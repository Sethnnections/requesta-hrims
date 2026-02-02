import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryDepartmentDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by parent department ID',
  })
  @IsOptional()
  @IsMongoId()
  parentDepartmentId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Filter only active departments',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Include sub-departments',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeSubDepartments?: boolean;

  @ApiPropertyOptional({
    description: 'Include employee count',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeEmployeeCount?: boolean;
}