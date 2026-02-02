import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryPositionDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by department ID',
  })
  @IsOptional()
  @IsMongoId()
  departmentId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Filter by grade ID',
  })
  @IsOptional()
  @IsMongoId()
  gradeId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Filter by reporting position ID',
  })
  @IsOptional()
  @IsMongoId()
  reportsToPositionId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Filter only active positions',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter only supervisor roles',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSupervisorRole?: boolean;

  @ApiPropertyOptional({
    description: 'Filter only manager roles',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isManagerRole?: boolean;

  @ApiPropertyOptional({
    description: 'Filter only director roles',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDirectorRole?: boolean;

  @ApiPropertyOptional({
    description: 'Filter only available positions (not fully filled)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasAvailability?: boolean;

  @ApiPropertyOptional({
    description: 'Include populated relations',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeRelations?: boolean;
}