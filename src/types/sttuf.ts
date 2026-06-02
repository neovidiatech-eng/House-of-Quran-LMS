export interface ApiResponse {
    message: string;
    status: number;
    data: StuffData;
}

export interface StuffData {
    stuff: StuffItem[];
    pagination: Pagination;
}

export interface StuffItem {
    id: string;
    user_id: string;
    createdAt: string;
    updatedAt: string;
    roleId: string;
    user: User;
    role: Role;
}

export interface User {
    id: string;
    email: string;
    password: string; // Optional if you don't always want to expose the hash
    name: string;
    phone: string;
    provider: string;
    googleId: string | null;
    createdAt: string;
    updatedAt: string;
    confirmAt: string | null;
    roleId: string;
    code_country: string;
    status: 'active' | 'inactive' | string;
}

export interface Role {
    id: string;
    name: 'teacher' | 'admin' | 'super_admin' | string;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
}
export interface CreateStaffPayload {
    name: string;
    email: string;
    password: string;
    codeCountry: string;
    phone: string;
    roleId: string;
    timezone?: string;
}

export interface UpdateStaffPayload extends Partial<CreateStaffPayload> {
    active?: boolean;
}
