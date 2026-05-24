export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface TypingState {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  typing: TypingState[];
  onlineUsers: string[];
  connected: boolean;
  activeConversationId: string | null;
}

export interface Conversation {
  conversationId: string;
  otherParty: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}