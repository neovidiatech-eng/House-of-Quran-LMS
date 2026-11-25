import api from "../../../lib/axios";
import {
  CreateExamPayload,
  ExamResponse,
  GradeAttemptPayload,
  SingleExamResponse,
  UpdateExamPayload,
} from "../../../types/exam";

// get all authenticated teacher exams
export const getUserExams = async (): Promise<ExamResponse> => {
  const response = await api.get("/exams");
  return response.data;
};

// get exam by id (includes examQuestions and examQuestionOptions)
export const getExamById = async (id: string): Promise<SingleExamResponse> => {
  const response = await api.get(`/exams/exam/${id}`);
  return response.data;
};

// delete exam
export const deleteExam = async (id: string) => {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
};

// create exam
export const createExam = async (payload: CreateExamPayload) => {
  const response = await api.post("/exams", payload);
  return response.data;
};

// update exam (PATCH with fallback to PUT and alternative paths)
export const updateExam = async (id: string, payload: UpdateExamPayload) => {
  try {
    const response = await api.patch(`/exams/${id}`, payload);
    return response.data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      try {
        const fallback = await api.put(`/exams/${id}`, payload);
        return fallback.data;
      } catch (err2: any) {
        if (err2?.response?.status === 404 || err2?.response?.status === 405) {
          const fallback2 = await api.patch(`/exams/exam/${id}`, payload);
          return fallback2.data;
        }
        throw err2;
      }
    }
    throw err;
  }
};

// 6. View student attempts for grading (GET /exams/:id/attempts)
export const getExamAttempts = async (
  examId: string,
  params?: { status?: string; page?: number; limit?: number }
) => {
  const response = await api.get(`/exams/${examId}/attempts`, { params });
  return response.data;
};

// 7. Grade student essay attempt (PATCH /exams/:id/attempts/:attemptId/grade)
export const gradeStudentAttempt = async (
  examId: string,
  attemptId: string,
  payload: GradeAttemptPayload
) => {
  const response = await api.patch(
    `/exams/${examId}/attempts/${attemptId}/grade`,
    payload
  );
  return response.data;
};

