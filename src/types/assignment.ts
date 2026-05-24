export interface UserBasicInfo {
    name: string;
    email: string;
}

export interface StudentInAssignment {
    id: string;
    user_id: string;
    birth_date: string;
    gender: string;
    active: boolean;
    planId: string;
    country: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    sessions: number;
    sessions_attended: number;
    sessions_remaining: number;
    user: UserBasicInfo;
}

export interface TeacherInAssignment {
    id: string;
    user_id: string;
    currencyId: string;
    hour_price: number;
    gender: string;
    active: boolean;
    roleId: string | null;
    createdAt: string;
    updatedAt: string;
    user: UserBasicInfo;
}

export interface SubjectInAssignment {
    id: string;
    name_en: string;
    name_ar: string;
    active: boolean;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface Assignment {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'graded' | string;
    dueDate: string;
    studentId: string;
    teacherId: string;
    subjectId: string;
    createdAt: string;
    updatedAt: string;
    student: StudentInAssignment;
    teacher: TeacherInAssignment;
    subject: SubjectInAssignment;
}

export interface HomeworkResponse {
  message: string;
  status: number;
  lang: string;
  data: Homework[];
}

export interface AdminAssignmentsResponse {
    message: string;
    status: number;
    data: {
        items: Assignment[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    };
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

  student: Student;
  teacher: Teacher;
  subject: Subject;
}

export interface Student {
  id: string;
  user_id: string;
  birth_date: string;
  gender: string;
  active: boolean;
  planId: string;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;

  avgRating: number;
  totalReviews: number;

  user: User;
}

export interface Teacher {
  id: string;
  user_id: string;
  currencyId: string;
  hour_price: number;
  meeting_link: string;
  gender: string;
  active: boolean;
  roleId: string | null;
  createdAt: string;
  updatedAt: string;

  avgRating: number;
  totalReviews: number;

  user: User;
}

export interface Subject {
  id: string;
  name_en: string;
  name_ar: string;
  active: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
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
