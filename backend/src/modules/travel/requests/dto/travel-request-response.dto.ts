import { ApiProperty } from '@nestjs/swagger';
import { TravelStatus, TravelType, TravelPurpose, AccommodationType, TravelMode, TransportMode, TravelPriority, Currency } from '../../../../common/enums';

export class TravelRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  travelReference: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty({ enum: TravelPurpose })
  travelPurpose: TravelPurpose;

  @ApiProperty({ enum: TravelType })
  travelType: TravelType;

  @ApiProperty()
  destination: {
    country: string;
    city: string;
    location?: string;
  };

  @ApiProperty()
  travelDates: {
    departureDate: Date;
    returnDate: Date;
    numberOfDays: number;
  };

  @ApiProperty({ enum: AccommodationType })
  accommodationType: AccommodationType;

  @ApiProperty({ required: false })
  accommodationDetails?: {
    hotelName?: string;
    hotelContact?: string;
    estimatedCostPerNight?: number;
    currency?: Currency;
  };

  @ApiProperty({ enum: TravelMode })
  travelMode: TravelMode;

  @ApiProperty()
  transportDetails: {
    mode: TransportMode;
    vehicleRegistration?: string;
    flightNumber?: string;
    estimatedCost?: number;
  };

  @ApiProperty({ required: false })
  additionalRequests?: {
    advanceRequired: boolean;
    advanceAmount?: number;
    advanceReason?: string;
    advanceCurrency?: Currency;
    specialRequirements?: string;
  };

  @ApiProperty({ required: false })
  calculatedCosts?: {
    totalEstimatedCost: number;
    perDiemAmount: number;
    accommodationCost: number;
    transportCost: number;
    advanceAmount: number;
    otherCosts: number;
    currency: Currency;
  };

  @ApiProperty({ enum: TravelPriority })
  urgency: TravelPriority;

  @ApiProperty({ enum: TravelStatus })
  status: TravelStatus;

  @ApiProperty({ required: false })
  workflowId?: string;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;

  @ApiProperty({ required: false })
  comments?: string;

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}