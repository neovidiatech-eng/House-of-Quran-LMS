import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeacherProfile, getWithdrawals, withdrawRequest, updateMeetingLink } from "../services/TeacherProfileServices";
import { message } from "antd";

export const useTeacherProfile = () => {
    return useQuery({
        queryKey: ["teacher-profile"],
        queryFn: getTeacherProfile,
    })
}

export const useWithdrawals = () => {
    return useQuery({
        queryKey: ["withdrawals"],
        queryFn: getWithdrawals,
    })
}
export const useWithdrawRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["withdraw-request"],
        mutationFn: (data: { amount: number }) => withdrawRequest(data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
            queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
            message.success(data.message)
        },

    })
}

export const useUpdateMeetingLink = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["update-meeting-link"],
        mutationFn: (data: { meeting_link: string }) => updateMeetingLink(data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
            message.success(data.message || "Updated successfully");
        },
        onError: (err: any) => {
            message.error(err?.response?.data?.message || "Failed to update meeting link");
        }
    })
}