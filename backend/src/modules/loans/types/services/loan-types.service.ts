import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoanType, LoanTypeDocument } from '../schemas/loan-type.schema';
import { CreateLoanTypeDto } from '../dto/create-loan-type.dto';

@Injectable()
export class LoanTypesService {
  private readonly logger = new Logger(LoanTypesService.name);

  constructor(
    @InjectModel(LoanType.name)
    private loanTypeModel: Model<LoanTypeDocument>,
  ) {}

  /**
   * Create a new loan type
   */
  async create(createDto: CreateLoanTypeDto, userId: string): Promise<LoanTypeDocument> {
    // Check if code already exists
    const existing = await this.loanTypeModel.findOne({ code: createDto.code });
    if (existing) {
      throw new ConflictException(`Loan type with code ${createDto.code} already exists`);
    }

    const loanType = new this.loanTypeModel({
      ...createDto,
      createdBy: new Types.ObjectId(userId),
    });

    await loanType.save();
    this.logger.log(`Created loan type ${loanType.code}`);

    return loanType;
  }

  /**
   * Get all loan types
   */
  async findAll(activeOnly: boolean = false): Promise<LoanTypeDocument[]> {
    const query: any = {};
    if (activeOnly) {
      query.isActive = true;
    }

    return this.loanTypeModel.find(query).sort({ name: 1 }).exec();
  }

  /**
   * Get loan type by ID
   */
  async findOne(id: string): Promise<LoanTypeDocument> {
    const loanType = await this.loanTypeModel.findById(id).exec();
    if (!loanType) {
      throw new NotFoundException('Loan type not found');
    }
    return loanType;
  }

  /**
   * Get loan type by code
   */
  async findByCode(code: string): Promise<LoanTypeDocument> {
    const loanType = await this.loanTypeModel.findOne({ code }).exec();
    if (!loanType) {
      throw new NotFoundException(`Loan type with code ${code} not found`);
    }
    return loanType;
  }

  /**
   * Update loan type
   */
  async update(id: string, updateDto: Partial<CreateLoanTypeDto>, userId: string): Promise<LoanTypeDocument> {
    const loanType = await this.loanTypeModel.findByIdAndUpdate(
      id,
      {
        ...updateDto,
        updatedBy: new Types.ObjectId(userId),
      },
      { new: true }
    ).exec();

    if (!loanType) {
      throw new NotFoundException('Loan type not found');
    }

    this.logger.log(`Updated loan type ${loanType.code}`);
    return loanType;
  }

  /**
   * Delete loan type
   */
  async remove(id: string): Promise<void> {
    const result = await this.loanTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Loan type not found');
    }

    this.logger.log(`Deleted loan type ${result.code}`);
  }

  /**
   * Activate/Deactivate loan type
   */
  async toggleActive(id: string, isActive: boolean, userId: string): Promise<LoanTypeDocument> {
    const loanType = await this.loanTypeModel.findByIdAndUpdate(
      id,
      {
        isActive,
        updatedBy: new Types.ObjectId(userId),
      },
      { new: true }
    ).exec();

    if (!loanType) {
      throw new NotFoundException('Loan type not found');
    }

    this.logger.log(`${isActive ? 'Activated' : 'Deactivated'} loan type ${loanType.code}`);
    return loanType;
  }
}
