import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { Department, DepartmentDocument } from '../organization/departments/schemas/department.schema';

export interface EmployeeNumberConfig {
  prefix: string;
  departmentCode: string;
  year: number;
  sequence: number;
  separator?: string;
}

@Injectable()
export class EmployeeNumberService {
  private readonly logger = new Logger(EmployeeNumberService.name);
  private readonly SEPARATOR = '/';

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Generate employee number based on department and sequence
   */
  async generateEmployeeNumber(departmentId: string): Promise<string> {
    try {
      const department = await this.departmentModel.findById(departmentId);
      if (!department) {
        throw new Error(`Department with ID ${departmentId} not found`);
      }

      const currentYear = new Date().getFullYear();
      const sequence = await this.getNextSequence(department.departmentCode, currentYear);

      const config: EmployeeNumberConfig = {
        prefix: 'EMP',
        departmentCode: department.departmentCode,
        year: currentYear,
        sequence,
        separator: this.SEPARATOR,
      };

      return this.formatEmployeeNumber(config);
    } catch (error) {
      this.logger.error('Failed to generate employee number:', error);
      // Fallback to simple incremental number
      return await this.generateFallbackEmployeeNumber();
    }
  }

  /**
   * Get next sequence number for department and year
   */
  private async getNextSequence(departmentCode: string, year: number): Promise<number> {
    // Find the highest employee number for this department and year
    const pattern = `^EMP${this.SEPARATOR}${departmentCode}${this.SEPARATOR}${year}${this.SEPARATOR}(\\d+)$`;
    
    const employees = await this.employeeModel
      .find({
        employeeNumber: { $regex: pattern }
      })
      .sort({ employeeNumber: -1 })
      .limit(1)
      .select('employeeNumber')
      .lean();

    if (employees.length === 0) {
      return 1; // First employee in this department for the year
    }

    const lastEmployeeNumber = employees[0].employeeNumber;
    const match = lastEmployeeNumber.match(new RegExp(pattern));
    
    if (match && match[1]) {
      return parseInt(match[1], 10) + 1;
    }

    return 1;
  }

