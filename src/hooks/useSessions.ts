import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserSessions, joinToSession, leaveSession, endSession } from "../services/SessionsServices";
import { message } from "antd";

export const useUserSessions = (search: string) => {
  return useQuery({
    queryKey: ["user-sessions", search],
    queryFn: () => getUserSessions(search),
  });
};

export const useJoinToSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => joinToSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      message.success("You have joined the session");
    },
    onError: (error: any) => {
      console.error("Failed to join session:", error);
    },
  });
};

export const useLeaveSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      message.success("You have left the session");
    },
    onError: (error: any) => {
      console.error("Failed to leave session:", error);
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endSession(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success(data?.message || "Session ended successfully");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to end session";
      message.error(msg);
    },
  });
};