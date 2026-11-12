import api from "../../../lib/axios";
import { ApproveTeacherRequestBody, TeacherSubscriptionRequest } from "../../../types/teacherSubscription";

export const getTeacherSubscriptionRequests = async (): Promise<TeacherSubscriptionRequest[]> => {
  const response = await api.get("/auth/teacher-requests");
  // Flexible parsing of API response
  const rawData = response.data;
  if (Array.isArray(rawData)) return rawData;
  if (Array.isArray(rawData?.data)) return rawData.data;
  if (Array.isArray(rawData?.data?.requests)) return rawData.data.requests;
  if (Array.isArray(rawData?.requests)) return rawData.requests;
  return [];
};

export const approveTeacherSubscriptionRequest = async (id: string, data: ApproveTeacherRequestBody) => {
  const response = await api.patch(`/auth/teacher-requests/${id}/approve`, data);
  return response.data;
};

export const rejectTeacherSubscriptionRequest = async (id: string) => {
  const response = await api.delete(`/auth/teacher-requests/${id}/reject`);
  return response.data;
};
