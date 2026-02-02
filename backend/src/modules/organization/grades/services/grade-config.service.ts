import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GradeApprovalConfig, GradeApprovalConfigDocument } from '../schemas/grade-approval-config.schema';
import { WorkflowType } from '../../../../common/enums';

@Injectable()
export class GradeConfigService implements OnModuleInit {
  private readonly logger = new Logger(GradeConfigService.name);
  private gradeConfigCache = new Map<string, GradeApprovalConfig>();

  constructor(
    @InjectModel(GradeApprovalConfig.name) 
    private gradeConfigModel: Model<GradeApprovalConfigDocument>,
  ) {}

  async onModuleInit() {
    await this.loadGradeConfigurations();
  }

  private async loadGradeConfigurations(): Promise<void> {
    try {
      const configs = await this.gradeConfigModel.find({ isActive: true }).exec();
      this.gradeConfigCache.clear();
      
      for (const config of configs) {
        this.gradeConfigCache.set(config.gradeCode, config);
      }
      
      this.logger.log(`Loaded ${configs.length} grade approval configurations`);
    } catch (error) {
      this.logger.error('Failed to load grade configurations:', error);
      await this.seedDefaultConfigurations();
    }
  }

  async getMaxApprovalLevel(gradeCode: string, workflowType?: WorkflowType): Promise<string> {
    const config = this.gradeConfigCache.get(gradeCode);
    
    if (!config) {
      this.logger.warn(`No configuration found for grade: ${gradeCode}, using default M17`);
      return 'M17';
    }

    // Check for workflow-specific override
    if (workflowType && config.workflowTypeOverrides.has(workflowType)) {
      return config.workflowTypeOverrides.get(workflowType)!;
    }

    return config.maxApprovalLevel;
  }

  async getRequiredApprovalLevelForAmount(gradeCode: string, amount: number): Promise<string> {
    const config = this.gradeConfigCache.get(gradeCode);
    
    if (!config || !config.amountThresholds.length) {
      return await this.getMaxApprovalLevel(gradeCode);
    }

    // Sort thresholds descending and find the first matching threshold
    const sortedThresholds = [...config.amountThresholds].sort((a, b) => b.threshold - a.threshold);
    
    for (const threshold of sortedThresholds) {
      if (amount >= threshold.threshold) {
        return threshold.requiredApprovalLevel;
      }
    }

    return await this.getMaxApprovalLevel(gradeCode);
  }

  async canApprove(approverGradeCode: string, targetGradeCode: string, workflowType?: WorkflowType): Promise<boolean> {
    const [approverConfig, targetConfig] = await Promise.all([
      this.gradeConfigModel.findOne({ gradeCode: approverGradeCode, isActive: true }),
      this.gradeConfigModel.findOne({ gradeCode: targetGradeCode, isActive: true })
    ]);

    if (!approverConfig || !targetConfig) {
      return false;
    }

    const approverMaxLevel = await this.getMaxApprovalLevel(approverGradeCode, workflowType);
    const targetMaxLevel = await this.getMaxApprovalLevel(targetGradeCode, workflowType);

    // Convert grade codes to comparable levels
    const approverLevel = await this.getGradeLevel(approverMaxLevel);
    const targetLevel = await this.getGradeLevel(targetMaxLevel);

    return targetLevel <= approverLevel;
  }

  private async getGradeLevel(gradeCode: string): Promise<number> {
    // This should query the actual Grade schema, but for now we'll use a fallback
    const gradeLevels: Record<string, number> = {
      'M3': 1, 'M4': 2, 'M5': 3, 'M6': 4, 'M7': 5, 'M8': 6,
      'M9': 7, 'M10': 8, 'M11': 9, 'M13': 10, 'M15': 11, 'M17': 12, 'CEO': 13
    };
    
    return gradeLevels[gradeCode] || 0;
  }

  async refreshCache(): Promise<void> {
    await this.loadGradeConfigurations();
  }

  private async seedDefaultConfigurations(): Promise<void> {
    const defaultConfigs = [
      { gradeCode: 'M3', maxApprovalLevel: 'M11', amountThresholds: [] },
      { gradeCode: 'M4', maxApprovalLevel: 'M11', amountThresholds: [] },
      { gradeCode: 'M5', maxApprovalLevel: 'M11', amountThresholds: [] },
      { gradeCode: 'M6', maxApprovalLevel: 'M13', amountThresholds: [] },
      { gradeCode: 'M7', maxApprovalLevel: 'M15', amountThresholds: [] },
      { gradeCode: 'M8', maxApprovalLevel: 'M15', amountThresholds: [] },
      { gradeCode: 'M9', maxApprovalLevel: 'M15', amountThresholds: [] },
      { gradeCode: 'M10', maxApprovalLevel: 'M17', amountThresholds: [] },
      { gradeCode: 'M11', maxApprovalLevel: 'M17', amountThresholds: [] },
      { gradeCode: 'M13', maxApprovalLevel: 'M17', amountThresholds: [] },
      { gradeCode: 'M15', maxApprovalLevel: 'M17', amountThresholds: [] },
      { gradeCode: 'M17', maxApprovalLevel: 'CEO', amountThresholds: [] },
    ];

    try {
      await this.gradeConfigModel.deleteMany({});
      await this.gradeConfigModel.insertMany(defaultConfigs);
      await this.loadGradeConfigurations();
      this.logger.log('Default grade configurations seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed default configurations:', error);
    }
  }
}