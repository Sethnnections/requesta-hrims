import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from '../modules/organization/departments/schemas/department.schema';
import { Position } from '../modules/organization/positions/schemas/position.schema';
import { Grade } from '../modules/organization/grades/schemas/grade.schema';

async function bootstrap() {
  console.log(' Seeding prerequisite data for ESCOM organizational structure...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const departmentModel = app.get<Model<Department>>('DepartmentModel');
    const positionModel = app.get<Model<Position>>('PositionModel');
    const gradeModel = app.get<Model<Grade>>('GradeModel');

    await seedGrades(gradeModel);
    await seedDepartments(departmentModel);
    await seedPositions(positionModel, departmentModel, gradeModel);
    
    console.log('  Prerequisite data seeding completed successfully!');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('  Error seeding prerequisites:', error);
    await app.close();
    process.exit(1);
  }
}

async function seedDepartments(departmentModel: Model<Department>) {
  const departments = [
    {
      departmentName: 'Technical & Field Operations Department',
      departmentCode: 'TECH',
      description: 'Handles physical infrastructure: power lines, substations, and field repairs',
    },
    {
      departmentName: 'Commercial & Customer Service Department', 
      departmentCode: 'COMM',
      description: 'Manages customer-facing operations: billing, connections, and revenue',
    },
    {
      departmentName: 'Finance Department',
      departmentCode: 'FIN', 
      description: 'Manages the company\'s financial health and accounting',
    },
    {
      departmentName: 'Information Technology Department',
      departmentCode: 'IT',
      description: 'Manages the company\'s digital infrastructure and software systems',
    },
    {
      departmentName: 'Human Resources & Administration Department',
      departmentCode: 'HR',
      description: 'Manages staff welfare, recruitment, training, and administrative services',
    },
    {
      departmentName: 'Procurement & Supply Chain Department',
      departmentCode: 'PROC',
      description: 'Manages purchasing, supplier relationships, and inventory',
    },
    {
      departmentName: 'Legal & Compliance Department',
      departmentCode: 'LEGAL',
      description: 'Ensures legal compliance and manages regulatory affairs',
    },
    {
      departmentName: 'Executive Management',
      departmentCode: 'EXEC',
      description: 'Provides overall strategic leadership for the entire company',
    }
  ];

  for (const dept of departments) {
    const existing = await departmentModel.findOne({ departmentCode: dept.departmentCode });
    if (!existing) {
      await departmentModel.create(dept);
      console.log(`  Created department: ${dept.departmentName}`);
    } else {
      console.log(`  Department already exists: ${dept.departmentName}`);
    }
  }
}

