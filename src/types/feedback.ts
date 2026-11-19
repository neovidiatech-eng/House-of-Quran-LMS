export interface Pagination{
    page:number;
    limit:number;
    totalItems:number;
    totalPages:number;
    hasNextPage:boolean;
}

export interface Schedule {
    id: string;
    teacherId: string;
    studentId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    notes: string | null;
    description: string | null;
    link: string;
    title: string; 
    end_time: string;
    start_time: string;
    day_of_week: string | null;
    is_recurring: boolean;
    isGroup: boolean;
    maxStudents: string;
    parent_recurring_id: string | null;
    subjectId: string;
    rescheduledFromId: string | null;
    rescheduledToId: string | null;
}

export interface UserReview {
    id: string;
    email: string;
    name: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
    confirmAt: string;
    roleId: string;
    code_country: string;
    status: string;
    googleId: string | null;
    provider: string;
    timezone: string;
    country: string | null;
    nationality: string | null;
    fcmToken: string;
    age: number;
    city: string;
    additionalData: any;
}

// A single review inside a session item
export interface Review {
    id: string;
    reviewer: UserReview;
    reviewee: UserReview;
    rating: number;
    comment: string;
    role: 'student' | 'teacher';
    isHidden: boolean;
    createdAt: string;
}

// A session item with its reviews (matches actual API: data.items[])
export interface FeedBackItem {
    schedule: Schedule;
    reviews: Review[];
}

export interface FeedbackResponse {
    message: string;
    status: number;
    lang: string;
    data: {
        items: FeedBackItem[];
        pagination: Pagination;
    };
}