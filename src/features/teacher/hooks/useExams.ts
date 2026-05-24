import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExam,
  getExamById,
  getUserExams,
} from "../services/ExamServices";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../../admin/services/StudentServices";
import { deleteExam } from "../services/ExamServices";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
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

//create exam
export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exams"] });
    },
  });
};
