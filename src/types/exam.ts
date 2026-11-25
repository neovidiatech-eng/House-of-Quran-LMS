export type ExamType = "WRITTEN" | "ORAL";

export type QuestionType = "TRUE_FALSE" | "MCQ" | "ESSAY";

export interface QuestionOption {
  id?: string;
  questionId?: string;
  option: string;
  isCorrect: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamQuestion {
  id?: string;
  examId?: string;
  question: string;
  type: QuestionType;
  points: number;
  options?: QuestionOption[];
  examQuestionOptions?: QuestionOption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOralExamPayload {
  title: string;
  description: string;
  type: "ORAL";
  startDate: string;
  duration: number;
  passPoints: number;
  subjectId: string;
  supervisorId: string;
  link: string;
  studentId: string;
}

export interface CreateWrittenExamPayload {
  title: string;
  description: string;
  type: "WRITTEN";
  startDate: string;
  duration: number;
  passPoints: number;
  subjectId: string;
  studentId: string;
  questions: ExamQuestion[];
}

export type CreateExamPayload = CreateOralExamPayload | CreateWrittenExamPayload;

export interface UpdateExamPayload {
  title?: string;
  description?: string;
  duration?: number;
  startDate?: string;
  passPoints?: number;
  supervisorId?: string;
  link?: string;
  [key: string]: any;
}

export interface ExamResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    items: Exam[];
    pagination: ExamPagination;
  };
}

export interface SingleExamResponse {
  message: string;
  status: number;
  lang: string;
  data: Exam;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  type: ExamType;
  passPoints: number;
  totalPoints: number;
  startDate: string;
  duration: number;
  teacherId: string;
  subjectId: string;
  supervisorId?: string | null;
  link?: string | null;
  scheduleId: string | null;
  studentId?: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: ExamTeacher;
  subject?: ExamSubject;
  schedule?: ExamSchedule | null;
  attempts?: ExamAttempt[];
  questions?: ExamQuestion[];
  examQuestions?: ExamQuestion[];
}

export interface ExamTeacher {
  id: string;
  user_id: string;
  currencyId: string;
  hour_price: number;
  group_hour_price: number;
  gender: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  avgRating: number;
  totalReviews: number;
  meeting_link: string | null;
  approved: boolean;
  user: ExamTeacherUser;
}

export interface ExamTeacherUser {
  id: string;
  name: string;
  email: string;
}

export interface ExamSubject {
  id: string;
  name_en: string;
  name_ar: string;
  active: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSchedule {
  [key: string]: unknown;
}

export interface ExamAttempt {
  id?: string;
  studentId?: string;
  examId?: string;
  score?: number;
  passed?: boolean;
  student?: {
    id?: string;
    name?: string;
    user?: {
      name?: string;
      email?: string;
    };
  };
  createdAt?: string;
  [key: string]: unknown;
}

export interface ExamPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface QuestionGrade {
  questionId: string;
  score: number;
  feedback?: string;
}

export interface GradeAttemptPayload {
  grades: QuestionGrade[];
  feedback?: string;
}

export interface StudentAttemptAnswer {
  id?: string;
  questionId: string;
  optionId?: string | null;
  textAnswer?: string | null;
  score?: number;
  feedback?: string;
  question?: ExamQuestion;
  selectedOption?: QuestionOption;
  [key: string]: unknown;
}

export interface StudentAttemptDetail {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  totalPoints?: number;
  passed?: boolean;
  status?: string;
  feedback?: string;
  answers?: StudentAttemptAnswer[];
  examQuestions?: ExamQuestion[];
  exam?: Exam;
  student?: {
    id?: string;
    name?: string;
    user?: {
      name?: string;
      email?: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ExamAttemptsResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    items: StudentAttemptDetail[];
    pagination?: ExamPagination;
  } | StudentAttemptDetail[];
}

