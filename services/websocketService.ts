import "./ws-polyfill";
import { createConsumer, Consumer, Subscription } from "@rails/actioncable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebSocketMessage } from "../types/chat";
import { WEBSOCKET_URL, TOKEN_KEY } from "./apiClient";
import logger from "../utils/logger";

export type WebSocketEventType =
  | "new_message"
  | "typing"
  | "stop_typing"
  | "connected"
  | "disconnected"
  | "error";

export interface WebSocketEventHandler {
  (type: WebSocketEventType, data?: any): void;
}

class WebSocketService {
  private consumer: Consumer | null = null;
  private subscription: Subscription | null = null;
  private currentConversationId: number | null = null;
  private eventHandlers: WebSocketEventHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private manualUnsubscribe = false;
  async connect(): Promise<void> {
    if (this.isConnecting || this.consumer) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        logger.debug(
          "WebSocket: No authentication token found, user not logged in"
        );
        this.isConnecting = false;
        return;
      }

      const wsUrl = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;

      this.consumer = createConsumer(wsUrl);

      // Simple connection success logging
      logger.info("WebSocket consumer created successfully");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.notifyHandlers("connected");
    } catch (error) {
      logger.error("Error connecting to WebSocket:", error);
      this.notifyHandlers("error", error);
    } finally {
      this.isConnecting = false;
    }
  }

  subscribeToConversation(conversationId: number): void {
    if (!this.consumer) {
      logger.error("WebSocket not connected. Call connect() first.");
      return;
    }

    if (this.subscription) {
      // Mark as manual to avoid triggering auto-reconnect when switching conversations
      this.manualUnsubscribe = true;
      this.subscription.unsubscribe();
    }

    this.currentConversationId = conversationId;

    this.subscription = this.consumer.subscriptions.create(
      {
        channel: "ChatChannel",
        conversation_id: conversationId,
      },
      {
        connected: () => {
          logger.debug(`Subscribed to conversation ${conversationId}`);
          this.notifyHandlers("connected");
        },

        disconnected: () => {
          logger.debug(`Unsubscribed from conversation ${conversationId}`);
          // If this was a manual unsubscribe (switching conversations or intentional disconnect),
          // do not emit a global disconnected event or trigger reconnection.
          if (this.manualUnsubscribe) {
            this.manualUnsubscribe = false;
            return;
          }

          this.notifyHandlers("disconnected");
          this.handleReconnection();
        },

        received: (data: WebSocketMessage) => {
          this.handleWebSocketMessage(data);
        },

        rejected: () => {
          logger.error(
            `Subscription to conversation ${conversationId} was rejected`
          );
          this.notifyHandlers(
            "error",
            "Subscription rejected - check permissions"
          );
        },
      }
    );
  }

  unsubscribeFromConversation(): void {
    if (this.subscription) {
      // Mark as manual so we don't auto-reconnect from the subscription callback
      this.manualUnsubscribe = true;
      this.subscription.unsubscribe();
      this.subscription = null;
      this.currentConversationId = null;
    }
  }

  sendTyping(): void {
    if (this.subscription && this.currentConversationId) {
      this.subscription.perform("typing", {
        conversation_id: this.currentConversationId,
      });
    }
  }

  sendStopTyping(): void {
    if (this.subscription && this.currentConversationId) {
      this.subscription.perform("stop_typing", {
        conversation_id: this.currentConversationId,
      });
    }
  }

  disconnect(): void {
    // Prevent auto-reconnect on intentional disconnects
    this.manualUnsubscribe = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.consumer) {
      this.consumer.disconnect();
      this.consumer = null;
    }

    this.currentConversationId = null;
    this.reconnectAttempts = 0;
    this.notifyHandlers("disconnected");
  }

  addEventListener(handler: WebSocketEventHandler): void {
    if (!this.eventHandlers) {
      this.eventHandlers = [];
    }
    this.eventHandlers.push(handler);
  }

  removeEventListener(handler: WebSocketEventHandler): void {
    if (!this.eventHandlers) {
      this.eventHandlers = [];
      return;
    }
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  isConnected(): boolean {
    try {
      return this.consumer?.connection?.isOpen() || false;
    } catch (error) {
      // Fallback if isOpen() method is not available
      return this.consumer !== null;
    }
  }

  getCurrentConversationId(): number | null {
    return this.currentConversationId;
  }

  private handleWebSocketMessage(data: WebSocketMessage): void {
    logger.debug("Received WebSocket message:", data);

    switch (data.type) {
      case "new_message":
        if (data.message) {
          this.notifyHandlers("new_message", data.message);
        }
        break;

      case "typing":
        if (data.user) {
          this.notifyHandlers("typing", {
            user: data.user,
            timestamp: data.timestamp,
          });
        }
        break;

      case "stop_typing":
        if (data.user) {
          this.notifyHandlers("stop_typing", {
            user: data.user,
            timestamp: data.timestamp,
          });
        }
        break;

      default:
        logger.debug("Unknown WebSocket message type:", data.type);
    }
  }

  private notifyHandlers(type: WebSocketEventType, data?: any): void {
    if (!this.eventHandlers || !Array.isArray(this.eventHandlers)) {
      logger.warn("WebSocket event handlers not properly initialized");
      return;
    }
    
    this.eventHandlers.forEach((handler) => {
      try {
        if (typeof handler === 'function') {
          handler(type, data);
        }
      } catch (error) {
        logger.error("Error in WebSocket event handler:", error);
      }
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error("Max reconnection attempts reached");
      this.notifyHandlers(
        "error",
        "Connection lost - max reconnection attempts reached"
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    logger.info(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (!this.isConnected()) {
        logger.info("Attempting to reconnect...");
        const previousConversationId = this.currentConversationId;
        this.consumer = null;
        this.connect()
          .then(() => {
            if (previousConversationId) {
              this.subscribeToConversation(previousConversationId);
            }
          })
          .catch((error) => {
            logger.error("Reconnection failed:", error);
          });
      }
    }, delay);
  }
}

export default new WebSocketService();
