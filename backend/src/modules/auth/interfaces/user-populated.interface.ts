import { Document, Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export interface PopulatedEmployee {
  _id: Types.ObjectId;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: Types.ObjectId;
  positionId: Types.ObjectId;
  gradeId: Types.ObjectId;
  employmentStatus: string;
  // Add other employee fields you need
}

export type UserWithPopulatedEmployee = Omit<User, 'employeeId'> & {
  employeeId: PopulatedEmployee | Types.ObjectId;
}

export type UserDocumentWithPopulated = Document<unknown, {}, UserWithPopulatedEmployee> & 
  UserWithPopulatedEmployee & 
  Required<{ _id: Types.ObjectId }>;