import { useQuery } from "@tanstack/react-query";
import { getExams } from "../services/ExamServices";
import { getStudents } from "../../admin/services/StudentServices";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
  });
};

export const useExams = () => {
  return useQuery({
    queryKey: ["exams"],
    queryFn: getExams,
  });
};
