import api from "../../../lib/axios"
import { CreateTeacherInput, Teacher, TeachersData, TeachersFetchResponse, UpdateTeacherInput } from "../../../types/teachers"

export interface GetTeachersParams {
    page?: number;
    search?: string;
}

export const getTeacher = async (params: GetTeachersParams = {}): Promise<TeachersData> => {
    const { search, page } = params;
    const queryParams: Record<string, string | number> = {};
    if (search) queryParams.search = search;
    if (page) queryParams.page = page;
    const response = await api.get("/teachers", Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined);
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

export const getTeacherStudentsForAdmin = async (teacherId: string) => {
    const response = await api.get(`/teachers/my-students/${teacherId}`);
    return response.data;
}

export const assignStudentHourPrice = async (teacherId: string, studentId: string, hour_price: number | string) => {
    const response = await api.patch(`/teachers/my-students/${teacherId}/hour-price`, {
        studentId,
        hour_price
    });
    return response.data;
}