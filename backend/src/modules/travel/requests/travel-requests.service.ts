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
  TravelRequest,
  TravelRequestDocument,
} from './schemas/travel-request.schema';
import {
  Employee,
  EmployeeDocument,
} from '../../employees/schemas/employee.schema';
import { WorkflowInstancesService } from '../../workflows/instances/workflow-instances.service';
import { DynamicWorkflowEngineService } from '../../workflows/services/dynamic-workflow-engine.service';
import { TravelRateConfigService } from './travel-rate-config.service';
import { CreateTravelRequestDto } from './dto/create-travel-request.dto';
import {
  TravelRequestResponseDto,
} from './dto/travel-request-response.dto';
import { WorkflowType, TravelStatus } from '../../../common/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TravelRequestsService {
  private readonly logger = new Logger(TravelRequestsService.name);

  constructor(
    @InjectModel(TravelRequest.name)
    private travelRequestModel: Model<TravelRequestDocument>,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    private workflowInstancesService: WorkflowInstancesService,
    private dynamicWorkflowEngine: DynamicWorkflowEngineService,
    private travelRateConfigService: TravelRateConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate travel reference number
   */
  private async generateTravelReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.travelRequestModel.countDocuments({
      travelReference: new RegExp(`^TRV-${year}-`),
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    return `TRV-${year}-${sequence}`;
  }

  /**
   * Calculate number of days between dates
   */
  private calculateNumberOfDays(departureDate: Date, returnDate: Date): number {
    const diffTime = Math.abs(returnDate.getTime() - departureDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include departure day
  }

  /**
   * Create a new travel request with workflow integration
   */
  async create(
    createDto: CreateTravelRequestDto,
    userId: string,
  ): Promise<TravelRequestResponseDto> {
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
        'Only active employees can submit travel requests',
      );
    }

    // Calculate number of days
    const numberOfDays = this.calculateNumberOfDays(
      createDto.travelDates.departureDate,
      createDto.travelDates.returnDate
    );

    // Get employee grade code
    const gradeCode = (employee.gradeId as any)?.code;
    if (!gradeCode) {
      throw new BadRequestException('Employee grade information is missing');
    }

    // Calculate travel costs using rate config
    const costBreakdown = await this.travelRateConfigService.calculateTravelCosts(
      gradeCode,
      createDto.travelType,
      numberOfDays,
      createDto.accommodationType,
      createDto.transportDetails.mode
    );

    // Generate travel reference
    const travelReference = await this.generateTravelReference();

    // Create travel request
    const travelRequest = new this.travelRequestModel({
      travelReference,
      employeeId: new Types.ObjectId(createDto.employeeId),
      travelPurpose: createDto.travelPurpose,
      travelType: createDto.travelType,
      destination: createDto.destination,
      travelDates: {
        ...createDto.travelDates,
        numberOfDays
      },
      accommodationType: createDto.accommodationType,
      accommodationDetails: createDto.accommodationDetails,
      travelMode: createDto.travelMode,
      transportDetails: createDto.transportDetails,
      additionalRequests: createDto.additionalRequests,
      calculatedCosts: {
        ...costBreakdown,
        advanceAmount: createDto.additionalRequests?.advanceAmount || 0,
        otherCosts: 0, // Could be calculated from other inputs
      },
      urgency: createDto.urgency || 'NORMAL',
      status: TravelStatus.DRAFT,
      comments: createDto.comments,
      metadata: createDto.metadata,
      createdBy: new Types.ObjectId(userId),
    });

    await travelRequest.save();

    // Create workflow instance
    try {
      const workflow = await this.workflowInstancesService.createWorkflowInstance({
        workflowType: WorkflowType.TRAVEL_REQUEST,
        requesterId: createDto.employeeId,
        requestData: {
          travelRequestId: travelRequest.id.toString(),
          travelReference: travelRequest.travelReference,
          employeeGrade: gradeCode,
          employeeDepartment: employee.departmentId.toString(),
          travelType: createDto.travelType,
          travelPurpose: createDto.travelPurpose,
          destination: createDto.destination,
          totalEstimatedCost: costBreakdown.totalEstimatedCost,
          currency: costBreakdown.currency,
          numberOfDays,
          urgency: createDto.urgency || 'NORMAL',
        },
      });

      travelRequest.workflowId = new Types.ObjectId(workflow.id);
      travelRequest.status = TravelStatus.PENDING_APPROVAL;
      await travelRequest.save();

      // Emit event for notifications
      this.eventEmitter.emit('travel.request.submitted', {
        travelRequestId: travelRequest.id.toString(),
        travelReference: travelRequest.travelReference,
        employeeId: createDto.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        destination: `${createDto.destination.city}, ${createDto.destination.country}`,
        totalEstimatedCost: costBreakdown.totalEstimatedCost,
        currency: costBreakdown.currency,
        workflowId: workflow.id.toString(),
      });

      this.logger.log(
        `Created travel request ${travelRequest.travelReference} with workflow ${workflow._id}`,
      );

      const populatedRequest = await this.travelRequestModel
        .findById(travelRequest._id)
        .populate('employeeId', 'employeeNumber firstName lastName gradeCode departmentId positionId')
        .exec();

      return this.mapToResponseDto(populatedRequest);
    } catch (error) {
      this.logger.error(
        `Failed to create workflow for travel request ${travelRequest.travelReference}`,
        error,
      );
      // Rollback travel request if workflow creation fails
      await this.travelRequestModel.findByIdAndDelete(travelRequest._id);
      throw new BadRequestException(
        'Failed to create travel request workflow',
      );
    }
  }

  /**
   * Get all travel requests with filtering
   */
  async findAll(filters: any = {}): Promise<TravelRequestResponseDto[]> {
    const query: any = {};

    if (filters.employeeId) {
      query.employeeId = new Types.ObjectId(filters.employeeId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.travelType) {
      query.travelType = filters.travelType;
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

    if (filters.destinationCountry) {
      query['destination.country'] = filters.destinationCountry;
    }

    if (filters.fromDate) {
      query['travelDates.departureDate'] = { $gte: new Date(filters.fromDate) };
    }

    if (filters.toDate) {
      query['travelDates.returnDate'] = { $lte: new Date(filters.toDate) };
    }

    const requests = await this.travelRequestModel
      .find(query)
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' },
      })
      .sort({ createdAt: -1 })
      .exec();

    return requests.map((req) => this.mapToResponseDto(req));
  }

  /**
   * Get travel request by ID
   */
  async findOne(id: string): Promise<TravelRequestResponseDto> {
    const request = await this.travelRequestModel
      .findById(id)
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' },
      })
      .populate('workflowId')
      .exec();

    if (!request) {
      throw new NotFoundException('Travel request not found');
    }

    return this.mapToResponseDto(request);
  }

  /**
   * Get travel request by reference
   */
  async findByReference(travelReference: string): Promise<TravelRequestResponseDto> {
    const request = await this.travelRequestModel
      .findOne({ travelReference })
      .populate({
        path: 'employeeId',
        populate: { path: 'gradeId' },
      })
      .populate('workflowId')
      .exec();

    if (!request) {
      throw new NotFoundException('Travel request not found');
    }

    return this.mapToResponseDto(request);
  }

  /**
   * Update travel request status (called by workflow engine)
   */
  async updateStatus(
    travelRequestId: string,
    status: TravelStatus,
    rejectionReason?: string,
  ): Promise<TravelRequestDocument> {
    const travelRequest = await this.travelRequestModel.findById(travelRequestId);
    if (!travelRequest) {
      throw new NotFoundException(
        `Travel request with ID ${travelRequestId} not found`,
      );
    }

    const updateData: any = { status };

    if (status === TravelStatus.APPROVED) {
      updateData.approvedAt = new Date();
    } else if (status === TravelStatus.REJECTED) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedRequest = await this.travelRequestModel
      .findByIdAndUpdate(travelRequestId, updateData, { new: true })
      .populate('employeeId')
      .exec();

    if (!updatedRequest) {
      throw new NotFoundException(
        `Failed to update travel request with ID ${travelRequestId}`,
      );
    }

    // Prepare event data
    const eventData = {
      travelRequestId,
      travelReference: updatedRequest.travelReference,
      employeeId: updatedRequest.employeeId?._id?.toString(),
      employeeName: 'Unknown Employee',
      workflowId: updatedRequest.workflowId?.toString(),
    };

    // Add employee name if available
    if (
      updatedRequest.employeeId &&
      typeof updatedRequest.employeeId === 'object' &&
      'firstName' in updatedRequest.employeeId &&
      'lastName' in updatedRequest.employeeId
    ) {
      eventData.employeeName = `${updatedRequest.employeeId.firstName} ${updatedRequest.employeeId.lastName}`;
    }

    // Emit events based on status
    if (status === TravelStatus.APPROVED) {
      this.eventEmitter.emit('travel.request.approved', {
        ...eventData,
        totalEstimatedCost: updatedRequest.calculatedCosts?.totalEstimatedCost,
        currency: updatedRequest.calculatedCosts?.currency,
      });
    } else if (status === TravelStatus.REJECTED) {
      this.eventEmitter.emit('travel.request.rejected', {
        ...eventData,
        rejectionReason,
      });
    }

    this.logger.log(
      `Updated travel request ${travelRequest.travelReference} status to ${status}`,
    );

    return updatedRequest;
  }

  /**
   * Cancel travel request
   */
  async cancelRequest(
    travelRequestId: string,
    cancelledBy: string,
    reason: string,
  ): Promise<TravelRequestResponseDto> {
    const request = await this.travelRequestModel.findById(travelRequestId);

    if (!request) {
      throw new NotFoundException('Travel request not found');
    }

    if (
      ![
        TravelStatus.DRAFT,
        TravelStatus.PENDING_APPROVAL,
      ].includes(request.status)
    ) {
      throw new BadRequestException(
        'Cannot cancel travel request in current status',
      );
    }

    request.status = TravelStatus.CANCELLED;
    request.rejectionReason = reason;
    request.updatedBy = new Types.ObjectId(cancelledBy);

    await request.save();

    // Cancel workflow if exists
    if (request.workflowId) {
      await this.workflowInstancesService.cancelWorkflowInstance(
        request.workflowId.toString(),
        cancelledBy,
        reason,
      );
    }

    this.eventEmitter.emit('travel.request.cancelled', {
      travelRequestId,
      travelReference: request.travelReference,
      reason,
      employeeId: request.employeeId,
    });

    return this.mapToResponseDto(request);
  }

  /**
   * Complete travel request (mark as completed after travel)
   */
  async completeRequest(
    travelRequestId: string,
    completedBy: string,
  ): Promise<TravelRequestResponseDto> {
    const request = await this.travelRequestModel.findById(travelRequestId);

    if (!request) {
      throw new NotFoundException('Travel request not found');
    }

    if (request.status !== TravelStatus.APPROVED) {
      throw new BadRequestException('Only approved travel requests can be marked as completed');
    }

    if (request.completedAt) {
      throw new BadRequestException('Travel request is already completed');
    }

    request.status = TravelStatus.COMPLETED;
    request.completedAt = new Date();
    request.updatedBy = new Types.ObjectId(completedBy);

    await request.save();

    this.eventEmitter.emit('travel.request.completed', {
      travelRequestId,
      travelReference: request.travelReference,
      employeeId: request.employeeId,
    });

    return this.mapToResponseDto(request);
  }

  /**
   * Get travel statistics
   */
  async getTravelStatistics(filters: any = {}): Promise<any> {
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
      query['travelDates.departureDate'] = { $gte: new Date(filters.fromDate) };
    }

    if (filters.toDate) {
      query['travelDates.returnDate'] = { $lte: new Date(filters.toDate) };
    }

    const statistics = await this.travelRequestModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$calculatedCosts.totalEstimatedCost' },
          avgDays: { $avg: '$travelDates.numberOfDays' },
        },
      },
    ]);

    const totalRequests = await this.travelRequestModel.countDocuments(query);
    const approvedRequests = await this.travelRequestModel.find({
      ...query,
      status: TravelStatus.APPROVED,
    });

    const totalApprovedCost = approvedRequests.reduce(
      (sum, req) => sum + (req.calculatedCosts?.totalEstimatedCost || 0),
      0,
    );

    const byTravelType = await this.travelRequestModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$travelType',
          count: { $sum: 1 },
          totalCost: { $sum: '$calculatedCosts.totalEstimatedCost' },
        },
      },
    ]);

    const byPurpose = await this.travelRequestModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$travelPurpose',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalRequests,
      totalApprovedCost,
      statusBreakdown: statistics,
      byTravelType,
      byPurpose,
      pendingApprovals: statistics.find((stat: any) => stat._id === TravelStatus.PENDING_APPROVAL)?.count || 0,
      approvedRequests: approvedRequests.length,
    };
  }

  /**
   * Get employee travel statistics
   */
  async getEmployeeTravelStatistics(employeeId: string): Promise<any> {
    const statistics = await this.travelRequestModel.aggregate([
      {
        $match: {
          employeeId: new Types.ObjectId(employeeId),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$calculatedCosts.totalEstimatedCost' },
          totalDays: { $sum: '$travelDates.numberOfDays' },
        },
      },
    ]);

    const totalRequests = await this.travelRequestModel.countDocuments({
      employeeId,
    });

    const approvedTravels = await this.travelRequestModel.find({
      employeeId,
      status: TravelStatus.APPROVED,
    });

    const totalApprovedCost = approvedTravels.reduce(
      (sum, travel) => sum + (travel.calculatedCosts?.totalEstimatedCost || 0),
      0,
    );

    const totalTravelDays = approvedTravels.reduce(
      (sum, travel) => sum + (travel.travelDates?.numberOfDays || 0),
      0,
    );

    return {
      totalRequests,
      totalApprovedCost,
      totalTravelDays,
      statusBreakdown: statistics,
      activeTravels: approvedTravels.filter(
        (travel) => 
          !travel.completedAt && 
          travel.travelDates?.departureDate && 
          new Date(travel.travelDates.departureDate) <= new Date() &&
          new Date(travel.travelDates.returnDate) >= new Date()
      ).length,
    };
  }

  /**
   * Map travel request to response DTO
   */
  private mapToResponseDto(request: any): TravelRequestResponseDto {
    const employeeGradeCode = request.employeeId?.gradeId?.code;

    return {
      id: request._id.toString(),
      travelReference: request.travelReference,
      employeeId: request.employeeId?._id?.toString() || request.employeeId?.toString(),
      travelPurpose: request.travelPurpose,
      travelType: request.travelType,
      destination: request.destination,
      travelDates: request.travelDates,
      accommodationType: request.accommodationType,
      accommodationDetails: request.accommodationDetails,
      travelMode: request.travelMode,
      transportDetails: request.transportDetails,
      additionalRequests: request.additionalRequests,
      calculatedCosts: request.calculatedCosts,
      urgency: request.urgency,
      status: request.status,
      workflowId: request.workflowId?._id?.toString() || request.workflowId?.toString(),
      rejectionReason: request.rejectionReason,
      approvedAt: request.approvedAt,
      completedAt: request.completedAt,
      comments: request.comments,
      metadata: request.metadata,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}