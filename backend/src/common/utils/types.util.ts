// src/common/utils/types.util.ts
import { Types } from 'mongoose';

export type SafeDocument<T> = T & {
  _id: Types.ObjectId;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
};

export function assertDocument<T>(doc: T): asserts doc is SafeDocument<T> {
  if (!doc || !(doc as any)._id) {
    throw new Error('Invalid document');
  }
}

export function safeAccess<T, K extends keyof T>(doc: T, key: K): T[K] {
  const value = doc[key];
  if (value === undefined || value === null) {
    throw new Error(`Field ${String(key)} is undefined or null`);
  }
  return value;
}