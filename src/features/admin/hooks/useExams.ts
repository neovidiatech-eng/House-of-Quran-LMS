import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExams } from "../services/ExamServices";
import { getExamById, deleteExam } from "../../teacher/services/ExamServices";
import { getStudents } from "../../admin/services/StudentServices";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents({ limit: 100 }),
  });
};

export const useExams = () => {
  return useQuery({
    queryKey: ["admin-exams"],
    queryFn: getExams,
  });
};

export const useExamDetails = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["admin-exam-details", id],
    queryFn: () => getExamById(id),
    enabled,
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
  });
};
