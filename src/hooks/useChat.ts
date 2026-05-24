import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Socket } from "socket.io-client";
import { getSocket } from "../utils/socket";
import {
  addMessage,
  setMessages,
  setTyping,
  setOnlineStatus,
  markMessagesAsRead,
  setConnected,
} from "../store/chatSlice";
import { Message } from "../types/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConversation, getConversations } from "../services/ChatServices";

export const useChatSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let socket: Socket | null = getSocket();
    let retryInterval: NodeJS.Timeout | null = null;

    const setupListeners = (): boolean => {
      try {
        socket = getSocket();
        if (!socket) return false;

        // Sync connection state
        if (socket.connected) {
          dispatch(setConnected(true));
        }

        // IMPORTANT: Clean up first to avoid duplicates or missed events
        socket.off("connect");
        socket.off("disconnect");
        socket.off("message:new");
        socket.off("message:received");
        socket.off("messages:history");
        socket.off("user:status");
        socket.off("users:online");
        socket.off("typing:update");
        socket.off("typing:status");

        socket.on("connect", () => {
          console.log("🚀 Socket connected");
          dispatch(setConnected(true));
        });

        socket.on("disconnect", () => {
          console.log("❌ Socket disconnected");
          dispatch(setConnected(false));
        });

        socket.on("messages:history", ({ conversationId, messages }: { conversationId: string; messages: Message[] }) => {
          dispatch(setMessages({ conversationId, messages }));
        });

        // Listen to both just in case
        socket.on("message:new", (message: Message) => {
          dispatch(addMessage(message));
        });
        socket.on("message:received", (message: Message) => {
          dispatch(addMessage(message));
        });

        socket.on("typing:update", (data: { userId?: string; id?: string; conversationId: string; isTyping?: boolean }) => {
          dispatch(setTyping({
            userId: data.userId || data.id || "",
            conversationId: data.conversationId,
            isTyping: !!data.isTyping
          }));
        });
        socket.on("typing:status", (data: { userId?: string; id?: string; conversationId: string; isTyping?: boolean }) => {
          dispatch(setTyping({
            userId: data.userId || data.id || "",
            conversationId: data.conversationId,
            isTyping: !!data.isTyping
          }));
        });

        socket.on("user:status", (data: { userId?: string; id?: string; status?: "online" | "offline"; online?: boolean }) => {
          console.log("👤 Socket Event - user:status:", data);
          dispatch(setOnlineStatus({
            userId: data.userId || data.id || "",
            status: data.status || (data.online ? "online" : "offline")
          }));
        });

        socket.on("messages:read", (data: { conversationId: string; userId: string }) => {
          console.log("📖 Socket Event - messages:read:", data);
          dispatch(markMessagesAsRead({ conversationId: data.conversationId }));
        });

        socket.on("users:online", (userIds: string[]) => {
          console.log("👥 Socket Event - users:online (initial list):", userIds);
          userIds.forEach(id => dispatch(setOnlineStatus({ userId: id, status: "online" })));
        });

        console.log("✅ Chat listeners attached successfully");
        return true;
      } catch (e) {
        return false;
      }
    };

    const success = setupListeners();

    if (!success) {
      retryInterval = setInterval(() => {
        if (setupListeners()) {
          if (retryInterval) clearInterval(retryInterval);
        }
      }, 1000);
    }

    return () => {
      if (retryInterval) clearInterval(retryInterval);
      // We don't remove listeners on unmount to keep background sync alive
    };
  }, [dispatch]);
};
export const useConversations = () =>{
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
  })
}
export const useCreateChat = () =>{
  const client = useQueryClient()
  return useMutation({
    mutationFn:(data: { teacherId: string; studentId: string }) => createConversation(data.teacherId, data.studentId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['conversations'] });
    }
  })
}