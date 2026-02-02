import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GradeApprovalConfig, GradeApprovalConfigDocument } from '../../modules/organization/grades/schemas/grade-approval-config.schema';
import { WorkflowType } from '../../common/enums';

@Injectable()
export class SeedGradeConfigMigration {
  private readonly logger = new Logger(SeedGradeConfigMigration.name);

  constructor(
    @InjectModel(GradeApprovalConfig.name) 
    private gradeConfigModel: Model<GradeApprovalConfigDocument>,
  ) {}

  async run(): Promise<void> {
    try {
      const existingCount = await this.gradeConfigModel.countDocuments();
      
      if (existingCount > 0) {
        this.logger.log('Grade approval configurations already exist, skipping migration.');
        return;
      }

      const defaultConfigs = [
        {
          gradeCode: 'M3',
          maxApprovalLevel: 'M11',
          amountThresholds: [
            { threshold: 50000, requiredApprovalLevel: 'M15', description: 'High amount override for low grades' }
          ],
          workflowTypeOverrides: new Map([[WorkflowType.SYSTEM_CONFIGURATION, 'M11']])
        },
        {
          gradeCode: 'M4', 
          maxApprovalLevel: 'M11',
          amountThresholds: [
            { threshold: 50000, requiredApprovalLevel: 'M15', description: 'High amount override for low grades' }
          ]
        },
        {
          gradeCode: 'M5',
          maxApprovalLevel: 'M11', 
          amountThresholds: [
            { threshold: 50000, requiredApprovalLevel: 'M15', description: 'High amount override for low grades' }
          ]
        },
        {
          gradeCode: 'M6',
          maxApprovalLevel: 'M13',
          amountThresholds: []
        },
        {
          gradeCode: 'M7',
          maxApprovalLevel: 'M15',
          amountThresholds: []
        },
        {
          gradeCode: 'M8', 
          maxApprovalLevel: 'M15',
          amountThresholds: []
        },
        {
          gradeCode: 'M9',
          maxApprovalLevel: 'M15',
          amountThresholds: []
        },
        {
          gradeCode: 'M10',
          maxApprovalLevel: 'M17', 
          amountThresholds: []
        },
        {
          gradeCode: 'M11',
          maxApprovalLevel: 'M17',
          amountThresholds: []
        },
        {
          gradeCode: 'M13',
          maxApprovalLevel: 'M17',
          amountThresholds: []
        },
        {
          gradeCode: 'M15',
          maxApprovalLevel: 'M17',
          amountThresholds: []
        },
        {
          gradeCode: 'M17',
          maxApprovalLevel: 'CEO',
          amountThresholds: []
        },
      ];

      await this.gradeConfigModel.insertMany(defaultConfigs);
      this.logger.log(`Successfully seeded ${defaultConfigs.length} grade approval configurations`);
      
    } catch (error) {
      this.logger.error('Failed to seed grade configurations:', error);
      throw error;
    }
  }
}