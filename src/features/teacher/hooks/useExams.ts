import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createExam,
  getExamById,
  getUserExams,
  deleteExam,
  updateExam,
  getExamAttempts,
  gradeStudentAttempt,
} from "../services/ExamServices";
import { getStudents } from "../../admin/services/StudentServices";
import { getAllModerators } from "../../admin/services/ModeratorServices";
import { CreateExamPayload, GradeAttemptPayload, UpdateExamPayload } from "../../../types/exam";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents({ limit: 100 }),
  });
};

export const useSupervisors = () => {
  return useQuery({
    queryKey: ["moderators-list"],
    queryFn: () => getAllModerators({ limit: 100 }),
  });
};

export const useExams = () => {
  return useQuery({
    queryKey: ["user-exams"],
    queryFn: getUserExams,
  });
};

export const useExamDetails = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["exam-details", id],
    queryFn: () => getExamById(id),
    enabled,
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exams"] });
    },
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamPayload) => createExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exams"] });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExamPayload }) =>
      updateExam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam-details"] });
    },
  });
};

export const useExamAttempts = (
  examId: string,
  params?: { status?: string; page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: ["exam-attempts", examId, params],
    queryFn: () => getExamAttempts(examId, params),
    enabled: !!examId && enabled,
  });
};

export const useGradeAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      attemptId,
      payload,
    }: {
      examId: string;
      attemptId: string;
      payload: GradeAttemptPayload;
    }) => gradeStudentAttempt(examId, attemptId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exam-attempts", variables.examId],
      });
      queryClient.invalidateQueries({ queryKey: ["user-exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam-details"] });
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
  });
};

