import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { Department } from '../organization/departments/schemas/department.schema';
import { Position } from '../organization/positions/schemas/position.schema';
import { Grade } from '../organization/grades/schemas/grade.schema';
import { EmploymentStatus, ContractType } from '../../common/enums';

@Injectable()
export class EmployeeStatisticsService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Department.name) private departmentModel: Model<any>,
    @InjectModel(Position.name) private positionModel: Model<any>,
    @InjectModel(Grade.name) private gradeModel: Model<any>,
  ) {}

  /**
   * Get comprehensive employee statistics
   */
  async getEmployeeStatistics(): Promise<any> {
    const [
      totalEmployees,
      activeEmployees,
      departmentStats,
      positionStats,
      gradeStats,
      contractTypeStats,
      genderStats,
      statusStats,
      salaryStats
    ] = await Promise.all([
      this.employeeModel.countDocuments(),
      this.employeeModel.countDocuments({ employmentStatus: EmploymentStatus.ACTIVE }),
      this.getDepartmentStatistics(),
      this.getPositionStatistics(),
      this.getGradeStatistics(),
      this.getContractTypeStatistics(),
      this.getGenderStatistics(),
      this.getEmploymentStatusStatistics(),
      this.getSalaryStatistics()
    ]);

    return {
      summary: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        systemAccessUsers: await this.employeeModel.countDocuments({ hasSystemAccess: true })
      },
      byDepartment: departmentStats,
      byPosition: positionStats,
      byGrade: gradeStats,
      byContractType: contractTypeStats,
      byGender: genderStats,
      byEmploymentStatus: statusStats,
      salary: salaryStats,
      recentHires: await this.getRecentHires(10),
      turnoverRate: await this.calculateTurnoverRate()
    };
  }

  /**
   * Get department-wise statistics
   */
  private async getDepartmentStatistics(): Promise<any[]> {
    const departments = await this.departmentModel.find().lean();
    const stats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$employmentStatus', EmploymentStatus.ACTIVE] }, 1, 0]
            }
          },
          avgSalary: { $avg: '$currentBasicSalary' },
          maxSalary: { $max: '$currentBasicSalary' },
          minSalary: { $min: '$currentBasicSalary' }
        }
      }
    ]);

    return departments.map(dept => {
      const deptStat = stats.find(stat => stat._id.toString() === dept.id.toString());
      return {
        departmentId: dept._id,
        departmentName: dept.departmentName,
        departmentCode: dept.departmentCode,
        totalEmployees: deptStat?.total || 0,
        activeEmployees: deptStat?.active || 0,
        avgSalary: deptStat?.avgSalary || 0,
        maxSalary: deptStat?.maxSalary || 0,
        minSalary: deptStat?.minSalary || 0
      };
    });
  }

  /**
   * Get position-wise statistics
   */
  private async getPositionStatistics(): Promise<any[]> {
    const positions = await this.positionModel.find().lean();
    const stats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$positionId',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$employmentStatus', EmploymentStatus.ACTIVE] }, 1, 0]
            }
          }
        }
      }
    ]);

    return positions.map(position => {
      const positionStat = stats.find(stat => stat._id.toString() === position.id.toString());
      return {
        positionId: position._id,
        positionTitle: position.positionTitle,
        positionCode: position.positionCode,
        totalEmployees: positionStat?.total || 0,
        activeEmployees: positionStat?.active || 0,
        positionsAvailable: position.numberOfPositions - (positionStat?.total || 0)
      };
    });
  }

  /**
   * Get grade-wise statistics
   */
  private async getGradeStatistics(): Promise<any[]> {
    const grades = await this.gradeModel.find().lean();
    const stats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$gradeId',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$employmentStatus', EmploymentStatus.ACTIVE] }, 1, 0]
            }
          },
          avgSalary: { $avg: '$currentBasicSalary' }
        }
      }
    ]);

    return grades.map(grade => {
      const gradeStat = stats.find(stat => stat._id.toString() === grade.id.toString());
      return {
        gradeId: grade._id,
        gradeCode: grade.gradeCode,
        gradeName: grade.gradeName,
        gradeLevel: grade.gradeLevel,
        totalEmployees: gradeStat?.total || 0,
        activeEmployees: gradeStat?.active || 0,
        avgSalary: gradeStat?.avgSalary || 0,
        salaryRange: {
          min: grade.basicSalaryMinimum,
          max: grade.basicSalaryMaximum,
          midpoint: grade.basicSalaryMidpoint
        }
      };
    });
  }

  /**
   * Get contract type statistics
   */
  private async getContractTypeStatistics(): Promise<any[]> {
    const stats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$contractType',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$employmentStatus', EmploymentStatus.ACTIVE] }, 1, 0]
            }
          }
        }
      }
    ]);

    return Object.values(ContractType).map(contractType => {
      const contractStat = stats.find(stat => stat._id === contractType);
      return {
        contractType,
        totalEmployees: contractStat?.total || 0,
        activeEmployees: contractStat?.active || 0
      };
    });
  }

  /**
   * Get gender statistics
   */
  private async getGenderStatistics(): Promise<any[]> {
    const stats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$gender',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$employmentStatus', EmploymentStatus.ACTIVE] }, 1, 0]
            }
          }
        }
      }
    ]);

    const genders = ['male', 'female', 'other'];
    return genders.map(gender => {
      const genderStat = stats.find(stat => stat._id === gender);
      return {
        gender,
        totalEmployees: genderStat?.total || 0,
        activeEmployees: genderStat?.active || 0
      };
    });
  }

  /**
   * Get employment status statistics
   */
  private async getEmploymentStatusStatistics(): Promise<any[]> {
    const stats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$employmentStatus',
          total: { $sum: 1 }
        }
      }
    ]);

    return Object.values(EmploymentStatus).map(status => {
      const statusStat = stats.find(stat => stat._id === status);
      return {
        employmentStatus: status,
        totalEmployees: statusStat?.total || 0
      };
    });
  }

  /**
   * Get salary statistics
   */
  private async getSalaryStatistics(): Promise<any> {
    const stats = await this.employeeModel.aggregate([
      {
        $match: {
          employmentStatus: EmploymentStatus.ACTIVE
        }
      },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: '$currentBasicSalary' },
          maxSalary: { $max: '$currentBasicSalary' },
          minSalary: { $min: '$currentBasicSalary' },
          totalSalary: { $sum: '$currentBasicSalary' },
          employeeCount: { $sum: 1 }
        }
      }
    ]);

    return stats[0] || {
      avgSalary: 0,
      maxSalary: 0,
      minSalary: 0,
      totalSalary: 0,
      employeeCount: 0
    };
  }

  /**
   * Get recent hires
   */
  private async getRecentHires(limit: number = 10): Promise<any[]> {
    return this.employeeModel
      .find()
      .sort({ employmentDate: -1 })
      .limit(limit)
      .populate('departmentId', 'departmentName')
      .populate('positionId', 'positionTitle')
      .populate('gradeId', 'gradeName')
      .select('employeeNumber firstName lastName email employmentDate departmentId positionId gradeId')
      .lean();
  }

  /**
   * Calculate turnover rate (last 12 months)
   */
  private async calculateTurnoverRate(): Promise<number> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [terminatedCount, averageHeadcount] = await Promise.all([
      this.employeeModel.countDocuments({
        employmentStatus: EmploymentStatus.TERMINATED,
        updatedAt: { $gte: oneYearAgo }
      }),
      this.employeeModel.countDocuments() // Simplified average headcount
    ]);

    return averageHeadcount > 0 ? (terminatedCount / averageHeadcount) * 100 : 0;
  }

  /**
   * Get department-specific statistics
   */
  async getDepartmentEmployeeStats(departmentId: string): Promise<any> {
    const department = await this.departmentModel.findById(departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    const employees = await this.employeeModel
      .find({ departmentId: new Types.ObjectId(departmentId) })
      .populate('positionId', 'positionTitle')
      .populate('gradeId', 'gradeName gradeCode')
      .lean();

    const stats = await this.employeeModel.aggregate([
      {
        $match: { departmentId: new Types.ObjectId(departmentId) }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$employmentStatus', EmploymentStatus.ACTIVE] }, 1, 0]
            }
          },
          avgSalary: { $avg: '$currentBasicSalary' },
          maxSalary: { $max: '$currentBasicSalary' },
          minSalary: { $min: '$currentBasicSalary' }
        }
      }
    ]);

    const positionStats = await this.employeeModel.aggregate([
      {
        $match: { departmentId: new Types.ObjectId(departmentId) }
      },
      {
        $group: {
          _id: '$positionId',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      department: {
        id: department._id,
        name: department.departmentName,
        code: department.departmentCode
      },
      summary: stats[0] || { total: 0, active: 0, avgSalary: 0, maxSalary: 0, minSalary: 0 },
      positionDistribution: positionStats,
      employees: employees.slice(0, 20) 
    };
  }
}