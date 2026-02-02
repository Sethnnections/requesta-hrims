import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryGradeDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by name, code, or description',
  })
  @IsOptional()
  @IsString()
  declare search?: string;

  @ApiPropertyOptional({
    description: 'Filter by grade band',
    enum: ['JUNIOR', 'OPERATIONAL', 'SUPERVISORY', 'MANAGERIAL', 'EXECUTIVE']
  })
  @IsOptional()
  @IsEnum(['JUNIOR', 'OPERATIONAL', 'SUPERVISORY', 'MANAGERIAL', 'EXECUTIVE'])
  band?: string;

  @ApiPropertyOptional({
    description: 'Filter only active grades',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by minimum grade level',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minGradeLevel?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum grade level',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxGradeLevel?: number;
}