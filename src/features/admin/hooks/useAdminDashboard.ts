import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardStats, getLogs } from "../services/AdminDashboard";
import { addLateDiscountRule, getLateDiscountRules } from "../services/DiscountServices";

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

export const useLateDiscountRules = () => {
    return useQuery({
        queryKey: ['late-discount-rules'],
        queryFn: getLateDiscountRules,
    });
}

export const useAddLateDiscountRule = (rule: { lateMinutes: number; discountPercentage: number }) => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['add-late-discount-rule'],
    mutationFn: () => addLateDiscountRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['late-discount-rules'] });
    }
  });

}