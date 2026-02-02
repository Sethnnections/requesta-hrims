import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelRateConfig, TravelRateConfigDocument } from './schemas/travel-rate-config.schema';
import { TravelType, Currency, AccommodationType, TransportMode } from '../../../common/enums';

@Injectable()
export class TravelRateConfigService implements OnModuleInit {
  private readonly logger = new Logger(TravelRateConfigService.name);

  constructor(
    @InjectModel(TravelRateConfig.name)
    private travelRateConfigModel: Model<TravelRateConfigDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRates();
  }

  async seedDefaultRates() {
    const existingCount = await this.travelRateConfigModel.countDocuments();
    
    if (existingCount > 0) {
      this.logger.log('Travel rate configurations already exist, skipping seeding.');
      return;
    }

    const defaultRates = [
      // LOCAL TRAVEL RATES (MWK)
      { gradeCode: 'M3', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 8000, accommodationRate: 25000, transportRate: 15000, communicationRate: 5000, incidentalsRate: 3000 },
      { gradeCode: 'M4', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 10000, accommodationRate: 30000, transportRate: 18000, communicationRate: 6000, incidentalsRate: 4000 },
      { gradeCode: 'M5', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 12000, accommodationRate: 35000, transportRate: 20000, communicationRate: 7000, incidentalsRate: 5000 },
      { gradeCode: 'M6', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 15000, accommodationRate: 40000, transportRate: 25000, communicationRate: 8000, incidentalsRate: 6000 },
      { gradeCode: 'M7', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 18000, accommodationRate: 45000, transportRate: 30000, communicationRate: 9000, incidentalsRate: 7000 },
      { gradeCode: 'M8', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 22000, accommodationRate: 50000, transportRate: 35000, communicationRate: 10000, incidentalsRate: 8000 },
      { gradeCode: 'M9', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 25000, accommodationRate: 60000, transportRate: 40000, communicationRate: 12000, incidentalsRate: 10000 },
      { gradeCode: 'M10', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 30000, accommodationRate: 70000, transportRate: 45000, communicationRate: 15000, incidentalsRate: 12000 },
      { gradeCode: 'M11', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 35000, accommodationRate: 80000, transportRate: 50000, communicationRate: 18000, incidentalsRate: 15000 },
      { gradeCode: 'M13', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 40000, accommodationRate: 90000, transportRate: 60000, communicationRate: 20000, incidentalsRate: 18000 },
      { gradeCode: 'M15', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 45000, accommodationRate: 100000, transportRate: 70000, communicationRate: 25000, incidentalsRate: 20000 },
      { gradeCode: 'M17', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 50000, accommodationRate: 120000, transportRate: 80000, communicationRate: 30000, incidentalsRate: 25000 },
      { gradeCode: 'CEO', travelType: TravelType.LOCAL, currency: Currency.MWK, perDiemRate: 60000, accommodationRate: 150000, transportRate: 100000, communicationRate: 35000, incidentalsRate: 30000 },

      // INTERNATIONAL TRAVEL RATES (USD)
      { gradeCode: 'M3', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 50, accommodationRate: 150, transportRate: 500, communicationRate: 30, incidentalsRate: 20 },
      { gradeCode: 'M4', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 60, accommodationRate: 180, transportRate: 600, communicationRate: 35, incidentalsRate: 25 },
      { gradeCode: 'M5', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 70, accommodationRate: 200, transportRate: 700, communicationRate: 40, incidentalsRate: 30 },
      { gradeCode: 'M6', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 80, accommodationRate: 220, transportRate: 800, communicationRate: 45, incidentalsRate: 35 },
      { gradeCode: 'M7', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 90, accommodationRate: 250, transportRate: 900, communicationRate: 50, incidentalsRate: 40 },
      { gradeCode: 'M8', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 100, accommodationRate: 280, transportRate: 1000, communicationRate: 55, incidentalsRate: 45 },
      { gradeCode: 'M9', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 120, accommodationRate: 300, transportRate: 1200, communicationRate: 60, incidentalsRate: 50 },
      { gradeCode: 'M10', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 140, accommodationRate: 350, transportRate: 1400, communicationRate: 65, incidentalsRate: 55 },
      { gradeCode: 'M11', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 160, accommodationRate: 400, transportRate: 1600, communicationRate: 70, incidentalsRate: 60 },
      { gradeCode: 'M13', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 180, accommodationRate: 450, transportRate: 1800, communicationRate: 75, incidentalsRate: 65 },
      { gradeCode: 'M15', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 200, accommodationRate: 500, transportRate: 2000, communicationRate: 80, incidentalsRate: 70 },
      { gradeCode: 'M17', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 250, accommodationRate: 600, transportRate: 2500, communicationRate: 90, incidentalsRate: 80 },
      { gradeCode: 'CEO', travelType: TravelType.INTERNATIONAL, currency: Currency.USD, perDiemRate: 300, accommodationRate: 800, transportRate: 3000, communicationRate: 100, incidentalsRate: 100 },
    ];

    await this.travelRateConfigModel.insertMany(defaultRates);
    this.logger.log(`Seeded ${defaultRates.length} travel rate configurations`);
  }