async function seedGrades(gradeModel: Model<Grade>) {
  const grades = [
    // JUNIOR BAND
    {
      name: 'M3 - Apprentice/Trainee',
      code: 'M3',
      level: 1,
      band: 'JUNIOR',
      description: 'Apprentice/Trainee Level',
      compensation: {
        basicSalary: { min: 450000, mid: 500000, max: 550000 },
        houseAllowance: 80000,
        carAllowance: 0,
        travelAllowance: 20000,
        overtimeRate: 2.0
      },
      limits: {
        maxLoanAmount: 200000,
        requiresManagerApproval: true,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'M11'
      },
      isActive: true,
    },
    {
      name: 'M4 - Junior Staff',
      code: 'M4',
      level: 2,
      band: 'JUNIOR',
      description: 'Junior Staff Level',
      compensation: {
        basicSalary: { min: 550000, mid: 600000, max: 650000 },
        houseAllowance: 100000,
        carAllowance: 0,
        travelAllowance: 30000,
        overtimeRate: 2.0
      },
      limits: {
        maxLoanAmount: 300000,
        requiresManagerApproval: true,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'M11'
      },
      isActive: true,
    },
    {
      name: 'M5 - Junior Technical/Admin',
      code: 'M5',
      level: 3,
      band: 'JUNIOR',
      description: 'Junior Technical/Administrative Staff',
      compensation: {
        basicSalary: { min: 650000, mid: 720000, max: 800000 },
        houseAllowance: 120000,
        carAllowance: 0,
        travelAllowance: 40000,
        overtimeRate: 2.0
      },
      limits: {
        maxLoanAmount: 400000,
        requiresManagerApproval: true,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'M11'
      },
      isActive: true,
    },

    // OPERATIONAL BAND
    {
      name: 'M6 - Operational Staff',
      code: 'M6',
      level: 4,
      band: 'OPERATIONAL',
      description: 'Operational Staff Level',
      compensation: {
        basicSalary: { min: 750000, mid: 850000, max: 950000 },
        houseAllowance: 150000,
        carAllowance: 0,
        travelAllowance: 50000,
        overtimeRate: 1.8
      },
      limits: {
        maxLoanAmount: 500000,
        requiresManagerApproval: true,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'M11'
      },
      isActive: true,
    },
    {
      name: 'M7 - Senior Operational',
      code: 'M7',
      level: 5,
      band: 'OPERATIONAL',
      description: 'Senior Operational Staff',
      compensation: {
        basicSalary: { min: 950000, mid: 1100000, max: 1250000 },
        houseAllowance: 200000,
        carAllowance: 0,
        travelAllowance: 60000,
        overtimeRate: 1.8
      },
      limits: {
        maxLoanAmount: 700000,
        requiresManagerApproval: true,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'M11'
      },
      isActive: true,
    },
    {
      name: 'M8 - Senior Technical/Admin',
      code: 'M8',
      level: 6,
      band: 'OPERATIONAL',
      description: 'Senior Technical/Administrative Staff',
      compensation: {
        basicSalary: { min: 1300000, mid: 1450000, max: 1600000 },
        houseAllowance: 300000,
        carAllowance: 150000,
        travelAllowance: 80000,
        overtimeRate: 1.8
      },
      limits: {
        maxLoanAmount: 1000000,
        requiresManagerApproval: true,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'M15'
      },
      isActive: true,
    },

    // SUPERVISORY BAND (P1-P3)
    {
      name: 'M9 - Supervisor (P1)',
      code: 'M9',
      level: 7,
      band: 'SUPERVISORY',
      description: 'Supervisory Staff Level 1',
      compensation: {
        basicSalary: { min: 1600000, mid: 1800000, max: 2000000 },
        houseAllowance: 400000,
        carAllowance: 200000,
        travelAllowance: 100000,
        overtimeRate: 1.5
      },
      limits: {
        maxLoanAmount: 1500000,
        requiresManagerApproval: true,
        requiresDirectorApproval: true,
        maxApprovalLevel: 'M17'
      },
      isActive: true,
    },
    {
      name: 'M10 - Professional (P2)',
      code: 'M10',
      level: 8,
      band: 'SUPERVISORY',
      description: 'Professional Staff Level 2',
      compensation: {
        basicSalary: { min: 2200000, mid: 2400000, max: 2600000 },
        houseAllowance: 500000,
        carAllowance: 300000,
        travelAllowance: 150000,
        overtimeRate: 1.5
      },
      limits: {
        maxLoanAmount: 2000000,
        requiresManagerApproval: true,
        requiresDirectorApproval: true,
        maxApprovalLevel: 'M17'
      },
      isActive: true,
    },
    {
      name: 'M11 - Senior Professional (P3)',
      code: 'M11',
      level: 9,
      band: 'SUPERVISORY',
      description: 'Senior Professional Staff Level 3',
      compensation: {
        basicSalary: { min: 2800000, mid: 3000000, max: 3300000 },
        houseAllowance: 600000,
        carAllowance: 400000,
        travelAllowance: 200000,
        overtimeRate: 1.5
      },
      limits: {
        maxLoanAmount: 3000000,
        requiresManagerApproval: true,
        requiresDirectorApproval: true,
        maxApprovalLevel: 'M17'
      },
      isActive: true,
    },

    // MANAGERIAL BAND
    {
      name: 'M13 - Manager',
      code: 'M13',
      level: 10,
      band: 'MANAGERIAL',
      description: 'Management Level',
      compensation: {
        basicSalary: { min: 3500000, mid: 3800000, max: 4200000 },
        houseAllowance: 800000,
        carAllowance: 600000,
        travelAllowance: 250000,
        overtimeRate: 1.3
      },
      limits: {
        maxLoanAmount: 4000000,
        requiresManagerApproval: true,
        requiresDirectorApproval: true,
        maxApprovalLevel: 'M17'
      },
      isActive: true,
    },
    {
      name: 'M15 - Senior Manager',
      code: 'M15',
      level: 11,
      band: 'MANAGERIAL',
      description: 'Senior Management Level',
      compensation: {
        basicSalary: { min: 4000000, mid: 4500000, max: 5000000 },
        houseAllowance: 1000000,
        carAllowance: 800000,
        travelAllowance: 300000,
        overtimeRate: 1.2
      },
      limits: {
        maxLoanAmount: 6000000,
        requiresManagerApproval: false,
        requiresDirectorApproval: true,
        maxApprovalLevel: 'M17'
      },
      isActive: true,
    },

    // EXECUTIVE BAND
    {
      name: 'M17 - Director',
      code: 'M17',
      level: 12,
      band: 'EXECUTIVE',
      description: 'Department Director Level',
      compensation: {
        basicSalary: { min: 5500000, mid: 6000000, max: 7000000 },
        houseAllowance: 1500000,
        carAllowance: 1200000,
        travelAllowance: 400000,
        overtimeRate: 1.0
      },
      limits: {
        maxLoanAmount: 8000000,
        requiresManagerApproval: false,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'CEO'
      },
      isActive: true,
    },
    {
      name: 'CEO - Chief Executive Officer',
      code: 'CEO',
      level: 13,
      band: 'EXECUTIVE',
      description: 'Chief Executive Officer',
      compensation: {
        basicSalary: { min: 8000000, mid: 9000000, max: 10000000 },
        houseAllowance: 2000000,
        carAllowance: 1500000,
        travelAllowance: 500000,
        overtimeRate: 1.0
      },
      limits: {
        maxLoanAmount: 10000000,
        requiresManagerApproval: false,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'CEO'
      },
      isActive: true,
    }
  ];

  for (const grade of grades) {
    const existing = await gradeModel.findOne({ code: grade.code });
    if (!existing) {
      await gradeModel.create(grade);
      console.log(`  Created grade: ${grade.name}`);
    } else {
      console.log(`  Grade already exists: ${grade.name}`);
    }
  }
}

