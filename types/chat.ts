// Chat related types for user-trainer messaging

export interface ChatUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'coach';
  profile_picture_url?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  read_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  sender: ChatUser;
}

export interface Conversation {
  id: number;
  user_id: number;
  coach_id: number;
  status: 'active' | 'archived';
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  unread_count: number;
  other_participant: ChatUser;
  last_message?: Message;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

export interface CreateConversationRequest {
  coach_id?: number;
  user_id?: number;
}

export interface CreateMessageRequest {
  content: string;
  message_type: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface WebSocketMessage {
  type: 'new_message' | 'typing' | 'stop_typing';
  message?: Message;
  user?: ChatUser;
  timestamp: string;
}

export interface ChatContextType {
  conversations: Conversation[];
  currentConversation?: Conversation;
  messages: Message[];
  isLoading: boolean;
  error?: string;
  
  // Actions
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  markAsRead: (conversationId: number) => Promise<void>;
  createConversation: (participantId: number) => Promise<Conversation | null>;
  
  // WebSocket actions
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  sendTyping: (conversationId: number) => void;
  sendStopTyping: (conversationId: number) => void;
}

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  userName: string;
  timestamp: string;
}
