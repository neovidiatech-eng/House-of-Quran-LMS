export type ViolationType = 'warning' | 'penalty';

export interface ViolationItem {
  id: string;
  title_ar: string;
  title_en: string;
  description: string;
  defaultType: ViolationType;
  defaultDeductionAmount: number;
  active: boolean;
  createdAt: string;
}

export interface ViolationsResponse {
  status: number;
  message: string;
  data: ViolationItem[] | { items: ViolationItem[] };
}

export interface CreateViolationPayload {
  title_ar: string;
  title_en: string;
  description: string;
  defaultType: ViolationType;
  defaultDeductionAmount: number;
}

export interface CreateViolationResponse {
  status: number;
  message: string;
  data: {
    item: ViolationItem;
  };
}

export interface IssueViolationPayload {
  teacherId: string;
  scheduleId?: string;
  infractionItemId: string;
  type: ViolationType;
  deductionAmount: number;
  reason: string;
}

export interface IssuedViolation {
  id: string;
  teacherId: string;
  supervisorId?: string;
  scheduleId?: string;
  infractionItemId: string;
  type: ViolationType;
  deductionAmount: number;
  reason: string;
  createdAt: string;
}

export interface IssueViolationResponse {
  status: number;
  message: string;
  data: {
    violation: IssuedViolation;
  };
}

export interface GetTeacherViolationsParams {
  page?: number;
  limit?: number;
  teacherId?: string;
  type?: ViolationType;
}

export interface IssuedViolationHistoryItem {
  id: string;
  type: ViolationType;
  deductionAmount: number;
  reason: string;
  createdAt: string;
  teacher?: {
    id: string;
    user?: {
      name: string;
    };
  };
  supervisor?: {
    id: string;
    name: string;
  };
  infractionItem?: {
    title_ar?: string;
    title_en?: string;
  };
}

export interface TeacherViolationsHistoryResponse {
  status: number;
  message: string;
  data: {
    violations: IssuedViolationHistoryItem[];
    pagination: {
      total: number;
      totalItems?: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface NormalizedViolation {
  id: string;
  type: ViolationType;
  title: string;
  reason: string;
  deductionAmount: number;
  createdAt: string;
  supervisorName?: string;
  raw?: any;
}



