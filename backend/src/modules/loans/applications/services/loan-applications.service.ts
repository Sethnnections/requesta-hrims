import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LoanApplication,
  LoanApplicationDocument,
} from '../schemas/loan-application.schema';
import {
  LoanType,
  LoanTypeDocument,
} from '../../types/schemas/loan-type.schema';
import {
  Employee,
  EmployeeDocument,
} from '../../../employees/schemas/employee.schema';
import { WorkflowInstancesService } from '../../../workflows/instances/workflow-instances.service';
import { DynamicWorkflowEngineService } from '../../../workflows/services/dynamic-workflow-engine.service';
import { CreateLoanApplicationDto } from '../dto/create-loan-application.dto';
import {
  LoanApplicationResponseDto,
  EmployeeResponseDto,
} from '../dto/loan-application-response.dto';
import { WorkflowType, WorkflowStatus } from '../../../../common/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LoanApplicationsService {
  private readonly logger = new Logger(LoanApplicationsService.name);

  constructor(
    @InjectModel(LoanApplication.name)
    private loanApplicationModel: Model<LoanApplicationDocument>,
    @InjectModel(LoanType.name)
    private loanTypeModel: Model<LoanTypeDocument>,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    private workflowInstancesService: WorkflowInstancesService,
    private dynamicWorkflowEngine: DynamicWorkflowEngineService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new loan application with workflow integration
   */
  async create(
    createDto: CreateLoanApplicationDto,
    userId: string,
  ): Promise<LoanApplicationResponseDto> {
    // Validate employee exists and is active - ADD POPULATE
    const employee = await this.employeeModel
      .findById(createDto.employeeId)
      .populate('gradeId'); // ADD THIS LINE
    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createDto.employeeId} not found`,
      );
    }

    if (employee.employmentStatus !== 'ACTIVE') {
      throw new BadRequestException(
        'Only active employees can apply for loans',
      );
    }

    // Validate loan type exists and is active
    const loanType = await this.loanTypeModel.findOne({
      code: createDto.loanType,
      isActive: true,
    });
    if (!loanType) {
      throw new NotFoundException(
        `Loan type ${createDto.loanType} not found or inactive`,
      );
    }

    // Validate amount is within limits
    if (
      createDto.amount < loanType.minAmount ||
      createDto.amount > loanType.maxAmount
    ) {
      throw new BadRequestException(
        `Loan amount must be between ${loanType.minAmount} and ${loanType.maxAmount}`,
      );
    }

    // Validate repayment period
    if (
      createDto.repaymentPeriod < loanType.minRepaymentPeriod ||
      createDto.repaymentPeriod > loanType.maxRepaymentPeriod
    ) {
      throw new BadRequestException(
        `Repayment period must be between ${loanType.minRepaymentPeriod} and ${loanType.maxRepaymentPeriod} months`,
      );
    }

    // Check if employee grade is eligible - ACCESS GRADE CODE VIA POPULATED FIELD
    if (loanType.eligibleGrades && loanType.eligibleGrades.length > 0) {
      const employeeGradeCode = (employee.gradeId as any)?.code; // ACCESS VIA POPULATED GRADE
      if (
        employeeGradeCode &&
        !loanType.eligibleGrades.includes(employeeGradeCode)
      ) {
        throw new BadRequestException(
          `Employee grade ${employeeGradeCode} is not eligible for ${loanType.name}`,
        );
      }
    }
    // Check if employee has existing active loans
    const existingActiveLoans = await this.loanApplicationModel.countDocuments({
      employeeId: createDto.employeeId,
      status: {
        $in: [
          WorkflowStatus.SUBMITTED,
          WorkflowStatus.PENDING_APPROVAL,
          WorkflowStatus.IN_PROGRESS,
        ],
      },
    });

    if (existingActiveLoans > 0) {
      throw new BadRequestException(
        'Employee has existing active loan applications',
      );
    }

    // Calculate loan terms
    const monthlyRepayment = this.calculateMonthlyRepayment(
      createDto.amount,
      loanType.interestRate,
      createDto.repaymentPeriod,
    );
    const totalRepayment = monthlyRepayment * createDto.repaymentPeriod;

    // Check if monthly repayment is affordable (less than 40% of basic salary)
    const affordabilityRatio = monthlyRepayment / employee.currentBasicSalary;
    if (affordabilityRatio > 0.4) {
      throw new BadRequestException(
        `Monthly repayment (${monthlyRepayment}) exceeds 40% of basic salary. Loan not affordable.`,
      );
    }

    // Create loan application
    const loanApplication = new this.loanApplicationModel({
      ...createDto,
      monthlyRepayment,
      interestRate: loanType.interestRate,
      totalRepayment,
      currency: createDto.currency || 'MWK',
      status: WorkflowStatus.DRAFT,
      createdBy: new Types.ObjectId(userId),
    });

    await loanApplication.save();

    // Create workflow instance
    try {
      const employeeGradeCode = (employee.gradeId as any)?.code; // ACCESS VIA POPULATED GRADE

      const workflow =
        await this.workflowInstancesService.createWorkflowInstance({
          workflowType: WorkflowType.LOAN_APPLICATION,
          requesterId: createDto.employeeId,
          requestData: {
            loanApplicationId: loanApplication.id.toString(),
            amount: createDto.amount,
            loanType: createDto.loanType,
            purpose: createDto.purpose,
            repaymentPeriod: createDto.repaymentPeriod,
            employeeGrade: employeeGradeCode, // USE POPULATED GRADE CODE
            employeeDepartment: employee.departmentId.toString(),
          },
        });

      loanApplication.workflowId = new Types.ObjectId(workflow.id);
      loanApplication.status = WorkflowStatus.SUBMITTED;
      await loanApplication.save();

      // Emit event for notifications
      this.eventEmitter.emit('loan.application.submitted', {
        loanApplicationId: loanApplication.id.toString(),
        employeeId: createDto.employeeId,
        amount: createDto.amount,
        workflowId: workflow.id.toString(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        loanType: loanType.name,
      });

      this.logger.log(
        `Created loan application ${loanApplication._id} with workflow ${workflow._id}`,
      );

      const populatedApplication = await this.loanApplicationModel
        .findById(loanApplication._id)
        .populate(
          'employeeId',
          'employeeNumber firstName lastName gradeCode departmentId positionId',
        )
        .exec();

      return this.mapToResponseDto(populatedApplication);
    } catch (error) {
      this.logger.error(
        `Failed to create workflow for loan application ${loanApplication._id}`,
        error,
      );
      // Rollback loan application if workflow creation fails
      await this.loanApplicationModel.findByIdAndDelete(loanApplication._id);
      throw new BadRequestException(
        'Failed to create loan application workflow',
      );
    }
  }

  /**
   * Get all loan applications with filtering
   */
  /**
   * Get all loan applications with filtering
   */
  async findAll(filters: any = {}): Promise<LoanApplicationResponseDto[]> {
    const query: any = {};

    if (filters.employeeId) {
      query.employeeId = new Types.ObjectId(filters.employeeId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.loanType) {
      query.loanType = filters.loanType;
    }

    if (filters.departmentId) {
      // Find employees in the department and get their loan applications
      const departmentEmployees = await this.employeeModel
        .find({
          departmentId: new Types.ObjectId(filters.departmentId),
        })
        .select('_id')
        .exec();

      const employeeIds = departmentEmployees.map((emp) => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    const applications = await this.loanApplicationModel
      .find(query)
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' }, // ADD NESTED POPULATION
      })
      .sort({ createdAt: -1 })
      .exec();

    return applications.map((app) => this.mapToResponseDto(app));
  }

  /**
   * Get loan application by ID
   */
  async findOne(id: string): Promise<LoanApplicationResponseDto> {
    const application = await this.loanApplicationModel
      .findById(id)
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' }, // ADD NESTED POPULATION
      })
      .populate('workflowId')
      .exec();

    if (!application) {
      throw new NotFoundException('Loan application not found');
    }

    return this.mapToResponseDto(application);
  }

  /**
   * Update loan application status (called by workflow engine)
   */
  async updateStatus(
    loanApplicationId: string,
    status: WorkflowStatus,
    approvedAmount?: number,
    approvedInterestRate?: number,
    approvedRepaymentPeriod?: number,
    rejectionReason?: string,
  ): Promise<LoanApplicationDocument> {
    // First, verify the loan application exists
    const existingApplication =
      await this.loanApplicationModel.findById(loanApplicationId);
    if (!existingApplication) {
      throw new NotFoundException(
        `Loan application with ID ${loanApplicationId} not found`,
      );
    }

    const updateData: any = { status };

    if (status === WorkflowStatus.APPROVED) {
      updateData.approvalDate = new Date();
      updateData.approvedAmount = approvedAmount;
      updateData.approvedInterestRate = approvedInterestRate;
      updateData.approvedRepaymentPeriod = approvedRepaymentPeriod;

      // If amounts are adjusted, recalculate repayments
      if (approvedAmount || approvedInterestRate || approvedRepaymentPeriod) {
        const finalAmount = approvedAmount || existingApplication.amount;
        const finalInterestRate =
          approvedInterestRate || existingApplication.interestRate;
        const finalRepaymentPeriod =
          approvedRepaymentPeriod || existingApplication.repaymentPeriod;

        updateData.monthlyRepayment = this.calculateMonthlyRepayment(
          finalAmount,
          finalInterestRate,
          finalRepaymentPeriod,
        );
        updateData.totalRepayment =
          updateData.monthlyRepayment * finalRepaymentPeriod;
      }
    } else if (status === WorkflowStatus.REJECTED) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedApplication = await this.loanApplicationModel
      .findByIdAndUpdate(loanApplicationId, updateData, { new: true })
      .populate('employeeId')
      .exec();

    // This should not happen since we verified existence, but still check
    if (!updatedApplication) {
      throw new NotFoundException(
        `Failed to update loan application with ID ${loanApplicationId}`,
      );
    }

    // Prepare event data safely
    const eventData = {
      loanApplicationId,
      employeeId:
        updatedApplication.employeeId?._id?.toString() || loanApplicationId,
      employeeName: 'Unknown Employee',
      workflowId: updatedApplication.workflowId?.toString(),
    };

    // Add employee name if available
    if (
      updatedApplication.employeeId &&
      typeof updatedApplication.employeeId === 'object' &&
      'firstName' in updatedApplication.employeeId &&
      'lastName' in updatedApplication.employeeId
    ) {
      eventData.employeeName = `${updatedApplication.employeeId.firstName} ${updatedApplication.employeeId.lastName}`;
    }

    // Emit events based on status
    if (status === WorkflowStatus.APPROVED) {
      this.eventEmitter.emit('loan.application.approved', {
        ...eventData,
        approvedAmount:
          updatedApplication.approvedAmount || updatedApplication.amount,
      });
    } else if (status === WorkflowStatus.REJECTED) {
      this.eventEmitter.emit('loan.application.rejected', {
        ...eventData,
        rejectionReason,
      });
    }

    this.logger.log(
      `Updated loan application ${loanApplicationId} status to ${status}`,
    );

    return updatedApplication;
  }

  /**
   * Disburse approved loan
   */
  async disburseLoan(
    loanApplicationId: string,
    disbursedBy: string,
    disbursementDate?: Date,
  ): Promise<LoanApplicationResponseDto> {
    const application =
      await this.loanApplicationModel.findById(loanApplicationId);

    if (!application) {
      throw new NotFoundException('Loan application not found');
    }

    if (application.status !== WorkflowStatus.APPROVED) {
      throw new BadRequestException('Only approved loans can be disbursed');
    }

    if (application.disbursementDate) {
      throw new BadRequestException('Loan has already been disbursed');
    }

    application.disbursementDate = disbursementDate || new Date();
    application.status = WorkflowStatus.COMPLETED;
    application.updatedBy = new Types.ObjectId(disbursedBy);

    await application.save();

    // Emit disbursement event
    this.eventEmitter.emit('loan.disbursed', {
      loanApplicationId,
      amount: application.approvedAmount || application.amount,
      employeeId: application.employeeId,
      disbursementDate: application.disbursementDate,
    });

    // Create repayment schedule
    await this.createRepaymentSchedule(application);

    return this.mapToResponseDto(application);
  }

  /**
   * Cancel loan application
   */
  async cancelApplication(
    loanApplicationId: string,
    cancelledBy: string,
    reason: string,
  ): Promise<LoanApplicationResponseDto> {
    const application =
      await this.loanApplicationModel.findById(loanApplicationId);

    if (!application) {
      throw new NotFoundException('Loan application not found');
    }

    if (
      ![
        WorkflowStatus.DRAFT,
        WorkflowStatus.SUBMITTED,
        WorkflowStatus.PENDING_APPROVAL,
      ].includes(application.status)
    ) {
      throw new BadRequestException(
        'Cannot cancel loan application in current status',
      );
    }

    application.status = WorkflowStatus.CANCELLED;
    application.rejectionReason = reason;
    application.updatedBy = new Types.ObjectId(cancelledBy);

    await application.save();

    // Cancel workflow if exists
    if (application.workflowId) {
      await this.workflowInstancesService.cancelWorkflowInstance(
        application.workflowId.toString(),
        cancelledBy,
        reason,
      );
    }

    this.eventEmitter.emit('loan.application.cancelled', {
      loanApplicationId,
      reason,
      employeeId: application.employeeId,
    });

    return this.mapToResponseDto(application);
  }

  /**
   * Get loan statistics for employee
   */
  async getEmployeeLoanStatistics(employeeId: string): Promise<any> {
    const statistics = await this.loanApplicationModel.aggregate([
      {
        $match: {
          employeeId: new Types.ObjectId(employeeId),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalApplications = await this.loanApplicationModel.countDocuments({
      employeeId,
    });
    const approvedLoans = await this.loanApplicationModel.find({
      employeeId,
      status: WorkflowStatus.APPROVED,
    });

    const totalApprovedAmount = approvedLoans.reduce(
      (sum, loan) => sum + (loan.approvedAmount || loan.amount),
      0,
    );

    return {
      totalApplications,
      totalApprovedAmount,
      statusBreakdown: statistics,
      activeLoans: approvedLoans.filter((loan) => !loan.disbursementDate)
        .length,
    };
  }

  /**
   * Calculate monthly repayment using loan formula
   */
  private calculateMonthlyRepayment(
    principal: number,
    annualInterestRate: number,
    months: number,
  ): number {
    const monthlyRate = annualInterestRate / 100 / 12;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const numerator =
      principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return Math.round((numerator / denominator) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Create repayment schedule for disbursed loan
   */
  private async createRepaymentSchedule(
    loanApplication: LoanApplicationDocument,
  ): Promise<void> {
    // This would integrate with your repayment module
    // For now, we'll just log it
    this.logger.log(
      `Creating repayment schedule for loan ${loanApplication._id}`,
    );

    // Implementation would create LoanRepayment records in the repayments module
    // based on the loan terms and disbursement date
  }

  /**
   * Map loan application to response DTO
   */
  private mapToResponseDto(application: any): LoanApplicationResponseDto {
    // ACCESS GRADE CODE VIA POPULATED GRADEID
    const employeeGradeCode = application.employeeId?.gradeId?.code;

    const employeeDto = application.employeeId
      ? {
          id: application.employeeId._id.toString(),
          employeeNumber: application.employeeId.employeeNumber,
          firstName: application.employeeId.firstName,
          lastName: application.employeeId.lastName,
          gradeCode: employeeGradeCode, // USE POPULATED GRADE CODE
        }
      : undefined;

    return {
      id: application._id.toString(),
      employee: employeeDto,
      loanType: application.loanType,
      amount: application.amount,
      currency: application.currency,
      purpose: application.purpose,
      repaymentPeriod: application.repaymentPeriod,
      monthlyRepayment: application.monthlyRepayment,
      interestRate: application.interestRate,
      totalRepayment: application.totalRepayment,
      supportingDocuments: application.supportingDocuments,
      workflowId:
        application.workflowId?._id?.toString() ||
        application.workflowId?.toString(),
      status: application.status,
      approvedAmount: application.approvedAmount,
      approvedInterestRate: application.approvedInterestRate,
      approvedRepaymentPeriod: application.approvedRepaymentPeriod,
      approvalDate: application.approvalDate,
      disbursementDate: application.disbursementDate,
      rejectionReason: application.rejectionReason,
      metadata: application.metadata,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