  async getActiveRatesForGrade(gradeCode: string, travelType: TravelType): Promise<TravelRateConfigDocument | null> {
    const now = new Date();
    
    return this.travelRateConfigModel.findOne({
      gradeCode,
      travelType,
      isActive: true,
      $or: [
        { effectiveFrom: { $lte: now }, effectiveTo: { $gte: now } },
        { effectiveFrom: { $lte: now }, effectiveTo: null },
        { effectiveFrom: null, effectiveTo: { $gte: now } },
        { effectiveFrom: null, effectiveTo: null }
      ]
    }).sort({ effectiveFrom: -1 }).exec();
  }

  async getAllActiveRates(travelType?: TravelType): Promise<TravelRateConfigDocument[]> {
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

    if (travelType) {
      query.travelType = travelType;
    }

    return this.travelRateConfigModel.find(query).sort({ gradeCode: 1 }).exec();
  }

  async createRateConfig(createDto: Partial<TravelRateConfig>): Promise<TravelRateConfigDocument> {
    // Deactivate previous rates for same grade and travel type
    await this.travelRateConfigModel.updateMany(
      { gradeCode: createDto.gradeCode, travelType: createDto.travelType, isActive: true },
      { isActive: false }
    );

    const rateConfig = new this.travelRateConfigModel(createDto);
    return rateConfig.save();
  }

  async updateRateConfig(id: string, updateDto: Partial<TravelRateConfig>): Promise<TravelRateConfigDocument | null> {
    return this.travelRateConfigModel.findByIdAndUpdate(
      id,
      { ...updateDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async calculateTravelCosts(
    gradeCode: string, 
    travelType: TravelType, 
    numberOfDays: number,
    accommodationType: AccommodationType,
    transportMode: TransportMode
  ): Promise<{
    perDiemAmount: number;
    accommodationCost: number;
    transportCost: number;
    communicationCost: number;
    incidentalsCost: number;
    totalEstimatedCost: number;
    currency: Currency;
  }> {
    const rates = await this.getActiveRatesForGrade(gradeCode, travelType);
    
    if (!rates) {
      throw new Error(`No travel rates found for grade ${gradeCode} and travel type ${travelType}`);
    }

    // Calculate per diem
    const perDiemAmount = rates.perDiemRate * numberOfDays;
    
    // Calculate accommodation cost
    let accommodationCost = 0;
    if (accommodationType === AccommodationType.FULLY_PAID) {
      accommodationCost = rates.accommodationRate * numberOfDays;
    } else if (accommodationType === AccommodationType.PER_DIEM_ONLY) {
      accommodationCost = rates.perDiemRate * numberOfDays * 0.5; // 50% of per diem for accommodation
    }
    
    // Calculate transport cost
    const transportCost = transportMode === TransportMode.FLIGHT 
      ? rates.transportRate * 2 // Round trip for flights
      : rates.transportRate * numberOfDays;
    
    // Calculate other costs
    const communicationCost = rates.communicationRate * numberOfDays;
    const incidentalsCost = rates.incidentalsRate * numberOfDays;
    
    // Calculate total
    const totalEstimatedCost = perDiemAmount + accommodationCost + transportCost + communicationCost + incidentalsCost;

    return {
      perDiemAmount,
      accommodationCost,
      transportCost,
      communicationCost,
      incidentalsCost,
      totalEstimatedCost,
      currency: rates.currency
    };
  }
}