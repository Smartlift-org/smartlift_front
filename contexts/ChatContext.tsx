import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ChatContextType, 
  Conversation, 
  Message, 
  TypingIndicator 
} from '../types/chat';
import chatService from '../services/chatService';
import websocketService, { WebSocketEventHandler } from '../services/websocketService';

interface ChatState {
  conversations: Conversation[];
  currentConversation?: Conversation;
  messages: Message[];
  typingIndicators: TypingIndicator[];
  isLoading: boolean;
  error?: string;
  isConnected: boolean;
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: Conversation }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'ADD_TYPING_INDICATOR'; payload: TypingIndicator }
  | { type: 'REMOVE_TYPING_INDICATOR'; payload: { conversationId: number; userId: number } }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_CONVERSATION_UNREAD'; payload: { conversationId: number; unreadCount: number } };

const initialState: ChatState = {
  conversations: [],
  messages: [],
  typingIndicators: [],
  isLoading: false,
  isConnected: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload, isLoading: false };
    
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload, isLoading: false };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        conversations: state.conversations.map(conv => 
          conv.id === action.payload.conversation_id 
            ? { ...conv, last_message: action.payload, last_message_at: action.payload.created_at }
            : conv
        )
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.id ? action.payload : msg
        )
      };
    
    case 'ADD_TYPING_INDICATOR':
      return {
        ...state,
        typingIndicators: [
          ...state.typingIndicators.filter(
            t => !(t.conversationId === action.payload.conversationId && t.userId === action.payload.userId)
          ),
          action.payload
        ]
      };
    
    case 'REMOVE_TYPING_INDICATOR':
      return {
        ...state,
        typingIndicators: state.typingIndicators.filter(
          t => !(t.conversationId === action.payload.conversationId && t.userId === action.payload.userId)
        )
      };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'UPDATE_CONVERSATION_UNREAD':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? { ...conv, unread_count: action.payload.unreadCount }
            : conv
        )
      };
    
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children?: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // WebSocket event handler
  const handleWebSocketEvent: WebSocketEventHandler = useCallback((type, data) => {
    switch (type) {
      case 'connected':
        dispatch({ type: 'SET_CONNECTED', payload: true });
        break;
      
      case 'disconnected':
        dispatch({ type: 'SET_CONNECTED', payload: false });
        break;
      
      case 'error':
        dispatch({ type: 'SET_ERROR', payload: data });
        dispatch({ type: 'SET_CONNECTED', payload: false });
        break;
      
      case 'new_message':
        if (data) {
          dispatch({ type: 'ADD_MESSAGE', payload: data });
          // Update unread count for conversation
          if (data.conversation_id !== websocketService.getCurrentConversationId()) {
            // Message is from a different conversation, increment unread count
            const conversation = state.conversations.find(c => c.id === data.conversation_id);
            if (conversation) {
              dispatch({ 
                type: 'UPDATE_CONVERSATION_UNREAD', 
                payload: { 
                  conversationId: data.conversation_id, 
                  unreadCount: conversation.unread_count + 1 
                }
              });
            }
          }
        }
        break;
      
      case 'typing':
        if (data?.user) {
          dispatch({
            type: 'ADD_TYPING_INDICATOR',
            payload: {
              conversationId: websocketService.getCurrentConversationId() || 0,
              userId: data.user.id,
              userName: `${data.user.first_name} ${data.user.last_name}`,
              timestamp: data.timestamp
            }
          });
        }
        break;
      
      case 'stop_typing':
        if (data?.user) {
          dispatch({
            type: 'REMOVE_TYPING_INDICATOR',
            payload: {
              conversationId: websocketService.getCurrentConversationId() || 0,
              userId: data.user.id
            }
          });
        }
        break;
    }
  }, [state.conversations]);

  // Initialize WebSocket connection
  useEffect(() => {
    websocketService.addEventListener(handleWebSocketEvent);
    websocketService.connect();

    return () => {
      websocketService.removeEventListener(handleWebSocketEvent);
      websocketService.disconnect();
    };
  }, [handleWebSocketEvent]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: undefined });

    try {
      const response = await chatService.getConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: response.conversations || response });
      
      // Cache conversations
      await AsyncStorage.setItem('cached_conversations', JSON.stringify(response.conversations || response));
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Try to load cached conversations
      try {
        const cached = await AsyncStorage.getItem('cached_conversations');
        if (cached) {
          const cachedConversations = JSON.parse(cached);
          dispatch({ type: 'SET_CONVERSATIONS', payload: cachedConversations });
        }
      } catch (cacheError) {
        console.error('Error loading cached conversations:', cacheError);
      }
    }
  }, []);

  // Load specific conversation
  const loadConversation = useCallback(async (conversationId: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: undefined });

    try {
      const response = await chatService.getConversation(conversationId);
      dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: response.conversation });
      dispatch({ type: 'SET_MESSAGES', payload: response.messages });
      
      // Subscribe to WebSocket for this conversation
      websocketService.subscribeToConversation(conversationId);
      
      // Mark conversation as read
      await chatService.markConversationAsRead(conversationId);
      dispatch({ 
        type: 'UPDATE_CONVERSATION_UNREAD', 
        payload: { conversationId, unreadCount: 0 }
      });
      
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    if (!content.trim()) {
      return;
    }

    try {
      const message = await chatService.sendMessage(conversationId, {
        content: content.trim(),
        message_type: 'text'
      });
      
      // Message will be added via WebSocket, but add optimistically for better UX
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await chatService.markConversationAsRead(conversationId);
      dispatch({ 
        type: 'UPDATE_CONVERSATION_UNREAD', 
        payload: { conversationId, unreadCount: 0 }
      });
    } catch (error: any) {
      console.error('Error marking conversation as read:', error.message);
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(async (participantId: number): Promise<Conversation | null> => {
    try {
      // Determine if we're creating with coach_id or user_id based on current user role
      // This will be determined by the backend based on the current user's role
      const conversation = await chatService.createConversation({ 
        coach_id: participantId,
        user_id: participantId 
      });
      
      // Add to conversations list
      dispatch({ 
        type: 'SET_CONVERSATIONS', 
        payload: [...state.conversations, conversation] 
      });
      
      return conversation;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  }, [state.conversations]);

  // WebSocket actions
  const connectWebSocket = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnectWebSocket = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const sendTyping = useCallback((conversationId: number) => {
    websocketService.sendTyping();
  }, []);

  const sendStopTyping = useCallback((conversationId: number) => {
    websocketService.sendStopTyping();
  }, []);

  const contextValue: ChatContextType = {
    conversations: state.conversations,
    currentConversation: state.currentConversation,
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    
    loadConversations,
    loadConversation,
    sendMessage,
    markAsRead,
    createConversation,
    
    connectWebSocket,
    disconnectWebSocket,
    sendTyping,
    sendStopTyping,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
