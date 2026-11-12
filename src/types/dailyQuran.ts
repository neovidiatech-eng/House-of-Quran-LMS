export interface IDailyQuranRecitation {
  id: string;
  studentId: string;
  surah: string;
  startPage: number;
  endPage: number;
  dueDate: string;
  status: "pending" | "completed" | "reviewed" | "rejected";
  student?: {
    user?: {
      name?: string;
    };
  };
}

export interface IDailyQuranPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface IDailyQuranData {
  recitations: IDailyQuranRecitation[];
  pagination: IDailyQuranPagination;
}

export interface IDailyQuranResponse {
  message: string;
  status: number;
  lang: string;
  data: IDailyQuranData;
}