import { ActivityLogsResponse, DashboardData, DashboardResponse } from "../../../types/AdminDasboard";
import api from "../../../lib/axios";

export const getDashboardStats = async (): Promise<DashboardData> => {
    const response = await api.get<DashboardResponse>('/system/dashboard');
    return response.data.data;
} 

export const getLogs = async() : Promise<ActivityLogsResponse> => {
    const response = await api.get<ActivityLogsResponse>('/auth/getLogs');
    return response.data;
}