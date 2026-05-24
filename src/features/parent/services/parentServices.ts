import api from '../../../lib/axios';
import { ParentChildrenResponse } from '../../../types/parent';

export const getParentChildren = async (): Promise<ParentChildrenResponse> => {
  const response = await api.get('/parent/students');
  return response.data;
};

export const getStudentSessions = async (studentId: string): Promise<any> => {
  const response = await api.get(`/parent/students/${studentId}/sessions`);
  return response.data;
};

export const getStudentExams = async (studentId: string): Promise<any> => {
  const response = await api.get(`/parent/students/${studentId}/exams`);
  return response.data;
};

export const getStudentHomeworks = async (studentId: string): Promise<any> => {
  const response = await api.get(`/parent/students/${studentId}/homeworks`);
  return response.data;
};

export const getStudentAttendance = async (studentId: string): Promise<any> => {
  const response = await api.get(`/parent/students/${studentId}/attendance`);
  return response.data;
};
