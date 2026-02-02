import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { QueryPositionDto } from './dto/query-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { PositionHierarchyDto } from './dto/position-hierarchy.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
@ApiTags('Positions')
// @ApiBearerAuth()
@Controller('positions')
export class PositionsController {
constructor(private readonly positionsService: PositionsService) {}
@Post()
@ApiOperation({ summary: 'Create a new position' })
@ApiResponse({
status: 201,
description: 'Position created successfully',
type: PositionResponseDto,
})
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 409, description: 'Position already exists' })
async create(
@Body() createPositionDto: CreatePositionDto,
): Promise<PositionResponseDto> {
return this.positionsService.create(createPositionDto);
}
@Get()
@ApiOperation({ summary: 'Get all positions with pagination and filters' })
@ApiResponse({
status: 200,
description: 'Positions retrieved successfully',
})
async findAll(
@Query() query: QueryPositionDto,
): Promise<PaginationResponseDto<PositionResponseDto>> {
return this.positionsService.findAll(query);
}
@Get('hierarchy')
@ApiOperation({ summary: 'Get complete position hierarchy' })
@ApiResponse({
status: 200,
description: 'Hierarchy retrieved successfully',
type: [PositionHierarchyDto],
})
async getCompleteHierarchy(): Promise<PositionHierarchyDto[]> {
return this.positionsService.getCompleteHierarchy();
}
@Get('department/:departmentId/hierarchy')
@ApiOperation({ summary: 'Get position hierarchy for a department' })
@ApiParam({ name: 'departmentId', description: 'Department ID' })
@ApiResponse({
status: 200,
description: 'Department hierarchy retrieved successfully',
type: [PositionHierarchyDto],
})
async getDepartmentHierarchy(
@Param('departmentId') departmentId: string,
): Promise<PositionHierarchyDto[]> {
return this.positionsService.getDepartmentPositionHierarchy(departmentId);
}
@Get(':id')
@ApiOperation({ summary: 'Get position by ID' })
@ApiParam({ name: 'id', description: 'Position ID' })
@ApiResponse({
status: 200,
description: 'Position retrieved successfully',
type: PositionResponseDto,
})
@ApiResponse({ status: 404, description: 'Position not found' })
async findOne(@Param('id') id: string): Promise<PositionResponseDto> {
return this.positionsService.findOne(id, true);
}
@Get(':id/reporting-chain')
@ApiOperation({ summary: 'Get reporting chain for a position' })
@ApiParam({ name: 'id', description: 'Position ID' })
@ApiResponse({
status: 200,
description: 'Reporting chain retrieved successfully',
type: [PositionResponseDto],
})
async getReportingChain(
@Param('id') id: string,
): Promise<PositionResponseDto[]> {
return this.positionsService.getReportingChain(id);
}
@Get(':id/subordinates')
@ApiOperation({ summary: 'Get all subordinate positions (recursive)' })
@ApiParam({ name: 'id', description: 'Position ID' })
@ApiResponse({
status: 200,
description: 'Subordinates retrieved successfully',
type: [PositionResponseDto],
})
async getAllSubordinates(
@Param('id') id: string,
): Promise<PositionResponseDto[]> {
return this.positionsService.getAllSubordinates(id);
}
@Get(':id/availability')
@ApiOperation({ summary: 'Check if position is available for assignment' })
@ApiParam({ name: 'id', description: 'Position ID' })
@ApiResponse({
status: 200,
description: 'Availability checked',
})
async checkAvailability(
@Param('id') id: string,
): Promise<{ available: boolean; message: string }> {
const available = await this.positionsService.checkAvailability(id);
return {
available,
message: available
? 'Position is available for assignment'
: 'Position is fully filled',
};
}
@Patch(':id')
@ApiOperation({ summary: 'Update position' })
@ApiParam({ name: 'id', description: 'Position ID' })
@ApiResponse({
status: 200,
description: 'Position updated successfully',
type: PositionResponseDto,
})
@ApiResponse({ status: 404, description: 'Position not found' })
@ApiResponse({
status: 409,
description: 'Position code already exists',
})
async update(
@Param('id') id: string,
@Body() updatePositionDto: UpdatePositionDto,
): Promise<PositionResponseDto> {
return this.positionsService.update(id, updatePositionDto);
}
@Delete(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Soft delete position' })
@ApiParam({ name: 'id', description: 'Position ID' })
@ApiResponse({
status: 200,
description: 'Position deleted successfully',
})
@ApiResponse({ status: 404, description: 'Position not found' })
@ApiResponse({
status: 400,
description: 'Cannot delete position with employees or direct reports',
})
async remove(@Param('id') id: string): Promise<{ message: string }> {
return this.positionsService.remove(id);
}
@Post(':id/restore')
@ApiOperation({ summary: 'Restore soft-deleted position' })
@ApiParam({ name: 'id', description: 'Position ID' })
@ApiResponse({
status: 200,
description: 'Position restored successfully',
type: PositionResponseDto,
})
@ApiResponse({ status: 404, description: 'Position not found' })
async restore(@Param('id') id: string): Promise<PositionResponseDto> {
return this.positionsService.restore(id);
}
}