export interface Grade {
  _id: string;
  name: string;
  code: string;
  level: number;
  band: 'JUNIOR' | 'OPERATIONAL' | 'SUPERVISORY' | 'MANAGERIAL' | 'EXECUTIVE';
  description: string;
  compensation: {
    basicSalary: {
      min: number;
      mid: number;
      max: number;
    };
    houseAllowance: number;
    carAllowance: number;
    travelAllowance: number;
    overtimeRate: number;
  };
  limits?: {
    maxLoanAmount: number;
    requiresManagerApproval: boolean;
    requiresDirectorApproval: boolean;
    maxApprovalLevel: string;
  };
  isActive: boolean;
  nextGrade?: string;
  createdAt: string;
  updatedAt: string;
}