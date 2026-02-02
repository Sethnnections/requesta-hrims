import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  TravelStatus,
  TravelType,
  TravelPurpose,
  AccommodationType,
  TravelMode,
  TransportMode,
  TravelPriority,
  Currency,
} from '../../../../common/enums';

export type TravelRequestDocument = TravelRequest & Document;

@Schema({ timestamps: true, collection: 'travel_requests' })
export class TravelRequest {
  @Prop({ required: true, unique: true })
  travelReference: string; // TRV-YYYY-0001 format

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(TravelPurpose), required: true })
  travelPurpose: TravelPurpose;

  @Prop({ type: String, enum: Object.values(TravelType), required: true })
  travelType: TravelType;

  @Prop({
    type: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      location: String,
    },
    required: true,
  })
  destination: {
    country: string;
    city: string;
    location?: string;
  };

  @Prop({
    type: {
      departureDate: { type: Date, required: true },
      returnDate: { type: Date, required: true },
      numberOfDays: { type: Number, default: 1 },
    },
    required: true,
  })
  travelDates: {
    departureDate: Date;
    returnDate: Date;
    numberOfDays: number;
  };

  @Prop({
    type: String,
    enum: Object.values(AccommodationType),
    required: true,
  })
  accommodationType: AccommodationType;

  @Prop({
    type: {
      hotelName: String,
      hotelContact: String,
      estimatedCostPerNight: Number,
      currency: {
        type: String,
        enum: Object.values(Currency),
        default: Currency.MWK,
      },
    },
  })
  accommodationDetails?: {
    hotelName?: string;
    hotelContact?: string;
    estimatedCostPerNight?: number;
    currency?: Currency;
  };

  @Prop({ type: String, enum: Object.values(TravelMode), required: true })
  travelMode: TravelMode;

  @Prop({
    type: {
      mode: {
        type: String,
        enum: Object.values(TransportMode),
        required: true,
      },
      vehicleRegistration: String,
      flightNumber: String,
      estimatedCost: Number,
    },
  })
  transportDetails: {
    mode: TransportMode;
    vehicleRegistration?: string;
    flightNumber?: string;
    estimatedCost?: number;
  };

  @Prop({
    type: {
      advanceRequired: { type: Boolean, default: false },
      advanceAmount: Number,
      advanceReason: String,
      advanceCurrency: {
        type: String,
        enum: Object.values(Currency),
        default: Currency.MWK,
      },
      specialRequirements: String,
    },
  })
  additionalRequests?: {
    advanceRequired: boolean;
    advanceAmount?: number;
    advanceReason?: string;
    advanceCurrency?: Currency;
    specialRequirements?: string;
  };

  @Prop({
    type: {
      totalEstimatedCost: Number,
      perDiemAmount: Number,
      accommodationCost: Number,
      transportCost: Number,
      advanceAmount: Number,
      otherCosts: Number,
      currency: {
        type: String,
        enum: Object.values(Currency),
        default: Currency.MWK,
      },
    },
  })
  calculatedCosts?: {
    totalEstimatedCost: number;
    perDiemAmount: number;
    accommodationCost: number;
    transportCost: number;
    advanceAmount: number;
    otherCosts: number;
    currency: Currency;
  };

  @Prop({
    type: String,
    enum: Object.values(TravelPriority),
    default: TravelPriority.NORMAL,
  })
  urgency: TravelPriority;

  @Prop({
    type: String,
    enum: Object.values(TravelStatus),
    default: TravelStatus.DRAFT,
  })
  status: TravelStatus;

  @Prop({ type: Types.ObjectId, ref: 'DynamicWorkflow' })
  workflowId?: Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop()
  approvedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop()
  comments?: string;

  @Prop({ type: Object })
  metadata?: any;
}

export const TravelRequestSchema = SchemaFactory.createForClass(TravelRequest);

// Indexes
TravelRequestSchema.index({ employeeId: 1, status: 1 });
TravelRequestSchema.index({ workflowId: 1 });
TravelRequestSchema.index({ status: 1, createdAt: -1 });
TravelRequestSchema.index({ travelType: 1, status: 1 });
TravelRequestSchema.index({ 'destination.country': 1, status: 1 });
TravelRequestSchema.index({ createdAt: -1 });
TravelRequestSchema.index({ 'travelDates.departureDate': 1 });
