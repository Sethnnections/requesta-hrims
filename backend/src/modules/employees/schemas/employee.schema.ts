import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';
import { EmploymentStatus, ContractType, SystemRole } from '../../../common/enums';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true, collection: 'employees' })
export class Employee extends BaseSchema {
  @Prop({ required: true, unique: true })
  employeeNumber: string;

  @Prop({ required: true })
  firstName: string;

  @Prop()
  middleName?: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true, unique: true })
  nationalId: string;

  // Contact Information
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop()
  personalEmail?: string;

  // EMERGENCY CONTACT FIELDS - ADD THESE
  @Prop()
  emergencyContactName?: string;

  @Prop()
  emergencyContactPhone?: string;

  // Department & Position
  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
  positionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Grade', required: true })
  gradeId: Types.ObjectId;

  // DYNAMIC HIERARCHY MANAGEMENT
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  reportsToEmployeeId?: Types.ObjectId;

  @Prop()
  reportsToGradeCode?: string;

  @Prop()
  reportsToEmployeeNumber?: string;

  @Prop({ default: false })
  isDepartmentManager: boolean;

  @Prop({ default: false })
  isSupervisor: boolean;

  // EMPLOYMENT DETAILS
  @Prop({ required: true })
  employmentDate: Date;

  @Prop({ 
    type: String, 
    enum: ContractType,
    required: true 
  })
  contractType: ContractType;

  @Prop({ 
    type: String, 
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE 
  })
  employmentStatus: EmploymentStatus;

  // COMPENSATION
  @Prop({ required: true })
  currentBasicSalary: number;

  @Prop({ required: true, default: 0 })
  houseAllowance: number;

  @Prop({ required: true, default: 0 })
  carAllowance: number;

  @Prop({ required: true, default: 0 })
  travelAllowance: number;

  @Prop({ required: true, default: 1.0 })
  overtimeRate: number;

  @Prop({ required: true, default: 0 })
  maxLoanAmount: number;

  // BANK DETAILS
  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  bankAccountNumber: string;

  @Prop({ required: true })
  bankBranch: string;

  @Prop()
  bankBranchCode?: string;

  @Prop()
  bankSwiftCode?: string;

  @Prop({ default: 'MWK' })
  currency: string;

  // TAX & COMPLIANCE
  @Prop()
  taxIdentificationNumber?: string;

  @Prop()
  pensionNumber?: string;

  @Prop()
  socialSecurityNumber?: string;

  // SYSTEM ACCESS
  @Prop({ default: false })
  hasSystemAccess: boolean;

  @Prop()
  systemUsername?: string;

  @Prop({
    type: String,
    enum: SystemRole,
    default: SystemRole.EMPLOYEE
  })
  systemRole: SystemRole;

  @Prop({ default: false })
  profileVerified: boolean;

  @Prop()
  profileVerifiedBy?: string;

  @Prop()
  profileVerifiedAt?: Date;

  @Prop()
  profilePhoto?: string;

  // REGISTRATION STATUS FIELDS
  @Prop({ 
    type: String,
    enum: ['PENDING', 'REGISTERED', 'SYSTEM_ACCESS_ACTIVE', 'COMPLETED'],
    default: 'PENDING'
  })
  registrationStatus: string;

  @Prop()
  systemAccessActivatedAt?: Date;

  @Prop()
  systemAccessActivatedBy?: string;

  @Prop({ default: false })
  welcomeEmailSent: boolean;

  @Prop({ default: false })
  credentialsEmailSent: boolean;

  // PERSONAL DETAILS
  @Prop()
  maritalStatus?: string;

  @Prop()
  numberOfDependents?: number;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop()
  postalCode?: string;

  // WORKFLOW SPECIFIC FIELDS
  @Prop({ 
    type: String,
    enum: ['M11', 'M13', 'M15', 'M17', 'CEO'],
    default: 'M11'
  })
  maxApprovalLevel: string;

  @Prop({ default: true })
  requiresManagerApproval: boolean;

  @Prop({ default: false })
  requiresDirectorApproval: boolean;

  // DELEGATION FIELDS
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  delegatedApprovalTo?: Types.ObjectId;

  @Prop()
  delegationStartDate?: Date;

  @Prop()
  delegationEndDate?: Date;

  @Prop({ default: false })
  hasDelegatedApproval: boolean;

  // WORKFLOW PERFORMANCE METRICS
  @Prop({ default: 0 })
  pendingApprovalsCount: number;

  @Prop({ default: 0 })
  completedApprovalsCount: number;

  @Prop()
  averageApprovalTime?: number;

  @Prop({ default: 100 })
  approvalRate: number;

  @Prop({
    type: String,
    enum: ['AVAILABLE', 'UNAVAILABLE', 'DELEGATED', 'ON_LEAVE'],
    default: 'AVAILABLE'
  })
  approvalAvailability: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// INDEXES FOR PERFORMANCE
EmployeeSchema.index({ departmentId: 1 });
EmployeeSchema.index({ positionId: 1 });
EmployeeSchema.index({ gradeId: 1 });
EmployeeSchema.index({ reportsToEmployeeId: 1 });
EmployeeSchema.index({ employmentStatus: 1 });
EmployeeSchema.index({ hasSystemAccess: 1 });
EmployeeSchema.index({ systemRole: 1 });
EmployeeSchema.index({ isDepartmentManager: 1 });
EmployeeSchema.index({ isSupervisor: 1 });

