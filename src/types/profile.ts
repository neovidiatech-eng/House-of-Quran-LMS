import { Currency } from "./currency";
import { Schedule } from "./scheduales";

export interface ReviewReceived {
  id: string;
  scheduleId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  role: string;
  isHidden: boolean;
  createdAt: string;
}


export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  provider: string;
  googleId: string | null;
  createdAt: string;
  code_country: string;
  status: string;
  reviewsReceived: ReviewReceived[];

}

export interface ProfilePlan {
  id: string;
  name_en: string;
  name_ar: string;
  description: string;
  price: string;
  duration: number;
  sessionsCount: number;
  features: string[];
}

export interface ProfileData {
  id: string;
  user_id: string;
  birth_date: string;
  gender: 'male' | 'female';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;
  planId: string;
  country: string;
  status: string;
  user: ProfileUser;
  schedules: Schedule[];
  plan: ProfilePlan;
}


export interface StudentProfileResponse {
  message: string;
  status: number;
  data: ProfileData;
}

export interface TeacherProfileInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  hourPrice: number;
  status: string;
  active: boolean;
  user_id?: string;
  meeting_link:string;
  wallet: Wallet[];
}

export interface Wallet {
  id: string;
  type: string;
  ownerId: string;
  balance: number;
  currencyId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  currency: Currency;

}
export interface TeacherProfileStats {
  totalStudents: number;
  totalSubjects: number;
  totalSessions: number;
}

export interface TeacherProfileSubject {
  nameEn: string;
  nameAr: string;
  color: string;
  active: boolean;
}

export interface TeacherProfileSchedule {
  title: string;
  description: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  link: string;
  notes: string;
  subject: {
    nameEn: string;
    nameAr: string;
    color: string;
  };
  student: {
    name: string;
    email: string;
    gender: string;
    country: string;
    status: string;
    sessions: {
      total: number;
      attended: number;
      remaining: number;
    };
  };
}

export interface TeacherProfileStudent {
  name: string;
  code: string;
  email: string;
  phone: string;
  subject: {
    name: string;
    code: string;
  };
  sessions: string;
}

export interface Withdrawal {
  id: string;
  teacherId: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfileData {
  teacher: TeacherProfileInfo;
  stats: TeacherProfileStats;
  subjects: TeacherProfileSubject[];
  schedules: TeacherProfileSchedule[];
  students: TeacherProfileStudent[];
  withdrawals: Withdrawal[];
}

export interface WithdrawalsResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    withdrawals: Withdrawal[];
  };
}

export interface TeacherProfileResponse {
  message: string;
  status: number;
  lang: string;
  data: TeacherProfileData;
}
