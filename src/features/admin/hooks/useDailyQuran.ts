import { useQuery } from "@tanstack/react-query";
import { getAllRecitations } from "../services/DailyQuranServices";

export const useAdminDailyQuranRecitations = () => {
  return useQuery({
    queryKey: ["admin-daily-quran-recitations"],
    queryFn: getAllRecitations,
  });
};
