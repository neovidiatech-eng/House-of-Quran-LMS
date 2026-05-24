import { useQuery } from "@tanstack/react-query";
import { getTeacherDashboard } from "../services/TeacherDashboardServices";

export const useTeacherDashboard = () => {
    return useQuery({
        queryKey: ["teacher-dashboard"],
        queryFn: getTeacherDashboard,
    });
};
