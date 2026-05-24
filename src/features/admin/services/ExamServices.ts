import api from "../../../lib/axios";
import { ExamsApiResponse } from "../../../types/exam";

//get all exams with pagination
export const getExams = async (): Promise<ExamsApiResponse> => {
  const response = await api.get(`/exams/`);
  return response.data;
};

