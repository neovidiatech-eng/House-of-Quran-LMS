export interface RankItem {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  color: string;
  icon?: string | null;
  minSessions: number;
  minPoints: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    students?: number;
  };
}

export interface GetRanksParams {
  active?: boolean;
}

export interface GetRanksResponse {
  status: number;
  message: string;
  data: {
    ranks: RankItem[];
  };
}

export interface CreateRankPayload {
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  color: string;
  icon?: string | null;
  minSessions: number;
  minPoints: number;
  active?: boolean;
}

export interface CreateRankResponse {
  status: number;
  message: string;
  data: {
    rank: RankItem;
  };
}

export interface AssignRankPayload {
  studentId: string;
  rankId: string;
}

export interface AssignRankResponse {
  status: number;
  message: string;
  data: {
    student: {
      id: string;
      rankId: string;
      rank: {
        id: string;
        name_ar: string;
        name_en: string;
        color: string;
      };
    };
  };
}

export interface UpdateRankPayload {
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  color?: string;
  icon?: string | null;
  minSessions?: number;
  minPoints?: number;
  active?: boolean;
}

export interface UpdateRankResponse {
  status: number;
  message: string;
  data: {
    rank: RankItem;
  };
}

export interface DeleteRankResponse {
  status: number;
  message: string;
}
