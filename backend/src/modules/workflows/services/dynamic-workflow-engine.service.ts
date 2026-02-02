import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Employee,
  EmployeeDocument,
} from '../../employees/schemas/employee.schema';
import {
  DynamicWorkflow,
  DynamicWorkflowDocument,
} from '../schemas/dynamic-workflow.schema';
import {
  WorkflowContext,
  WorkflowContextDocument,
} from '../schemas/workflow-context.schema';
import {
  WorkflowDefinition,
  WorkflowDefinitionDocument,
} from '../definitions/schemas/workflow-definition.schema';
import { DelegationService } from './delegation.service';
import { WorkflowDefinitionsService } from '../definitions/services/workflow-definitions.service';
import { GradeConfigService } from '../../organization/grades/services/grade-config.service';
import { StageResolutionService } from './stage-resolution.service';
import {
  WorkflowType,
  WorkflowStatus,
  ApprovalAction,
} from '../../../common/enums';
import {
  ApprovalChainStage,
  ApprovalHistoryEntry,
  EmployeeLean,
} from '../types/workflow.types';
import { GradeHelperService } from 'src/modules/organization/grades/services/grade-helper.service';
import {
  Department,
  DepartmentDocument,
} from 'src/modules/organization/departments/schemas/department.schema';

@Injectable()
export class DynamicWorkflowEngineService implements OnModuleInit {
  private readonly logger = new Logger(DynamicWorkflowEngineService.name);

  constructor(
  @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  @InjectModel(DynamicWorkflow.name) private workflowModel: Model<DynamicWorkflowDocument>,
  @InjectModel(WorkflowContext.name) private contextModel: Model<WorkflowContextDocument>,
  @InjectModel(WorkflowDefinition.name) private workflowDefinitionModel: Model<WorkflowDefinitionDocument>,
  @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>, 
  private delegationService: DelegationService, 
  private workflowDefinitionsService: WorkflowDefinitionsService,
  private gradeConfigService: GradeConfigService, 
  private stageResolutionService: StageResolutionService,
  private gradeHelperService: GradeHelperService,
) {}

  async onModuleInit() {
    // Ensure grade config is loaded
    if (this.gradeConfigService.onModuleInit) {
      await this.gradeConfigService.onModuleInit();
    }
    this.logger.log(
      'Dynamic Workflow Engine initialized with configuration-driven approval system',
    );
  }

  /**
   * Create workflow with dynamic stage resolution
   */
  async createWorkflow(
    workflowType: WorkflowType,
    requesterId: string,
    requestData: any,
  ): Promise<DynamicWorkflowDocument> {
    // Get employee with populated grade
    const employee = (await this.employeeModel
      .findById(requesterId)
      .populate('gradeId')
      .populate('reportsToEmployeeId')
      .lean()
      .exec()) as any;

    if (!employee) {
      throw new Error(`Employee with ID ${requesterId} not found`);
    }

    // Get employee grade info
    const gradeCode = await this.gradeHelperService.getGradeCode(employee);
    const gradeLevel = await this.gradeHelperService.getGradeLevel(employee);

    // Update requestData with grade info
    requestData = {
      ...requestData,
      employeeGrade: gradeCode,
      employeeGradeLevel: gradeLevel,
    };

    // Get workflow definition
    const definition =
      await this.workflowDefinitionsService.getActiveDefinition(
        workflowType,
        employee.departmentId.toString(),
      );

    if (!definition) {
      throw new Error(
        `No active workflow definition found for type: ${workflowType}`,
      );
    }

    // Create workflow
    const workflow = new this.workflowModel({
      workflowType,
      requesterId: new Types.ObjectId(requesterId),
      requestData,
      workflowDefinitionId: definition._id,
      approvalChain: [],
      currentStage: 0,
      totalStages: definition.stages.length,
      status: WorkflowStatus.SUBMITTED,
    });

    await workflow.save();
    await this.createWorkflowContext(workflow.id, requesterId);

    // Advance to first stage
    await this.advanceToNextStage(workflow.id);

    this.logger.log(
      `Created workflow ${workflow._id} for employee grade: ${gradeCode}`,
    );
    return workflow;
  }

  /**
   * Advance workflow to next stage with dynamic approver resolution
   */
  private async advanceToNextStage(workflowId: Types.ObjectId): Promise<void> {
    const workflow = await this.workflowModel.findById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }

