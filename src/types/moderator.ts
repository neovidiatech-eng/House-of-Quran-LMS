import { Pagination } from './api';

export interface ModeratorUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  password?: string;
  code_country?: string;
  roleId?: string;
}

export interface ModeratorStudent {
  id: string;
  user_id: string;
  birth_date: string;
  gender: 'male' | 'female' | string;
  active: boolean;
  planId: string | null;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;
  points: number;
  avgRating: number;
  totalReviews: number;
  paid: string;
  rankId: string | null;
  user?: ModeratorUser;
}

export interface StudentModerator {
  id: string;
  studentId: string;
  moderatorId: string;
  createdAt: string;
  updatedAt: string;
  student: ModeratorStudent;
}

export interface Moderator {
  id: string;
  userId: string;
  gender: 'male' | 'female' | string;
  status: 'active' | 'inactive' | string;
  createdAt: string;
  updatedAt: string;
  user: ModeratorUser;
  studentModerators: StudentModerator[];
}

export type ModeratorOrderBy = 'createdAt' | 'active';
export type SortOrder = 'asc' | 'desc';

export interface GetModeratorsParams {
  page?: number;
  limit?: number;
  search?: string;
  order?: SortOrder;
  orderBy?: ModeratorOrderBy;
}

export interface ModeratorsResponse {
  message: string;
  status: number;
  lang?: string;
  data: {
    items: Moderator[];
    pagination: Pagination;
  };
}

export interface CreateModeratorInput {
  name: string;
  email: string;
  codeCountry: string;
  password?: string;
  phone: string;
  age?: number | string;
  gender: 'male' | 'female' | string;
  studentIds?: string[];
}

export interface UpdateModeratorInput {
  name?: string;
  email?: string;
  codeCountry?: string;
  password?: string;
  phone?: string;
  age?: number | string;
  gender?: 'male' | 'female' | string;
  studentIds?: string[];
  status?: 'active' | 'inactive' | string;
}

export interface ChangeModeratorStatusInput {
  id: string;
  status: 'active' | 'inactive' | string;
}

export interface SingleModeratorResponse {
  message: string;
  status: number;
  data: Moderator;
}

export type ModeratorsFetchResponse = ModeratorsResponse;
export type ModeratorsData = ModeratorsResponse['data'];

// ── Moderator Request (pending sign-up) types ────────────────────────────────

export interface ModeratorRequestAdditionalData {
  birthDate: string;
  governorate: string;
  hasCurrentJob: boolean;
  maritalStatus: string;
  qualification: string;
  whatsappNumber: string;
  hasPersonalLaptop: boolean;
  dailyFreeTimeHours: string;
  hasFreeTimeFrom3To8: boolean;
  agreedToWorkConditions: boolean;
}

export interface ModeratorRequestModerator {
  id: string;
  userId: string;
  gender: 'male' | 'female' | string;
  status: 'pending' | 'active' | 'inactive' | string;
  createdAt: string;
  updatedAt: string;
  studentModerators: StudentModerator[];
}

export interface ModeratorRequest {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  confirmAt: string | null;
  roleId: string | null;
  code_country: string;
  status: 'pending' | 'active' | 'inactive' | string;
  googleId: string | null;
  provider: 'local' | 'google' | string;
  timezone: string;
  country: string;
  nationality: string;
  fcmToken: string;
  age: number;
  city: string;
  additionalData: ModeratorRequestAdditionalData;
  moderator: ModeratorRequestModerator;
}

export interface ModeratorRequestsResponse {
  message: string;
  status: number;
  lang?: string;
  data: {
    requests: ModeratorRequest[];
    pagination: Pagination;
  };
}



