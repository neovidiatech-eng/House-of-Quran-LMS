import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserSessions, joinToSession, leaveSession } from "../services/SessionsServices";
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