    //  FIX: Use type assertion to access workflowDefinitionId
    const workflowDoc = workflow as unknown as DynamicWorkflowDocument;

    const definition = await this.workflowDefinitionModel.findById(
      workflowDoc.workflowDefinitionId,
    );
    if (!definition) {
      throw new Error(
        `Workflow definition not found for workflow: ${workflowId}`,
      );
    }

    const nextStageIndex = workflowDoc.currentStage;

    // Check if workflow is complete
    if (nextStageIndex >= definition.stages.length) {
      //  FIX: Use type-safe property assignment
      workflowDoc.status = WorkflowStatus.APPROVED;
      workflowDoc.completedAt = new Date();
      await workflowDoc.save();
      this.logger.log(`Workflow ${workflowId} completed all stages`);
      return;
    }

    const nextStage = definition.stages[nextStageIndex];
    const employee = (await this.employeeModel
      .findById(workflowDoc.requesterId)
      .lean()
      .exec()) as EmployeeLean | null;

    if (!employee) {
      throw new Error(`Employee not found for workflow: ${workflowId}`);
    }

    // Resolve approvers dynamically for this stage
    const approvers = await this.resolveApproversForStage(
      employee,
      nextStage,
      workflowDoc.workflowType,
      workflowDoc.requestData,
    );

    if (approvers.length === 0) {
      this.logger.warn(
        `No approvers resolved for stage ${nextStageIndex + 1}, auto-approving and moving to next stage...`,
      );

      // Auto-approve this stage and move to next
      workflowDoc.approvalChain.push({
        approverId: workflowDoc.requesterId, // Use requester as placeholder
        stage: nextStageIndex + 1,
        stageName: nextStage.name,
        status: 'APPROVED',
        action: ApprovalAction.APPROVE,
        comments: 'Auto-approved: No approvers found',
        actionDate: new Date(),
      });

      workflowDoc.currentStage = nextStageIndex + 1;
      await workflowDoc.save();

      // Recursively advance to next stage
      await this.advanceToNextStage(workflowId);
      return;
    }

    // Update workflow with current stage approvers
    workflowDoc.currentStage = nextStageIndex + 1;
    workflowDoc.currentApproverId = approvers[0]; // First approver for this stage

    // Add to approval chain
    workflowDoc.approvalChain.push({
      approverId: approvers[0],
      stage: nextStageIndex + 1,
      stageName: nextStage.name,
      status: 'PENDING',
    });

    workflowDoc.status = WorkflowStatus.IN_PROGRESS;
    await workflowDoc.save();

