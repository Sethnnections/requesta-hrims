import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkflowDefinition, WorkflowDefinitionDocument } from '../schemas/workflow-definition.schema';
import { CreateWorkflowDefinitionDto, WorkflowStageDto } from '../dto/create-workflow-definition.dto';
import { UpdateWorkflowDefinitionDto } from '../dto/update-workflow-definition.dto';
import { WorkflowDefinitionResponseDto, WorkflowStageResponseDto } from '../dto/workflow-definition-response.dto';
import { WorkflowType } from '../../../../common/enums';

interface WorkflowSearchFilters {
  workflowType?: string;
  department?: string;
  isActive?: boolean;
}

@Injectable()
export class WorkflowDefinitionsService {
  constructor(
    @InjectModel(WorkflowDefinition.name) 
    private workflowDefinitionModel: Model<WorkflowDefinitionDocument>,
  ) {}

  async create(createDto: CreateWorkflowDefinitionDto, createdBy: string): Promise<WorkflowDefinitionResponseDto> {
    // Validate stages
    this.validateStages(createDto.stages);

    // Check if active definition already exists
    if (createDto.isActive !== false) {
      const existingDefinition = await this.workflowDefinitionModel.findOne({
        workflowType: createDto.workflowType,
        department: createDto.department,
        isActive: true,
      });

      if (existingDefinition) {
        throw new ConflictException(`Active workflow definition already exists for ${createDto.workflowType} in department ${createDto.department}`);
      }
    }

    // Get latest version number
    const latestVersion = await this.getLatestVersion(createDto.workflowType, createDto.department);
    
    const workflowDefinition = new this.workflowDefinitionModel({
      ...createDto,
      version: latestVersion + 1,
      createdBy,
    });

    const savedDefinition = await workflowDefinition.save();
    return this.mapToResponseDto(savedDefinition);
  }

  async findAll(): Promise<WorkflowDefinitionResponseDto[]> {
    const definitions = await this.workflowDefinitionModel
      .find()
      .sort({ workflowType: 1, department: 1, version: -1 })
      .exec();

    return definitions.map(def => this.mapToResponseDto(def));
  }

  async search(filters: WorkflowSearchFilters): Promise<WorkflowDefinitionResponseDto[]> {
    const query: any = {};

    if (filters.workflowType) {
      query.workflowType = filters.workflowType;
    }

    if (filters.department) {
      query.department = filters.department;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const definitions = await this.workflowDefinitionModel
      .find(query)
      .sort({ workflowType: 1, department: 1, version: -1 })
      .exec();

    return definitions.map(def => this.mapToResponseDto(def));
  }

  async findOne(id: string): Promise<WorkflowDefinitionResponseDto> {
    const definition = await this.workflowDefinitionModel.findById(id).exec();

    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }

    return this.mapToResponseDto(definition);
  }

  async update(id: string, updateDto: UpdateWorkflowDefinitionDto, updatedBy: string): Promise<WorkflowDefinitionResponseDto> {
    const definition = await this.workflowDefinitionModel.findById(id);
    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }

    // Validate stages if provided
    if (updateDto.stages) {
      this.validateStages(updateDto.stages);
    }

    // If activating, deactivate other definitions of same type and department
    if (updateDto.isActive === true) {
      await this.workflowDefinitionModel.updateMany(
        { 
          workflowType: definition.workflowType, 
          department: definition.department,
          _id: { $ne: id } 
        },
        { isActive: false }
      );
    }

    const updated = await this.workflowDefinitionModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          updatedBy,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    return this.mapToResponseDto(updated!);
  }

  async remove(id: string): Promise<void> {
    const definition = await this.workflowDefinitionModel.findById(id);
    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }

    await this.workflowDefinitionModel.findByIdAndDelete(id);
  }

  async activate(id: string, updatedBy: string): Promise<WorkflowDefinitionResponseDto> {
    const definition = await this.workflowDefinitionModel.findById(id);
    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }

    // Deactivate other definitions of same type and department
    await this.workflowDefinitionModel.updateMany(
      { 
        workflowType: definition.workflowType, 
        department: definition.department,
        _id: { $ne: id } 
      },
      { isActive: false }
    );

    const activated = await this.workflowDefinitionModel
      .findByIdAndUpdate(
        id,
        {
          isActive: true,
          updatedBy,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    return this.mapToResponseDto(activated!);
  }

  async deactivate(id: string, updatedBy: string): Promise<WorkflowDefinitionResponseDto> {
    const definition = await this.workflowDefinitionModel.findById(id);
    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }

    const deactivated = await this.workflowDefinitionModel
      .findByIdAndUpdate(
        id,
        {
          isActive: false,
          updatedBy,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    return this.mapToResponseDto(deactivated!);
  }

  async getActiveDefinition(workflowType: WorkflowType, department: string = 'ALL'): Promise<WorkflowDefinitionDocument | null> {
    return this.workflowDefinitionModel.findOne({
      workflowType,
      $or: [
        { department: 'ALL' },
        { department }
      ],
      isActive: true
    }).sort({ version: -1 }).exec();
  }

  private async getLatestVersion(workflowType: WorkflowType, department: string): Promise<number> {
    const latest = await this.workflowDefinitionModel
      .findOne({ workflowType, department })
      .sort({ version: -1 })
      .exec();

    return latest ? latest.version : 0;
  }

  private validateStages(stages: WorkflowStageDto[]): void {
    if (!stages || stages.length === 0) {
      throw new BadRequestException('Workflow definition must have at least one stage');
    }

    // Check for duplicate stage numbers
    const stageNumbers = stages.map(stage => stage.stage);
    const uniqueStageNumbers = new Set(stageNumbers);
    if (stageNumbers.length !== uniqueStageNumbers.size) {
      throw new BadRequestException('Stage numbers must be unique');
    }

    // Check for sequential stage numbers starting from 1
    const sortedStages = [...stageNumbers].sort((a, b) => a - b);
    for (let i = 0; i < sortedStages.length; i++) {
      if (sortedStages[i] !== i + 1) {
        throw new BadRequestException('Stage numbers must be sequential starting from 1');
      }
    }

    // Validate each stage
    stages.forEach((stage, index) => {
      if (!stage.name) {
        throw new BadRequestException(`Stage ${index + 1} must have a name`);
      }

      if (!stage.approvalRule) {
        throw new BadRequestException(`Stage ${index + 1} must have an approval rule`);
      }

      const validRules = ['SUPERVISOR', 'MANAGERIAL_LEVEL', 'GRADE_BASED', 'FINANCE', 'DEPARTMENT_HEAD', 'ROLE_BASED', 'SPECIFIC_USER'];
      if (!validRules.includes(stage.approvalRule)) {
        throw new BadRequestException(`Stage ${index + 1} has invalid approval rule: ${stage.approvalRule}`);
      }
    });
  }

  mapToResponseDto(definition: WorkflowDefinitionDocument): WorkflowDefinitionResponseDto {
    const dto = new WorkflowDefinitionResponseDto();
    dto._id = (definition._id as Types.ObjectId).toString();
    dto.name = definition.name;
    dto.workflowType = definition.workflowType;
    dto.department = definition.department;
    dto.description = definition.description;
    dto.isActive = definition.isActive;
    dto.version = definition.version;

    // Map stages - fix the type issue here
    dto.stages = definition.stages.map(stage => {
      const stageDto = new WorkflowStageResponseDto();
      stageDto.stage = stage.stage;
      stageDto.name = stage.name;
      stageDto.approvalRule = stage.approvalRule;
      stageDto.ruleConfig = stage.ruleConfig;
      return stageDto;
    });

    return dto;
  }
}