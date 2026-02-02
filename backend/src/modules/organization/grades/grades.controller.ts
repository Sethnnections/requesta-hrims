import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GradesService } from './services/grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradeDto } from './dto/query-grade.dto';
import { GradeResponseDto } from './dto/grade-response.dto';

@ApiTags('grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grade' })
  @ApiResponse({ status: 201, type: GradeResponseDto })
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grades with pagination and filtering' })
  @ApiResponse({ status: 200, type: [GradeResponseDto] })
  findAll(@Query() query: QueryGradeDto) {
    return this.gradesService.findAll(query);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get complete grade hierarchy' })
  @ApiResponse({ status: 200, type: [GradeResponseDto] })
  getHierarchy() {
    return this.gradesService.getGradeHierarchy();
  }

  @Get('band/:band')
  @ApiOperation({ summary: 'Get grades by band' })
  @ApiResponse({ status: 200, type: [GradeResponseDto] })
  getByBand(@Param('band') band: string) {
    return this.gradesService.getGradesByBand(band);
  }

  @Get('progression/:gradeCode')
  @ApiOperation({ summary: 'Get grade progression path from starting grade' })
  @ApiResponse({ status: 200, type: [GradeResponseDto] })
  getProgression(@Param('gradeCode') gradeCode: string) {
    return this.gradesService.getGradeProgression(gradeCode);
  }

  @Get('can-approve/:approverGrade/:targetGrade')
  @ApiOperation({ summary: 'Check if approver grade can approve target grade' })
  @ApiResponse({ status: 200, type: Boolean })
  canApprove(
    @Param('approverGrade') approverGrade: string,
    @Param('targetGrade') targetGrade: string,
  ) {
    return this.gradesService.canApproveUpTo(approverGrade, targetGrade);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grade by ID' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get grade by code' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  findByCode(@Param('code') code: string) {
    return this.gradesService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update grade' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete grade' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
