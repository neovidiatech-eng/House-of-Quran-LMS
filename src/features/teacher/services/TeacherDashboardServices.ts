import api from "../../../lib/axios";
import { TeacherDashboardResponse } from "../../../types/teacherDashboard";

export const getTeacherDashboard = async (): Promise<TeacherDashboardResponse> => {
    const response = await api.get<TeacherDashboardResponse>("/teacher/profile/dashboard");
    return response.data;
};
