import { Plan } from "./plan";
import { UserDetails } from "./student";

export interface Child {
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
    planId: string | null;
    country: string;
    status: string;
    avgRating: number;
    totalReviews: number;
    user: UserDetails;
    plan: Plan | null;
}

export interface ParentChildrenResponse {
    success: boolean;
    data: Child[];
}

export interface ParentUser {
    id: string;
    name: string;
    email: string;
    password:string;
    phone: string;
    country: string;
    codeCountry: string;
    timezone?: string;
}

export interface CreateParentResponse {
    message?: string;
    status?: number;
    success?: boolean;
    data?: ParentUser | null;
}
