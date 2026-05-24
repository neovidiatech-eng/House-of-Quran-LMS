import api from "../lib/axios";
import { Conversation } from "../types/chat";

export const getConversations = async (): Promise<Conversation[]> => {
  const res = await api.get("/chat/conversations");
  const data = res.data.data;
  if (!Array.isArray(data)) return [];
  return data.map(conv => ({
    ...conv,
    conversationId: conv.conversationId || conv.id
  }));
};

export const createConversation = async (teacherId: string, studentId: string): Promise<Conversation> => {
  const res = await api.post("/chat/conversations", { teacherId, studentId });
  const data = res.data.data;
  if (data && !data.conversationId && data.id) {
    data.conversationId = data.id;
  }
  return data;
};

export const getConversationMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ messages: any[]; pagination: any }> => {
  const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
  return res.data.data;
};