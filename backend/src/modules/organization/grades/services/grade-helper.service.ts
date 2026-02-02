import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Grade, GradeDocument } from '../schemas/grade.schema';
import { EmployeeLean, GradeInfo } from '../../../workflows/types/workflow.types';

@Injectable()
export class GradeHelperService {
  private readonly logger = new Logger(GradeHelperService.name);
  private gradeCache = new Map<string, GradeInfo>();

  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  /**
   * Get grade info for an employee
   */
  async getEmployeeGradeInfo(employee: EmployeeLean): Promise<GradeInfo> {
    try {
      // If grade is already populated
      if (typeof employee.gradeId === 'object' && 'code' in employee.gradeId) {
        return {
          _id: employee.gradeId._id,
          code: employee.gradeId.code,
          level: employee.gradeId.level,
          name: employee.gradeId.name
        };
      }

      // Get grade from cache
      const gradeId = employee.gradeId.toString();
      if (this.gradeCache.has(gradeId)) {
        return this.gradeCache.get(gradeId)!;
      }

      // Fetch grade from database
      const grade = await this.gradeModel.findById(employee.gradeId).lean();
      if (!grade) {
        this.logger.warn(`Grade not found for ID: ${gradeId}`);
        return { _id: new Types.ObjectId(), code: 'UNKNOWN', level: 0 };
      }

      const gradeInfo: GradeInfo = {
        _id: grade._id as Types.ObjectId,
        code: grade.code,
        level: grade.level,
        name: grade.name
      };

      // Cache for future use
      this.gradeCache.set(gradeId, gradeInfo);
      return gradeInfo;
    } catch (error) {
      this.logger.error(`Error getting grade info: ${error.message}`);
      return { _id: new Types.ObjectId(), code: 'UNKNOWN', level: 0 };
    }
  }

  /**
   * Get grade code from employee
   */
  async getGradeCode(employee: EmployeeLean): Promise<string> {
    const gradeInfo = await this.getEmployeeGradeInfo(employee);
    return gradeInfo.code;
  }

  /**
   * Get grade level from employee
   */
  async getGradeLevel(employee: EmployeeLean): Promise<number> {
    const gradeInfo = await this.getEmployeeGradeInfo(employee);
    return gradeInfo.level;
  }

  /**
   * Compare two grades
   */
  async canGradeApprove(approverGradeCode: string, targetGradeCode: string): Promise<boolean> {
    const [approverGrade, targetGrade] = await Promise.all([
      this.gradeModel.findOne({ code: approverGradeCode }).lean(),
      this.gradeModel.findOne({ code: targetGradeCode }).lean()
    ]);

    if (!approverGrade || !targetGrade) {
      return false;
    }

    return approverGrade.level >= targetGrade.level;
  }

  /**
   * Get employees by grade range - Return Types.ObjectId[]
   */
  async getEmployeesByGradeRange(minGradeCode?: string, maxGradeCode?: string): Promise<Types.ObjectId[]> {
    const query: any = { isActive: true };
    
    if (minGradeCode && maxGradeCode) {
      const minGrade = await this.gradeModel.findOne({ code: minGradeCode });
      const maxGrade = await this.gradeModel.findOne({ code: maxGradeCode });
      
      if (minGrade && maxGrade) {
        query.level = { $gte: minGrade.level, $lte: maxGrade.level };
      }
    } else if (minGradeCode) {
      const minGrade = await this.gradeModel.findOne({ code: minGradeCode });
      if (minGrade) {
        query.level = { $gte: minGrade.level };
      }
    } else if (maxGradeCode) {
      const maxGrade = await this.gradeModel.findOne({ code: maxGradeCode });
      if (maxGrade) {
        query.level = { $lte: maxGrade.level };
      }
    }

    const grades = await this.gradeModel.find(query).select('_id').lean();
    // Convert to Types.ObjectId[]
    const gradeIds = grades.map(grade => new Types.ObjectId(grade.id));
    
    return gradeIds;
  }

  /**
   * Get all grade codes
   */
  async getAllGradeCodes(): Promise<string[]> {
    const grades = await this.gradeModel.find({ isActive: true }).select('code').lean();
    return grades.map(grade => grade.code);
  }

  /**
   * Get grade by code
   */
  async getGradeByCode(code: string): Promise<GradeInfo | null> {
    const grade = await this.gradeModel.findOne({ code }).lean();
    if (!grade) return null;
    
    return {
      _id: grade._id as Types.ObjectId,
      code: grade.code,
      level: grade.level,
      name: grade.name
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.gradeCache.clear();
  }
}