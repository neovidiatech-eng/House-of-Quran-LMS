import api from "../../../lib/axios";
import { ExamResponse } from "../../../types/exam";

//get all exams with pagination
export const getExams = async (): Promise<ExamResponse> => {
  const response = await api.get(`/exams/`);
  return response.data;
};

export const getExamById = async (id:string) =>{
  const response = await api.get(`/exams/exam/${id}`);
  return response.data;
}


