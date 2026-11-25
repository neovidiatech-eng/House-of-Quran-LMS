import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserExams,
  startExam,
  submitExam,
  getExamById,
  getMyAttempt,
  SubmitExamPayload,
} from "../services/ExamServices";
import { getStudents } from "../../admin/services/StudentServices";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents({ limit: 100 }),
  });
};

export const useExams = () => {
  return useQuery({
    queryKey: ["user-exams"],
    queryFn: getUserExams,
  });
};

export const useExamDetails = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["exam-details", id],
    queryFn: () => getExamById(id),
    enabled: !!id && enabled,
  });
};

export const useStartExam = () => {
  return useMutation({
    mutationFn: (examId: string) => startExam(examId),
  });
};

export const useSubmitExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: SubmitExamPayload;
    }) => submitExam(examId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exams"] });
    },
  });
};

export const useMyAttempt = (examId: string, enabled = true) => {
  return useQuery({
    queryKey: ["my-attempt", examId],
    queryFn: () => getMyAttempt(examId),
    enabled: !!examId && enabled,
  });
};

