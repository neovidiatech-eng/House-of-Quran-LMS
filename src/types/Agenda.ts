export type SessionStatus = "scheduled" | "cancelled" | "planned";

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
