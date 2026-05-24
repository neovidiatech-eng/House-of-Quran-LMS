import { useQuery } from "@tanstack/react-query";
import { getHomeworkList } from "../services/HomeworkServices";

export const useHomework = () => {
  return useQuery({
    queryKey: ["homework"],
    queryFn: getHomeworkList,
  });
};