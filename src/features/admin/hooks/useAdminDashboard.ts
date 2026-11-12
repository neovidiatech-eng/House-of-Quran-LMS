import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardStats, getLogs } from "../services/AdminDashboard";
import { addStudentAttendance, getStudenAttendance } from "../services/DiscountServices";

export const useAdminDashboard = () => {
    return useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: getDashboardStats,
    });
};

export const useActivityLogs = () => {
    return useQuery({
        queryKey: ['activity-logs'],
        queryFn: getLogs,
    });
}

export const useStudentAttendance = () => {
    return useQuery({
        queryKey: ['student-attendance'],
        queryFn: getStudenAttendance,
    });
}

export const useAddStudentAttendance = () => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentAttendance: { paidSessionCount: number; studentCanJoin: boolean }) =>
      addStudentAttendance(studentAttendance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
    }
  });

}



