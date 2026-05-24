export interface ExamItem {
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
    student: {
        id: string;
        user_id: string;
        birth_date: string;
        gender: string;
        active: boolean;
        planId: string | null;
        country: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        sessions: number;
        sessions_attended: number;
        sessions_remaining: number;
        user: {
            name: string;
            email: string;
        };
    };
    teacher: {
        id: string;
        user_id: string;
        currencyId: string;
        hour_price: number;
        gender: string;
        active: boolean;
        roleId: string | null;
        createdAt: string;
        updatedAt: string;
        user: {
            name: string;
            email: string;
        };
    };
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

export interface ExamPagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface ExamsResponseData {
    items: ExamItem[];
    pagination: ExamPagination;
}

export interface ExamsApiResponse {
    message: string;
    status: number;
    lang: string;
    data: ExamsResponseData;
}
