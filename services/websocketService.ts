import { createConsumer, Consumer, Subscription } from '@rails/actioncable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketMessage, Message, ChatUser } from '../types/chat';

export type WebSocketEventType = 'new_message' | 'typing' | 'stop_typing' | 'connected' | 'disconnected' | 'error';

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
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;

  /**
   * Initialize WebSocket connection with JWT token
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.consumer) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Backend expects token as query parameter for WebSocket connection
      const wsUrl = `ws://10.0.2.2:3000/cable?token=${encodeURIComponent(token)}`;
      
      this.consumer = createConsumer(wsUrl);
      
      this.consumer.connection.monitor.on('connected', () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.notifyHandlers('connected');
      });

      this.consumer.connection.monitor.on('disconnected', () => {
        console.log('WebSocket disconnected');
        this.notifyHandlers('disconnected');
        this.handleReconnection();
      });

      this.consumer.connection.monitor.on('rejected', () => {
        console.error('WebSocket connection rejected');
        this.notifyHandlers('error', 'Connection rejected - check authentication');
      });

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.notifyHandlers('error', error);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Subscribe to a specific conversation channel
   */
  subscribeToConversation(conversationId: number): void {
    if (!this.consumer) {
      console.error('WebSocket not connected. Call connect() first.');
      return;
    }

    // Unsubscribe from previous conversation if any
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.currentConversationId = conversationId;

    this.subscription = this.consumer.subscriptions.create(
      {
        channel: 'ChatChannel',
        conversation_id: conversationId
      },
      {
        connected: () => {
          console.log(`Subscribed to conversation ${conversationId}`);
        },

        disconnected: () => {
          console.log(`Unsubscribed from conversation ${conversationId}`);
        },

        received: (data: WebSocketMessage) => {
          this.handleWebSocketMessage(data);
        },

        rejected: () => {
          console.error(`Subscription to conversation ${conversationId} was rejected`);
          this.notifyHandlers('error', 'Subscription rejected - check permissions');
        }
      }
    );
  }

  /**
   * Unsubscribe from current conversation
   */
  unsubscribeFromConversation(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      this.currentConversationId = null;
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(): void {
    if (this.subscription && this.currentConversationId) {
      this.subscription.perform('typing', {
        conversation_id: this.currentConversationId
      });
    }
  }

  /**
   * Send stop typing indicator
   */
  sendStopTyping(): void {
    if (this.subscription && this.currentConversationId) {
      this.subscription.perform('stop_typing', {
        conversation_id: this.currentConversationId
      });
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
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
    this.notifyHandlers('disconnected');
  }

  /**
   * Add event handler
   */
  addEventListener(handler: WebSocketEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventListener(handler: WebSocketEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.consumer?.connection?.isOpen() || false;
  }

  /**
   * Get current conversation ID
   */
  getCurrentConversationId(): number | null {
    return this.currentConversationId;
  }

  private handleWebSocketMessage(data: WebSocketMessage): void {
    console.log('Received WebSocket message:', data);

    switch (data.type) {
      case 'new_message':
        if (data.message) {
          this.notifyHandlers('new_message', data.message);
        }
        break;

      case 'typing':
        if (data.user) {
          this.notifyHandlers('typing', {
            user: data.user,
            timestamp: data.timestamp
          });
        }
        break;

      case 'stop_typing':
        if (data.user) {
          this.notifyHandlers('stop_typing', {
            user: data.user,
            timestamp: data.timestamp
          });
        }
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  private notifyHandlers(type: WebSocketEventType, data?: any): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(type, data);
      } catch (error) {
        console.error('Error in WebSocket event handler:', error);
      }
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyHandlers('error', 'Connection lost - max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected()) {
        console.log('Attempting to reconnect...');
        this.consumer = null; // Reset consumer
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }
}

export default new WebSocketService();
