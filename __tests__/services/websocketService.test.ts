import websocketService from '../../services/websocketService';

// Mock ActionCable
jest.mock('@rails/actioncable', () => ({
  createConsumer: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const { createConsumer } = require('@rails/actioncable');
const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('WebSocketService', () => {
  let mockConsumer: any;
  let mockSubscription: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Force reset WebSocket service to initial state
    try {
      websocketService.disconnect();
    } catch (e) {
      // Ignore errors on disconnect
    }
    
    // Force reset all private properties
    Object.assign(websocketService as any, {
      consumer: null,
      subscription: null,
      currentConversationId: null,
      eventHandlers: [],
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      isConnecting: false,
      manualUnsubscribe: false
    });
    
    mockSubscription = {
      unsubscribe: jest.fn(),
      perform: jest.fn(),
    };
    
    mockConsumer = {
      subscriptions: {
        create: jest.fn(() => mockSubscription),
      },
      disconnect: jest.fn(),
      connection: {
        isOpen: jest.fn(() => false),
      },
    };
    
    createConsumer.mockReturnValue(mockConsumer);
    AsyncStorage.getItem.mockResolvedValue('mock-token');
  });

  describe('connect', () => {
    it('should establish websocket connection successfully', async () => {
      // Act
      await websocketService.connect();

      // Assert
      expect(createConsumer).toHaveBeenCalledWith(expect.stringContaining('token=mock-token'));
    });

    it('should not connect when no token available', async () => {
      // Arrange
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      // Act
      await websocketService.connect();

      // Assert
      expect(createConsumer).not.toHaveBeenCalled();
    });

    it('should not create multiple connections', async () => {
      // Act
      await websocketService.connect();
      await websocketService.connect();

      // Assert
      expect(createConsumer).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should disconnect websocket successfully', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();

      // Act
      websocketService.disconnect();

      // Assert
      expect(mockConsumer.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect when not connected', () => {
      // Act & Assert - should not throw
      expect(() => websocketService.disconnect()).not.toThrow();
    });
  });

  describe('isConnected', () => {
    it('should return false initially', () => {
      // Act & Assert
      expect(websocketService.isConnected()).toBe(false);
    });

    it('should return true when connected', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();

      // Act & Assert
      expect(websocketService.isConnected()).toBe(true);
    });

    it('should return false after disconnect', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      
      // Mock disconnect behavior - consumer becomes null
      mockConsumer.connection.isOpen.mockReturnValue(false);
      websocketService.disconnect();

      // Act & Assert
      expect(websocketService.isConnected()).toBe(false);
    });
  });

  describe('subscribeToConversation', () => {
    it('should subscribe to conversation successfully', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      const conversationId = 1;

      // Act
      websocketService.subscribeToConversation(conversationId);

      // Assert
      expect(mockConsumer.subscriptions.create).toHaveBeenCalledWith(
        {
          channel: 'ChatChannel',
          conversation_id: conversationId,
        },
        expect.objectContaining({
          connected: expect.any(Function),
          disconnected: expect.any(Function),
          received: expect.any(Function),
          rejected: expect.any(Function),
        })
      );
    });

    it('should unsubscribe from previous conversation before subscribing to new one', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      websocketService.subscribeToConversation(1);
      
      // Act
      websocketService.subscribeToConversation(2);

      // Assert
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockConsumer.subscriptions.create).toHaveBeenCalledTimes(2);
    });

    it('should not subscribe when not connected', () => {
      // Act
      websocketService.subscribeToConversation(1);

      // Assert
      expect(mockConsumer.subscriptions.create).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribeFromConversation', () => {
    it('should unsubscribe from conversation successfully', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      websocketService.subscribeToConversation(1);

      // Act
      websocketService.unsubscribeFromConversation();

      // Assert
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(websocketService.getCurrentConversationId()).toBeNull();
    });

    it('should handle unsubscribe when no subscription exists', () => {
      // Act & Assert - should not throw
      expect(() => websocketService.unsubscribeFromConversation()).not.toThrow();
    });
  });

  describe('sendTyping', () => {
    it('should send typing indicator successfully', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      const conversationId = 1;
      websocketService.subscribeToConversation(conversationId);

      // Act
      websocketService.sendTyping();

      // Assert
      expect(mockSubscription.perform).toHaveBeenCalledWith('typing', {
        conversation_id: conversationId,
      });
    });

    it('should not send typing when not subscribed', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();

      // Act
      websocketService.sendTyping();

      // Assert
      expect(mockSubscription.perform).not.toHaveBeenCalled();
    });
  });

  describe('sendStopTyping', () => {
    it('should send stop typing indicator successfully', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      const conversationId = 1;
      websocketService.subscribeToConversation(conversationId);

      // Act
      websocketService.sendStopTyping();

      // Assert
      expect(mockSubscription.perform).toHaveBeenCalledWith('stop_typing', {
        conversation_id: conversationId,
      });
    });

    it('should not send stop typing when not subscribed', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();

      // Act
      websocketService.sendStopTyping();

      // Assert
      expect(mockSubscription.perform).not.toHaveBeenCalled();
    });
  });

  describe('addEventListener', () => {
    it('should add event listener successfully', () => {
      // Arrange
      const handler = jest.fn();

      // Act
      websocketService.addEventListener(handler);

      // Assert - We can't directly test the internal array, but we can test that it doesn't throw
      expect(() => websocketService.addEventListener(handler)).not.toThrow();
    });
  });

  describe('removeEventListener', () => {
    it('should remove event listener successfully', () => {
      // Arrange
      const handler = jest.fn();
      websocketService.addEventListener(handler);

      // Act
      websocketService.removeEventListener(handler);

      // Assert - Should not throw
      expect(() => websocketService.removeEventListener(handler)).not.toThrow();
    });

    it('should handle removing non-existent handler', () => {
      // Arrange
      const handler = jest.fn();

      // Act & Assert - should not throw
      expect(() => websocketService.removeEventListener(handler)).not.toThrow();
    });
  });

  describe('getCurrentConversationId', () => {
    it('should return null initially', () => {
      // Act & Assert
      expect(websocketService.getCurrentConversationId()).toBeNull();
    });

    it('should return conversation ID after subscription', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      const conversationId = 1;

      // Act
      websocketService.subscribeToConversation(conversationId);

      // Assert
      expect(websocketService.getCurrentConversationId()).toBe(conversationId);
    });

    it('should return null after unsubscription', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      websocketService.subscribeToConversation(1);

      // Act
      websocketService.unsubscribeFromConversation();

      // Assert
      expect(websocketService.getCurrentConversationId()).toBeNull();
    });
  });

  describe('Message Handling', () => {
    let subscriptionCallbacks: any;

    beforeEach(async () => {
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      websocketService.subscribeToConversation(1);
      
      // Capture the callbacks passed to subscription.create
      subscriptionCallbacks = mockConsumer.subscriptions.create.mock.calls[0][1];
    });

    it('should handle new_message events', () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);
      const messageData = {
        type: 'new_message',
        message: { id: 1, content: 'Hello', user_id: 2 }
      };

      // Act
      subscriptionCallbacks.received(messageData);

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('new_message', messageData.message);
    });

    it('should handle typing events', () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);
      const typingData = {
        type: 'typing',
        user: { id: 2, name: 'John' },
        timestamp: '2024-01-01T10:00:00Z'
      };

      // Act
      subscriptionCallbacks.received(typingData);

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('typing', {
        user: typingData.user,
        timestamp: typingData.timestamp
      });
    });

    it('should handle stop_typing events', () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);
      const stopTypingData = {
        type: 'stop_typing',
        user: { id: 2, name: 'John' },
        timestamp: '2024-01-01T10:00:00Z'
      };

      // Act
      subscriptionCallbacks.received(stopTypingData);

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('stop_typing', {
        user: stopTypingData.user,
        timestamp: stopTypingData.timestamp
      });
    });

    it('should handle unknown message types', () => {
      // Arrange
      const unknownData = {
        type: 'unknown_type',
        data: 'some data'
      };

      // Act & Assert - should not throw
      expect(() => subscriptionCallbacks.received(unknownData)).not.toThrow();
    });

    it('should handle messages without required data', () => {
      // Arrange
      const invalidMessages = [
        { type: 'new_message' }, // missing message
        { type: 'typing' }, // missing user
        { type: 'stop_typing' } // missing user
      ];

      // Act & Assert - should not throw
      invalidMessages.forEach(msg => {
        expect(() => subscriptionCallbacks.received(msg)).not.toThrow();
      });
    });
  });

  describe('Event Handler Management', () => {
    it('should notify multiple event handlers', async () => {
      // Arrange
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      websocketService.addEventListener(handler1);
      websocketService.addEventListener(handler2);

      // Act - trigger connected event
      await websocketService.connect();

      // Assert
      expect(handler1).toHaveBeenCalledWith('connected', undefined);
      expect(handler2).toHaveBeenCalledWith('connected', undefined);
    });

    it('should handle errors in event handlers gracefully', async () => {
      // Arrange
      const faultyHandler = jest.fn(() => { throw new Error('Handler error'); });
      const normalHandler = jest.fn();
      websocketService.addEventListener(faultyHandler);
      websocketService.addEventListener(normalHandler);

      // Act
      await websocketService.connect();

      // Assert - normal handler should still be called despite faulty handler
      expect(normalHandler).toHaveBeenCalledWith('connected', undefined);
    });

    it('should handle uninitialized event handlers', () => {
      // Arrange - Force eventHandlers to be undefined
      (websocketService as any).eventHandlers = undefined;

      // Act & Assert - should not throw
      expect(() => websocketService.addEventListener(jest.fn())).not.toThrow();
    });

    it('should handle non-function handlers', () => {
      // Arrange
      (websocketService as any).eventHandlers = ['not a function'];

      // Act & Assert - should not throw
      expect(async () => await websocketService.connect()).not.toThrow();
    });
  });

  describe('Connection Error Handling', () => {
    it('should handle connection errors', async () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);
      const connectionError = new Error('Connection failed');
      createConsumer.mockImplementationOnce(() => { throw connectionError; });

      // Act
      await websocketService.connect();

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('error', connectionError);
    });

    it('should handle AsyncStorage errors', async () => {
      // Arrange
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      // Act & Assert - should not throw
      await expect(websocketService.connect()).resolves.not.toThrow();
    });
  });

  describe('Subscription Callbacks', () => {
    let subscriptionCallbacks: any;

    beforeEach(async () => {
      mockConsumer.connection.isOpen.mockReturnValue(true);
      await websocketService.connect();
      websocketService.subscribeToConversation(1);
      subscriptionCallbacks = mockConsumer.subscriptions.create.mock.calls[0][1];
    });

    it('should handle subscription connected callback', () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);

      // Act
      subscriptionCallbacks.connected();

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('connected', undefined);
    });

    it('should handle subscription disconnected callback', () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);

      // Act
      subscriptionCallbacks.disconnected();

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('disconnected', undefined);
    });

    it('should handle subscription rejected callback', () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);

      // Act
      subscriptionCallbacks.rejected();

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('error', 'Subscription rejected - check permissions');
    });

    it('should not trigger reconnection on manual unsubscribe', () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);

      // Act
      websocketService.unsubscribeFromConversation();
      subscriptionCallbacks.disconnected();

      // Assert - should not call handleReconnection
      expect(mockHandler).not.toHaveBeenCalledWith('error', expect.stringContaining('max reconnection attempts'));
    });
  });

  describe('isConnected Edge Cases', () => {
    it('should handle connection check errors', async () => {
      // Arrange
      await websocketService.connect();
      mockConsumer.connection.isOpen.mockImplementationOnce(() => { throw new Error('Check failed'); });

      // Act & Assert - should fallback to checking consumer existence
      expect(websocketService.isConnected()).toBe(true);
    });

    it('should return false when consumer is null', () => {
      // Arrange
      websocketService.disconnect();

      // Act & Assert
      expect(websocketService.isConnected()).toBe(false);
    });
  });

  describe('Reconnection Logic', () => {
    it('should handle max reconnection attempts', async () => {
      // Arrange
      const mockHandler = jest.fn();
      websocketService.addEventListener(mockHandler);
      await websocketService.connect();
      websocketService.subscribeToConversation(1);
      
      // Set reconnectAttempts to max
      (websocketService as any).reconnectAttempts = 5;
      
      const subscriptionCallbacks = mockConsumer.subscriptions.create.mock.calls[0][1];

      // Act
      subscriptionCallbacks.disconnected();

      // Assert
      expect(mockHandler).toHaveBeenCalledWith('error', 'Connection lost - max reconnection attempts reached');
    });

    it('should attempt reconnection with exponential backoff', async () => {
      // Arrange
      mockConsumer.connection.isOpen.mockReturnValue(false);
      const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

      await websocketService.connect();
      websocketService.subscribeToConversation(1);
      const subscriptionCallbacks = mockConsumer.subscriptions.create.mock.calls[0][1];
      
      const initialCallCount = createConsumer.mock.calls.length;

      // Act - trigger disconnection to start reconnection process
      subscriptionCallbacks.disconnected();

      // Assert
      // Should call setTimeout with 1000ms delay for first reconnection attempt
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      setTimeoutSpy.mockRestore();
    });

    it('should reset reconnection state on successful connection', async () => {
      // Arrange
      (websocketService as any).reconnectAttempts = 3;

      // Act
      await websocketService.connect();

      // Assert
      expect((websocketService as any).reconnectAttempts).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle removeEventListener when eventHandlers is uninitialized', () => {
      // Arrange
      (websocketService as any).eventHandlers = undefined;
      const handler = jest.fn();

      // Act & Assert
      expect(() => websocketService.removeEventListener(handler)).not.toThrow();
    });

    it('should initialize eventHandlers array when uninitialized', () => {
      // Arrange
      (websocketService as any).eventHandlers = undefined;

      // Act
      websocketService.addEventListener(jest.fn());

      // Assert
      expect((websocketService as any).eventHandlers).toEqual(expect.any(Array));
    });

    it('should handle disconnect when already disconnected', () => {
      // Act & Assert
      expect(() => websocketService.disconnect()).not.toThrow();
    });

    it('should reset reconnection state on successful connection', async () => {
      // Arrange
      (websocketService as any).reconnectAttempts = 3;

      // Act
      await websocketService.connect();

      // Assert
      expect((websocketService as any).reconnectAttempts).toBe(0);
    });
  });
});