  /**
   * Format employee number according to configuration
   */
  private formatEmployeeNumber(config: EmployeeNumberConfig): string {
    const { prefix, departmentCode, year, sequence, separator = this.SEPARATOR } = config;
    
    // Format: EMP/HR/2024/001
    return `${prefix}${separator}${departmentCode}${separator}${year}${separator}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Fallback method if department-based generation fails
   */
  private async generateFallbackEmployeeNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    // Find the highest employee number with simple format
    const employees = await this.employeeModel
      .find({
        employeeNumber: { $regex: `^EMP${this.SEPARATOR}\\d+${this.SEPARATOR}\\d+$` }
      })
      .sort({ employeeNumber: -1 })
      .limit(1)
      .select('employeeNumber')
      .lean();

    let sequence = 1;
    
    if (employees.length > 0) {
      const lastEmployeeNumber = employees[0].employeeNumber;
      const match = lastEmployeeNumber.match(/^EMP\/\d+\/(\d+)$/);
      
      if (match && match[1]) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    // Fallback format: EMP/2024/001
    return `EMP${this.SEPARATOR}${currentYear}${this.SEPARATOR}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Validate employee number format
   */
  validateEmployeeNumber(employeeNumber: string): boolean {
    // Acceptable formats:
    // 1. EMP/HR/2024/001 (department-based)
    // 2. EMP/2024/001 (fallback)
    const patterns = [
      `^EMP${this.SEPARATOR}[A-Z]+${this.SEPARATOR}\\d{4}${this.SEPARATOR}\\d{3}$`,
      `^EMP${this.SEPARATOR}\\d{4}${this.SEPARATOR}\\d{3}$`
    ];

    return patterns.some(pattern => 
      new RegExp(pattern).test(employeeNumber)
    );
  }

  /**
   * Parse employee number to extract components
   */
  parseEmployeeNumber(employeeNumber: string): EmployeeNumberConfig | null {
    // Format: EMP/HR/2024/001
    const pattern = `^EMP${this.SEPARATOR}([A-Z]+)${this.SEPARATOR}(\\d{4})${this.SEPARATOR}(\\d{3})$`;
    const match = employeeNumber.match(new RegExp(pattern));

    if (match) {
      return {
        prefix: 'EMP',
        departmentCode: match[1],
        year: parseInt(match[2], 10),
        sequence: parseInt(match[3], 10),
        separator: this.SEPARATOR,
      };
    }

    // Fallback format: EMP/2024/001
    const fallbackPattern = `^EMP${this.SEPARATOR}(\\d{4})${this.SEPARATOR}(\\d{3})$`;
    const fallbackMatch = employeeNumber.match(new RegExp(fallbackPattern));

    if (fallbackMatch) {
      return {
        prefix: 'EMP',
        departmentCode: 'GEN', // General department
        year: parseInt(fallbackMatch[1], 10),
        sequence: parseInt(fallbackMatch[2], 10),
        separator: this.SEPARATOR,
      };
    }

    return null;
  }

  /**
   * Get employee number statistics
   */
  async getEmployeeNumberStats(): Promise<any> {
    const currentYear = new Date().getFullYear();
    
    const [departmentStats, yearlyStats, totalEmployees] = await Promise.all([
      this.getDepartmentWiseStats(),
      this.getYearlyStats(),
      this.employeeModel.countDocuments()
    ]);

    return {
      totalEmployees,
      currentYear,
      departmentDistribution: departmentStats,
      yearlyDistribution: yearlyStats,
      nextEmployeeNumber: await this.generateEmployeeNumberForStats(),
    };
  }

  /**
   * Get department-wise employee number statistics
   */
  private async getDepartmentWiseStats(): Promise<any[]> {
    const departments = await this.departmentModel.find().lean();
    const stats: any[] = [];

    for (const dept of departments) {
      const count = await this.employeeModel.countDocuments({
        employeeNumber: { $regex: `EMP/${dept.departmentCode}/` }
      });

      stats.push({
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        employeeCount: count,
      });
    }

    return stats;
  }

  /**
   * Get yearly employee number statistics
   */
  private async getYearlyStats(): Promise<any[]> {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years
    const stats: any[] = [];

    for (const year of years) {
      const count = await this.employeeModel.countDocuments({
        employeeNumber: { $regex: `/${year}/` }
      });

      stats.push({
        year,
        employeeCount: count,
      });
    }

    return stats;
  }

  /**
   * Generate sample employee number for statistics display
   */
  private async generateEmployeeNumberForStats(): Promise<string> {
    const departments = await this.departmentModel.find().limit(1).lean();
    
    if (departments.length > 0) {
      // Use _id instead of id when using lean()
      return await this.generateEmployeeNumber(departments[0]._id.toString());
    }

    return await this.generateFallbackEmployeeNumber();
  }

  /**
   * Bulk generate employee numbers for multiple departments
   */
  async bulkGenerateEmployeeNumbers(count: number = 10): Promise<string[]> {
    const departments = await this.departmentModel.find().lean();
    const employeeNumbers: string[] = [];

    for (let i = 0; i < count && i < departments.length; i++) {
      const employeeNumber = await this.generateEmployeeNumber(departments[i]._id.toString());
      employeeNumbers.push(employeeNumber);
    }

    return employeeNumbers;
  }

  /**
   * Regenerate employee numbers (for system migration)
   */
  async regenerateEmployeeNumbers(batchSize: number = 100): Promise<{ processed: number; updated: number }> {
    let processed = 0;
    let updated = 0;

    // Find employees without proper employee numbers or with old format
    const employees = await this.employeeModel
      .find({
        $or: [
          { employeeNumber: { $exists: false } },
          { employeeNumber: { $not: /^EMP\// } },
          { employeeNumber: { $regex: /^EMP\\d+$/ } } // Old format like EMP123
        ]
      })
      .populate('departmentId')
      .limit(batchSize)
      .lean();

    for (const employee of employees) {
      try {
        processed++;
        const newEmployeeNumber = await this.generateEmployeeNumber(employee.departmentId._id.toString());
        
        await this.employeeModel.findByIdAndUpdate(employee._id, {
          employeeNumber: newEmployeeNumber
        });

        updated++;
        this.logger.log(`Regenerated employee number for ${employee._id}: ${newEmployeeNumber}`);
      } catch (error) {
        this.logger.error(`Failed to regenerate employee number for ${employee._id}:`, error);
      }
    }

    return { processed, updated };
  }
}