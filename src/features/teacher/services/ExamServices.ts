import api from "../../../lib/axios";

export interface CreateExamPayload {
  title: string;
  totalMarks: number;
  studentId: string;
  subjectId: string;
  status: string;
  dueDate: string;
  duration: number;
}

//get all authenticated exam
export const getUserExams = async () => {
  const response = await api.get("/exams/user-exams");
  return response.data;
};

// get exam by id
export const getExamById = async (id: string) => {
  const response = await api.get(`/exams/exam/${id}`);
  return response.data;
};

//delete
export const deleteExam = async (id: string) => {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
};

//create
export const createExam = async (payload: CreateExamPayload) => {
  const response = await api.post("/exams", payload);
  return response.data;
};
