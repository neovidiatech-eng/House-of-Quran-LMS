import api from "../../../lib/axios";
import { Subject, SubjectsData } from "../../../types/subject";

export const getSubjects = async (): Promise<SubjectsData> => {
    const response = await api.get("/teachers/subjects/");
    return response.data.data;
};

export const searchSubject = async (search: string): Promise<SubjectsData> => {
    try {
        const response = await api.get(`/teachers/subjects/?search=${search}`);
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return {
                subjects: [],
                count: 0,
                activeCount: 0
            };
        }
        throw error;
    }
}

export const addSubject = async (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post("/teachers/subjects/create/", data);
    return response.data;
};

export const updateSubject = async (id: string, data: Partial<Subject>) => {
    const response = await api.patch(`/teachers/subjects/update/${id}`, data);
    return response.data;
};

export const deleteSubject = async (id: string) => {
    const response = await api.delete(`/teachers/subjects/delete/${id}`);
    return response.data;
};