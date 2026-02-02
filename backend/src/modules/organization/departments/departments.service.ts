import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { DepartmentHierarchyDto } from './dto/department-hierarchy.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Create a new department
   */
  async create(
    createDepartmentDto: CreateDepartmentDto,
    userId?: string,
  ): Promise<DepartmentResponseDto> {
    // Check if department code already exists
    const existingCode = await this.departmentModel.findOne({
      departmentCode: createDepartmentDto.departmentCode,
    });

    if (existingCode) {
      throw new ConflictException(
        `Department with code '${createDepartmentDto.departmentCode}' already exists`,
      );
    }

    // Check if department name already exists
    const existingName = await this.departmentModel.findOne({
      departmentName: createDepartmentDto.departmentName,
    });

    if (existingName) {
      throw new ConflictException(
        `Department with name '${createDepartmentDto.departmentName}' already exists`,
      );
    }

    // Validate parent department exists
    if (createDepartmentDto.parentDepartmentId) {
      const parentExists = await this.departmentModel.findById(
        createDepartmentDto.parentDepartmentId,
      );

      if (!parentExists) {
        throw new NotFoundException('Parent department not found');
      }

      // Prevent circular reference
      await this.validateNoCircularReference(
        null,
        createDepartmentDto.parentDepartmentId,
      );
    }

    const department = new this.departmentModel({
      ...createDepartmentDto,
      createdBy: userId,
    });

    const saved = await department.save();
    return this.mapToResponseDto(saved);
  }

  /**
   * Find all departments with pagination and filters
   */
  async findAll(
    query: QueryDepartmentDto,
  ): Promise<PaginationResponseDto<DepartmentResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      parentDepartmentId,
      isActive,
      includeSubDepartments,
      includeEmployeeCount,
    } = query;

    const filter: any = {};

    // Apply filters
    if (search) {
      filter.$or = [
        { departmentName: { $regex: search, $options: 'i' } },
        { departmentCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (parentDepartmentId !== undefined) {
      filter.parentDepartmentId = parentDepartmentId || null;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [departments, total] = await Promise.all([
      this.departmentModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('parentDepartmentId', 'departmentName departmentCode')
        .exec(), // Removed .lean() to keep Mongoose documents
      this.departmentModel.countDocuments(filter),
    ]);

    // Enhance with additional data if requested
    const enhancedDepartments = await Promise.all(
      departments.map(async (dept) => {
        const enhanced = this.mapToResponseDto(dept);

        if (includeSubDepartments) {
          enhanced.subDepartments = await this.getSubDepartments(dept._id as Types.ObjectId);
        }

        if (includeEmployeeCount) {
          enhanced.employeeCount = await this.getEmployeeCount(dept._id as Types.ObjectId);
        }

        return enhanced;
      }),
    );

    return {
      data: enhancedDepartments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Find one department by ID
   */
  async findOne(
    id: string,
    includeRelations = false,
  ): Promise<DepartmentResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    let query = this.departmentModel.findById(id);

    if (includeRelations) {
      query = query
        .populate('parentDepartmentId', 'departmentName departmentCode')
        .populate('departmentHeadPositionId', 'positionTitle positionCode');
    }

    const department = await query.exec();

    if (!department) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }

    const response = this.mapToResponseDto(department);

    // Add sub-departments
    response.subDepartments = await this.getSubDepartments(department._id as Types.ObjectId);
    response.employeeCount = await this.getEmployeeCount(department._id as Types.ObjectId);

    return response;
  }

  /**
   * Update department
   */
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    userId?: string,
  ): Promise<DepartmentResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.departmentModel.findById(id);

    if (!department) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }

    // Check for duplicate code if being changed
    if (
      updateDepartmentDto.departmentCode &&
      updateDepartmentDto.departmentCode !== department.departmentCode
    ) {
      const existingCode = await this.departmentModel.findOne({
        departmentCode: updateDepartmentDto.departmentCode,
        _id: { $ne: id },
      });

      if (existingCode) {
        throw new ConflictException(
          `Department with code '${updateDepartmentDto.departmentCode}' already exists`,
        );
      }
    }

    // Check for duplicate name if being changed
    if (
      updateDepartmentDto.departmentName &&
      updateDepartmentDto.departmentName !== department.departmentName
    ) {
      const existingName = await this.departmentModel.findOne({
        departmentName: updateDepartmentDto.departmentName,
        _id: { $ne: id },
      });

      if (existingName) {
        throw new ConflictException(
          `Department with name '${updateDepartmentDto.departmentName}' already exists`,
        );
      }
    }

    // Validate parent department change
    if (updateDepartmentDto.parentDepartmentId !== undefined) {
      if (updateDepartmentDto.parentDepartmentId) {
        const parentExists = await this.departmentModel.findById(
          updateDepartmentDto.parentDepartmentId,
        );

        if (!parentExists) {
          throw new NotFoundException('Parent department not found');
        }

        // Prevent circular reference
        await this.validateNoCircularReference(
          new Types.ObjectId(id),
          updateDepartmentDto.parentDepartmentId,
        );

        // Prevent setting itself as parent
        if (updateDepartmentDto.parentDepartmentId.toString() === id) {
          throw new BadRequestException(
            'Department cannot be its own parent',
          );
        }
      }
    }

    Object.assign(department, updateDepartmentDto, { updatedBy: userId });
    const updated = await department.save();

    return this.mapToResponseDto(updated);
  }

  /**
   * Soft delete department
   */
  async remove(id: string, userId?: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.departmentModel.findById(id);

    if (!department) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }

    // Check if department has sub-departments
    const subDepartments = await this.departmentModel.countDocuments({
      parentDepartmentId: id,
      isActive: true,
    });

    if (subDepartments > 0) {
      throw new BadRequestException(
        'Cannot delete department with active sub-departments',
      );
    }

    // Check if department has employees
    const employeeCount = await this.getEmployeeCount(department._id as Types.ObjectId);
    if (employeeCount > 0) {
      throw new BadRequestException(
        'Cannot delete department with active employees',
      );
    }

    department.isActive = false;
    department.deletedAt = new Date();
    department.deletedBy = userId;
    await department.save();

    return {
      message: `Department '${department.departmentName}' deleted successfully`,
    };
  }

  /**
   * Permanently delete department
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const result = await this.departmentModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }

    return {
      message: `Department '${result.departmentName}' permanently deleted`,
    };
  }

  /**
   * Restore soft-deleted department
   */
  async restore(id: string, userId?: string): Promise<DepartmentResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.departmentModel.findById(id);

    if (!department) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }

    department.isActive = true;
    department.deletedAt = undefined;
    department.deletedBy = undefined;
    department.updatedBy = userId;
    const restored = await department.save();

    return this.mapToResponseDto(restored);
  }

  /**
   * Get complete department hierarchy
   */
  async getHierarchy(): Promise<DepartmentHierarchyDto[]> {
    const departments = await this.departmentModel
      .find({ isActive: true })
      .lean()
      .exec();

    return this.buildHierarchy(departments, null, 0);
  }

  /**
   * Get department path to root
   */
  async getDepartmentPath(id: string): Promise<DepartmentResponseDto[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const path: DepartmentResponseDto[] = [];
    let currentId: Types.ObjectId | null = new Types.ObjectId(id);

    while (currentId) {
      const department = await this.departmentModel
        .findById(currentId)
        .exec();

      if (!department) {
        break;
      }

      path.unshift(this.mapToResponseDto(department));
      currentId = department.parentDepartmentId || null;
    }

    return path;
  }

  /**
   * Get all employees in department (including sub-departments)
   */
  async getAllEmployeesInDepartment(id: string): Promise<any[]> {
    // This will be implemented when Employee module is ready
    // For now, return empty array
    return [];
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private async getSubDepartments(
    parentId: Types.ObjectId,
  ): Promise<DepartmentResponseDto[]> {
    const subDepartments = await this.departmentModel
      .find({ parentDepartmentId: parentId, isActive: true })
      .exec();

    return subDepartments.map(dept => this.mapToResponseDto(dept));
  }

  private async getEmployeeCount(departmentId: Types.ObjectId): Promise<number> {
    // This will be implemented when Employee module is ready
    // For now, return 0
    return 0;
  }

  private async validateNoCircularReference(
    departmentId: Types.ObjectId | null,
    parentId: Types.ObjectId,
  ): Promise<void> {
    let currentParentId = parentId;
    const visitedIds = new Set<string>();

    while (currentParentId) {
      const parentIdString = currentParentId.toString();

      // Check if we've visited this ID before (circular reference)
      if (visitedIds.has(parentIdString)) {
        throw new BadRequestException(
          'Circular reference detected in department hierarchy',
        );
      }

      // Check if parent is the department itself
      if (departmentId && currentParentId.toString() === departmentId.toString()) {
        throw new BadRequestException(
          'Department cannot be its own ancestor',
        );
      }

      visitedIds.add(parentIdString);

      const parent = await this.departmentModel.findById(currentParentId);
      if (!parent || !parent.parentDepartmentId) {
        break;
      }

      currentParentId = parent.parentDepartmentId;
    }
  }

  private buildHierarchy(
    departments: any[],
    parentId: Types.ObjectId | null,
    level: number,
  ): DepartmentHierarchyDto[] {
    const children = departments.filter((dept) => {
      if (parentId === null) {
        return !dept.parentDepartmentId;
      }
      return (
        dept.parentDepartmentId &&
        dept.parentDepartmentId.toString() === parentId.toString()
      );
    });

    return children.map((dept) => ({
      _id: new Types.ObjectId(dept._id.toString()),
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode,
      parentDepartmentId: dept.parentDepartmentId 
        ? new Types.ObjectId(dept.parentDepartmentId.toString())
        : undefined,
      level,
      path: [], // Can be enhanced to build full path
      children: this.buildHierarchy(departments, new Types.ObjectId(dept._id.toString()), level + 1),
      employeeCount: 0, // Will be populated when Employee module is ready
    }));
  }

  private mapToResponseDto(department: DepartmentDocument): DepartmentResponseDto {
  // Type assertion for the _id field
  const departmentId = department._id as unknown as Types.ObjectId;
  
  return {
    _id: departmentId,
    departmentName: department.departmentName,
    departmentCode: department.departmentCode,
    description: department.description,
    parentDepartmentId: department.parentDepartmentId as Types.ObjectId | undefined,
    departmentHeadPositionId: department.departmentHeadPositionId as Types.ObjectId | undefined,
    isActive: department.isActive,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
    createdBy: department.createdBy,
    updatedBy: department.updatedBy,
  };
}
}