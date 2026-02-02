import { 
  IsNotEmpty, IsString, IsEnum, IsObject, IsOptional, 
  IsNumber, IsBoolean, IsDate, IsMongoId, Min, Max, ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TravelPurpose, TravelType, AccommodationType, TravelMode, TransportMode, TravelPriority, Currency } from '../../../../common/enums';

export class DestinationDto {
  @ApiProperty({ description: 'Destination country', example: 'Malawi' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ description: 'Destination city', example: 'Blantyre' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Specific location', example: 'ABC Client Offices' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class TravelDatesDto {
  @ApiProperty({ description: 'Departure date', example: '2025-11-15T08:00:00.000Z' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  departureDate: Date;

  @ApiProperty({ description: 'Return date', example: '2025-11-17T18:00:00.000Z' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  returnDate: Date;
}

export class AccommodationDetailsDto {
  @ApiPropertyOptional({ description: 'Hotel name', example: 'Blantyre Hotel' })
  @IsOptional()
  @IsString()
  hotelName?: string;

  @ApiPropertyOptional({ description: 'Hotel contact', example: '+265 123 4567' })
  @IsOptional()
  @IsString()
  hotelContact?: string;

  @ApiPropertyOptional({ description: 'Estimated cost per night', example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCostPerNight?: number;

  @ApiPropertyOptional({ 
    description: 'Currency for accommodation', 
    enum: Currency,
    default: Currency.MWK 
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}

export class TransportDetailsDto {
  @ApiProperty({ 
    description: 'Transport mode', 
    enum: TransportMode,
    example: TransportMode.COMPANY_VEHICLE 
  })
  @IsNotEmpty()
  @IsEnum(TransportMode)
  mode: TransportMode;

  @ApiPropertyOptional({ description: 'Vehicle registration', example: 'BL 1234' })
  @IsOptional()
  @IsString()
  vehicleRegistration?: string;

  @ApiPropertyOptional({ description: 'Flight number', example: 'KQ 123' })
  @IsOptional()
  @IsString()
  flightNumber?: string;

  @ApiPropertyOptional({ description: 'Estimated transport cost', example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;
}

export class AdditionalRequestsDto {
  @ApiPropertyOptional({ description: 'Whether advance is required', default: false })
  @IsOptional()
  @IsBoolean()
  advanceRequired?: boolean = false;

  @ApiPropertyOptional({ description: 'Advance amount requested', example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  advanceAmount?: number;

  @ApiPropertyOptional({ description: 'Reason for advance', example: 'Fuel and incidental expenses' })
  @IsOptional()
  @IsString()
  advanceReason?: string;

  @ApiPropertyOptional({ 
    description: 'Currency for advance', 
    enum: Currency,
    default: Currency.MWK 
  })
  @IsOptional()
  @IsEnum(Currency)
  advanceCurrency?: Currency;

  @ApiPropertyOptional({ description: 'Special requirements', example: 'Vegetarian meals required' })
  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

export class CreateTravelRequestDto {
  @ApiProperty({ 
    description: 'ID of the employee traveling',
    example: '60d5ecb74b24c72b8c8b4567'
  })
  @IsNotEmpty()
  @IsMongoId()
  employeeId: string;

  @ApiProperty({ 
    description: 'Purpose of travel', 
    enum: TravelPurpose,
    example: TravelPurpose.CLIENT_MEETING 
  })
  @IsNotEmpty()
  @IsEnum(TravelPurpose)
  travelPurpose: TravelPurpose;

  @ApiProperty({ 
    description: 'Type of travel', 
    enum: TravelType,
    example: TravelType.LOCAL 
  })
  @IsNotEmpty()
  @IsEnum(TravelType)
  travelType: TravelType;

  @ApiProperty({ type: DestinationDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => DestinationDto)
  destination: DestinationDto;

  @ApiProperty({ type: TravelDatesDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => TravelDatesDto)
  travelDates: TravelDatesDto;

  @ApiProperty({ 
    description: 'Accommodation type', 
    enum: AccommodationType,
    example: AccommodationType.FULLY_PAID 
  })
  @IsNotEmpty()
  @IsEnum(AccommodationType)
  accommodationType: AccommodationType;

  @ApiPropertyOptional({ type: AccommodationDetailsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AccommodationDetailsDto)
  accommodationDetails?: AccommodationDetailsDto;

  @ApiProperty({ 
    description: 'Travel mode', 
    enum: TravelMode,
    example: TravelMode.ROAD 
  })
  @IsNotEmpty()
  @IsEnum(TravelMode)
  travelMode: TravelMode;

  @ApiProperty({ type: TransportDetailsDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => TransportDetailsDto)
  transportDetails: TransportDetailsDto;

  @ApiPropertyOptional({ type: AdditionalRequestsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AdditionalRequestsDto)
  additionalRequests?: AdditionalRequestsDto;

  @ApiProperty({ 
    description: 'Urgency level', 
    enum: TravelPriority,
    default: TravelPriority.NORMAL 
  })
  @IsOptional()
  @IsEnum(TravelPriority)
  urgency?: TravelPriority = TravelPriority.NORMAL;

  @ApiPropertyOptional({ description: 'Additional comments', example: 'Client system implementation and training' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}