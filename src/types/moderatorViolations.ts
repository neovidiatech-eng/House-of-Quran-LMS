import { Pagination } from './api';
import { ViolationType } from './Violations';

export interface ModeratorViolationUser {
  name: string;
  email: string;
}

export interface ModeratorViolationModerator {
  id: string;
  userId: string;
  gender: 'male' | 'female' | string;
  status: 'active' | 'inactive' | string;
  createdAt: string;
  updatedAt: string;
  user: ModeratorViolationUser;
}

export interface ModeratorViolationSupervisor {
  id: string;
  name: string;
  email: string;
}

export interface ModeratorViolationInfractionItem {
  id: string;
  title_en: string;
  title_ar: string;
  description: string;
  defaultType: ViolationType | string;
  defaultDeductionAmount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModeratorViolation {
  id: string;
  moderatorId: string;
  supervisorId: string;
  infractionItemId: string;
  type: ViolationType;
  deductionAmount: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  moderator?: ModeratorViolationModerator;
  supervisor?: ModeratorViolationSupervisor;
  infractionItem?: ModeratorViolationInfractionItem;
}

export interface ModeratorViolationsData {
  violations: ModeratorViolation[];
  pagination: Pagination;
}

export interface ModeratorViolationsResponse {
  message: string;
  status: number;
  lang?: string;
  data: ModeratorViolationsData;
}

export interface IssueModeratorViolationPayload {
  moderatorId: string;
  infractionItemId: string;
  type: ViolationType;
  deductionAmount: number;
  reason: string;
}

export interface IssueModeratorViolationResponse {
  status: number;
  message: string;
  data?: {
    violation: ModeratorViolation;
  };
}

export interface GetModeratorViolationsParams {
  page?: number;
  limit?: number;
  moderatorId?: string;
  type?: ViolationType;
}