async function seedPositions(
  positionModel: Model<Position>, 
  departmentModel: Model<Department>, 
  gradeModel: Model<Grade>
) {
  // Get all departments and grades first
  const departments = await departmentModel.find().lean();
  const grades = await gradeModel.find().lean();
  
  const departmentMap = new Map(departments.map(dept => [dept.departmentCode, dept._id]));
  const gradeMap = new Map(grades.map(grade => [grade.code, grade._id]));

  const positions = [
    // ==================== TECHNICAL DEPARTMENT POSITIONS ====================
    {
      positionTitle: 'Linesman Apprentice',
      positionCode: 'LINES_APP',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M3'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Linesman',
      positionCode: 'LINESMAN',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M5'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Senior Linesman / Cable Jointer',
      positionCode: 'SEN_LINES',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M6'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Substation Technician',
      positionCode: 'SUB_TECH',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M8'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Field Operations Supervisor',
      positionCode: 'FIELD_SUP',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M9'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Network Control Engineer',
      positionCode: 'NET_ENG',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M10'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Maintenance Engineer',
      positionCode: 'MAINT_ENG',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M11'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Principal Engineer (Grid Reliability)',
      positionCode: 'PRIN_ENG',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M13'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Chief Grid Engineer',
      positionCode: 'GRID_CHIEF',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M15'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Director of Technical Operations',
      positionCode: 'TECH_DIR',
      departmentId: departmentMap.get('TECH'),
      gradeId: gradeMap.get('M17'),
      isSupervisorRole: true,
      isManagerRole: true,
      isDirectorRole: true,
    },

    // ==================== COMMERCIAL DEPARTMENT POSITIONS ====================
    {
      positionTitle: 'Meter Reader',
      positionCode: 'METER_READER',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M4'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Billing Clerk',
      positionCode: 'BILL_CLERK',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M6'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Customer Service Representative',
      positionCode: 'CS_REP',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M7'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Revenue Protection Officer',
      positionCode: 'REV_PROTECT',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M8'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'New Connections Officer',
      positionCode: 'NEW_CONN',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M9'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Tariffs & Regulations Analyst',
      positionCode: 'TARIFF_ANAL',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M10'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Commercial Manager (Region)',
      positionCode: 'COMM_MGR_REG',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M11'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Senior Manager (Key Accounts)',
      positionCode: 'SEN_MGR_KEY',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M13'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Chief Commercial Officer',
      positionCode: 'CCO',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M15'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Director of Commercial Services',
      positionCode: 'COMM_DIR',
      departmentId: departmentMap.get('COMM'),
      gradeId: gradeMap.get('M17'),
      isSupervisorRole: true,
      isManagerRole: true,
      isDirectorRole: true,
    },

    // ==================== FINANCE DEPARTMENT POSITIONS ====================
    {
      positionTitle: 'Cashier',
      positionCode: 'CASHIER',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M4'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Accounts Payable Clerk',
      positionCode: 'AP_CLERK',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M6'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Accounts Receivable Clerk',
      positionCode: 'AR_CLERK',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M7'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Payroll Administrator',
      positionCode: 'PAYROLL_ADM',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M8'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Internal Auditor',
      positionCode: 'INT_AUDIT',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M9'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Financial Analyst',
      positionCode: 'FIN_ANAL',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M10'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Senior Accountant',
      positionCode: 'SEN_ACC',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M11'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Finance Manager',
      positionCode: 'FIN_MGR',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M13'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Chief Financial Officer',
      positionCode: 'CFO',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M15'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Director of Finance',
      positionCode: 'FIN_DIR',
      departmentId: departmentMap.get('FIN'),
      gradeId: gradeMap.get('M17'),
      isSupervisorRole: true,
      isManagerRole: true,
      isDirectorRole: true,
    },

    // ==================== IT DEPARTMENT POSITIONS ====================
    {
      positionTitle: 'IT Support Assistant',
      positionCode: 'IT_SUPPORT',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M5'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Help Desk Technician',
      positionCode: 'HELP_DESK',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M6'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Network Technician',
      positionCode: 'NET_TECH',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M7'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Database Administrator',
      positionCode: 'DB_ADMIN',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M8'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Systems Administrator',
      positionCode: 'SYS_ADMIN',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M9'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Business Analyst',
      positionCode: 'BUS_ANAL',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M10'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Systems Analyst / Programmer',
      positionCode: 'SYS_ANAL',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M11'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'IT Manager',
      positionCode: 'IT_MGR',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M13'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Chief Technology Officer',
      positionCode: 'CTO',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M15'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Director of IT Services',
      positionCode: 'IT_DIR',
      departmentId: departmentMap.get('IT'),
      gradeId: gradeMap.get('M17'),
      isSupervisorRole: true,
      isManagerRole: true,
      isDirectorRole: true,
    },

    // ==================== HR DEPARTMENT POSITIONS ====================
    {
      positionTitle: 'Office Assistant',
      positionCode: 'OFFICE_ASST',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M4'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Receptionist',
      positionCode: 'RECEPTIONIST',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M5'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'HR Assistant',
      positionCode: 'HR_ASST',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M6'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Recruitment Officer',
      positionCode: 'RECRUIT_OFF',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M7'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'Training & Development Officer',
      positionCode: 'TRAINING_OFF',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M8'),
      isSupervisorRole: false,
    },
    {
      positionTitle: 'HR Officer (Employee Relations)',
      positionCode: 'HR_OFF_ER',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M9'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Administration Manager',
      positionCode: 'ADMIN_MGR',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M10'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'HR Business Partner',
      positionCode: 'HR_BP',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M11'),
      isSupervisorRole: true,
    },
    {
      positionTitle: 'Senior HR Manager',
      positionCode: 'SEN_HR_MGR',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M13'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Chief Human Resources Officer',
      positionCode: 'CHRO',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M15'),
      isSupervisorRole: true,
      isManagerRole: true,
    },
    {
      positionTitle: 'Director of Human Resources',
      positionCode: 'HR_DIR',
      departmentId: departmentMap.get('HR'),
      gradeId: gradeMap.get('M17'),
      isSupervisorRole: true,
      isManagerRole: true,
      isDirectorRole: true,
    },

    // ==================== EXECUTIVE POSITIONS ====================
    {
      positionTitle: 'Chief Executive Officer',
      positionCode: 'CEO',
      departmentId: departmentMap.get('EXEC'),
      gradeId: gradeMap.get('CEO'),
      isSupervisorRole: true,
      isManagerRole: true,
      isDirectorRole: true,
    },
    {
      positionTitle: 'Chief Operations Officer',
      positionCode: 'COO',
      departmentId: departmentMap.get('EXEC'),
      gradeId: gradeMap.get('M17'),
      isSupervisorRole: true,
      isManagerRole: true,
      isDirectorRole: true,
    }
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const position of positions) {
    if (!position.departmentId || !position.gradeId) {
      console.warn(`   Skipping position ${position.positionCode} - missing department or grade reference`);
      skippedCount++;
      continue;
    }

    const existing = await positionModel.findOne({ positionCode: position.positionCode });
    if (!existing) {
      await positionModel.create(position);
      console.log(`  Created position: ${position.positionTitle}`);
      createdCount++;
    } else {
      console.log(`  Position already exists: ${position.positionTitle}`);
      skippedCount++;
    }
  }

  console.log(`  Positions Summary: ${createdCount} created, ${skippedCount} skipped/existing`);
}

bootstrap();