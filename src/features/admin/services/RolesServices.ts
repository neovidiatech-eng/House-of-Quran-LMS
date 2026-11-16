import api from "../../../lib/axios";
import { RolesResponse } from "../../../types/roles";

export const getRoles = async (): Promise<RolesResponse> => {
    const response = await api.get("/system/roles");
    return response.data;
};


export const searchRoles = async (search: string): Promise<RolesResponse> => {
    const response = await api.get(`/system/roles?search=${search}`);
    return response.data;
};

export const addRole = async (role: { name: string , permissionIds: string[]}): Promise<RolesResponse> => {
    const response = await api.post("/system/roles/create", role);
    return response.data;
}

export const updateRole = async ({
    id,
    role,
}: {
    id: string;
    role: { name: string; permissionIds?: string[] };
}): Promise<RolesResponse> => {
    const response = await api.patch(`/system/roles/${id}`, role);
    return response.data;
};

export const addPermissionsToRole = async ({
    roleId,
    permissionIds,
}: {
    roleId: string;
    permissionIds: string[];
}): Promise<any> => {
    const response = await api.post(`/system/roles/permissions/assign/`, {
    roleId,
    permissionIds,
    });
    return response.data;
};

export const revokePermissionsToRole = async ({
    roleId,
    permissionIds,
}: {
    roleId: string;
    permissionIds: string[];
}): Promise<any> => {
    const response = await api.post(`/system/roles/permissions/revoke/`, {
    roleId,
    permissionIds,
    });
    return response.data;
};

export const deleteRole = async ({
    id,
}: {
    id: string;
}): Promise<RolesResponse> => {
    const response = await api.delete(`/system/roles/${id}`);
    return response.data;
};