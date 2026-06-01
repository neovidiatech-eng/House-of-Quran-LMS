import api from "../../../lib/axios";
import { Student, StudentsFetchResponse } from "../../../types/student";
import { StudentFormData } from "../../../lib/schemas/StudentSchema";

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  planId?: string;
}

export const getStudents = async (params: GetStudentsParams = {}): Promise<StudentsFetchResponse> => {
  const { page = 1, limit = 7, search, country, planId } = params;

  const queryParams: Record<string, string | number> = { page, limit };
  if (search) queryParams.search = search;
  if (country && country !== "all") queryParams.country = country;
  if (planId && planId !== "all") queryParams.planId = planId;

  const response = await api.get("/students", {
    params: queryParams
  });
  return response.data;
};

export const searchStudent = async (
  search: string,
): Promise<StudentsFetchResponse> => {
  try {
    const response = await api.get(`/students?search=${search}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        message: "",
        status: 404,
        data: {
          studentsData: [],
          pagination: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
          },
        },
      };
    }
    throw error;
  }
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
