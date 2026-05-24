import api from "../../../lib/axios";
import { PermissionResponse, CreatePermissionPayload } from "../../../types/permission";

export const getPermissions = async (): Promise<PermissionResponse> => {
    const response = await api.get("/system/permissions");
    return response.data;
};

export const searchPermissions = async (search: string): Promise<PermissionResponse> => {
    const response = await api.get(`/system/permissions?search=${search}`);
    return response.data;
};

export const addPermission = async (permission: CreatePermissionPayload): Promise<PermissionResponse> => {
    const response = await api.post("/system/permissions/", permission);
    return response.data;
};

export const updatePermission = async ({
    id,
    permission,
}: {
    id: string;
    permission: Partial<CreatePermissionPayload>;
}): Promise<PermissionResponse> => {
    const response = await api.patch(`/system/permissions/update/${id}`, permission);
    return response.data;
};

export const deletePermission = async (id: string): Promise<PermissionResponse> => {
    const response = await api.delete(`/system/permissions/${id}`);
    return response.data;
};