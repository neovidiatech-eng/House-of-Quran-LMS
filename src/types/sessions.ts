export interface ContextSession {
  id: string;
  sessionName: string;
  studentName: string;
  teacherName: string;
  subject: string;
  day: string;
  date: string;
  time: string;
  endTime: string;
  meetingLink?: string;
  sessionIndex?: number;
}

export interface SessionDisplay {
  id: string;
  title: string;
  teacher: string;
  subject: string;
  grade: string; 
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AddSessionInput {
  title: string;
  student: string;
  teacher: string;
  subject: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
}

export interface AddMultipleSessionsInput {
  title: string;
  student: string;
  teacher: string;
  subject: string;
  sessions: Array<{
    day: string;
    date: string;
    time: string;
    endTime: string;
    meetingLink?: string;
  }>;
}

export interface SessionFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  teacher: string;
  student: string;
  subject: string;
}

export interface SessionGroupDetails {
  id: string;
  sessionName: string;
  student: string;
  teacher: string;
  subject: string;
  monthYear: string;
  duration: number;
  meetingLink: string;
  sessions: Array<{
    day: string;
    date: string;
    time: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    meetingLink?: string;
  }>;
  packageInfo: {
    packageName: string;
    totalSessions: number;
    sessionsUsed: number;
    sessionsRemaining: number;
  };
}

export interface SingleSessionInput {
 title: string;
  student: string;
  teacher: string;
  subject: string;
  sessionDate: string; // بدلاً من date
  startTime: string;   // بدلاً من time
  endTime: string;
  meetingLink?: string;
  notes?: string;
}

export interface MultipleSessionsInput {
  title: string;
  student: string;
  teacher: string;
  subject: string;
  sessions: Array<{
    day: string;
    date: string;
    time: string;
    endTime: string;
    meetingLink?: string;
  }>;
}