    this.logger.log(
      `Advanced workflow ${workflowId} to stage ${workflowDoc.currentStage}, assigned to approver: ${approvers[0]}`,
    );
  }

  /**
   * Resolve approvers for a specific stage
   */
  private async resolveApproversForStage(
    employee: EmployeeLean,
    stage: any,
    workflowType: WorkflowType,
    requestData: any,
  ): Promise<Types.ObjectId[]> {
    const approvers: Types.ObjectId[] = [];
    const employeeGradeCode =
      await this.gradeHelperService.getGradeCode(employee);

    switch (stage.approvalRule) {
      case 'SUPERVISOR':
        const supervisor = await this.getSupervisorApprover(
          employee,
          workflowType,
        );
        if (supervisor) {
          approvers.push(supervisor._id);
          this.logger.log(
            `Resolved supervisor: ${supervisor.firstName} ${supervisor.lastName}`,
          );
        }
        break;

      case 'MANAGERIAL_LEVEL':
        const level = stage.ruleConfig?.level || 1;
        const managerialApprovers = await this.getManagerialApprovers(
          employee,
          level,
          workflowType,
        );
        approvers.push(...managerialApprovers.map((a) => a._id));
        break;

      case 'DEPARTMENT_HEAD':
        const departmentHead = await this.getDepartmentHeadApprover(
          employee.departmentId,
        );
        if (departmentHead) {
          approvers.push(departmentHead._id);
        }
        break;

      case 'FINANCE':
        const financeApprovers = await this.getFinanceApprovers(
          requestData.amount,
          employeeGradeCode, // Use the grade code from helper
          stage.ruleConfig,
        );
        approvers.push(...financeApprovers.map((a) => a._id));
        break;

      case 'GRADE_BASED':
        const gradeApprovers = await this.getGradeBasedApprovers(
          stage.ruleConfig?.minGrade,
          stage.ruleConfig?.maxGrade,
        );
        approvers.push(...gradeApprovers.map((a) => a._id));
        break;

      case 'ROLE_BASED':
        const roleApprovers = await this.getRoleBasedApprovers(
          stage.ruleConfig?.role,
        );
        approvers.push(...roleApprovers.map((a) => a._id));
        break;

      case 'SPECIFIC_USER':
        if (stage.ruleConfig?.userId) {
          const specificUser = await this.employeeModel
            .findById(stage.ruleConfig.userId)
            .lean();
          if (specificUser) approvers.push(specificUser.id);
        }
        break;

      default:
        this.logger.warn(`Unknown approval rule: ${stage.approvalRule}`);
    }

    return this.removeDuplicateApprovers(approvers);
  }
  /**
   * Get supervisor approver with delegation support and real-time resolution
   */

  private async getSupervisorApprover(
    employee: EmployeeLean,
    workflowType: WorkflowType,
  ): Promise<EmployeeLean | null> {
    try {
      // Get employee with populated supervisor
      const employeeWithSupervisor = await this.employeeModel
        .findById(employee._id)
        .populate({
          path: 'reportsToEmployeeId',
          populate: { path: 'gradeId' },
        })
        .lean()
        .exec();

      if (
        !employeeWithSupervisor ||
        !employeeWithSupervisor.reportsToEmployeeId
      ) {
        this.logger.warn(`Employee ${employee._id} has no supervisor`);
        return await this.getDepartmentHeadApprover(employee.departmentId);
      }

      const intendedApprover =
        employeeWithSupervisor.reportsToEmployeeId as any;

      // Check supervisor status
      if (
        !intendedApprover.isSupervisor &&
        !intendedApprover.isDepartmentManager
      ) {
        this.logger.warn(
          `Intended approver ${intendedApprover._id} is not a supervisor`,
        );
        return await this.getDepartmentHeadApprover(employee.departmentId);
      }

      if (intendedApprover.employmentStatus !== 'ACTIVE') {
        this.logger.warn(`Supervisor ${intendedApprover._id} is not active`);
        return await this.getDepartmentHeadApprover(employee.departmentId);
      }

      // Check delegation
      const delegation = await this.delegationService.findActiveDelegation(
        intendedApprover._id,
        workflowType,
      );

      if (delegation) {
        this.logger.log(
          `Delegation found: ${intendedApprover.employeeNumber} -> ${delegation.delegateToId}`,
        );
        const delegate = await this.employeeModel
          .findById(delegation.delegateToId)
          .populate('gradeId')
          .lean();

        if (
          (delegate && (delegate as any).isSupervisor) ||
          (delegate as any).isDepartmentManager
        ) {
          return delegate as unknown as EmployeeLean;
        }
      }

      return intendedApprover as unknown as EmployeeLean;
    } catch (error) {
      this.logger.error(`Error getting supervisor: ${error.message}`);
      return await this.getDepartmentHeadApprover(employee.departmentId);
    }
  }
  /**
   * Get managerial approvers with proper supervisor validation
   */
  private async getManagerialApprovers(
    employee: EmployeeLean,
    level: number,
    workflowType: WorkflowType,
  ): Promise<EmployeeLean[]> {
    const approvers: EmployeeLean[] = [];
    let currentEmployee = employee;

    for (let i = 0; i < level; i++) {
      if (!currentEmployee.reportsToEmployeeId) break;

      const manager = await this.getActualApprover(
        currentEmployee.reportsToEmployeeId,
        workflowType,
      );
      if (manager) {
        // Only add if they're actually a supervisor/manager
        if (manager.isSupervisor || manager.isDepartmentManager) {
          approvers.push(manager);
          currentEmployee = manager;
        } else {
          // Skip non-supervisors and continue up the chain
          currentEmployee = manager;
          i--; // Don't count this level since we skipped
        }
      } else {
        break;
      }
    }

    return approvers;
  }

  /**
   * Enhanced department head approver with validation
   */
  private async getDepartmentHeadApprover(
    departmentId: Types.ObjectId,
  ): Promise<EmployeeLean | null> {
    const departmentHead = (await this.employeeModel
      .findOne({
        departmentId,
        isDepartmentManager: true,
        employmentStatus: 'ACTIVE',
      })
      .lean()
      .exec()) as EmployeeLean | null;

    if (!departmentHead) {
      this.logger.warn(
        `No department manager found for department: ${departmentId}`,
      );
      // Fallback: Find the highest grade employee in the department who is a supervisor
      const fallbackManager = (await this.employeeModel
        .findOne({
          departmentId,
          isSupervisor: true,
          employmentStatus: 'ACTIVE',
        })
        .sort({ gradeLevel: -1 })
        .lean()
        .exec()) as EmployeeLean | null;

      return fallbackManager;
    }

    return departmentHead;
  }

  /**
   * Get finance approvers based on amount and grade configuration
   */
  private async getFinanceApprovers(
    amount: number,
    requesterGradeCode: string,
    ruleConfig: any,
  ): Promise<EmployeeLean[]> {
    const approvers: EmployeeLean[] = [];

    try {
      // Use grade config service to determine required approval level
      const requiredLevel =
        await this.gradeConfigService.getRequiredApprovalLevelForAmount(
          requesterGradeCode,
          amount || 0,
        );

      // Get finance roles for the required level
      const financeRoles = this.getFinanceRolesByLevel(requiredLevel);

      // Get grade IDs for the required level
      const requiredGradeIds =
        await this.gradeHelperService.getEmployeesByGradeRange(
          requiredLevel,
          requiredLevel,
        );

      if (requiredGradeIds.length === 0) {
        this.logger.warn(`No grade found for level: ${requiredLevel}`);
        return [];
      }

      const financeEmployees = await this.employeeModel
        .find({
          gradeId: { $in: requiredGradeIds },
          systemRole: { $in: financeRoles },
          employmentStatus: 'ACTIVE',
        })
        .lean()
        .exec();

      // Convert to EmployeeLean
      const financeApprovers = financeEmployees.map((emp) => ({
        _id: emp._id as Types.ObjectId,
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        lastName: emp.lastName,
        gradeId: emp.gradeId as Types.ObjectId,
        departmentId: emp.departmentId as Types.ObjectId,
        reportsToEmployeeId: emp.reportsToEmployeeId as
          | Types.ObjectId
          | undefined,
        systemRole: emp.systemRole,
        employmentStatus: emp.employmentStatus,
        isDepartmentManager: emp.isDepartmentManager,
        isSupervisor: emp.isSupervisor,
        __v: emp.__v,
      })) as EmployeeLean[];

      if (financeApprovers.length > 0) {
        approvers.push(...financeApprovers);
      } else {
        // Fallback: any finance supervisor
        this.logger.warn(
          `No specific finance employees found, looking for any finance supervisor`,
        );
        const financeDeptId = await this.getFinanceDepartmentId();

        if (financeDeptId) {
          const fallbackFinance = await this.employeeModel
            .find({
              departmentId: financeDeptId,
              isSupervisor: true,
              employmentStatus: 'ACTIVE',
            })
            .lean()
            .exec();

          const fallbackApprovers = fallbackFinance.map((emp) => ({
            _id: emp._id as Types.ObjectId,
            employeeNumber: emp.employeeNumber,
            firstName: emp.firstName,
            lastName: emp.lastName,
            gradeId: emp.gradeId as Types.ObjectId,
            departmentId: emp.departmentId as Types.ObjectId,
            reportsToEmployeeId: emp.reportsToEmployeeId as
              | Types.ObjectId
              | undefined,
            systemRole: emp.systemRole,
            employmentStatus: emp.employmentStatus,
            isDepartmentManager: emp.isDepartmentManager,
            isSupervisor: emp.isSupervisor,
            __v: emp.__v,
          })) as EmployeeLean[];

          approvers.push(...fallbackApprovers);
        }
      }
    } catch (error) {
      this.logger.error(`Error getting finance approvers: ${error.message}`);
    }

    return approvers;
  }

  /**
   * Helper to get finance roles by grade level
   */
  private getFinanceRolesByLevel(level: string): string[] {
    const roleMap: Record<string, string[]> = {
      M6: ['accounts_clerk', 'payroll_officer'],
      M7: ['accounts_clerk', 'payroll_officer'],
      M8: ['payroll_admin', 'accounts_supervisor'],
      M9: ['payroll_admin', 'financial_analyst'],
      M10: ['financial_analyst', 'senior_accountant'],
      M11: ['financial_analyst', 'senior_accountant'],
      M13: ['senior_accountant', 'finance_manager'],
      M15: ['finance_manager', 'finance_director'],
      M17: ['finance_director', 'chief_finance_officer'],
      CEO: ['chief_finance_officer'],
    };

    return roleMap[level] || ['accounts_clerk'];
  }

  /**
   * Get role-based approvers
   */
  private async getRoleBasedApprovers(role: string): Promise<EmployeeLean[]> {
    if (!role) return [];

    const employees = (await this.employeeModel
      .find({
        systemRole: role,
        employmentStatus: 'ACTIVE',
      })
      .lean()
      .exec()) as unknown as EmployeeLean[];

    return employees;
  }

  /**
   * Get grade-based approvers
   */
  private async getGradeBasedApprovers(
    minGrade?: string,
    maxGrade?: string,
  ): Promise<EmployeeLean[]> {
    if (!minGrade && !maxGrade) {
      this.logger.warn('No grade range specified for grade-based approval');
      return [];
    }

    // Get grade IDs in the specified range
    const gradeIds = await this.gradeHelperService.getEmployeesByGradeRange(
      minGrade,
      maxGrade,
    );

    if (gradeIds.length === 0) {
      this.logger.warn(`No grades found in range: ${minGrade} - ${maxGrade}`);
      return [];
    }

    // Find employees with those grades who are supervisors/managers
    const employees = await this.employeeModel
      .find({
        gradeId: { $in: gradeIds },
        employmentStatus: 'ACTIVE',
        $or: [
          { isSupervisor: true },
          { isDepartmentManager: true },
          { systemRole: { $in: ['manager', 'department_head', 'supervisor'] } },
        ],
      })
      .lean()
      .exec();

    // Cast to EmployeeLean with proper type handling
    return employees.map((emp) => ({
      _id: emp._id as Types.ObjectId,
      employeeNumber: emp.employeeNumber,
      firstName: emp.firstName,
      lastName: emp.lastName,
      gradeId: emp.gradeId as Types.ObjectId,
      departmentId: emp.departmentId as Types.ObjectId,
      reportsToEmployeeId: emp.reportsToEmployeeId as
        | Types.ObjectId
        | undefined,
      systemRole: emp.systemRole,
      employmentStatus: emp.employmentStatus,
      isDepartmentManager: emp.isDepartmentManager,
      isSupervisor: emp.isSupervisor,
      __v: emp.__v,
    })) as EmployeeLean[];
  }

  /**
   * Get actual approver considering delegations
   */
  private async getActualApprover(
    intendedApproverId: Types.ObjectId,
    workflowType: WorkflowType,
  ): Promise<EmployeeLean | null> {
    const intendedApprover = (await this.employeeModel
      .findById(intendedApproverId)
      .lean()
      .exec()) as EmployeeLean | null;
    if (!intendedApprover) return null;

    // Check for active delegations
    const delegation = await this.delegationService.findActiveDelegation(
      intendedApproverId,
      workflowType,
    );
    if (delegation) {
      this.logger.log(
        `Delegation found: ${intendedApprover.employeeNumber} -> ${delegation.delegateToId}`,
      );
      return (await this.employeeModel
        .findById(delegation.delegateToId)
        .lean()
        .exec()) as EmployeeLean | null;
    }

    return intendedApprover;
  }

  /**
   * Process approval action with dynamic stage advancement
   */
  async processApproval(
    workflowId: string,
    approverId: string,
    action: ApprovalAction,
    comments?: string,
  ): Promise<DynamicWorkflowDocument> {
    const workflow = await this.workflowModel.findById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }

    // Use type assertion
    const workflowDoc = workflow as unknown as DynamicWorkflowDocument;
    const currentStage =
      workflowDoc.approvalChain[workflowDoc.currentStage - 1];

    if (
      !currentStage ||
      !currentStage.approverId.equals(new Types.ObjectId(approverId))
    ) {
      throw new Error('Approver not authorized for this stage');
    }

    // Update current stage
    currentStage.status =
      action === ApprovalAction.APPROVE ? 'APPROVED' : 'REJECTED';
    currentStage.action = action;
    currentStage.comments = comments;
    currentStage.actionDate = new Date();

    // Add to history
    const historyEntry: ApprovalHistoryEntry = {
      fromStage: workflowDoc.currentStage,
      toStage: workflowDoc.currentStage,
      action,
      performedBy: new Types.ObjectId(approverId),
      comments,
      timestamp: new Date(),
    };
    workflowDoc.approvalHistory.push(historyEntry);

    if (action === ApprovalAction.APPROVE) {
      // Dynamically advance to next stage
      await this.advanceToNextStage(workflowDoc.id);
    } else if (action === ApprovalAction.REJECT) {
      workflowDoc.status = WorkflowStatus.REJECTED;
      workflowDoc.currentApproverId = undefined;
      workflowDoc.completedAt = new Date();
    }

    return await workflowDoc.save();
  }

  /**
   * Process delegation action
   */

  async processDelegation(
    workflowId: string,
    approverId: string,
    delegateToId: string,
    comments?: string,
  ): Promise<DynamicWorkflowDocument> {
    const workflow = await this.workflowModel.findById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }

    //  FIX: Use type assertion
    const workflowDoc = workflow as unknown as DynamicWorkflowDocument;
    const currentStage =
      workflowDoc.approvalChain[workflowDoc.currentStage - 1];

    if (
      !currentStage ||
      !currentStage.approverId.equals(new Types.ObjectId(approverId))
    ) {
      throw new Error('Approver not authorized for this stage');
    }

    // Update current stage with delegation
    currentStage.status = 'DELEGATED';
    currentStage.action = ApprovalAction.DELEGATE;
    currentStage.comments = comments;
    currentStage.actionDate = new Date();
    currentStage.delegatedTo = new Types.ObjectId(delegateToId);

    // Update the approval chain to use the delegate
    currentStage.approverId = new Types.ObjectId(delegateToId);
    workflowDoc.currentApproverId = new Types.ObjectId(delegateToId);

    // Add to history
    workflowDoc.approvalHistory.push({
      fromStage: workflowDoc.currentStage,
      toStage: workflowDoc.currentStage,
      action: ApprovalAction.DELEGATE,
      performedBy: new Types.ObjectId(approverId),
      comments: `Delegated to ${delegateToId}: ${comments}`,
      timestamp: new Date(),
    });

    return await workflowDoc.save();
  }
  /**
   * Get workflows pending approval for an employee
   */
  async getPendingApprovals(
    approverId: string,
  ): Promise<DynamicWorkflowDocument[]> {
    return await this.workflowModel
      .find({
        'approvalChain.approverId': new Types.ObjectId(approverId),
        'approvalChain.status': 'PENDING',
        status: { $in: [WorkflowStatus.SUBMITTED, WorkflowStatus.IN_PROGRESS] },
      })
      .populate('requesterId', 'firstName lastName employeeNumber gradeCode')
      .populate(
        'approvalChain.approverId',
        'firstName lastName employeeNumber gradeCode',
      )
      .exec();
  }

  /**
   * Get workflows where user has delegated approval rights
   */
  async getDelegatedApprovals(
    delegateToId: string,
  ): Promise<DynamicWorkflowDocument[]> {
    const delegations =
      await this.delegationService.getDelegatedApprovals(delegateToId);

    if (delegations.length === 0) {
      return [];
    }

    const workflowTypes = [
      ...new Set(delegations.flatMap((d) => d.workflowTypes)),
    ];

    return await this.workflowModel
      .find({
        workflowType: { $in: workflowTypes },
        'approvalChain.status': 'PENDING',
        status: { $in: [WorkflowStatus.SUBMITTED, WorkflowStatus.IN_PROGRESS] },
      })
      .populate('requesterId', 'firstName lastName employeeNumber gradeCode')
      .populate(
        'approvalChain.approverId',
        'firstName lastName employeeNumber gradeCode',
      )
      .exec();
  }

  /**
   * Simulate workflow chain for testing
   */
  async simulateWorkflowChain(
    employeeId: string,
    workflowType: WorkflowType,
    requestData: any,
  ): Promise<{ chain: Types.ObjectId[]; details: any[] }> {
    const employee = (await this.employeeModel
      .findById(employeeId)
      .lean()
      .exec()) as EmployeeLean | null;
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const definition =
      await this.workflowDefinitionsService.getActiveDefinition(
        workflowType,
        employee.departmentId.toString(),
      );

    if (!definition) {
      throw new Error(
        `No active workflow definition found for type: ${workflowType}`,
      );
    }

    const chain: Types.ObjectId[] = [];

    // Simulate each stage to build the chain
    for (const stage of definition.stages) {
      const approvers = await this.resolveApproversForStage(
        employee,
        stage,
        workflowType,
        requestData,
      );
      for (const approver of approvers) {
        if (!chain.some((id) => id.equals(approver))) {
          chain.push(approver);
        }
      }
    }

    const details = await Promise.all(
      chain.map(async (approverId) => {
        const approver = (await this.employeeModel
          .findById(approverId)
          .populate('gradeId')
          .lean()
          .exec()) as EmployeeLean | null;
        const gradeCode = approver
          ? await this.gradeHelperService.getGradeCode(approver)
          : undefined;
        return {
          approverId,
          name: approver
            ? `${approver.firstName} ${approver.lastName}`
            : 'Unknown',
          grade: gradeCode,
          role: approver?.systemRole,
        };
      }),
    );

    return { chain, details };
  }

  /**
   * Create workflow context with proper grade info
   */
  private async createWorkflowContext(
    workflowId: Types.ObjectId,
    employeeId: string,
  ): Promise<void> {
    try {
      const employee = await this.employeeModel
        .findById(employeeId)
        .populate('gradeId')
        .lean()
        .exec();

      if (!employee) {
        this.logger.error(
          `Employee not found for workflow context: ${employeeId}`,
        );
        return;
      }

      // Create EmployeeLean object
      const employeeLean: EmployeeLean = {
        _id: employee._id as Types.ObjectId,
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        gradeId: employee.gradeId as
          | Types.ObjectId
          | { _id: Types.ObjectId; code: string; level: number },
        departmentId: employee.departmentId as Types.ObjectId,
        reportsToEmployeeId: employee.reportsToEmployeeId as
          | Types.ObjectId
          | undefined,
        systemRole: employee.systemRole,
        employmentStatus: employee.employmentStatus,
        isDepartmentManager: employee.isDepartmentManager,
        isSupervisor: employee.isSupervisor,
        __v: employee.__v,
      };

      // Get grade info using helper
      const gradeCode =
        await this.gradeHelperService.getGradeCode(employeeLean);
      const gradeLevel =
        await this.gradeHelperService.getGradeLevel(employeeLean);

      const context = new this.contextModel({
        workflowId,
        employeeId: employee._id,
        employeeGrade: gradeCode,
        employeeGradeLevel: gradeLevel,
        departmentId: employee.departmentId,
        supervisorId: employee.reportsToEmployeeId,
        workflowData: {
          department: employee.departmentId,
          grade: gradeCode,
          isDepartmentManager: employee.isDepartmentManager,
        },
      });

      await context.save();
      this.logger.log(
        `Created workflow context for employee ${employeeId}, grade: ${gradeCode}`,
      );
    } catch (error) {
      this.logger.error(`Error creating workflow context: ${error.message}`);
    }
  }

  /**
   * Remove duplicate approvers from chain
   */
  private removeDuplicateApprovers(chain: Types.ObjectId[]): Types.ObjectId[] {
    const uniqueIds = new Set<string>();
    return chain.filter((id) => {
      const idString = id.toString();
      if (uniqueIds.has(idString)) {
        return false;
      }
      uniqueIds.add(idString);
      return true;
    });
  }

  /**
   * Check if workflow type is monetary
   */
  private isMonetaryWorkflow(workflowType: WorkflowType): boolean {
    const monetaryWorkflows = [
      WorkflowType.LOAN_APPLICATION,
      WorkflowType.TRAVEL_REQUEST,
      WorkflowType.OVERTIME_CLAIM,
      WorkflowType.PAYROLL_APPROVAL,
      WorkflowType.EXPENSE_CLAIM,
    ];
    return monetaryWorkflows.includes(workflowType);
  }

  /**
   * Get next manager in hierarchy
   */
  private async getNextManagerInHierarchy(
    employeeId: Types.ObjectId,
  ): Promise<EmployeeLean | null> {
    const employee = (await this.employeeModel
      .findById(employeeId)
      .lean()
      .exec()) as EmployeeLean | null;
    if (!employee || !employee.reportsToEmployeeId) return null;

    return (await this.employeeModel
      .findById(employee.reportsToEmployeeId)
      .lean()
      .exec()) as EmployeeLean | null;
  }
  /**
   * Get finance department ID
   */
  private async getFinanceDepartmentId(): Promise<Types.ObjectId | null> {
    try {
      const financeDept = await this.departmentModel
        .findOne({
          departmentCode: 'FIN',
          isActive: true,
        })
        .select('_id')
        .lean();

      // Properly handle the type
      if (financeDept && financeDept._id) {
        return financeDept._id as Types.ObjectId;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting finance department: ${error.message}`);
      return null;
    }
  }
}
