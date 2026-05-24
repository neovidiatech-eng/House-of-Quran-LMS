import api from "../../../lib/axios";
import { GetRequestsResponse } from "../../../types/requests";

// export const RequestsServices = {
//     async getRequests() {
//         const response = await api.get<GetRequestsResponse>("/session-requests/all");
//         return response.data;
//     },

//     async 
// };

export const getRequests = async () => {
    const response = await api.get<GetRequestsResponse>("/session-requests/all");
    return response.data;
};

export const changeRequestStatus = async (id: string, status: "approve" | "reject", adminNotes: string) => {
    const response = await api.patch(`/session-requests/${id}/${status}`, { adminNotes });
    return response.data;
};

