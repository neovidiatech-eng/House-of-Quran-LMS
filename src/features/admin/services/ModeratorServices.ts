import api from "../../../lib/axios";
import {
    CreateModeratorInput,
    GetModeratorsParams,
    ModeratorsFetchResponse,
    SingleModeratorResponse,
    UpdateModeratorInput,
} from "../../../types/moderator";

export const getAllModerators = async (params: GetModeratorsParams = {}): Promise<ModeratorsFetchResponse> => {
    const {
        page = 1,
        limit = 10,
        search,
        order = 'desc',
        orderBy = 'createdAt'
    } = params;

    const queryParams: Record<string, string | number> = {
        page,
        limit,
        order,
        orderBy
    };

    if (search && search.trim()) {
        queryParams.search = search.trim();
    }

    const response = await api.get("/moderator", { params: queryParams });
    return response.data;
};

export const getModeratorById = async (id: string): Promise<SingleModeratorResponse> => {
    const response = await api.get(`/moderator/${id}`);
    return response.data;
};

export const createModerator = async (data: CreateModeratorInput) => {
    const response = await api.post("/moderator", data);
    return response.data;
};

export const updateModerator = async ({ id, data }: { id: string; data: UpdateModeratorInput }) => {
    const response = await api.put(`/moderator/${id}`, data);
    return response.data;
};

export const deleteModerator = async (id: string) => {
    const response = await api.delete(`/moderator/${id}`);
    return response.data;
};
