import api from "../../../lib/axios"
import { CreateTeacherInput, Teacher, TeachersData, TeachersFetchResponse, UpdateTeacherInput } from "../../../types/teachers"

export const getTeacher = async (): Promise<TeachersData> => {
    const response = await api.get("/teachers");
    return response.data.data
}

export const searchTeacher = async (search: string): Promise<TeachersData> => {
    const response = await api.get(`/teachers?search=${search}`);
    return response.data.data
}

export const getTeacherById = async (id: string): Promise<Teacher> => {
    const response = await api.get(`/teachers/${id}`);
    return response.data.data
}

export const createTeacher = async (data: CreateTeacherInput): Promise<TeachersFetchResponse> => {
    const response = await api.post("/teachers/create", data);
    return response.data
}

export const updateTeacher = async (id: string, data: UpdateTeacherInput): Promise<TeachersFetchResponse> => {
    const response = await api.patch(`/teachers/update/${id}`, data);
    return response.data
}

export const deleteTeacher = async (id: string): Promise<TeachersFetchResponse> => {
    const response = await api.delete(`/teachers/delete/${id}`);
    return response.data
}