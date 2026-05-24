import api from "../../../lib/axios";
import { CreateRequestParams, CreateRequestResponse, GetRequestsResponse } from "../../../types/requests";

export const createRequest = async (request: CreateRequestParams) => {
    const response = await api.post<CreateRequestResponse>("/session-requests", request);
    return response.data;
};

export const getStudentRequest = async () => {
    const response = await api.get<GetRequestsResponse>("/session-requests/my-requests");
    return response.data;
};