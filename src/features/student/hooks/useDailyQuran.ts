import { useQuery } from "@tanstack/react-query";
import { getMyRecitations } from "../services/DailyQuranServices";

export const useMyRecitations = () => {
  return useQuery({
    queryKey: ["my-recitations"],
    queryFn: getMyRecitations,
  });
};
