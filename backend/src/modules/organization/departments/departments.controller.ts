import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, type: DepartmentResponseDto })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() query: QueryDepartmentDto) {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id, true);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a department' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted department' })
  @ApiResponse({ status: 201, type: DepartmentResponseDto })
  restore(@Param('id') id: string) {
    return this.departmentsService.restore(id);
  }

  @Get('organization/hierarchy')
  @ApiOperation({ summary: 'Get complete organization hierarchy' })
  getOrganizationHierarchy() {
    return this.departmentsService.getHierarchy();
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get department path to root' })
  getDepartmentHierarchy(@Param('id') id: string) {
    return this.departmentsService.getDepartmentPath(id);
  }
}