import { Plan } from "./plan";

export type StudentStatus = 'pending' | 'approved' | 'rejected';

export interface UserDetails {
    id: string;
    email: string;
    name: string;
    phone: string;
    code_country: string;
    status: string;
    confirmAt: string | null;
    createdAt: string;
    updatedAt: string;
    roleId: string;
    provider: string;
}

export interface Student {
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
    status: StudentStatus;
    user: UserDetails;
    plan: Plan | null;
}

export interface StudentsFetchResponse {
    message: string;
    status: number;
    data: {
        studentsData: Student[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
        };
    };
}