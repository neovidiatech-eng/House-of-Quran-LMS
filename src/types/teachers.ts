export interface TeacherSubject {
    id: string;
    teacherId: string;
    subjectId: string;
    createdAt: string;
    updatedAt: string;
    subject: {
        id: string;
        name_en: string;
        name_ar: string;
        active: boolean;
        color: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface TeacherFinancials {
    totalHours: number;
    hourPrice: number;
    totalDue: number;
    totalEarnings: number;
    completedEarnings: number;
    completedHours: number;
    pendingEarnings: number;
    pendingHours: number;
    availableBalance: number;
    pendingWithdrawals: number;
}

export interface TeacherStats {
    totalStudents: number;
    completedSessions: number;
    todaySessions: number;
    upcomingSessions: number;
    financials: TeacherFinancials;
}

export interface TeacherCurrency {
    id: string;
    name_en: string;
    name_ar: string;
    symbol: string;
    code: string;
    default: boolean;
    exchangeRate: number;
}

export interface Teacher {
    id: string;
    user_id: string;
    currencyId: string;
    hour_price: number;
    gender: 'Male' | 'Female';
    active: boolean;
    nationality?: string;
    createdAt: string;
    updatedAt: string;
    roleId: string | null;
    avgRating?: number;
    totalReviews?: number;
    user: {
        id: string;
        email: string;
        name: string;
        password: string;
        phone: string;
        code_country: string;
        status: string;
        confirmAt: string | null;
        nationality?: string;
        timezone?: string;
        age?: number | string;
        country?: string;
        city?: string;
    };
    teacherSubjects: TeacherSubject[];
    meeting_link?: string | null;
    currency?: TeacherCurrency;
    stats?: TeacherStats;
    additionalData: {
        notes?: string
    };
}

export interface TeachersFetchResponse {
    message: string;
    status: number;
    data: {
        teachers: Teacher[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
        };
        activeCount: number;
        inactiveCount: number;
    };
}

export interface CreateTeacherInput {
    name: string;
    email: string;
    password?: string;
    phone: string;
    code_country: string;
    nationality: string;
    currency_id: string;
    gender: 'male' | 'female';
    active: boolean;
    subject_ids: string[];
    meeting_link?: string;
    timezone?: string;
    country?: string;
    city?: string;
    age?: number | string;
}

export interface UpdateTeacherInput {
    name: string;
    email: string;
    password?: string;
    phone: string;
    code_country: string;
    currency_id: string;
    nationality: string;
    gender: 'male' | 'female';
    active: boolean;
    subject_ids: string[];
    timezone?: string;
    meeting_link?: string;
    country?: string;
    city?: string;
    age?: number | string;
}

export type TeachersData = TeachersFetchResponse['data'];
