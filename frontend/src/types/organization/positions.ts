export interface Position {
  _id: string;
  positionTitle: string;
  positionCode: string;
  departmentId: string;
  gradeId: string;
  reportsToPositionId?: string;
  jobDescription?: string;
  responsibilities: string[];
  isHeadOfDepartment: boolean;
  isSupervisorRole: boolean;
  isManagerRole: boolean;
  isDirectorRole: boolean;
  numberOfPositions: number;
  currentlyFilled: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  department?: {
    _id: string;
    departmentName: string;
    departmentCode: string;
  };
  grade?: {
    _id: string;
    code: string;
    name: string;
  };
  reportsToPosition?: {
    _id: string;
    positionTitle: string;
    positionCode: string;
  };
  availablePositions: number;
  salaryRange?: string;
}