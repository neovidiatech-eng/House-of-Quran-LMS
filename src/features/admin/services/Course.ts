import api from "../../../lib/axios";
import { CoursesResponse } from "../../../types/course";

export const getCourses = async () : Promise<CoursesResponse> => {
    const response = await api.get<CoursesResponse>(`/courses`);
    return response.data;
}

export const createCourse = async (courseData: FormData) : Promise<CoursesResponse> => {
    const response = await api.post<CoursesResponse>(`/courses`, courseData);
    return response.data;
}

export const updateCourse = async (id: string, courseData: FormData) : Promise<CoursesResponse> => {
    const response = await api.patch<CoursesResponse>(`/courses/${id}`, courseData);
    return response.data;
}

export const deleteCourse = async (id: string) : Promise<CoursesResponse> => {
    const response = await api.delete<CoursesResponse>(`/courses/${id}`);
    return response.data;
}
