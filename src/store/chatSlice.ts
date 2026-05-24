import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatState, Conversation, Message, TypingState } from "../types/chat";

const initialState: ChatState = {
  conversations: [],
  messages: {},
  typing: [],
  onlineUsers: [],
  connected: false,
  activeConversationId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
    },

    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      // Reset unread count for the active conversation
      const conv = state.conversations.find(c => c.conversationId === action.payload);
      if (conv) {
        conv.unreadCount = 0;
      }
    },

    setMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },

    addMessage(state, action: PayloadAction<Message>) {
      const msg = action.payload;
      const convId = msg.conversationId;

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      const exists = state.messages[convId].some((m) => m.id === msg.id);
      if (!exists) {
        state.messages[convId].push(msg);
      }

      // Update last message and unread count in conversations list
      const conv = state.conversations.find(c => c.conversationId === convId);
      if (conv) {
        conv.lastMessage = msg.content;
        conv.lastMessageAt = msg.createdAt;
        
        // Increment unread count if conversation is not active
        if (state.activeConversationId !== convId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }
    },

    resetUnreadCount(state, action: PayloadAction<string>) {
      const conv = state.conversations.find(c => c.conversationId === action.payload);
      if (conv) {
        conv.unreadCount = 0;
      }
    },

    markMessagesAsRead(state, action: PayloadAction<{ conversationId: string }>) {
      const { conversationId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map(msg => ({
          ...msg,
          isRead: true
        }));
      }
    },

    setTyping(state, action: PayloadAction<TypingState>) {
      const { userId, conversationId, isTyping } = action.payload;

      state.typing = state.typing.filter(
        (t) => !(t.userId === userId && t.conversationId === conversationId)
      );

      if (isTyping) {
        state.typing.push(action.payload);
      }
    },

    setOnlineStatus(state, action) {
      const { userId, status } = action.payload;

      const id = String(userId).trim().toLowerCase();

      if (status === "online") {
        if (!state.onlineUsers.includes(id)) {
          state.onlineUsers.push(id);
        }
      } else {
        state.onlineUsers = state.onlineUsers.filter(
          (x) => x !== id
        );
      }
    },

    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  resetUnreadCount,
  markMessagesAsRead,
  setTyping,
  setOnlineStatus,
  setConnected,
} = chatSlice.actions;

export default chatSlice.reducer;