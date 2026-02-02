import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OvertimeRateConfig, OvertimeRateConfigDocument } from './schemas/overtime-rate-config.schema';
import { OvertimeType } from '../../../common/enums';

@Injectable()
export class OvertimeRateConfigService implements OnModuleInit {
  private readonly logger = new Logger(OvertimeRateConfigService.name);

  constructor(
    @InjectModel(OvertimeRateConfig.name)
    private overtimeRateConfigModel: Model<OvertimeRateConfigDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRates();
  }

  async seedDefaultRates() {
    const existingCount = await this.overtimeRateConfigModel.countDocuments();
    
    if (existingCount > 0) {
      this.logger.log('Overtime rate configurations already exist, skipping seeding.');
      return;
    }

    const defaultRates = [
      // REGULAR OVERTIME (Weekday after hours)
      { gradeCode: 'M3', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M4', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M5', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M6', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M7', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M8', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M9', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M10', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M11', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M13', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M15', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'M17', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },
      { gradeCode: 'CEO', overtimeType: OvertimeType.REGULAR, baseMultiplier: 1.5, minimumHours: 0, maximumHoursPerDay: 4, maximumHoursPerMonth: 40, approvalRules: { autoApproveLimit: 2, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: false, notificationThreshold: 10 } },

      // WEEKEND OVERTIME (Higher rate)
      { gradeCode: 'M3', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M4', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M5', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M6', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M7', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M8', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M9', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M10', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M11', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M13', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M15', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'M17', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },
      { gradeCode: 'CEO', overtimeType: OvertimeType.WEEKEND, baseMultiplier: 2.0, minimumHours: 2, maximumHoursPerDay: 8, maximumHoursPerMonth: 48, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: false, requiresHrApproval: true, notificationThreshold: 8 } },

      // HOLIDAY OVERTIME (Highest rate)
      { gradeCode: 'M3', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M4', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M5', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M6', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M7', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M8', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M9', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M10', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M11', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M13', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M15', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'M17', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },
      { gradeCode: 'CEO', overtimeType: OvertimeType.HOLIDAY, baseMultiplier: 2.5, minimumHours: 4, maximumHoursPerDay: 10, maximumHoursPerMonth: 60, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 4 } },

      // PUBLIC HOLIDAY OVERTIME (Premium rate)
      { gradeCode: 'M3', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M4', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M5', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M6', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M7', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M8', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M9', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M10', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M11', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M13', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M15', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'M17', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
      { gradeCode: 'CEO', overtimeType: OvertimeType.PUBLIC_HOLIDAY, baseMultiplier: 3.0, minimumHours: 6, maximumHoursPerDay: 12, maximumHoursPerMonth: 72, approvalRules: { autoApproveLimit: 0, requiresManagerApproval: true, requiresDirectorApproval: true, requiresHrApproval: true, notificationThreshold: 2 } },
    ];

