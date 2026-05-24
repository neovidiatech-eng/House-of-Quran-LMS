export interface Permission {
    id: string;
    name: string;
    code: string;
    resource: string;
    method: string;
}

export interface Role {
    id: string;
    name: string;
    permissions?: Permission[];
    createdAt?: string;
    updatedAt?: string;
}

export interface RolesResponse {
    message: string;
    status: number;
    data: Role[];
}