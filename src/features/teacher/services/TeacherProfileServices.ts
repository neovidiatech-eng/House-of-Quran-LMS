import api from "../../../lib/axios";
import { TeacherProfileResponse, WithdrawalsResponse } from "../../../types/profile";

export const getTeacherProfile = async (): Promise<TeacherProfileResponse> => {
    const response = await api.get("/teacher/profile");
    return response.data;
}

export const getWithdrawals = async (): Promise<WithdrawalsResponse> => {
    const response = await api.get("/withdrawals");
    return response.data;
}

export const withdrawRequest = async (data: { amount: number }) => {
    const response = await api.post(`/withdrawals/request`, data);
    return response.data;
}

export const updateMeetingLink = async (data: { meeting_link: string }) => {
    const response = await api.patch("/teacher/profile/meeting-link", data);
    return response.data;
}