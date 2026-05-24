import { useQuery } from "@tanstack/react-query";
import { TeacherService } from "../services/TeacherAvailabilityServices";

export const useTeacherAvailability = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["teacher-availability", startDate, endDate],
    queryFn: () => TeacherService.getTeachersCalendar(startDate, endDate),
  });
};
