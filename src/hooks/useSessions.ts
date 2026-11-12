import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserSessions, joinToSession, leaveSession, endSessionForAll } from "../services/SessionsServices";
import { message } from "antd";

export const useUserSessions = (search: string) => {
  return useQuery({
    queryKey: ["user-sessions", search],
    queryFn: () => getUserSessions(search),
  });
};

const JITSI_ERROR_MESSAGES: Record<string, string> = {
  NOT_A_PARTICIPANT: "أنت لست مشاركاً في هذه الجلسة",
  TOO_EARLY_TO_JOIN: "لا يمكن الانضمام قبل 5 دقائق من موعد الجلسة",
  SESSION_ALREADY_FINISHED: "انتهت هذه الجلسة بالفعل",
  SESSION_CANCELLED: "تم إلغاء هذه الجلسة",
  SESSION_NOT_FOUND: "الجلسة غير موجودة",
};

export const useJoinToSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => joinToSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.errors?.[0] ?? error?.response?.data?.message;
      message.error(JITSI_ERROR_MESSAGES[code] ?? "حدث خطأ أثناء الانضمام للجلسة");
    },
  });
};

export const useLeaveSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: (error: any) => {
      console.error("Failed to leave session:", error);
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endSessionForAll(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      message.success(data?.message ?? "تم إنهاء الجلسة للجميع");
    },
    onError: (error: any) => {
      message.error("حدث خطأ أثناء إنهاء الجلسة");
      console.error(error);
    },
  });
};

export const useEndSessionForAll = useEndSession;