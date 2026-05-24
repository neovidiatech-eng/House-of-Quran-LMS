import { getSocket } from "../utils/socket";

export const openConversation = (conversationId: string) => {
  try {
    getSocket()?.emit("conversation:open", { conversationId });
  } catch (err) {
    console.warn("Socket not ready to open conversation.");
  }
};

export const sendMessage = (conversationId: string, content: string) => {
  try {
    getSocket()?.emit("message:send", { conversationId, content });
  } catch (err) {
    console.error("Failed to send message: Socket not initialized");
  }
};

export const startTyping = (conversationId: string) => {
  try {
    getSocket()?.emit("typing:start", { conversationId });
  } catch (err) {
    // Silent fail
  }
};

export const stopTyping = (conversationId: string) => {
  try {
    getSocket()?.emit("typing:stop", { conversationId });
  } catch (err) {
    // Silent fail
  }
};

export const markAsRead = (conversationId: string) => {
  try {
    getSocket()?.emit("message:read", { conversationId });
  } catch (err) {
    // Silent fail
  }
};