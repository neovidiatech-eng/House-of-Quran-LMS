import api from "../../../lib/axios";
import { CreateRequestParams, CreateRequestResponse, GetRequestsResponse } from "../../../types/requests";
import { SendReviewSchedulePayload } from "../../../types/scheduales";

export const createRequest = async (request: CreateRequestParams) => {
    const response = await api.post<CreateRequestResponse>("/session-requests", request);
    return response.data;
};

export const getTeacherRequest = async () => {
    const response = await api.get<GetRequestsResponse>("/session-requests/my-requests");
    return response.data;
};

export const SendFeedBack = async (id: string, payload: SendReviewSchedulePayload) => {
    const response = await api.post(`/schedules/${id}/review`, payload)
    return response.data
}