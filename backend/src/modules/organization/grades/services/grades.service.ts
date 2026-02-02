import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Grade, GradeDocument } from '../schemas/grade.schema';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { UpdateGradeDto } from '../dto/update-grade.dto';
import { QueryGradeDto } from '../dto/query-grade.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const createdGrade = new this.gradeModel(createGradeDto);
    return createdGrade.save();
  }

  async findAll(query: QueryGradeDto): Promise<{ data: Grade[]; total: number }> {
    const { page = 1, limit = 10, sortBy = 'level', sortOrder = 'asc', search, band, isActive, minGradeLevel, maxGradeLevel } = query;
    
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (band) {
      filter.band = band;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (minGradeLevel !== undefined) {
      filter.level = { ...filter.level, $gte: minGradeLevel };
    }

    if (maxGradeLevel !== undefined) {
      filter.level = { ...filter.level, $lte: maxGradeLevel };
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [data, total] = await Promise.all([
      this.gradeModel
        .find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.gradeModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradeModel.findById(id).exec();
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  async findByCode(code: string): Promise<Grade> {
    const grade = await this.gradeModel.findOne({ code }).exec();
    if (!grade) {
      throw new NotFoundException(`Grade with code ${code} not found`);
    }
    return grade;
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const updatedGrade = await this.gradeModel
      .findByIdAndUpdate(id, updateGradeDto, { new: true })
      .exec();
    
    if (!updatedGrade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    
    return updatedGrade;
  }

  async remove(id: string): Promise<void> {
    const result = await this.gradeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
  }

    /**
   * Validate if salary is within grade range
   */
  async validateSalaryInRange(gradeId: string, salary: number): Promise<boolean> {
    const grade = await this.gradeModel.findById(gradeId).exec();
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${gradeId} not found`);
    }

    return salary >= grade.compensation.basicSalary.min && 
           salary <= grade.compensation.basicSalary.max;
  }

  /**
   * Get grade salary range information
   */
  async getGradeSalaryRange(gradeId: string): Promise<{ min: number; mid: number; max: number; code: string }> {
    const grade = await this.gradeModel.findById(gradeId).exec();
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${gradeId} not found`);
    }

    return {
      min: grade.compensation.basicSalary.min,
      mid: grade.compensation.basicSalary.mid,
      max: grade.compensation.basicSalary.max,
      code: grade.code
    };
  }

  /**
   * Get grade midpoint salary
   */
  async getGradeMidpointSalary(gradeId: string): Promise<number> {
    const grade = await this.gradeModel.findById(gradeId).exec();
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${gradeId} not found`);
    }

    return grade.compensation.basicSalary.mid;
  }

  // ESCOM Specific Methods
  async getGradeHierarchy(): Promise<Grade[]> {
    return this.gradeModel
      .find({ isActive: true })
      .sort({ level: 1 })
      .populate('nextGrade')
      .exec();
  }

  async getGradesByBand(band: string): Promise<Grade[]> {
    return this.gradeModel
      .find({ band, isActive: true })
      .sort({ level: 1 })
      .exec();
  }

  async getNextGrade(currentGradeCode: string): Promise<Grade | null> {
    const currentGrade = await this.findByCode(currentGradeCode);
    if (currentGrade.nextGrade) {
      return this.gradeModel.findById(currentGrade.nextGrade).exec();
    }
    return null;
  }

  async getGradeProgression(startGradeCode: string): Promise<Grade[]> {
    const progression: Grade[] = [];
    let currentGrade: Grade | null = await this.findByCode(startGradeCode);
    
    while (currentGrade) {
      progression.push(currentGrade);
      if (currentGrade.nextGrade) {
        currentGrade = await this.gradeModel.findById(currentGrade.nextGrade).exec();
      } else {
        break;
      }
    }
    
    return progression;
  }

  async canApproveUpTo(approverGradeCode: string, targetGradeCode: string): Promise<boolean> {
    const [approverGrade, targetGrade] = await Promise.all([
      this.findByCode(approverGradeCode),
      this.findByCode(targetGradeCode),
    ]);

    const approverMaxLevel = this.getMaxApprovalLevel(approverGrade.code);
    const targetLevel = targetGrade.level;

    return targetLevel <= this.getGradeLevel(approverMaxLevel);
  }

  private getMaxApprovalLevel(gradeCode: string): string {
    const approvalLimits: Record<string, string> = {
      'M3': 'M11', 'M4': 'M11', 'M5': 'M11', 'M6': 'M13',
      'M7': 'M15', 'M8': 'M15', 'M9': 'M15',
      'M10': 'M17', 'M11': 'M17', 'M13': 'M17', 'M15': 'M17', 'M17': 'CEO'
    };
    return approvalLimits[gradeCode] || 'M17';
  }

  private getGradeLevel(gradeCode: string): number {
    const gradeLevels: Record<string, number> = {
      'M3': 1, 'M4': 2, 'M5': 3, 'M6': 4, 'M7': 5, 'M8': 6,
      'M9': 7, 'M10': 8, 'M11': 9, 'M13': 10, 'M15': 11, 'M17': 12, 'CEO': 13
    };
    return gradeLevels[gradeCode] || 0;
  }
}