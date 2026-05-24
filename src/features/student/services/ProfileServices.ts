import api from "../../../lib/axios"
import { StudentProfileResponse } from "../../../types/profile"
import { StudentDashboardData } from "../../../types/studentDashboard";

export const getStudentProfile = async (): Promise<StudentProfileResponse> => {
    const response = await api.get("/student/profile");
    return response.data;
}

export const getStudentDashboard = async (): Promise<StudentDashboardData> => {
    const response = await api.get("/student/profile/dashboard");
    return response.data.data;
}

