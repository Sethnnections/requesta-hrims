import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WorkflowDefinition,
  WorkflowDefinitionDocument,
} from '../schemas/workflow-definition.schema';
import { WorkflowType } from '../../../../common/enums';

@Injectable()
export class WorkflowDefinitionSetupService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowDefinitionSetupService.name);

  constructor(
    @InjectModel(WorkflowDefinition.name)
    private workflowDefinitionModel: Model<WorkflowDefinitionDocument>,
  ) {}

  async onModuleInit() {
    await this.seedWorkflowDefinitions();
  }

  async seedWorkflowDefinitions() {
    const existingCount = await this.workflowDefinitionModel.countDocuments();

    if (existingCount > 0) {
      this.logger.log('Workflow definitions already exist, skipping seeding.');
      return;
    }

    const definitions = [
      // LOAN APPLICATION WORKFLOWS - GRADE BASED
      {
        name: 'Small Loan Application (Up to MWK 500,000)',
        workflowType: WorkflowType.LOAN_APPLICATION,
        department: 'ALL',
        description: 'Small loan approval for amounts up to MWK 500,000',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Finance Officer (M8-M10)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M8', maxGrade: 'M10' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Medium Loan Application (MWK 500,001 - 2,000,000)',
        workflowType: WorkflowType.LOAN_APPLICATION,
        department: 'ALL',
        description: 'Medium loan approval requiring managerial approval',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
          {
            stage: 3,
            name: 'Finance Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Large Loan Application (Above MWK 2,000,000)',
        workflowType: WorkflowType.LOAN_APPLICATION,
        department: 'ALL',
        description: 'Large loan approval requiring director level approval',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 3,
            name: 'Finance Director (M17)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M17', maxGrade: 'M17' },
          },
          {
            stage: 4,
            name: 'Executive Approval (CEO)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'CEO', maxGrade: 'CEO' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      // TRAVEL REQUEST WORKFLOWS - GRADE BASED
      {
        name: 'Domestic Travel - Junior Staff (M3-M6)',
        workflowType: WorkflowType.TRAVEL_REQUEST,
        department: 'ALL',
        description: 'Domestic travel for junior operational staff',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Supervisor (M11-M13)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M11', maxGrade: 'M13' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Domestic Travel - Senior Staff (M7-M11)',
        workflowType: WorkflowType.TRAVEL_REQUEST,
        department: 'ALL',
        description: 'Domestic travel for senior staff and supervisors',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'International Travel - All Staff',
        workflowType: WorkflowType.TRAVEL_REQUEST,
        department: 'ALL',
        description: 'International travel requiring director approval',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 3,
            name: 'Finance Director (M17)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M17', maxGrade: 'M17' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      // OVERTIME CLAIM WORKFLOWS - GRADE BASED
      {
        name: 'Overtime Claim - Operational Staff (M3-M6)',
        workflowType: WorkflowType.OVERTIME_CLAIM,
        department: 'ALL',
        description: 'Overtime approval for field and operational staff',
        stages: [
          {
            stage: 1,
            name: 'Field Supervisor (M9)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Payroll Officer (M8)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M8', maxGrade: 'M8' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Overtime Claim - Office Staff (M7-M11)',
        workflowType: WorkflowType.OVERTIME_CLAIM,
        department: 'ALL',
        description: 'Overtime approval for office and supervisory staff',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M13' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      // LEAVE REQUEST WORKFLOWS - GRADE BASED
      {
        name: 'Annual Leave - Junior Staff (M3-M6)',
        workflowType: WorkflowType.LEAVE_REQUEST,
        department: 'ALL',
        description: 'Annual leave approval for junior staff',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'HR Officer (M8-M9)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M8', maxGrade: 'M9' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Annual Leave - Senior Staff (M7-M11)',
        workflowType: WorkflowType.LEAVE_REQUEST,
        department: 'ALL',
        description: 'Annual leave approval for senior staff',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Extended Leave - Managerial Staff (M13-M17)',
        workflowType: WorkflowType.LEAVE_REQUEST,
        department: 'ALL',
        description: 'Extended leave for managerial staff',
        stages: [
          {
            stage: 1,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'HR Manager (M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M15', maxGrade: 'M15' },
          },
          {
            stage: 3,
            name: 'Executive Approval (CEO)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'CEO', maxGrade: 'CEO' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      // PAYROLL APPROVAL WORKFLOWS - GRADE BASED
      {
        name: 'Payroll Processing - Standard',
        workflowType: WorkflowType.PAYROLL_APPROVAL,
        department: 'FIN',
        description: 'Standard payroll processing workflow',
        stages: [
          {
            stage: 1,
            name: 'Payroll Supervisor (M9)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M9', maxGrade: 'M9' },
          },
          {
            stage: 2,
            name: 'Finance Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
          {
            stage: 3,
            name: 'Finance Director (M17)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M17', maxGrade: 'M17' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      // EXPENSE CLAIM WORKFLOWS - GRADE BASED
      {
        name: 'Expense Claim - Small Amount (Up to MWK 200,000)',
        workflowType: WorkflowType.EXPENSE_CLAIM,
        department: 'ALL',
        description: 'Small expense claim approval',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Accounts Clerk (M6-M7)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M6', maxGrade: 'M7' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Expense Claim - Medium Amount (MWK 200,001 - 1,000,000)',
        workflowType: WorkflowType.EXPENSE_CLAIM,
        department: 'ALL',
        description: 'Medium expense claim requiring manager approval',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
          {
            stage: 3,
            name: 'Finance Officer (M10-M11)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M10', maxGrade: 'M11' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Expense Claim - Large Amount (Above MWK 1,000,000)',
        workflowType: WorkflowType.EXPENSE_CLAIM,
        department: 'ALL',
        description: 'Large expense claim requiring director approval',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 3,
            name: 'Finance Director (M17)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M17', maxGrade: 'M17' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      // RECRUITMENT WORKFLOWS - GRADE BASED
      {
        name: 'Recruitment - Junior Positions (M3-M6)',
        workflowType: WorkflowType.RECRUITMENT,
        department: 'ALL',
        description: 'Recruitment approval for junior positions',
        stages: [
          {
            stage: 1,
            name: 'Hiring Manager (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
          {
            stage: 3,
            name: 'HR Officer (M8-M9)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M8', maxGrade: 'M9' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Recruitment - Senior Positions (M7-M11)',
        workflowType: WorkflowType.RECRUITMENT,
        department: 'ALL',
        description: 'Recruitment approval for senior positions',
        stages: [
          {
            stage: 1,
            name: 'Hiring Manager (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 3,
            name: 'HR Manager (M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M15', maxGrade: 'M15' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Recruitment - Managerial Positions (M13-M17)',
        workflowType: WorkflowType.RECRUITMENT,
        department: 'ALL',
        description: 'Recruitment approval for managerial positions',
        stages: [
          {
            stage: 1,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'HR Director (M17)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M17', maxGrade: 'M17' },
          },
          {
            stage: 3,
            name: 'Executive Approval (CEO)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'CEO', maxGrade: 'CEO' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      {
        name: 'Domestic Travel - Junior Staff (M3-M6)',
        workflowType: WorkflowType.TRAVEL_REQUEST,
        department: 'ALL',
        description: 'Domestic travel for junior operational staff',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Supervisor (M11-M13)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M11', maxGrade: 'M13' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Domestic Travel - Senior Staff (M7-M11)',
        workflowType: WorkflowType.TRAVEL_REQUEST,
        department: 'ALL',
        description: 'Domestic travel for senior staff and supervisors',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13-M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M15' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'International Travel - All Staff',
        workflowType: WorkflowType.TRAVEL_REQUEST,
        department: 'ALL',
        description: 'International travel requiring director approval',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 3,
            name: 'Finance Director (M17)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M17', maxGrade: 'M17' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },

      {
        name: 'Overtime Claim - Operational Staff (M3-M6)',
        workflowType: WorkflowType.OVERTIME_CLAIM,
        department: 'ALL',
        description: 'Overtime approval for field and operational staff',
        stages: [
          {
            stage: 1,
            name: 'Field Supervisor (M9)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Payroll Officer (M8)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M8', maxGrade: 'M8' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Overtime Claim - Office Staff (M7-M11)',
        workflowType: WorkflowType.OVERTIME_CLAIM,
        department: 'ALL',
        description: 'Overtime approval for office and supervisory staff',
        stages: [
          {
            stage: 1,
            name: 'Direct Supervisor (M9-M11)',
            approvalRule: 'SUPERVISOR',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'Department Manager (M13)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M13', maxGrade: 'M13' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
      {
        name: 'Overtime Claim - Managerial Staff (M13-M17)',
        workflowType: WorkflowType.OVERTIME_CLAIM,
        department: 'ALL',
        description: 'Overtime approval for managerial staff',
        stages: [
          {
            stage: 1,
            name: 'Department Head (M17)',
            approvalRule: 'DEPARTMENT_HEAD',
            ruleConfig: {},
          },
          {
            stage: 2,
            name: 'HR Manager (M15)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M15', maxGrade: 'M15' },
          },
          {
            stage: 3,
            name: 'Finance Director (M17)',
            approvalRule: 'GRADE_BASED',
            ruleConfig: { minGrade: 'M17', maxGrade: 'M17' },
          },
        ],
        isActive: true,
        version: 1,
        createdBy: 'system',
      },
    ];

    await this.workflowDefinitionModel.insertMany(definitions);
    this.logger.log(
      `Seeded ${definitions.length} grade-based workflow definitions`,
    );
  }

  async getActiveWorkflowDefinition(
    workflowType: WorkflowType,
    department: string = 'ALL',
  ): Promise<WorkflowDefinitionDocument | null> {
    return this.workflowDefinitionModel
      .findOne({
        workflowType,
        $or: [{ department: 'ALL' }, { department }],
        isActive: true,
      })
      .sort({ version: -1 })
      .exec();
  }

  // Helper method to get workflow by amount thresholds
  async getWorkflowByAmount(
    workflowType: WorkflowType,
    amount: number,
    department: string = 'ALL',
  ): Promise<WorkflowDefinitionDocument | null> {
    const workflows = await this.workflowDefinitionModel
      .find({
        workflowType,
        $or: [{ department: 'ALL' }, { department }],
        isActive: true,
      })
      .sort({ version: -1 })
      .exec();

    // Simple logic to determine workflow based on amount thresholds
    if (workflowType === WorkflowType.LOAN_APPLICATION) {
      if (amount <= 500000)
        return (
          workflows.find((w) => w.name.includes('Small Loan')) || workflows[0]
        );
      if (amount <= 2000000)
        return (
          workflows.find((w) => w.name.includes('Medium Loan')) || workflows[1]
        );
      return (
        workflows.find((w) => w.name.includes('Large Loan')) || workflows[2]
      );
    }

    if (workflowType === WorkflowType.EXPENSE_CLAIM) {
      if (amount <= 200000)
        return (
          workflows.find((w) => w.name.includes('Small Amount')) || workflows[0]
        );
      if (amount <= 1000000)
        return (
          workflows.find((w) => w.name.includes('Medium Amount')) ||
          workflows[1]
        );
      return (
        workflows.find((w) => w.name.includes('Large Amount')) || workflows[2]
      );
    }

    return workflows[0] || null;
  }
}
