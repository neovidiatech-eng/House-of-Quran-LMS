import { LucideIcon } from "lucide-react";
import { Plan } from "./plan";

export type StudentStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

export interface UserDetails {
    id: string;
    email: string;
    name: string;
    phone: string;
    password: string;
    code_country: string;
    age?: string | number;
    city?: string;
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
    rankId: string | null;
    rank?: Rank | null;
    planId: string | null;
    country: string;
    nationality: string;
    status: StudentStatus;
    user: UserDetails;
    paid: string;
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

        "totalCount": number;
        "activeCount": number,
        "inactiveCount": number,
        "unpaidCount":number
    };
}


export interface Rank {
    id: string;
    name_ar: string;
    name_en: string;
    color: string;
    icon: LucideIcon;
    minSessions: string;
    minPoints: string;
}