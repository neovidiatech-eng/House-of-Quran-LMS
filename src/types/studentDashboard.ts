export interface StudentDashboardSubject {
  id: string;
  name_en: string;
  name_ar: string;
  active: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDashboardTeacher {
  id: string;
  user_id: string;
  user: {
    name: string;
  };
}

export interface Exam {
  id: string;
  title: string;
  grade: number;
  studentId: string;
  subjectId: string;
  teacherId: string;
  dueDate: string;
  totalMarks: number;
  duration: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  subject: StudentDashboardSubject;
  teacher: StudentDashboardTeacher;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
  subject: StudentDashboardSubject;
  teacher: StudentDashboardTeacher;
}

export interface AttendanceLog {
  id: string;
  scheduleId: string;
  joinTime_student: string | null;
  leaveTime_student: string | null;
  joinTime_teacher: string | null;
  leaveTime_teacher: string | null;
  duration_student: number;
  duration_teacher: number;
  isTeacherLate: boolean;
  isTeacherCompleted: boolean;
  isStudentAttended: boolean;
  createdAt: string;
  updatedAt: string;
  schedule: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
    subject: StudentDashboardSubject;
  };
}