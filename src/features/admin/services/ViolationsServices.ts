import api from "../../../lib/axios";
import { 
  ModeratorViolationsResponse, 
  IssueModeratorViolationPayload, 
  IssueModeratorViolationResponse,
} from "../../../types/moderatorViolations";
import {
  ViolationsResponse,
  CreateViolationPayload,
  CreateViolationResponse,
  IssueViolationPayload,
  IssueViolationResponse,
  TeacherViolationsHistoryResponse,
  ViolationType
} from "../../../types/Violations";

export const getViolations = async (): Promise<ViolationsResponse> => {
    const response = await api.get('/violations/items');
    return response.data;
}

export const createViolation = async (payload: CreateViolationPayload): Promise<CreateViolationResponse> => {
    const response = await api.post('/violations/items', payload);
    return response.data;
}

export const issueViolation = async (payload: IssueViolationPayload): Promise<IssueViolationResponse> => {
    const response = await api.post('/violations/issue', payload);
    return response.data;
}

export const getTeacherViolationsHistory = async (
  teacherId: string
): Promise<TeacherViolationsHistoryResponse> => {
  try {
    const response = await api.get(`/violations?teacherId=${teacherId}`);
    return response.data;
  } catch (error) {
    // Handle the error appropriately
    console.error('Error fetching teacher violations history:', error);
    throw error;
  }
};

export const deleteViolationItem = async (id: string): Promise<{ status: number; message: string }> => {
  const response = await api.delete(`/violations/items/${id}`);
  return response.data;
};

export const getAllViolationsHistory = async (
  page: number,
  limit: number,
  type?: ViolationType
): Promise<TeacherViolationsHistoryResponse> => {
  const response = await api.get('/violations', { params: { page, limit, type } });
  return response.data;
};


export const getModeratorViolations = async () : Promise<ModeratorViolationsResponse>=>{
    const response = await api.get('/violations/moderator');
  return response.data;
};

export const createModeratorViolations = async (
  payload: IssueModeratorViolationPayload
): Promise<IssueModeratorViolationResponse> => {
  const response = await api.post('/violations/moderator/issue', payload);
  return response.data;
};


export const deleteModeratorViolation = async (id: string): Promise<{ status: number; message: string }> => {
  const response = await api.delete(`/violations/moderator/${id}`);
  return response.data;
};