// Compound indexes for common queries
EmployeeSchema.index({ departmentId: 1, gradeBand: 1 });
EmployeeSchema.index({ gradeCode: 1, employmentStatus: 1 });
EmployeeSchema.index({ reportsToEmployeeId: 1, isSupervisor: 1 });

// Enhanced indexes for workflow performance
EmployeeSchema.index({ gradeCode: 1, approvalAvailability: 1 });
EmployeeSchema.index({ hasDelegatedApproval: 1, delegationEndDate: 1 });
EmployeeSchema.index({ isDepartmentManager: 1, departmentId: 1 });
EmployeeSchema.index({ approvalAvailability: 1, pendingApprovalsCount: 1 });

// VIRTUAL FIELDS
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
});

// Virtual for supervisor info
EmployeeSchema.virtual('supervisor', {
  ref: 'Employee',
  localField: 'reportsToEmployeeId',
  foreignField: '_id',
  justOne: true
});

// Virtual for department info
EmployeeSchema.virtual('department', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for position info
EmployeeSchema.virtual('position', {
  ref: 'Position',
  localField: 'positionId',
  foreignField: '_id',
  justOne: true
});

// Virtual for grade info
EmployeeSchema.virtual('grade', {
  ref: 'Grade',
  localField: 'gradeId',
  foreignField: '_id',
  justOne: true
});

// Virtual for workflow approval eligibility
EmployeeSchema.virtual('canApproveWorkflows').get(function() {
  return this.isSupervisor || this.isDepartmentManager;
});

// Virtual for active delegations
EmployeeSchema.virtual('activeDelegations', {
  ref: 'Employee',
  localField: 'delegatedApprovalTo',
  foreignField: '_id',
  justOne: true,
  match: { 
    delegationEndDate: { $gte: new Date() },
    hasDelegatedApproval: true
  }
});

// Virtual for direct reports count
EmployeeSchema.virtual('directReportsCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'reportsToEmployeeId',
  count: true
});

// Ensure virtual fields are serialized
EmployeeSchema.set('toJSON', { virtuals: true });
EmployeeSchema.set('toObject', { virtuals: true });

// POST-SAVE HOOK TO UPDATE REPORTING CHAIN - KEEP BUT UPDATE
EmployeeSchema.post('save', async function(employeeDoc) {
  try {
    const employee = employeeDoc as unknown as EmployeeDocument;
    
    // If this employee has direct reports, update their reporting information
    const EmployeeModel = employee.model('Employee');
    const directReports = await EmployeeModel.find({ 
      reportsToEmployeeId: employee._id 
    });

    for (const report of directReports) {
      const reportDoc = report as unknown as EmployeeDocument;
      
      // Get the supervisor's employee number (this still exists in schema)
      const supervisorEmployeeNumber = employee.employeeNumber;
      
      // Update the direct report's supervisor info
      await EmployeeModel.findByIdAndUpdate(reportDoc._id, {
        reportsToEmployeeNumber: supervisorEmployeeNumber
      });
    }
  } catch (error) {
    console.error('Error updating direct reports:', error);
  }
});

// STATIC METHODS
EmployeeSchema.statics.findSupervisors = function() {
  return this.find({ isSupervisor: true }).exec();
}

EmployeeSchema.statics.findDepartmentManagers = function() {
  return this.find({ isDepartmentManager: true }).exec();
};

EmployeeSchema.statics.findAvailableApprovers = function() {
  return this.find({ 
    approvalAvailability: 'AVAILABLE',
    $or: [
      { isSupervisor: true },
      { isDepartmentManager: true }
    ]
  }).exec();
};

// INSTANCE METHODS
EmployeeSchema.methods.getReportingChain = async function(): Promise<any[]> {
  const chain: any[] = [];
  let currentEmployee: any = this;
  
  while (currentEmployee.reportsToEmployeeId) {
    const EmployeeModel = this.model('Employee');
    currentEmployee = await EmployeeModel.findById(currentEmployee.reportsToEmployeeId)
      .populate('gradeId')
      .exec();
    
    if (!currentEmployee) break;
    
    chain.push({
      _id: currentEmployee._id,
      employeeNumber: currentEmployee.employeeNumber,
      fullName: currentEmployee.fullName,
      gradeCode: currentEmployee.gradeCode,
      position: currentEmployee.positionId,
      department: currentEmployee.departmentId
    });
  }
  
  return chain;
};

EmployeeSchema.methods.getDirectReports = async function(): Promise<any[]> {
  const EmployeeModel = this.model('Employee');
  return await EmployeeModel.find({ 
    reportsToEmployeeId: this._id 
  })
  .populate('gradeId')
  .populate('positionId')
  .exec();
};

EmployeeSchema.methods.canApproveRequest = function(requestType: string, amount?: number): boolean {
  // Check basic approval eligibility
  if (!this.canApproveWorkflows) return false;
  
  // Check availability
  if (this.approvalAvailability !== 'AVAILABLE') return false;
  
  // Check delegation status
  if (this.hasDelegatedApproval && this.delegationEndDate && this.delegationEndDate > new Date()) {
    return false; // Approval is delegated to someone else
  }
  
  // Type-specific approval logic
  switch (requestType) {
    case 'LOAN_APPLICATION':
      return amount ? amount <= this.maxLoanAmount : true;
    case 'TRAVEL_REQUEST':
      return true;  // M8 and above can approve travel
    case 'LEAVE_REQUEST':
      return this.isSupervisor;
    default:
      return true;
  }
};