    await this.overtimeRateConfigModel.insertMany(defaultRates);
    this.logger.log(`Seeded ${defaultRates.length} overtime rate configurations`);
  }

  async getActiveRatesForGrade(gradeCode: string, overtimeType: OvertimeType): Promise<OvertimeRateConfigDocument | null> {
    const now = new Date();
    
    return this.overtimeRateConfigModel.findOne({
      gradeCode,
      overtimeType,
      isActive: true,
      $or: [
        { effectiveFrom: { $lte: now }, effectiveTo: { $gte: now } },
        { effectiveFrom: { $lte: now }, effectiveTo: null },
        { effectiveFrom: null, effectiveTo: { $gte: now } },
        { effectiveFrom: null, effectiveTo: null }
      ]
    }).sort({ effectiveFrom: -1 }).exec();
  }

  async getAllActiveRates(overtimeType?: OvertimeType): Promise<OvertimeRateConfigDocument[]> {
    const now = new Date();
    const query: any = {
      isActive: true,
      $or: [
        { effectiveFrom: { $lte: now }, effectiveTo: { $gte: now } },
        { effectiveFrom: { $lte: now }, effectiveTo: null },
        { effectiveFrom: null, effectiveTo: { $gte: now } },
        { effectiveFrom: null, effectiveTo: null }
      ]
    };

    if (overtimeType) {
      query.overtimeType = overtimeType;
    }

    return this.overtimeRateConfigModel.find(query).sort({ gradeCode: 1 }).exec();
  }

  async createRateConfig(createDto: Partial<OvertimeRateConfig>): Promise<OvertimeRateConfigDocument> {
    // Deactivate previous rates for same grade and overtime type
    await this.overtimeRateConfigModel.updateMany(
      { gradeCode: createDto.gradeCode, overtimeType: createDto.overtimeType, isActive: true },
      { isActive: false }
    );

    const rateConfig = new this.overtimeRateConfigModel(createDto);
    return rateConfig.save();
  }

  async calculateOvertimePay(
    gradeCode: string,
    overtimeType: OvertimeType,
    totalHours: number,
    basicHourlyRate: number
  ): Promise<{
    overtimeMultiplier: number;
    overtimeRate: number;
    totalAmount: number;
    calculatedHours: number;
    gradeMultiplier: number;
  }> {
    const rates = await this.getActiveRatesForGrade(gradeCode, overtimeType);
    
    if (!rates) {
      throw new Error(`No overtime rates found for grade ${gradeCode} and type ${overtimeType}`);
    }

    // Calculate effective hours (considering minimum hours)
    const effectiveHours = Math.max(totalHours - rates.minimumHours, 0);
    
    // Apply multiplier
    const overtimeMultiplier = rates.baseMultiplier;
    const overtimeRate = basicHourlyRate * overtimeMultiplier;
    const totalAmount = effectiveHours * overtimeRate;

    return {
      overtimeMultiplier,
      overtimeRate,
      totalAmount,
      calculatedHours: effectiveHours,
      gradeMultiplier: rates.baseMultiplier
    };
  }

  async getApprovalRules(
    gradeCode: string,
    overtimeType: OvertimeType,
    totalHours: number
  ): Promise<{
    isAutoApproved: boolean;
    autoApproveReason?: string;
    requiresManagerApproval: boolean;
    requiresHrApproval: boolean;
    requiresFinanceApproval: boolean;
  }> {
    const rates = await this.getActiveRatesForGrade(gradeCode, overtimeType);
    
    if (!rates) {
      throw new Error(`No overtime rates found for grade ${gradeCode} and type ${overtimeType}`);
    }

    // Check if auto-approval applies
    const isAutoApproved = totalHours <= rates.approvalRules.autoApproveLimit;

    return {
      isAutoApproved,
      autoApproveReason: isAutoApproved ? `Auto-approved: Hours (${totalHours}) <= ${rates.approvalRules.autoApproveLimit} limit` : undefined,
      requiresManagerApproval: rates.approvalRules.requiresManagerApproval,
      requiresHrApproval: rates.approvalRules.requiresHrApproval,
      requiresFinanceApproval: rates.approvalRules.requiresDirectorApproval
    };
  }

  async validateOvertimeLimits(
    gradeCode: string,
    overtimeType: OvertimeType,
    totalHours: number,
    date: Date
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const rates = await this.getActiveRatesForGrade(gradeCode, overtimeType);
    
    if (!rates) {
      return {
        isValid: false,
        errors: [`No overtime rates found for grade ${gradeCode}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check daily limit
    if (totalHours > rates.maximumHoursPerDay) {
      errors.push(`Exceeds maximum ${rates.maximumHoursPerDay} hours per day for ${overtimeType}`);
    }

    // Check minimum hours
    if (totalHours < rates.minimumHours) {
      warnings.push(`Hours (${totalHours}) are less than minimum ${rates.minimumHours} hours for ${overtimeType}`);
    }

    // Check notification threshold
    if (totalHours > rates.approvalRules.notificationThreshold) {
      warnings.push(`Hours (${totalHours}) exceed notification threshold of ${rates.approvalRules.notificationThreshold}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}