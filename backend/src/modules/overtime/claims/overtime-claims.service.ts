import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OvertimeType, ClaimStatus } from '../../../common/enums';

import {
  OvertimeClaim,
  OvertimeClaimDocument,
} from './schemas/overtime-claim.schema';

import {
  Employee,
  EmployeeDocument,
} from '../../employees/schemas/employee.schema';
import { WorkflowInstancesService } from '../../workflows/instances/workflow-instances.service';
import { DynamicWorkflowEngineService } from '../../workflows/services/dynamic-workflow-engine.service';
import { OvertimeRateConfigService } from './overtime-rate-config.service';
import { CreateOvertimeClaimDto } from './dto/create-overtime-claim.dto';
import { OvertimeClaimResponseDto } from './dto/overtime-claim-response.dto';
import { WorkflowType, WorkflowStatus } from '../../../common/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OvertimeClaimsService {
  private readonly logger = new Logger(OvertimeClaimsService.name);

  constructor(
    @InjectModel(OvertimeClaim.name)
    private overtimeClaimModel: Model<OvertimeClaimDocument>,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    private workflowInstancesService: WorkflowInstancesService,
    private dynamicWorkflowEngine: DynamicWorkflowEngineService,
    private overtimeRateConfigService: OvertimeRateConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate claim reference number
   */
  private async generateClaimReference(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const count = await this.overtimeClaimModel.countDocuments({
      claimReference: new RegExp(`^OVT-${year}-${month}-`),
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `OVT-${year}-${month}-${sequence}`;
  }

  /**
   * Calculate total hours from start and end time
   */
  private calculateTotalHours(
    startTime: Date,
    endTime: Date,
    breakHours: number = 0,
  ): number {
    const diffTime = Math.abs(endTime.getTime() - startTime.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    return Math.max(0, diffHours - breakHours);
  }

  /**
   * Calculate basic hourly rate from annual salary
   */
  private calculateBasicHourlyRate(annualSalary: number): number {
    // Assuming 260 working days per year, 8 hours per day
    const annualWorkingHours = 260 * 8;
    return annualSalary / annualWorkingHours;
  }

  /**
   * Determine if overtime is auto-approved based on rules
   */
  private async determineAutoApproval(
    gradeCode: string,
    overtimeType: OvertimeType,
    totalHours: number,
  ): Promise<{
    isAutoApproved: boolean;
    autoApprovalReason?: string;
  }> {
    const approvalRules = await this.overtimeRateConfigService.getApprovalRules(
      gradeCode,
      overtimeType,
      totalHours,
    );

    return {
      isAutoApproved: approvalRules.isAutoApproved,
      autoApprovalReason: approvalRules.autoApproveReason,
    };
  }

  /**
   * Create a new overtime claim with workflow integration
   */
  async create(
    createDto: CreateOvertimeClaimDto,
    userId: string,
  ): Promise<OvertimeClaimResponseDto> {
    // Validate employee exists and is active
    const employee = await this.employeeModel
      .findById(createDto.employeeId)
      .populate('gradeId');

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createDto.employeeId} not found`,
      );
    }

    if (employee.employmentStatus !== 'ACTIVE') {
      throw new BadRequestException(
        'Only active employees can submit overtime claims',
      );
    }

    // Calculate total hours
    const totalHours = this.calculateTotalHours(
      createDto.workingHours.startTime,
      createDto.workingHours.endTime,
      createDto.workingHours.breakHours,
    );

    if (totalHours <= 0) {
      throw new BadRequestException('Overtime hours must be greater than 0');
    }

    // Get employee grade code
    const gradeCode = (employee.gradeId as any)?.code;
    if (!gradeCode) {
      throw new BadRequestException('Employee grade information is missing');
    }

    // Validate overtime limits
    const validation =
      await this.overtimeRateConfigService.validateOvertimeLimits(
        gradeCode,
        createDto.overtimeType,
        totalHours,
        createDto.claimDate,
      );

    if (!validation.isValid) {
      throw new BadRequestException(
        `Overtime validation failed: ${validation.errors.join(', ')}`,
      );
    }

    // Calculate basic hourly rate
    const basicHourlyRate = this.calculateBasicHourlyRate(
      employee.currentBasicSalary,
    );

    // Calculate overtime payments
    const paymentBreakdown =
      await this.overtimeRateConfigService.calculateOvertimePay(
        gradeCode,
        createDto.overtimeType,
        totalHours,
        basicHourlyRate,
      );

    // Determine if auto-approved
    const autoApproval = await this.determineAutoApproval(
      gradeCode,
      createDto.overtimeType,
      totalHours,
    );

    // Generate claim reference
    const claimReference = await this.generateClaimReference();

    // Get approval rules
    const approvalRules = await this.overtimeRateConfigService.getApprovalRules(
      gradeCode,
      createDto.overtimeType,
      totalHours,
    );

    // Determine initial status
    let initialStatus = ClaimStatus.PENDING_APPROVAL;
    if (autoApproval.isAutoApproved) {
      initialStatus = ClaimStatus.APPROVED;
    }

    // Create overtime claim
    const overtimeClaim = new this.overtimeClaimModel({
      claimReference,
      employeeId: new Types.ObjectId(createDto.employeeId),
      claimDate: createDto.claimDate,
      overtimeType: createDto.overtimeType,
      workingHours: {
        ...createDto.workingHours,
        totalHours,
      },
      reason: createDto.reason,
      projectCode: createDto.projectCode,
      taskReference: createDto.taskReference,
      clientName: createDto.clientName,
      supervisorConfirmed: createDto.supervisorConfirmed || false,
      calculatedPayments: {
        basicHourlyRate,
        ...paymentBreakdown,
      },
      approvalRules: {
        isAutoApproved: autoApproval.isAutoApproved,
        autoApprovalReason: autoApproval.autoApprovalReason,
        requiresManagerApproval: approvalRules.requiresManagerApproval,
        requiresHrApproval: approvalRules.requiresHrApproval,
        requiresFinanceApproval: approvalRules.requiresFinanceApproval,
      },
      status: initialStatus,
      comments: createDto.comments,
      supportingDocuments: createDto.supportingDocuments || [],
      metadata: createDto.metadata,
      createdBy: new Types.ObjectId(userId),
    });

    await overtimeClaim.save();

    // If auto-approved, skip workflow
    if (autoApproval.isAutoApproved) {
      overtimeClaim.status = ClaimStatus.APPROVED;
      overtimeClaim.approvedAt = new Date();
      await overtimeClaim.save();

      this.eventEmitter.emit('overtime.claim.auto_approved', {
        claimId: overtimeClaim.id.toString(),
        claimReference: overtimeClaim.claimReference,
        employeeId: createDto.employeeId,
        totalHours,
        totalAmount: paymentBreakdown.totalAmount,
        autoApprovalReason: autoApproval.autoApprovalReason,
      });

      this.logger.log(
        `Auto-approved overtime claim ${overtimeClaim.claimReference} (${totalHours} hours)`,
      );
    } else {
      // Create workflow instance for approval
      try {
        const workflow =
          await this.workflowInstancesService.createWorkflowInstance({
            workflowType: WorkflowType.OVERTIME_CLAIM,
            requesterId: createDto.employeeId,
            requestData: {
              claimId: overtimeClaim.id.toString(),
              claimReference: overtimeClaim.claimReference,
              employeeGrade: gradeCode,
              employeeDepartment: employee.departmentId.toString(),
              overtimeType: createDto.overtimeType,
              totalHours,
              totalAmount: paymentBreakdown.totalAmount,
              reason: createDto.reason,
              projectCode: createDto.projectCode,
            },
          });

        overtimeClaim.workflowId = new Types.ObjectId(workflow.id);
        overtimeClaim.status = ClaimStatus.PENDING_APPROVAL;
        await overtimeClaim.save();

        // Emit event for notifications
        this.eventEmitter.emit('overtime.claim.submitted', {
          claimId: overtimeClaim.id.toString(),
          claimReference: overtimeClaim.claimReference,
          employeeId: createDto.employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          totalHours,
          totalAmount: paymentBreakdown.totalAmount,
          workflowId: workflow.id.toString(),
        });

        this.logger.log(
          `Created overtime claim ${overtimeClaim.claimReference} with workflow ${workflow._id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create workflow for overtime claim ${overtimeClaim.claimReference}`,
          error,
        );
        // Rollback overtime claim if workflow creation fails
        await this.overtimeClaimModel.findByIdAndDelete(overtimeClaim._id);
        throw new BadRequestException(
          'Failed to create overtime claim workflow',
        );
      }
    }

    // Log validation warnings
    if (validation.warnings.length > 0) {
      this.logger.warn(
        `Overtime claim ${overtimeClaim.claimReference} warnings: ${validation.warnings.join(', ')}`,
      );
    }

    const populatedClaim = await this.overtimeClaimModel
      .findById(overtimeClaim._id)
      .populate(
        'employeeId',
        'employeeNumber firstName lastName gradeCode departmentId positionId',
      )
      .exec();

    return this.mapToResponseDto(populatedClaim);
  }

  /**
   * Get all overtime claims with filtering
   */
  async findAll(filters: any = {}): Promise<OvertimeClaimResponseDto[]> {
    const query: any = {};

    if (filters.employeeId) {
      query.employeeId = new Types.ObjectId(filters.employeeId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.overtimeType) {
      query.overtimeType = filters.overtimeType;
    }

    if (filters.departmentId) {
      const departmentEmployees = await this.employeeModel
        .find({
          departmentId: new Types.ObjectId(filters.departmentId),
        })
        .select('_id')
        .exec();

      const employeeIds = departmentEmployees.map((emp) => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    if (filters.projectCode) {
      query.projectCode = filters.projectCode;
    }

    if (filters.fromDate) {
      query.claimDate = { $gte: new Date(filters.fromDate) };
    }

    if (filters.toDate) {
      query.claimDate = { $lte: new Date(filters.toDate) };
    }

    if (filters.supervisorConfirmed !== undefined) {
      query.supervisorConfirmed = filters.supervisorConfirmed === 'true';
    }

    const claims = await this.overtimeClaimModel
      .find(query)
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' },
      })
      .populate('confirmedBy', 'firstName lastName employeeNumber')
      .sort({ claimDate: -1, createdAt: -1 })
      .exec();

    return claims.map((claim) => this.mapToResponseDto(claim));
  }

  /**
   * Get overtime claim by ID
   */
  async findOne(id: string): Promise<OvertimeClaimResponseDto> {
    const claim = await this.overtimeClaimModel
      .findById(id)
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' },
      })
      .populate('confirmedBy', 'firstName lastName employeeNumber')
      .populate('workflowId')
      .exec();

    if (!claim) {
      throw new NotFoundException('Overtime claim not found');
    }

    return this.mapToResponseDto(claim);
  }

  /**
   * Get overtime claim by reference
   */
  async findByReference(
    claimReference: string,
  ): Promise<OvertimeClaimResponseDto> {
    const claim = await this.overtimeClaimModel
      .findOne({ claimReference })
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' },
      })
      .populate('confirmedBy', 'firstName lastName employeeNumber')
      .populate('workflowId')
      .exec();

    if (!claim) {
      throw new NotFoundException('Overtime claim not found');
    }

    return this.mapToResponseDto(claim);
  }

  /**
   * Update overtime claim status (called by workflow engine)
   */
  async updateStatus(
    claimId: string,
    status: ClaimStatus,
    rejectionReason?: string,
  ): Promise<OvertimeClaimDocument> {
    const claim = await this.overtimeClaimModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException(
        `Overtime claim with ID ${claimId} not found`,
      );
    }

    const updateData: any = { status };

    if (status === ClaimStatus.APPROVED) {
      updateData.approvedAt = new Date();
    } else if (status === ClaimStatus.REJECTED) {
      updateData.rejectionReason = rejectionReason;
    } else if (status === ClaimStatus.PROCESSED) {
      updateData.processedAt = new Date();
      // Set payroll period (YYYY-MM format)
      const now = new Date();
      updateData.payrollPeriod = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    } else if (status === ClaimStatus.PAID) {
      updateData.paidAt = new Date();
    }

    const updatedClaim = await this.overtimeClaimModel
      .findByIdAndUpdate(claimId, updateData, { new: true })
      .populate('employeeId')
      .exec();

    if (!updatedClaim) {
      throw new NotFoundException(
        `Failed to update overtime claim with ID ${claimId}`,
      );
    }

    // Prepare event data
    const eventData = {
      claimId,
      claimReference: updatedClaim.claimReference,
      employeeId: updatedClaim.employeeId?._id?.toString(),
      employeeName: 'Unknown Employee',
      workflowId: updatedClaim.workflowId?.toString(),
    };

    // Add employee name if available
    if (
      updatedClaim.employeeId &&
      typeof updatedClaim.employeeId === 'object' &&
      'firstName' in updatedClaim.employeeId &&
      'lastName' in updatedClaim.employeeId
    ) {
      eventData.employeeName = `${updatedClaim.employeeId.firstName} ${updatedClaim.employeeId.lastName}`;
    }

    // Emit events based on status
    switch (status) {
      case ClaimStatus.APPROVED:
        this.eventEmitter.emit('overtime.claim.approved', {
          ...eventData,
          totalHours: updatedClaim.workingHours.totalHours,
          totalAmount: updatedClaim.calculatedPayments?.totalAmount,
        });
        break;
      case ClaimStatus.REJECTED:
        this.eventEmitter.emit('overtime.claim.rejected', {
          ...eventData,
          rejectionReason,
        });
        break;
      case ClaimStatus.PROCESSED:
        this.eventEmitter.emit('overtime.claim.processed', {
          ...eventData,
          payrollPeriod: updatedClaim.payrollPeriod,
        });
        break;
      case ClaimStatus.PAID:
        this.eventEmitter.emit('overtime.claim.paid', {
          ...eventData,
        });
        break;
    }

    this.logger.log(
      `Updated overtime claim ${claim.claimReference} status to ${status}`,
    );

    return updatedClaim;
  }

  /**
   * Confirm overtime claim by supervisor
   */
  async confirmBySupervisor(
    claimId: string,
    supervisorId: string,
    comments?: string,
  ): Promise<OvertimeClaimResponseDto> {
    const claim = await this.overtimeClaimModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Overtime claim not found');
    }

    if (claim.status !== ClaimStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only confirm claims pending approval');
    }

    if (claim.supervisorConfirmed) {
      throw new BadRequestException('Claim already confirmed by supervisor');
    }

    // Verify supervisor exists
    const supervisor = await this.employeeModel.findById(supervisorId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    // Verify supervisor is actually a supervisor
    if (!supervisor.isSupervisor && !supervisor.isDepartmentManager) {
      throw new BadRequestException('User is not authorized as a supervisor');
    }

    claim.supervisorConfirmed = true;
    claim.supervisorConfirmationDate = new Date();
    claim.confirmedBy = new Types.ObjectId(supervisorId);
    if (comments) {
      claim.comments = comments;
    }

    await claim.save();

    this.eventEmitter.emit('overtime.claim.supervisor_confirmed', {
      claimId,
      claimReference: claim.claimReference,
      supervisorId,
      employeeId: claim.employeeId.toString(),
    });

    return this.mapToResponseDto(claim);
  }

  /**
   * Process approved overtime claims for payroll
   */
  async processForPayroll(
    claimIds: string[],
    processedBy: string,
    payrollPeriod: string,
  ): Promise<OvertimeClaimResponseDto[]> {
    const processedClaims: OvertimeClaimResponseDto[] = [];

    for (const claimId of claimIds) {
      const claim = await this.overtimeClaimModel.findById(claimId);
      if (!claim) {
        throw new NotFoundException(`Overtime claim ${claimId} not found`);
      }

      if (claim.status !== ClaimStatus.APPROVED) {
        throw new BadRequestException(
          `Claim ${claim.claimReference} is not approved`,
        );
      }

      if (claim.processedAt) {
        throw new BadRequestException(
          `Claim ${claim.claimReference} is already processed`,
        );
      }

      claim.status = ClaimStatus.PROCESSED;
      claim.processedAt = new Date();
      claim.payrollPeriod = payrollPeriod;
      claim.updatedBy = new Types.ObjectId(processedBy);

      await claim.save();

      processedClaims.push(this.mapToResponseDto(claim));
    }

    this.logger.log(
      `Processed ${processedClaims.length} overtime claims for payroll period ${payrollPeriod}`,
    );

    return processedClaims;
  }

  /**
   * Cancel overtime claim
   */
  async cancelClaim(
    claimId: string,
    cancelledBy: string,
    reason: string,
  ): Promise<OvertimeClaimResponseDto> {
    const claim = await this.overtimeClaimModel.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Overtime claim not found');
    }

    if (
      ![ClaimStatus.DRAFT, ClaimStatus.PENDING_APPROVAL].includes(claim.status)
    ) {
      throw new BadRequestException(
        'Cannot cancel overtime claim in current status',
      );
    }

    claim.status = ClaimStatus.CANCELLED;
    claim.rejectionReason = reason;
    claim.updatedBy = new Types.ObjectId(cancelledBy);

    await claim.save();

    // Cancel workflow if exists
    if (claim.workflowId) {
      await this.workflowInstancesService.cancelWorkflowInstance(
        claim.workflowId.toString(),
        cancelledBy,
        reason,
      );
    }

    this.eventEmitter.emit('overtime.claim.cancelled', {
      claimId,
      claimReference: claim.claimReference,
      reason,
      employeeId: claim.employeeId,
    });

    return this.mapToResponseDto(claim);
  }

  /**
   * Get overtime statistics
   */
  async getOvertimeStatistics(filters: any = {}): Promise<any> {
    const query: any = {};

    if (filters.departmentId) {
      const departmentEmployees = await this.employeeModel
        .find({
          departmentId: new Types.ObjectId(filters.departmentId),
        })
        .select('_id')
        .exec();

      const employeeIds = departmentEmployees.map((emp) => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    if (filters.fromDate) {
      query.claimDate = { $gte: new Date(filters.fromDate) };
    }

    if (filters.toDate) {
      query.claimDate = { $lte: new Date(filters.toDate) };
    }

    const statistics = await this.overtimeClaimModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$workingHours.totalHours' },
          totalAmount: { $sum: '$calculatedPayments.totalAmount' },
          avgHours: { $avg: '$workingHours.totalHours' },
          avgAmount: { $avg: '$calculatedPayments.totalAmount' },
        },
      },
    ]);

    const byOvertimeType = await this.overtimeClaimModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$overtimeType',
          count: { $sum: 1 },
          totalHours: { $sum: '$workingHours.totalHours' },
          totalAmount: { $sum: '$calculatedPayments.totalAmount' },
        },
      },
    ]);

    const byEmployee = await this.overtimeClaimModel.aggregate([
      { $match: { ...query, status: ClaimStatus.APPROVED } },
      {
        $group: {
          _id: '$employeeId',
          count: { $sum: 1 },
          totalHours: { $sum: '$workingHours.totalHours' },
          totalAmount: { $sum: '$calculatedPayments.totalAmount' },
        },
      },
      { $sort: { totalHours: -1 } },
      { $limit: 10 },
    ]);

    const totalClaims = await this.overtimeClaimModel.countDocuments(query);
    const approvedClaims = await this.overtimeClaimModel.find({
      ...query,
      status: ClaimStatus.APPROVED,
    });

    const totalApprovedHours = approvedClaims.reduce(
      (sum, claim) => sum + (claim.workingHours?.totalHours || 0),
      0,
    );

    const totalApprovedAmount = approvedClaims.reduce(
      (sum, claim) => sum + (claim.calculatedPayments?.totalAmount || 0),
      0,
    );

    return {
      totalClaims,
      totalApprovedHours,
      totalApprovedAmount,
      statusBreakdown: statistics,
      byOvertimeType,
      topEmployees: byEmployee,
      pendingApprovals:
        statistics.find(
          (stat: any) => stat._id === ClaimStatus.PENDING_APPROVAL,
        )?.count || 0,
      approvedClaims: approvedClaims.length,
    };
  }

  /**
   * Get employee overtime statistics
   */
  async getEmployeeOvertimeStatistics(employeeId: string): Promise<any> {
    const statistics = await this.overtimeClaimModel.aggregate([
      {
        $match: {
          employeeId: new Types.ObjectId(employeeId),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$workingHours.totalHours' },
          totalAmount: { $sum: '$calculatedPayments.totalAmount' },
        },
      },
    ]);

    const byMonth = await this.overtimeClaimModel.aggregate([
      {
        $match: {
          employeeId: new Types.ObjectId(employeeId),
          status: ClaimStatus.APPROVED,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$claimDate' },
            month: { $month: '$claimDate' },
          },
          count: { $sum: 1 },
          totalHours: { $sum: '$workingHours.totalHours' },
          totalAmount: { $sum: '$calculatedPayments.totalAmount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    const totalClaims = await this.overtimeClaimModel.countDocuments({
      employeeId,
    });

    const approvedClaims = await this.overtimeClaimModel.find({
      employeeId,
      status: ClaimStatus.APPROVED,
    });

    const totalApprovedHours = approvedClaims.reduce(
      (sum, claim) => sum + (claim.workingHours?.totalHours || 0),
      0,
    );

    const totalApprovedAmount = approvedClaims.reduce(
      (sum, claim) => sum + (claim.calculatedPayments?.totalAmount || 0),
      0,
    );

    const pendingClaims = await this.overtimeClaimModel.countDocuments({
      employeeId,
      status: ClaimStatus.PENDING_APPROVAL,
    });

    return {
      totalClaims,
      totalApprovedHours,
      totalApprovedAmount,
      pendingClaims,
      statusBreakdown: statistics,
      monthlyBreakdown: byMonth,
      autoApprovedClaims:
        statistics.find(
          (stat: any) =>
            stat._id === ClaimStatus.APPROVED && stat.isAutoApproved,
        )?.count || 0,
    };
  }

  /**
   * Get monthly overtime summary for payroll
   */
  async getMonthlySummary(
    year: number,
    month: number,
    departmentId?: string,
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const query: any = {
      claimDate: { $gte: startDate, $lte: endDate },
      status: ClaimStatus.APPROVED,
    };

    if (departmentId) {
      const departmentEmployees = await this.employeeModel
        .find({
          departmentId: new Types.ObjectId(departmentId),
        })
        .select('_id')
        .exec();

      const employeeIds = departmentEmployees.map((emp) => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    const summary = await this.overtimeClaimModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$employeeId',
          totalHours: { $sum: '$workingHours.totalHours' },
          totalAmount: { $sum: '$calculatedPayments.totalAmount' },
          claimCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          employeeNumber: '$employee.employeeNumber',
          employeeName: {
            $concat: ['$employee.firstName', ' ', '$employee.lastName'],
          },
          departmentId: '$employee.departmentId',
          totalHours: 1,
          totalAmount: 1,
          claimCount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalSummary = await this.overtimeClaimModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEmployees: { $addToSet: '$employeeId' },
          totalHours: { $sum: '$workingHours.totalHours' },
          totalAmount: { $sum: '$calculatedPayments.totalAmount' },
          totalClaims: { $sum: 1 },
        },
      },
    ]);

    return {
      month: `${year}-${month.toString().padStart(2, '0')}`,
      employeeSummary: summary,
      totals: totalSummary[0] || {
        totalEmployees: 0,
        totalHours: 0,
        totalAmount: 0,
        totalClaims: 0,
      },
    };
  }

  /**
   * Map overtime claim to response DTO
   */
  private mapToResponseDto(claim: any): OvertimeClaimResponseDto {
    return {
      id: claim._id.toString(),
      claimReference: claim.claimReference,
      employeeId:
        claim.employeeId?._id?.toString() || claim.employeeId?.toString(),
      claimDate: claim.claimDate,
      overtimeType: claim.overtimeType,
      workingHours: claim.workingHours,
      reason: claim.reason,
      projectCode: claim.projectCode,
      taskReference: claim.taskReference,
      clientName: claim.clientName,
      supervisorConfirmed: claim.supervisorConfirmed,
      supervisorConfirmationDate: claim.supervisorConfirmationDate,
      confirmedBy: claim.confirmedBy?._id?.toString(),
      calculatedPayments: claim.calculatedPayments,
      approvalRules: claim.approvalRules,
      status: claim.status,
      workflowId:
        claim.workflowId?._id?.toString() || claim.workflowId?.toString(),
      rejectionReason: claim.rejectionReason,
      approvedAt: claim.approvedAt,
      processedAt: claim.processedAt,
      paidAt: claim.paidAt,
      payrollPeriod: claim.payrollPeriod,
      comments: claim.comments,
      supportingDocuments: claim.supportingDocuments,
      metadata: claim.metadata,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
    };
  }
}
