import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChatContextType,
  Conversation,
  Message,
  TypingIndicator,
} from "../types/chat";
import chatService from "../services/chatService";
import websocketService, {
  WebSocketEventHandler,
} from "../services/websocketService";

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
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | undefined }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "SET_CURRENT_CONVERSATION"; payload: Conversation }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_MESSAGE"; payload: Message }
  | { type: "ADD_TYPING_INDICATOR"; payload: TypingIndicator }
  | {
      type: "REMOVE_TYPING_INDICATOR";
      payload: { conversationId: number; userId: number };
    }
  | { type: "SET_CONNECTED"; payload: boolean }
  | {
      type: "UPDATE_CONVERSATION_UNREAD";
      payload: { conversationId: number; unreadCount: number };
    };

const initialState: ChatState = {
  conversations: [],
  messages: [],
  typingIndicators: [],
  isLoading: false,
  isConnected: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload, isLoading: false };

    case "SET_CURRENT_CONVERSATION":
      return { ...state, currentConversation: action.payload };

    case "SET_MESSAGES":
      return { ...state, messages: action.payload, isLoading: false };

    case "ADD_MESSAGE":
      // Avoid duplicates if the same message arrives via WebSocket and optimistic update
      if (state.messages.some((m) => m.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        messages: [...state.messages, action.payload],
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.conversation_id
            ? {
                ...conv,
                last_message: action.payload,
                last_message_at: action.payload.created_at,
              }
            : conv
        ),
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? action.payload : msg
        ),
      };

    case "ADD_TYPING_INDICATOR":
      return {
        ...state,
        typingIndicators: [
          ...state.typingIndicators.filter(
            (t) =>
              !(
                t.conversationId === action.payload.conversationId &&
                t.userId === action.payload.userId
              )
          ),
          action.payload,
        ],
      };

    case "REMOVE_TYPING_INDICATOR":
      return {
        ...state,
        typingIndicators: state.typingIndicators.filter(
          (t) =>
            !(
              t.conversationId === action.payload.conversationId &&
              t.userId === action.payload.userId
            )
        ),
      };

    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };

    case "UPDATE_CONVERSATION_UNREAD":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.conversationId
            ? { ...conv, unread_count: action.payload.unreadCount }
            : conv
        ),
      };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children?: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // WebSocket event handler
  const handleWebSocketEvent: WebSocketEventHandler = useCallback(
    (type, data) => {
      switch (type) {
        case "connected":
          dispatch({ type: "SET_CONNECTED", payload: true });
          break;

        case "disconnected":
          dispatch({ type: "SET_CONNECTED", payload: false });
          break;

        case "error":
          dispatch({ type: "SET_ERROR", payload: data });
          dispatch({ type: "SET_CONNECTED", payload: false });
          break;

        case "new_message":
          if (data) {
            dispatch({ type: "ADD_MESSAGE", payload: data });
            // Update unread count for conversation
            if (
              data.conversation_id !==
              websocketService.getCurrentConversationId()
            ) {
              // Message is from a different conversation, increment unread count
              const conversation = state.conversations.find(
                (c: Conversation) => c.id === data.conversation_id
              );
              if (conversation) {
                dispatch({
                  type: "UPDATE_CONVERSATION_UNREAD",
                  payload: {
                    conversationId: data.conversation_id,
                    unreadCount: conversation.unread_count + 1,
                  },
                });
              }
            }
          }
          break;

        case "typing":
          if (data?.user) {
            dispatch({
              type: "ADD_TYPING_INDICATOR",
              payload: {
                conversationId:
                  websocketService.getCurrentConversationId() || 0,
                userId: data.user.id,
                userName: `${data.user.first_name} ${data.user.last_name}`,
                timestamp: data.timestamp,
              },
            });
          }
          break;

        case "stop_typing":
          if (data?.user) {
            dispatch({
              type: "REMOVE_TYPING_INDICATOR",
              payload: {
                conversationId:
                  websocketService.getCurrentConversationId() || 0,
                userId: data.user.id,
              },
            });
          }
          break;
      }
    },
    [state.conversations]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    try {
      // Check if websocketService is properly initialized
      if (websocketService && typeof websocketService.addEventListener === 'function') {
        websocketService.addEventListener(handleWebSocketEvent);
      } else {
        console.error("WebSocket service not properly initialized");
        dispatch({ type: "SET_ERROR", payload: "Error inicializando conexión de chat" });
      }
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      dispatch({ type: "SET_ERROR", payload: "Error configurando conexión de chat" });
    }

    // Proper cleanup: remove listener and disconnect subscription (not global socket)
    return () => {
      try {
        if (websocketService && typeof websocketService.removeEventListener === 'function') {
          websocketService.removeEventListener(handleWebSocketEvent);
        }
        // Do not hard-disconnect here; screens manage subscribe/unsubscribe per conversation
      } catch (cleanupErr) {
        console.error("WebSocket cleanup error:", cleanupErr);
      }
    };
  }, [handleWebSocketEvent]);

  // Ensure WebSocket is connected globally when the provider mounts
  useEffect(() => {
    websocketService.connect();
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: undefined });

    try {
      const response = await chatService.getConversations();
      const conversations = response.conversations || [];
      dispatch({ type: "SET_CONVERSATIONS", payload: conversations });

      // Cache conversations for offline use
      try {
        await AsyncStorage.setItem(
          "cached_conversations",
          JSON.stringify(conversations)
        );
      } catch (cacheError) {
        console.error("Error caching conversations:", cacheError);
      }
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });

      // Try to load cached conversations
      try {
        const cached = await AsyncStorage.getItem("cached_conversations");
        if (cached) {
          const cachedConversations = JSON.parse(cached);
          dispatch({ type: "SET_CONVERSATIONS", payload: cachedConversations });
        }
      } catch (cacheError) {
        console.error("Error loading cached conversations:", cacheError);
      }
    }
  }, []);

  // Load specific conversation
  const loadConversation = useCallback(async (conversationId: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: undefined });

    try {
      const response = await chatService.getConversation(conversationId);
      dispatch({
        type: "SET_CURRENT_CONVERSATION",
        payload: response.conversation,
      });
      dispatch({ type: "SET_MESSAGES", payload: response.messages });

      // Subscribe to WebSocket for this conversation (avoid duplicate subscriptions)
      const currentId = websocketService.getCurrentConversationId();
      if (currentId && currentId !== conversationId) {
        websocketService.unsubscribeFromConversation();
      }
      websocketService.subscribeToConversation(conversationId);

      // Mark conversation as read
      await chatService.markConversationAsRead(conversationId);
      dispatch({
        type: "UPDATE_CONVERSATION_UNREAD",
        payload: { conversationId, unreadCount: 0 },
      });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (conversationId: number, content: string) => {
      if (!content.trim()) {
        return;
      }

      try {
        const message = await chatService.sendMessage(conversationId, {
          content: content.trim(),
          message_type: "text",
        });

        // Message will be added via WebSocket, but add optimistically for better UX
        dispatch({ type: "ADD_MESSAGE", payload: message });
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message });
      }
    },
    []
  );

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await chatService.markConversationAsRead(conversationId);
      dispatch({
        type: "UPDATE_CONVERSATION_UNREAD",
        payload: { conversationId, unreadCount: 0 },
      });
    } catch (error: any) {
      console.error("Error marking conversation as read:", error.message);
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(
    async (participantId: number): Promise<Conversation | null> => {
      try {
        // Determine whether to use coach_id or user_id based on current user role
        let request: { coach_id?: number; user_id?: number } = {};
        try {
          const userDataString = await AsyncStorage.getItem("userData");
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            if (userData?.role === "coach") {
              request = { user_id: participantId };
            } else {
              request = { coach_id: participantId };
            }
          } else {
            // Fallback: assume user wants to chat with coach
            request = { coach_id: participantId };
          }
        } catch (_) {
          request = { coach_id: participantId };
        }

        const conversation = await chatService.createConversation(request);

        // Add to conversations list
        dispatch({
          type: "SET_CONVERSATIONS",
          payload: [...state.conversations, conversation],
        });

        return conversation;
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        return null;
      }
    },
    [state.conversations]
  );

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
    typingIndicators: state.typingIndicators,

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
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};
