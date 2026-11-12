import api from "../lib/axios"
import { GetUserSchedulesResponse } from "../types/scheduales"

export type JitsiSessionData = {
  token: string;
  roomName: string;
  url: string;
  domain: string;
  isModerator: boolean;
};

export const getUserSessions = async (search: string): Promise<GetUserSchedulesResponse> => {
    const response = await api.get<GetUserSchedulesResponse>(`/schedules/user/schedules?search=${search}`)
    return response.data
}

export const joinToSession = async (id: string): Promise<JitsiSessionData> => {
    const response = await api.post(`/schedules/${id}/join`);
    return response.data.data;
}

export const leaveSession = async (id: string) => {
    const response = await api.post(`/schedules/${id}/leave`);
    return response.data;
}

export const endSessionForAll = async (id: string) => {
    const response = await api.post(`/schedules/${id}/end`);
    return response.data;
}