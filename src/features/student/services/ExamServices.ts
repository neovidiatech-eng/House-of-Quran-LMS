import api from "../../../lib/axios";

export interface StudentSubmitAnswer {
  questionId: string;
  optionId?: string;
  textAnswer?: string;
}

export interface SubmitExamPayload {
  answers: StudentSubmitAnswer[];
}

// 1. Get all student exams
export const getUserExams = async () => {
  const response = await api.get("/exams/user-exams");
  return response.data;
};

// 2. Start exam (receives questions & remaining time)
export const startExam = async (examId: string) => {
  const response = await api.post(`/exams/${examId}/start`);
  return response.data;
};

// 3. Submit exam (objective or essay)
export const submitExam = async (examId: string, payload: SubmitExamPayload) => {
  const response = await api.post(`/exams/${examId}/submit`, payload);
  return response.data;
};

// 4. Get exam details
export const getExamById = async (examId: string) => {
  const response = await api.get(`/exams/exam/${examId}`);
  return response.data;
};

// 5. View my attempt & score & teacher feedback (GET /exams/:id/my-attempt)
export const getMyAttempt = async (examId: string) => {
  const response = await api.get(`/exams/${examId}/my-attempt`);
  return response.data;
};

