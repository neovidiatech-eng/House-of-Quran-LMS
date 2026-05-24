export interface TeacherStats {
  totalStudents: number;
  totalSubjects: number;
  totalSessions: number;
}

export interface TeacherSubject {
  nameEn: string;
  nameAr: string;
  color: string;
  active: boolean;
}

export interface TeacherScheduleSubject {
  nameEn: string;
  nameAr: string;
  color: string;
}

export interface TeacherScheduleStudentSessions {
  total: number;
  attended: number;
  remaining: number;
}

export interface TeacherScheduleStudent {
  name: string;
  email: string;
  gender: string;
  country: string;
  status: string;
  sessions: TeacherScheduleStudentSessions;
}

export interface TeacherSchedule {
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  link: string;
  notes: string;
  subject: TeacherScheduleSubject;
  student: TeacherScheduleStudent;
}

export interface TeacherStudentSubject {
  name: string;
  code: string;
}

export interface TeacherStudent {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  subject: TeacherStudentSubject;
  sessions: string;
}

export interface TeacherDashboardData {
  stats: TeacherStats;
  subjects: TeacherSubject[];
  schedules: TeacherSchedule[];
  todaySchedules: TeacherSchedule[];
  students: TeacherStudent[];
}

export interface TeacherDashboardResponse {
  message: string;
  status: number;
  lang: string;
  data: TeacherDashboardData;
}
