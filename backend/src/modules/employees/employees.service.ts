import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import {
  EmploymentStatus,
  ContractType,
  SystemRole,
  UserRole,
} from '../../common/enums';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { PositionsService } from '../organization/positions/positions.service';
import { GradesService } from '../organization/grades/services/grades.service';
import { DepartmentsService } from '../organization/departments/departments.service';
import { EmployeeNumberService } from './employee-number.service';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { EmailService } from '../../common/services/email.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { AuthService } from '../auth/services/auth.service';
import { ActivateSystemAccessDto } from './dto/activate-system-access.dto';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    private positionsService: PositionsService,
    private gradesService: GradesService,
    private departmentsService: DepartmentsService,
    private employeeNumberService: EmployeeNumberService,
    private emailService: EmailService,
    private authService: AuthService,
  ) {}

  /**
   * Convert string role to SystemRole enum
   */
  private convertToSystemRole(role: string): SystemRole {
    // Convert string to SystemRole enum
    const systemRoleKey = Object.keys(SystemRole).find(
      (key) =>
        SystemRole[key as keyof typeof SystemRole].toLowerCase() ===
        role.toLowerCase(),
    );

    if (systemRoleKey) {
      return SystemRole[systemRoleKey as keyof typeof SystemRole];
    }

    // Default to EMPLOYEE if not found
    return SystemRole.EMPLOYEE;
  }

  /**
   * Convert string role to UserRole enum
   */
  private convertToUserRole(role: string): UserRole {
    // Convert string to UserRole enum
    const userRoleKey = Object.keys(UserRole).find(
      (key) =>
        UserRole[key as keyof typeof UserRole].toLowerCase() ===
        role.toLowerCase(),
    );

    if (userRoleKey) {
      return UserRole[userRoleKey as keyof typeof UserRole];
    }

    // Default to EMPLOYEE if not found
    return UserRole.EMPLOYEE;
  }

  /**
   * HR Administrator: Register new employee with auto-generated employee number
   */
  async registerEmployee(
    createEmployeeDto: CreateEmployeeDto,
    hrAdminId: string,
  ): Promise<EmployeeResponseDto> {
    // Auto-generate employee number
    const employeeNumber =
      await this.employeeNumberService.generateEmployeeNumber(
        createEmployeeDto.departmentId.toString(),
      );

    // Convert string IDs to ObjectId for service calls
    const positionId = new Types.ObjectId(
      createEmployeeDto.positionId.toString(),
    );
    const departmentId = new Types.ObjectId(
      createEmployeeDto.departmentId.toString(),
    );
    const gradeId = new Types.ObjectId(createEmployeeDto.gradeId.toString());

    // Validate position exists and has availability
    const position = await this.positionsService.findOne(
      createEmployeeDto.positionId.toString(),
    );

    if (position.currentlyFilled >= position.numberOfPositions) {
      throw new ConflictException('Position is fully filled');
    }

    // Validate department exists
    const department = await this.departmentsService.findOne(
      createEmployeeDto.departmentId.toString(),
    );

    // Validate grade exists
    const grade = await this.gradesService.findOne(
      createEmployeeDto.gradeId.toString(),
    );

    // Validate reporting employee exists if provided
    if (createEmployeeDto.reportsToEmployeeId) {
      const reportingEmployee = await this.employeeModel.findById(
        createEmployeeDto.reportsToEmployeeId,
      );
      if (!reportingEmployee) {
        throw new NotFoundException('Reporting employee not found');
      }
    }

    // Check for duplicate email or national ID
    await this.checkDuplicateEmployee(
      createEmployeeDto.email,
      createEmployeeDto.nationalId,
    );

    // Validate salary against grade range if provided
    if (createEmployeeDto.currentBasicSalary) {
      const isValidSalary = await this.gradesService.validateSalaryInRange(
        createEmployeeDto.gradeId.toString(),
        createEmployeeDto.currentBasicSalary,
      );
      if (!isValidSalary) {
        const salaryRange = await this.gradesService.getGradeSalaryRange(
          createEmployeeDto.gradeId.toString(),
        );
        throw new BadRequestException(
          `Basic salary must be between ${salaryRange.min} and ${salaryRange.max} for grade ${salaryRange.code}`,
        );
      }
    } else {
      // Use grade midpoint as default salary
      const midpoint = await this.gradesService.getGradeMidpointSalary(
        createEmployeeDto.gradeId.toString(),
      );
      createEmployeeDto.currentBasicSalary = midpoint;
    }

    // AUTOMATICALLY SET SUPERVISOR FLAGS BASON ON POSITION/GRADE
    let isSupervisor = createEmployeeDto.isSupervisor || false;
    let isDepartmentManager = createEmployeeDto.isDepartmentManager || false;
    let systemRole = createEmployeeDto.systemRole || 'employee';

    // Auto-detect supervisor/manager based on position title
    if (position.positionTitle) {
      const title = position.positionTitle.toLowerCase();
      if (title.includes('manager') || title.includes('head') || title.includes('director') || title.includes('chief')) {
        isDepartmentManager = true;
        isSupervisor = true;
        if (!createEmployeeDto.systemRole) {
          systemRole = title.includes('department') ? 'department_head' : 
                      title.includes('hr') ? 'hr_manager' :
                      title.includes('finance') ? 'finance_manager' : 'manager';
        }
      } else if (title.includes('supervisor') || title.includes('team lead') || title.includes('senior')) {
        isSupervisor = true;
        if (!createEmployeeDto.systemRole) {
          systemRole = 'supervisor';
        }
      }
    }

    // Auto-detect based on grade level (M8 and above are typically supervisors/managers)
    if (grade.level >= 6) { // M8 = level 6, M9 = level 7, etc.
      isSupervisor = true;
      if (grade.level >= 10) { // M13 = level 10 and above are department managers
        isDepartmentManager = true;
      }
    }

    // Create employee data with auto-generated employee number
    const employeeData = {
      ...createEmployeeDto,
      employeeNumber,
      isSupervisor,
      isDepartmentManager,
      systemRole,
      createdBy: hrAdminId,
      employmentStatus: EmploymentStatus.ACTIVE,
      hasSystemAccess: false,
      registrationStatus: 'REGISTERED',
    };

    const employee = new this.employeeModel(employeeData);
    const savedEmployee = await employee.save();

    // Increment position filled count
    await this.positionsService.incrementFilledCount(positionId);

    // Build reporting hierarchy
    await this.buildEmployeeReportingChain(savedEmployee._id as Types.ObjectId);

    // Send welcome email
    await this.sendWelcomeEmail(
      savedEmployee,
      department.departmentName,
      position.positionTitle,
    );

    // Log supervisor/manager assignment
    this.logger.log(`Created employee ${savedEmployee.employeeNumber}: ${savedEmployee.firstName} ${savedEmployee.lastName}`);
    if (isSupervisor) {
      this.logger.log(`Auto-assigned as supervisor (position: ${position.positionTitle}, grade: ${grade.code})`);
    }
    if (isDepartmentManager) {
      this.logger.log(` Auto-assigned as department manager`);
    }

    return this.mapToResponseDto(savedEmployee);
  }

  /**
   * HR Administrator: Activate system access for employee
   */
  async activateSystemAccess(
    employeeId: string,
    activateSystemAccessDto: ActivateSystemAccessDto,
    hrAdminId: string,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.employeeModel.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.hasSystemAccess) {
      throw new ConflictException('Employee already has system access');
    }

    // Check if username is unique
    const existingUser = await this.employeeModel.findOne({
      systemUsername: activateSystemAccessDto.systemUsername,
      _id: { $ne: employeeId },
    });

    if (existingUser) {
      throw new ConflictException('System username already exists');
    }

    // Generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();

    // Update employee with system access
    employee.hasSystemAccess = true;
    employee.systemUsername = activateSystemAccessDto.systemUsername;
    employee.systemRole = activateSystemAccessDto.systemRole;
    employee.registrationStatus = 'SYSTEM_ACCESS_ACTIVE';
    employee.systemAccessActivatedAt = new Date();
    employee.systemAccessActivatedBy = hrAdminId;
    employee.updatedBy = hrAdminId;

    const updatedEmployee = await employee.save();

    // Create user account in auth system
    await this.createUserAccountForEmployee(
      updatedEmployee,
      activateSystemAccessDto,
      temporaryPassword,
      hrAdminId,
    );

    // Send system credentials email
    await this.sendSystemCredentialsEmail(
      updatedEmployee,
      activateSystemAccessDto.systemUsername,
      temporaryPassword,
    );

    return this.mapToResponseDto(updatedEmployee);
  }

  /**
   * Employee: Verify their profile (self-service)
   */
  async verifyEmployeeProfile(
    employeeId: string,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.employeeModel.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.profileVerified) {
      throw new ConflictException('Profile already verified');
    }

    if (!employee.hasSystemAccess) {
      throw new ForbiddenException(
        'System access must be activated before profile verification',
      );
    }

    // Use type assertion for registrationStatus
    const employeeDoc = employee as EmployeeDocument & {
      registrationStatus: string;
    };

    employeeDoc.profileVerified = true;
    employeeDoc.profileVerifiedAt = new Date();
    employeeDoc.profileVerifiedBy = employeeId;
    employeeDoc.registrationStatus = 'COMPLETED';

    const updatedEmployee = await employeeDoc.save();
    return this.mapToResponseDto(updatedEmployee);
  }

  /**
   * Create user account for employee after system access activation
   */
  private async createUserAccountForEmployee(
    employee: EmployeeDocument,
    activateSystemAccessDto: ActivateSystemAccessDto,
    temporaryPassword: string,
    hrAdminId: string,
  ): Promise<void> {
    try {
      const createUserDto: CreateUserDto = {
        username: activateSystemAccessDto.systemUsername,
        email: employee.email,
        password: temporaryPassword,
        employeeId: employee.id.toString(),
        role: activateSystemAccessDto.systemRole as any, // Type assertion
        loginMethod: 'both' as any,
        mustChangePassword: true,
      };

      this.logger.log(
        `Creating user account for employee: ${employee.employeeNumber}`,
      );

      // Call authService to create user
      await this.authService.createUser(createUserDto, hrAdminId);

      this.logger.log(
        `User account created for employee: ${employee.employeeNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create user account for employee ${employee.employeeNumber}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to create user account');
    }
  }

  // In employees.service.ts - Update sendWelcomeEmail method
  private async sendWelcomeEmail(
    employee: EmployeeDocument,
    departmentName: string,
    positionTitle: string,
  ): Promise<void> {
    try {
      await this.emailService.sendEmployeeWelcome(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        employee.employeeNumber,
        positionTitle,
        departmentName,
        employee.employmentDate.toDateString(),
      );

      // FIX: Use {new: true} to get updated document
      await this.employeeModel.findByIdAndUpdate(
        employee._id,
        {
          welcomeEmailSent: true,
        },
        { new: true },
      );

      this.logger.log(`Welcome email sent to: ${employee.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${employee.email}:`,
        error,
      );
    }
  }

  // Also update sendSystemCredentialsEmail method
  private async sendSystemCredentialsEmail(
    employee: EmployeeDocument,
    username: string,
    temporaryPassword: string,
  ): Promise<void> {
    try {
      await this.emailService.sendEmployeeCredentials(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        username,
        temporaryPassword,
        process.env.APP_URL || 'https://your-hr-system.com',
      );

      // FIX: Use {new: true} to get updated document
      await this.employeeModel.findByIdAndUpdate(
        employee._id,
        {
          credentialsEmailSent: true,
        },
        { new: true },
      );

      this.logger.log(`System credentials email sent to: ${employee.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send credentials email to ${employee.email}:`,
        error,
      );
    }
  }

  /**
   * Generate temporary password
   */
  private generateTemporaryPassword(): string {
    const length = 12;

    // Separate character sets for each requirement
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*';

    // Combined charset for remaining characters
    const allChars = lowercase + uppercase + numbers + specialChars;

    let password = '';

    // Ensure at least one of each required character type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(
      Math.floor(Math.random() * specialChars.length),
    );

    // Fill the rest with random characters from all sets
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to randomize character positions
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return password;
  }

  /**
   * Manager: Request employee registration (creates draft without system access)
   */
  async requestEmployeeRegistration(
    createEmployeeDto: CreateEmployeeDto,
    managerId: string,
  ): Promise<EmployeeResponseDto> {
    // Remove system access fields for manager requests
    const { createSystemAccess, systemUsername, systemRole, ...employeeData } =
      createEmployeeDto;

    const registrationData: CreateEmployeeDto = {
      ...employeeData,
      createdBy: managerId,
    } as CreateEmployeeDto;

    return this.registerEmployee(registrationData, managerId);
  }

  /**
   * HR Administrator: Approve manager's registration request and create system access
   */
  async approveEmployeeRegistration(
    employeeId: string,
    systemAccessData: { systemUsername: string; systemRole: string },
    hrAdminId: string,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.employeeModel.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.hasSystemAccess) {
      throw new ConflictException('Employee already has system access');
    }

    // Check if username is unique
    const existingUser = await this.employeeModel.findOne({
      systemUsername: systemAccessData.systemUsername,
      _id: { $ne: employeeId },
    });

    if (existingUser) {
      throw new ConflictException('System username already exists');
    }

    // Convert systemRole string to SystemRole enum
    const systemRole = this.convertToSystemRole(systemAccessData.systemRole);

    employee.hasSystemAccess = true;
    employee.systemUsername = systemAccessData.systemUsername;
    employee.systemRole = systemRole;
    employee.updatedBy = hrAdminId;

    const updated = await employee.save();

    // TODO: Trigger system account creation (email with credentials)
    await this.sendSystemAccessCredentials(updated);

    return this.mapToResponseDto(updated);
  }

  /**
   * Find all employees with pagination and filters
   */
  async findAll(
    query: QueryEmployeeDto,
    requestorRole?: string,
  ): Promise<PaginationResponseDto<EmployeeResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      departmentId,
      positionId,
      employmentStatus,
      contractType,
      hasSystemAccess,
    } = query;

    const filter: any = {};

    // Apply filters
    if (search) {
      filter.$or = [
        { employeeNumber: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nationalId: { $regex: search, $options: 'i' } },
      ];
    }

    if (departmentId) {
      filter.departmentId = new Types.ObjectId(departmentId);
    }

    if (positionId) {
      filter.positionId = new Types.ObjectId(positionId);
    }

    if (employmentStatus) {
      filter.employmentStatus = employmentStatus;
    }

    if (contractType) {
      filter.contractType = contractType;
    }

    if (hasSystemAccess !== undefined) {
      filter.hasSystemAccess = hasSystemAccess;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      this.employeeModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('departmentId', 'departmentName departmentCode')
        .populate('positionId', 'positionTitle positionCode')
        .populate('gradeId', 'code name compensation limits')
        .populate('reportsToEmployeeId', 'firstName lastName employeeNumber')
        .exec(),
      this.employeeModel.countDocuments(filter),
    ]);

    const enhancedEmployees = await Promise.all(
      employees.map(async (employee) => {
        const response = this.mapToResponseDto(employee);

        // Add direct reports for managers
        if (requestorRole === 'manager' || requestorRole === 'hr_admin') {
          response.directReports = await this.getDirectReports(
            employee._id as Types.ObjectId,
          );
        }

        return response;
      }),
    );

    return {
      data: enhancedEmployees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Find one employee by ID with access control
   */
  async findOne(
    id: string,
    requestorEmployeeId?: string,
    requestorRole?: string,
  ): Promise<EmployeeResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const employee = await this.employeeModel
      .findById(id)
      .populate('departmentId', 'departmentName departmentCode')
      .populate('positionId', 'positionTitle positionCode')
      .populate('gradeId', 'code name compensation limits')
      .populate(
        'reportsToEmployeeId',
        'firstName lastName employeeNumber positionTitle',
      )
      .exec();

    if (!employee) {
      throw new NotFoundException(`Employee with ID '${id}' not found`);
    }

    // Access control: Employees can only view their own profile or basic colleague info
    if (requestorRole === 'employee' && requestorEmployeeId !== id) {
      // Return limited information for other employees
      return this.mapToLimitedResponseDto(employee);
    }

    const response = this.mapToResponseDto(employee);

    // Add direct reports for managers and HR
    if (requestorRole === 'manager' || requestorRole === 'hr_admin') {
      response.directReports = await this.getDirectReports(
        employee._id as Types.ObjectId,
      );
    }

    return response;
  }

  /**
   * Update employee information
   */
  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    updatedBy: string,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.employeeModel.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate salary against grade range if provided
    if (updateEmployeeDto.currentBasicSalary) {
      // Use the updated gradeId if provided, otherwise use the existing one
      const gradeId = updateEmployeeDto.gradeId
        ? updateEmployeeDto.gradeId.toString()
        : employee.gradeId.toString();

      const isValidSalary = await this.gradesService.validateSalaryInRange(
        gradeId,
        updateEmployeeDto.currentBasicSalary,
      );
      if (!isValidSalary) {
        const salaryRange =
          await this.gradesService.getGradeSalaryRange(gradeId);
        throw new BadRequestException(
          `Basic salary must be between ${salaryRange.min} and ${salaryRange.max} for grade ${salaryRange.code}`,
        );
      }
    }

    // If grade is updated but salary isn't, update salary to new grade midpoint
    if (updateEmployeeDto.gradeId && !updateEmployeeDto.currentBasicSalary) {
      updateEmployeeDto.currentBasicSalary =
        await this.gradesService.getGradeMidpointSalary(
          updateEmployeeDto.gradeId.toString(),
        );
    }

    // AUTO-ADJUST SUPERVISOR/MANAGER FLAGS IF GRADE OR POSITION CHANGES
    const updateData: any = { ...updateEmployeeDto };

    // Check if grade or position is being updated
    if (updateEmployeeDto.gradeId || updateEmployeeDto.positionId) {
      // Get updated grade and position
      const updatedGrade = updateEmployeeDto.gradeId 
        ? await this.gradesService.findOne(updateEmployeeDto.gradeId.toString())
        : await this.gradesService.findOne(employee.gradeId.toString());
      
      const updatedPosition = updateEmployeeDto.positionId
        ? await this.positionsService.findOne(updateEmployeeDto.positionId.toString())
        : await this.positionsService.findOne(employee.positionId.toString());

      // Auto-adjust flags
      let isSupervisor = updateEmployeeDto.isSupervisor ?? employee.isSupervisor;
      let isDepartmentManager = updateEmployeeDto.isDepartmentManager ?? employee.isDepartmentManager;

      // Check based on position title
      if (updatedPosition.positionTitle) {
        const title = updatedPosition.positionTitle.toLowerCase();
        if (title.includes('manager') || title.includes('head') || title.includes('director') || title.includes('chief')) {
          isDepartmentManager = true;
          isSupervisor = true;
        } else if (title.includes('supervisor') || title.includes('team lead') || title.includes('senior')) {
          isSupervisor = true;
          isDepartmentManager = false;
        }
      }

      // Check based on grade level
      if (updatedGrade.level >= 6) { // M8 and above
        isSupervisor = true;
        if (updatedGrade.level >= 10) { // M13 and above
          isDepartmentManager = true;
        }
      }

      updateData.isSupervisor = isSupervisor;
      updateData.isDepartmentManager = isDepartmentManager;

      // Log changes
      if (isSupervisor !== employee.isSupervisor) {
        this.logger.log(`Updated employee ${employee.employeeNumber}: Supervisor status changed from ${employee.isSupervisor} to ${isSupervisor}`);
      }
      if (isDepartmentManager !== employee.isDepartmentManager) {
        this.logger.log(`Updated employee ${employee.employeeNumber}: Department manager status changed from ${employee.isDepartmentManager} to ${isDepartmentManager}`);
      }
    }

    const updated = await this.employeeModel
      .findByIdAndUpdate(
        id,
        {
          ...updateData,
          updatedBy,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .populate('departmentId', 'departmentName departmentCode')
      .populate('positionId', 'positionTitle positionCode')
      .populate('gradeId', 'code name compensation limits')
      .populate('reportsToEmployeeId', 'firstName lastName employeeNumber');

    // Handle the case where updated might be null
    if (!updated) {
      throw new NotFoundException('Employee not found after update');
    }

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete employee (soft delete)
   */
  async remove(id: string, deletedBy: string): Promise<void> {
    const employee = await this.employeeModel.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Soft delete by updating employment status
    await this.employeeModel.findByIdAndUpdate(id, {
      employmentStatus: EmploymentStatus.TERMINATED,
      terminationDate: new Date(),
      updatedBy: deletedBy,
    });
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private generateUsername(createEmployeeDto: CreateEmployeeDto): string {
    return `${createEmployeeDto.firstName.toLowerCase()}.${createEmployeeDto.lastName.toLowerCase()}`;
  }

  private async checkDuplicateEmployee(
    email: string,
    nationalId: string,
  ): Promise<void> {
    const existingEmployee = await this.employeeModel.findOne({
      $or: [{ email }, { nationalId }],
    });

    if (existingEmployee) {
      if (existingEmployee.email === email) {
        throw new ConflictException('Employee with this email already exists');
      }
      if (existingEmployee.nationalId === nationalId) {
        throw new ConflictException(
          'Employee with this national ID already exists',
        );
      }
    }
  }

  private async getDirectReports(
    employeeId: Types.ObjectId,
  ): Promise<EmployeeResponseDto[]> {
    const directReports = await this.employeeModel
      .find({
        reportsToEmployeeId: employeeId,
        employmentStatus: EmploymentStatus.ACTIVE,
      })
      .populate('positionId', 'positionTitle positionCode')
      .exec();

    return directReports.map((emp) => this.mapToResponseDto(emp));
  }

  private async buildEmployeeReportingChain(
    employeeId: Types.ObjectId,
  ): Promise<void> {
    // This will be implemented in the hierarchy module
    console.log(`Building reporting chain for employee: ${employeeId}`);
  }

  private async sendSystemAccessCredentials(
    employee: EmployeeDocument,
  ): Promise<void> {
    // TODO: Implement email service to send system access credentials
    console.log(`Sending system access credentials to: ${employee.email}`);
  }

  private mapToResponseDto(employee: EmployeeDocument): EmployeeResponseDto {
    const dto = new EmployeeResponseDto();

    // Safe conversion of _id
    dto._id = employee._id as Types.ObjectId;
    dto.employeeNumber = employee.employeeNumber;
    dto.firstName = employee.firstName;
    dto.middleName = employee.middleName;
    dto.lastName = employee.lastName;
    dto.dateOfBirth = employee.dateOfBirth;
    dto.gender = employee.gender;
    dto.nationalId = employee.nationalId;
    dto.email = employee.email;
    dto.phoneNumber = employee.phoneNumber;
    dto.personalEmail = employee.personalEmail;
    dto.emergencyContactName = employee.emergencyContactName;
    dto.emergencyContactPhone = employee.emergencyContactPhone;

    // Safe ID conversion
    dto.departmentId = employee.departmentId as Types.ObjectId;
    dto.positionId = employee.positionId as Types.ObjectId;
    dto.gradeId = employee.gradeId as Types.ObjectId;
    dto.reportsToEmployeeId = employee.reportsToEmployeeId as
      | Types.ObjectId
      | undefined;

    dto.employmentDate = employee.employmentDate;
    dto.contractType = employee.contractType as ContractType;
    dto.employmentStatus = employee.employmentStatus as EmploymentStatus;
    dto.bankName = employee.bankName;
    dto.bankAccountNumber = employee.bankAccountNumber;
    dto.bankBranch = employee.bankBranch;
    dto.taxIdentificationNumber = employee.taxIdentificationNumber;
    dto.pensionNumber = employee.pensionNumber;
    dto.currentBasicSalary = employee.currentBasicSalary;
    dto.hasSystemAccess = employee.hasSystemAccess;
    dto.systemUsername = employee.systemUsername;
    dto.systemRole = employee.systemRole;
    dto.profileVerified = employee.profileVerified;
    dto.profileVerifiedBy = employee.profileVerifiedBy;
    dto.profileVerifiedAt = employee.profileVerifiedAt;
    dto.profilePhoto = employee.profilePhoto;

    // Safe handling of dates with fallbacks
    dto.createdAt = employee.createdAt || new Date();
    dto.updatedAt = employee.updatedAt || new Date();

    dto.createdBy = employee.createdBy;
    dto.updatedBy = employee.updatedBy;

    // Populated fields - check if they're actually populated objects
    if (
      employee.departmentId &&
      typeof employee.departmentId === 'object' &&
      'departmentName' in employee.departmentId
    ) {
      dto.department = employee.departmentId as any;
    }
    if (
      employee.positionId &&
      typeof employee.positionId === 'object' &&
      'positionTitle' in employee.positionId
    ) {
      dto.position = employee.positionId as any;
    }
    if (
      employee.gradeId &&
      typeof employee.gradeId === 'object' &&
      'name' in employee.gradeId
    ) {
      dto.grade = employee.gradeId as any;
    }
    if (
      employee.reportsToEmployeeId &&
      typeof employee.reportsToEmployeeId === 'object' &&
      'firstName' in employee.reportsToEmployeeId
    ) {
      dto.reportsTo = employee.reportsToEmployeeId as any;
    }

    dto.registrationStatus = employee.registrationStatus || 'PENDING';
    dto.systemAccessActivatedAt = employee.systemAccessActivatedAt;
    dto.systemAccessActivatedBy = employee.systemAccessActivatedBy;
    dto.welcomeEmailSent = employee.welcomeEmailSent || false;
    dto.credentialsEmailSent = employee.credentialsEmailSent || false;

    return dto;
  }

  private mapToLimitedResponseDto(
    employee: EmployeeDocument,
  ): EmployeeResponseDto {
    const dto = new EmployeeResponseDto();

    // Limited information for colleagues
    dto._id = employee._id as Types.ObjectId;
    dto.employeeNumber = employee.employeeNumber;
    dto.firstName = employee.firstName;
    dto.middleName = employee.middleName;
    dto.lastName = employee.lastName;
    dto.departmentId = employee.departmentId as Types.ObjectId;
    dto.positionId = employee.positionId as Types.ObjectId;
    dto.employmentStatus = employee.employmentStatus as EmploymentStatus;

    // Safe date handling
    dto.createdAt = employee.createdAt || new Date();
    dto.updatedAt = employee.updatedAt || new Date();

    // Basic populated info only with type-safe checks
    if (
      employee.departmentId &&
      typeof employee.departmentId === 'object' &&
      'departmentName' in employee.departmentId
    ) {
      dto.department = {
        departmentName: (employee.departmentId as any).departmentName,
      };
    }
    if (
      employee.positionId &&
      typeof employee.positionId === 'object' &&
      'positionTitle' in employee.positionId
    ) {
      dto.position = {
        positionTitle: (employee.positionId as any).positionTitle,
      };
    }

    return dto;
  }
}
