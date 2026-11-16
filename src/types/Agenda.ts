export type SessionStatus = "scheduled" | "cancelled" | "planned" | "completed";

export type SessionType = "half" | "full";

export interface AgendaSession {
  id: string;
  teacherId: string;
  studentId: string;
  status: SessionStatus;
  title: string;
  description: string;
  type: SessionType;

  start_time: string;
  end_time: string;

  link: string;
  notes: string | null;

  createdAt: string;
  updatedAt: string;

  is_recurring: boolean;
  day_of_week: string | null;
  parent_recurring_id: string | null;

  subjectId?: string | null;
  rescheduledFromId?: string | null;
  rescheduledToId?: string | null;

  reviews?: {
    id?: string;
    role?: string;
    scheduleId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number | string;
    comment: string;
    reviewee: {
      email: string;
      password: string;
      name: string;
      phone: string;
      createdAt: string;
      updatedAt?:string|null
      roleId: string;
      code_country:string;

    }
    reviewer:{
      email:string;
      password:string;
      name:string;
      phone:string;
      createdAt: string;
      updatedAt?:string|null
      roleId: string;
      code_country:string;
    }
  }[] | null;
  




  display_start_time?: string;
  display_end_time?: string;
  display_timezone?: string;

  teacher?: {
    user?: {
      name: string;
      email: string;
      role?: {
        name: string;
      };
    };
  };

  student?: {
    user?: {
      name: string;
      email: string;
      role?: {
        name: string;
      };
    };
  };

  subject?: {
    id: string;
    name_en: string;
    name_ar: string;
    active: boolean;
    color: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AgendaResponse {
  message: string;
  status: number;
  data: {
    sessions: AgendaSession[];
    count: number;
    planned: number;
    toDaySessions: AgendaSession[];
  };
}
