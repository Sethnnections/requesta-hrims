import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StageResolver, StageResolverDocument } from '../schemas/stage-resolver.schema';
import { EmployeeLean } from '../types/workflow.types';
import { WorkflowType, ApprovalRuleType } from '../../../common/enums';
import { GradeHelperService } from '../../organization/grades/services/grade-helper.service';

@Injectable()
export class StageResolutionService {
  private readonly logger = new Logger(StageResolutionService.name);

  constructor(
    @InjectModel(StageResolver.name) 
    private stageResolverModel: Model<StageResolverDocument>,
    private gradeHelperService: GradeHelperService, // Add this dependency
  ) {}

  async resolveStageApprovers(
    employee: EmployeeLean,
    stageConfig: any,
    workflowType: WorkflowType,
    requestData: any,
    currentStage: number
  ): Promise<Types.ObjectId[]> {
    const resolvers = await this.stageResolverModel
      .find({
        workflowType,
        stageNumber: currentStage + 1, // Next stage
        isActive: true
      })
      .sort({ executionOrder: 1 })
      .exec();

    let approvers: Types.ObjectId[] = [];

    for (const resolver of resolvers) {
      const shouldExecute = await this.evaluateConditions(resolver.conditions, employee, requestData);
      
      if (shouldExecute) {
        const resolvedApprovers = await this.executeResolver(resolver, employee, requestData);
        approvers = [...approvers, ...resolvedApprovers];
      }
    }

    // Remove duplicates
    return this.removeDuplicateApprovers(approvers);
  }

  private async evaluateConditions(
    conditions: any[],
    employee: EmployeeLean,
    requestData: any
  ): Promise<boolean> {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      const meetsCondition = await this.evaluateSingleCondition(condition, employee, requestData);
      
      if (!meetsCondition && condition.thenAction === 'REQUIRE') {
        return false;
      }
      
      if (meetsCondition && condition.thenAction === 'SKIP') {
        return false;
      }
    }

    return true;
  }

  private async evaluateSingleCondition(
    condition: any,
    employee: EmployeeLean,
    requestData: any
  ): Promise<boolean> {
    switch (condition.conditionType) {
      case 'AMOUNT':
        return this.evaluateAmountCondition(condition, requestData.amount);
      case 'DEPARTMENT':
        return this.evaluateDepartmentCondition(condition, employee.departmentId);
      case 'GRADE':
        // Use gradeHelperService to get grade code
        const gradeCode = await this.gradeHelperService.getGradeCode(employee);
        return this.evaluateGradeCondition(condition, gradeCode);
      case 'WORKFLOW_TYPE':
        return this.evaluateWorkflowTypeCondition(condition, requestData.workflowType);
      default:
        this.logger.warn(`Unknown condition type: ${condition.conditionType}`);
        return true;
    }
  }

  private evaluateAmountCondition(condition: any, amount: number): boolean {
    if (!amount) return false;

    switch (condition.operator) {
      case 'GT': return amount > condition.value;
      case 'LT': return amount < condition.value;
      case 'EQ': return amount === condition.value;
      case 'GTE': return amount >= condition.value;
      case 'LTE': return amount <= condition.value;
      default: return false;
    }
  }

  private evaluateDepartmentCondition(condition: any, departmentId: Types.ObjectId): boolean {
    if (!condition.value) return true;
    
    const targetDeptId = new Types.ObjectId(condition.value);
    return departmentId.equals(targetDeptId);
  }

  private evaluateGradeCondition(condition: any, gradeCode: string): boolean {
    if (!condition.value) return true;

    switch (condition.operator) {
      case 'EQ': return gradeCode === condition.value;
      case 'IN': return Array.isArray(condition.value) && condition.value.includes(gradeCode);
      case 'GT': return this.compareGrades(gradeCode, condition.value) > 0;
      case 'LT': return this.compareGrades(gradeCode, condition.value) < 0;
      default: return false;
    }
  }

  private evaluateWorkflowTypeCondition(condition: any, workflowType: WorkflowType): boolean {
    return workflowType === condition.value;
  }

  private compareGrades(grade1: string, grade2: string): number {
    const gradeLevels: Record<string, number> = {
      'M3': 1, 'M4': 2, 'M5': 3, 'M6': 4, 'M7': 5, 'M8': 6,
      'M9': 7, 'M10': 8, 'M11': 9, 'M13': 10, 'M15': 11, 'M17': 12, 'CEO': 13
    };
    
    const level1 = gradeLevels[grade1] || 0;
    const level2 = gradeLevels[grade2] || 0;
    
    return level1 - level2;
  }

  private async executeResolver(
    resolver: StageResolver,
    employee: EmployeeLean,
    requestData: any
  ): Promise<Types.ObjectId[]> {
    // This would integrate with your existing approval rule logic
    // but now it's driven by database configuration
    this.logger.log(`Executing resolver: ${resolver.name} for stage ${resolver.stageNumber}`);
    
    // Your existing approval rule logic goes here, but now config-driven
    return []; // Return approver IDs
  }

  private removeDuplicateApprovers(approvers: Types.ObjectId[]): Types.ObjectId[] {
    const uniqueIds = new Set<string>();
    return approvers.filter(approverId => {
      const idString = approverId.toString();
      if (uniqueIds.has(idString)) {
        return false;
      }
      uniqueIds.add(idString);
      return true;
    });
  }
}