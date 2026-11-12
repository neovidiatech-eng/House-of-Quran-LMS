import api from "../../../lib/axios";
import { Student, StudentsFetchResponse } from "../../../types/student";
import { StudentFormData } from "../../../lib/schemas/StudentSchema";

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  planId?: string;
  status?: string;
  active?: boolean;
  paid?: string;
}

export const getStudents = async (params: GetStudentsParams = {}): Promise<StudentsFetchResponse> => {
  const { page, limit, search, country, planId, status, active, paid } = params;

  const queryParams: Record<string, string | number | boolean> = {};
  if (page !== undefined) queryParams.page = page;
  if (limit !== undefined) queryParams.limit = limit;
  if (search) queryParams.search = search;
  if (country && country !== "all") queryParams.country = country;
  if (planId && planId !== "all") queryParams.planId = planId;
  if (status && status !== "all") queryParams.status = status;
  if (active !== undefined) queryParams.active = active;
  if (paid && paid !== "all") queryParams.paid = paid;

  const response = await api.get("/students", {
    params: queryParams
  });
  return response.data;
};

export const searchStudent = async (
  search: string,
): Promise<StudentsFetchResponse> => {
    const response = await api.get(`/students?search=${search}`);
    return response.data;

};

export const getStudentById = async (
  id: string,
): Promise<StudentsFetchResponse> => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};
export const updateStudent = async (
  id: string,
  data: StudentFormData | Partial<Student>,
) => {
  const response = await api.patch(`/students/update/${id}`, data);
  return response.data;
};
export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};
export const createStudent = async (
  data: StudentFormData | Partial<Student>,
) => {
  const response = await api.post(`/students/create`, data);
  return response.data;
};

export const updateStudentPlan= async (id: string, planId: string) => {
  const response = await api.patch(`/students/updatePlan/${id}`, { planId });
  return response.data;
};
