export interface ParentsResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    parents: Parent[];
    pagination: Pagination;
    activeCount: number;
    inactiveCount: number;
  };
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  code_country: string;
  status: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  students: Student[];
}

export interface Student {
  id: string;
  user_id: string;
  birth_date: string;
  gender: string;
  active: boolean;
  planId: string | null;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;
  avgRating: number;
  totalReviews: number;
  user: StudentUser;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}