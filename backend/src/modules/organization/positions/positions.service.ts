import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position, PositionDocument } from './schemas/position.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { QueryPositionDto } from './dto/query-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { PositionHierarchyDto } from './dto/position-hierarchy.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
  ) {}

  /**
   * Create a new position
   */
  async create(
    createPositionDto: CreatePositionDto,
    userId?: string,
  ): Promise<PositionResponseDto> {
    // Check if position code already exists
    const existingCode = await this.positionModel.findOne({
      positionCode: createPositionDto.positionCode,
    });

    if (existingCode) {
      throw new ConflictException(
        `Position with code '${createPositionDto.positionCode}' already exists`,
      );
    }

    // Validate reporting position exists and prevent circular reference
    if (createPositionDto.reportsToPositionId) {
      const reportsToPosition = await this.positionModel.findById(
        createPositionDto.reportsToPositionId,
      );

      if (!reportsToPosition) {
        throw new NotFoundException('Reporting position not found');
      }

      // Prevent circular reference
      await this.validateNoCircularReference(
        null,
        createPositionDto.reportsToPositionId,
      );
    }

    const position = new this.positionModel({
      ...createPositionDto,
      currentlyFilled: 0,
      createdBy: userId,
    });

    const saved = await position.save();
    return this.mapToResponseDto(saved);
  }

  /**
   * Find all positions with pagination and filters
   */
  async findAll(
    query: QueryPositionDto,
  ): Promise<PaginationResponseDto<PositionResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      departmentId,
      gradeId,
      reportsToPositionId,
      isActive,
      isSupervisorRole,
      isManagerRole,
      isDirectorRole,
      hasAvailability,
      includeRelations,
    } = query;

    const filter: any = {};

    // Apply filters
    if (search) {
      filter.$or = [
        { positionTitle: { $regex: search, $options: 'i' } },
        { positionCode: { $regex: search, $options: 'i' } },
        { jobDescription: { $regex: search, $options: 'i' } },
      ];
    }

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (gradeId) {
      filter.gradeId = gradeId;
    }

    if (reportsToPositionId !== undefined) {
      filter.reportsToPositionId = reportsToPositionId || null;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isSupervisorRole !== undefined) {
      filter.isSupervisorRole = isSupervisorRole;
    }

    if (isManagerRole !== undefined) {
      filter.isManagerRole = isManagerRole;
    }

    if (isDirectorRole !== undefined) {
      filter.isDirectorRole = isDirectorRole;
    }

    if (hasAvailability) {
      filter.$expr = { $lt: ['$currentlyFilled', '$numberOfPositions'] };
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    let queryBuilder = this.positionModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    if (includeRelations) {
      queryBuilder = queryBuilder
        .populate('departmentId', 'departmentName departmentCode')
        .populate('gradeId', 'gradeCode gradeName basicSalaryMinimum basicSalaryMaximum')
        .populate('reportsToPositionId', 'positionTitle positionCode');
    }

    const [positions, total] = await Promise.all([
      queryBuilder.exec(),
      this.positionModel.countDocuments(filter),
    ]);

    const enhancedPositions = positions.map((position) => {
      const response = this.mapToResponseDto(position);
      
      // Add calculated fields
      response.availablePositions = position.numberOfPositions - position.currentlyFilled;
      
      // Add salary range if grade is populated
      if (position.gradeId && typeof position.gradeId === 'object' && 'basicSalaryMinimum' in position.gradeId) {
        const grade = position.gradeId as any;
        response.salaryRange = `${grade.basicSalaryMinimum?.toLocaleString()} - ${grade.basicSalaryMaximum?.toLocaleString()}`;
      }
      
      return response;
    });

    return {
      data: enhancedPositions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Find one position by ID
   */
  async findOne(
    id: string,
    includeRelations = false,
  ): Promise<PositionResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid position ID');
    }

    let query = this.positionModel.findById(id);

    if (includeRelations) {
      query = query
        .populate('departmentId', 'departmentName departmentCode')
        .populate('gradeId', 'gradeCode gradeName basicSalaryMinimum basicSalaryMaximum')
        .populate('reportsToPositionId', 'positionTitle positionCode');
    }

    const position = await query.exec();

    if (!position) {
      throw new NotFoundException(`Position with ID '${id}' not found`);
    }

    const response = this.mapToResponseDto(position);

    // Add direct reports
    response.directReports = await this.getDirectReports(this.convertToObjectId(position._id));
    response.availablePositions = position.numberOfPositions - position.currentlyFilled;

    return response;
  }

  /**
   * Update position
   */
  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
    userId?: string,
  ): Promise<PositionResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid position ID');
    }

    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException(`Position with ID '${id}' not found`);
    }

    // Check for duplicate code if being changed
    if (
      updatePositionDto.positionCode &&
      updatePositionDto.positionCode !== position.positionCode
    ) {
      const existingCode = await this.positionModel.findOne({
        positionCode: updatePositionDto.positionCode,
        _id: { $ne: id },
      });

      if (existingCode) {
        throw new ConflictException(
          `Position with code '${updatePositionDto.positionCode}' already exists`,
        );
      }
    }

    // Validate reporting position change
    if (updatePositionDto.reportsToPositionId !== undefined) {
      if (updatePositionDto.reportsToPositionId) {
        const reportsToPosition = await this.positionModel.findById(
          updatePositionDto.reportsToPositionId,
        );

        if (!reportsToPosition) {
          throw new NotFoundException('Reporting position not found');
        }

        // Prevent circular reference
        await this.validateNoCircularReference(
          new Types.ObjectId(id),
          updatePositionDto.reportsToPositionId,
        );

        // Prevent setting itself as reporting position
        if (updatePositionDto.reportsToPositionId.toString() === id) {
          throw new BadRequestException(
            'Position cannot report to itself',
          );
        }
      }
    }

    Object.assign(position, updatePositionDto, { updatedBy: userId });
    const updated = await position.save();

    return this.mapToResponseDto(updated);
  }

  /**
   * Soft delete position
   */
  async remove(id: string, userId?: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid position ID');
    }

    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException(`Position with ID '${id}' not found`);
    }

    // Check if position has employees
    if (position.currentlyFilled > 0) {
      throw new BadRequestException(
        'Cannot delete position with assigned employees',
      );
    }

    // Check if position has direct reports
    const directReports = await this.positionModel.countDocuments({
      reportsToPositionId: id,
      isActive: true,
    });

    if (directReports > 0) {
      throw new BadRequestException(
        'Cannot delete position with direct report positions',
      );
    }

    position.isActive = false;
    position.deletedAt = new Date();
    position.deletedBy = userId;
    await position.save();

    return {
      message: `Position '${position.positionTitle}' deleted successfully`,
    };
  }

  /**
   * Restore soft-deleted position
   */
  async restore(id: string, userId?: string): Promise<PositionResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid position ID');
    }

    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException(`Position with ID '${id}' not found`);
    }

    position.isActive = true;
    position.deletedAt = undefined;
    position.deletedBy = undefined;
    position.updatedBy = userId;
    const restored = await position.save();

    return this.mapToResponseDto(restored);
  }

  /**
   * Get position hierarchy for a department
   */
  async getDepartmentPositionHierarchy(
    departmentId: string,
  ): Promise<PositionHierarchyDto[]> {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const positions = await this.positionModel
      .find({ departmentId, isActive: true })
      .populate('departmentId', 'departmentName departmentCode')
      .populate('gradeId', 'gradeCode gradeName')
      .lean()
      .exec();

    return this.buildHierarchy(positions, null, 0);
  }

  /**
   * Get complete position hierarchy (all departments)
   */
  async getCompleteHierarchy(): Promise<PositionHierarchyDto[]> {
    const positions = await this.positionModel
      .find({ isActive: true })
      .populate('departmentId', 'departmentName departmentCode')
      .populate('gradeId', 'gradeCode gradeName')
      .lean()
      .exec();

    return this.buildHierarchy(positions, null, 0);
  }

  /**
   * Get reporting chain for a position
   */
  async getReportingChain(id: string): Promise<PositionResponseDto[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid position ID');
    }

    const chain: PositionResponseDto[] = [];
    let currentId: Types.ObjectId | null = new Types.ObjectId(id);

    while (currentId) {
      const position = await this.positionModel
        .findById(currentId)
        .populate('departmentId', 'departmentName departmentCode')
        .populate('gradeId', 'gradeCode gradeName')
        .exec();

      if (!position) {
        break;
      }

      chain.unshift(this.mapToResponseDto(position));
      currentId = position.reportsToPositionId ? this.convertToObjectId(position.reportsToPositionId) : null;
    }

    return chain;
  }

  /**
   * Get all subordinate positions (recursive)
   */
  async getAllSubordinates(id: string): Promise<PositionResponseDto[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid position ID');
    }

    return this.getSubordinatesRecursive(new Types.ObjectId(id));
  }

  /**
   * Check if position is available for assignment
   */
  async checkAvailability(id: string): Promise<boolean> {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException(`Position with ID '${id}' not found`);
    }

    return position.currentlyFilled < position.numberOfPositions;
  }

  /**
   * Increment filled count (called when employee is assigned)
   */
  async incrementFilledCount(id: Types.ObjectId): Promise<void> {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    if (position.currentlyFilled >= position.numberOfPositions) {
      throw new BadRequestException('Position is fully filled');
    }

    position.currentlyFilled += 1;
    await position.save();
  }

  /**
   * Decrement filled count (called when employee leaves)
   */
  async decrementFilledCount(id: Types.ObjectId): Promise<void> {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    if (position.currentlyFilled > 0) {
      position.currentlyFilled -= 1;
      await position.save();
    }
  }

  /**
   * Get positions by department
   */
  async getPositionsByDepartment(
    departmentId: Types.ObjectId,
  ): Promise<PositionResponseDto[]> {
    const positions = await this.positionModel
      .find({ departmentId, isActive: true })
      .populate('gradeId', 'gradeCode gradeName basicSalaryMinimum basicSalaryMaximum')
      .exec();

    return positions.map((pos) => this.mapToResponseDto(pos));
  }

  /**
   * Get positions by grade
   */
  async getPositionsByGrade(
    gradeId: Types.ObjectId,
  ): Promise<PositionResponseDto[]> {
    const positions = await this.positionModel
      .find({ gradeId, isActive: true })
      .populate('departmentId', 'departmentName departmentCode')
      .exec();

    return positions.map((pos) => this.mapToResponseDto(pos));
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private async getDirectReports(
    positionId: Types.ObjectId,
  ): Promise<PositionResponseDto[]> {
    const directReports = await this.positionModel
      .find({ reportsToPositionId: positionId, isActive: true })
      .populate('gradeId', 'gradeCode gradeName')
      .exec();

    return directReports.map((pos) => this.mapToResponseDto(pos));
  }

  private async getSubordinatesRecursive(
    positionId: Types.ObjectId,
  ): Promise<PositionResponseDto[]> {
    const subordinates: PositionResponseDto[] = [];

    const directReports = await this.positionModel
      .find({ reportsToPositionId: positionId, isActive: true })
      .exec();

    for (const report of directReports) {
      subordinates.push(this.mapToResponseDto(report));

      const subSubordinates = await this.getSubordinatesRecursive(this.convertToObjectId(report._id));
      subordinates.push(...subSubordinates);
    }

    return subordinates;
  }

  private async validateNoCircularReference(
    positionId: Types.ObjectId | null,
    reportsToId: Types.ObjectId,
  ): Promise<void> {
    let currentReportsToId = reportsToId;
    const visitedIds = new Set<string>();

    while (currentReportsToId) {
      const reportsToIdString = currentReportsToId.toString();

      // Check if we've visited this ID before (circular reference)
      if (visitedIds.has(reportsToIdString)) {
        throw new BadRequestException(
          'Circular reference detected in position hierarchy',
        );
      }

      // Check if parent is the position itself
      if (positionId && currentReportsToId.toString() === positionId.toString()) {
        throw new BadRequestException(
          'Position cannot be its own ancestor',
        );
      }

      visitedIds.add(reportsToIdString);

      const reportsToPosition = await this.positionModel.findById(
        currentReportsToId,
      );
      if (!reportsToPosition || !reportsToPosition.reportsToPositionId) {
        break;
      }

      currentReportsToId = this.convertToObjectId(reportsToPosition.reportsToPositionId);
    }
  }

  private buildHierarchy(
    positions: any[],
    parentId: Types.ObjectId | null,
    level: number,
  ): PositionHierarchyDto[] {
    const children = positions.filter((pos) => {
      if (parentId === null) {
        return !pos.reportsToPositionId;
      }
      return (
        pos.reportsToPositionId &&
        this.convertToObjectId(pos.reportsToPositionId).toString() === parentId.toString()
      );
    });

    return children.map((pos) => ({
      _id: this.convertToObjectId(pos._id),
      positionTitle: pos.positionTitle,
      positionCode: pos.positionCode,
      departmentId: pos.departmentId?._id ? this.convertToObjectId(pos.departmentId._id) : this.convertToObjectId(pos.departmentId),
      gradeId: pos.gradeId?._id ? this.convertToObjectId(pos.gradeId._id) : this.convertToObjectId(pos.gradeId),
      reportsToPositionId: pos.reportsToPositionId ? this.convertToObjectId(pos.reportsToPositionId) : undefined,
      level,
      path: [], // Can be enhanced to build full path
      children: this.buildHierarchy(positions, this.convertToObjectId(pos._id), level + 1),
      employeeCount: pos.currentlyFilled || 0,
      department: pos.departmentId,
      grade: pos.gradeId,
    }));
  }

  private mapToResponseDto(position: PositionDocument): PositionResponseDto {
    // Type assertion for the _id field
    const positionId = this.convertToObjectId(position._id);
    
    // Ensure dates are defined (they should be with timestamps: true)
    const createdAt = position.createdAt || new Date();
    const updatedAt = position.updatedAt || new Date();
    
    return {
      _id: positionId,
      positionTitle: position.positionTitle,
      positionCode: position.positionCode,
      departmentId: this.convertToObjectId(position.departmentId),
      gradeId: this.convertToObjectId(position.gradeId),
      reportsToPositionId: position.reportsToPositionId ? this.convertToObjectId(position.reportsToPositionId) : undefined,
      jobDescription: position.jobDescription,
      responsibilities: position.responsibilities || [],
      isHeadOfDepartment: position.isHeadOfDepartment,
      isSupervisorRole: position.isSupervisorRole,
      isManagerRole: position.isManagerRole,
      isDirectorRole: position.isDirectorRole,
      numberOfPositions: position.numberOfPositions,
      currentlyFilled: position.currentlyFilled,
      isActive: position.isActive,
      createdAt,
      updatedAt,
      createdBy: position.createdBy,
      updatedBy: position.updatedBy,
      availablePositions: position.numberOfPositions - position.currentlyFilled,
    };
  }

  /**
   * Helper method to safely convert unknown _id to Types.ObjectId
   */
  private convertToObjectId(id: unknown): Types.ObjectId {
    if (id instanceof Types.ObjectId) {
      return id;
    }
    if (typeof id === 'string') {
      return new Types.ObjectId(id);
    }
    if (id && typeof id === 'object' && 'toString' in id) {
      return new Types.ObjectId(id.toString());
    }
    throw new BadRequestException('Invalid ID format');
  }
}