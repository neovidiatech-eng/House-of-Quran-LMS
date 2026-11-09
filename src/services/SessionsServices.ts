import api from "../lib/axios"
import { GetUserSchedulesResponse } from "../types/scheduales"

export interface JoinSessionResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    roomName: string;
    url: string;
    domain: string;
    isModerator: boolean;
  };
}

export const getUserSessions = async (search: string): Promise<GetUserSchedulesResponse> => {
    const response = await api.get<GetUserSchedulesResponse>(`/schedules/user/schedules?search=${search}`)
    return response.data
}

export const joinToSession = async (id: string): Promise<JoinSessionResponse> => {
  const response = await api.post<JoinSessionResponse>(`/schedules/${id}/join`);
  return response.data;
};

export const leaveSession = async (id: string) => {
  const response = await api.post(`/schedules/${id}/leave`);
  return response.data;
};

export const endSession = async (id: string) => {
  const response = await api.post(`/schedules/${id}/end`);
  return response.data;
};
