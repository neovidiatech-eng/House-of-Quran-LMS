export interface User {
    name: string;
    email: string;
    code_country: string;
    status: string;
    phone: string;
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
}

export interface Plan {
    id: string;
    name_en: string;
    name_ar: string;
    description: string;
    price: string;
    duration: number;
    features: string[];
    currencyId: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
    bestSeller: boolean;
    sessionsCount: number;
    sessionTime: number;
}

export interface Currency {
    id: string;
    name_en: string;
    name_ar: string;
    symbol: string;
    code: string;
    default: boolean;
    exchangeRate: number;
}

export interface SubscriptionData {
    id: string;
    status: string;
    amount: number;
    currencyId: string;
    startDate: string;
    paidAt: string;
    user: User;
    student: Student;
    plan: Plan;
    currency: Currency;
}

export interface ApiResponse {
    success: boolean;
    data: SubscriptionData[];
}
