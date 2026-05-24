import api from "../../../lib/axios";
import { CreateStaffPayload, StuffData, StuffItem, UpdateStaffPayload } from "../../../types/sttuf";

export const getStaff = async (): Promise<StuffData> => {
    const response = await api.get("/system/stuff");
    return response.data.data;
};

export const searchStaff = async (search: string): Promise<StuffData> => {
    const response = await api.get(`/system/stuff?search=${search}`);
    return response.data.data;
};

export const getStaffbyId = async (id: string): Promise<StuffItem> => {
    const response = await api.get(`/system/stuffs/${id}`);
    return response.data;
}

export const addStaff = async (staff: CreateStaffPayload): Promise<StuffData> => {
    const response = await api.post("/system/stuff/create", staff);
    return response.data;
};

export const updateStaff = async ({
    id,
    staff,
}: {
    id: string;
    staff: UpdateStaffPayload;
}): Promise<StuffData> => {
    const response = await api.patch(`/system/stuff/update/${id}`, staff);
    return response.data;
};

export const deleteStaff = async (id: string): Promise<StuffData> => {
    const response = await api.delete(`/system/stuff/delete/${id}`);
    return response.data;
};
