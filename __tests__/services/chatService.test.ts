import chatService from '../../services/chatService';
import { apiClient } from '../../services/apiClient';
import { CreateConversationRequest, CreateMessageRequest } from '../../types/chat';

// Mock logger
jest.mock('../../utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

const logger = require('../../utils/logger');

// Mock dependencies
jest.mock('../../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient & { patch: jest.MockedFunction<any> }>;

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should return conversations on success', async () => {
      const mockResponse = {
        data: {
          conversations: [
            {
              id: 1,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              unread_count: 2,
              other_participant: {
                id: 2,
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                role: 'coach'
              },
              last_message: {
                id: 1,
                content: 'Hello!',
                created_at: '2024-01-01T00:00:00Z',
                sender_id: 2
              }
            }
          ]
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      const result = await chatService.getConversations();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/conversations', { params: { page: 1 } });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle pagination', async () => {
      const mockResponse = { data: { conversations: [] } };
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      await chatService.getConversations(2);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/conversations', { params: { page: 2 } });
    });

    it('should throw error on 401 unauthorized', async () => {
      const mockError = { response: { status: 401 } };
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(chatService.getConversations()).rejects.toThrow(
        'No tienes autorización para ver las conversaciones'
      );
    });

    it('should throw error on 403 forbidden', async () => {
      const mockError = { response: { status: 403 } };
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(chatService.getConversations()).rejects.toThrow(
        'No tienes permisos para acceder a esta función'
      );
    });

    it('should handle empty response', async () => {
      const mockResponse = { data: null };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await chatService.getConversations();
      expect(result).toEqual({ conversations: [] });
    });

    it('should handle array response format', async () => {
      const mockConversations = [{
        id: 1,
        user: { id: 1, first_name: 'User', last_name: 'Test' },
        created_at: '2024-01-01T00:00:00Z'
      }];
      
      const mockResponse = { data: mockConversations };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await chatService.getConversations();
      expect(result.conversations[0].other_participant).toEqual(mockConversations[0].user);
    });
  });

  describe('getConversation', () => {
    it('should return conversation details on success', async () => {
      const mockResponse = {
        data: {
          conversation: {
            id: 1,
            created_at: '2024-01-01T00:00:00Z',
            other_participant: {
              id: 2,
              first_name: 'Coach',
              last_name: 'Test'
            }
          },
          messages: [
            {
              id: 1,
              content: 'Hello!',
              sender_id: 2,
              created_at: '2024-01-01T00:00:00Z'
            }
          ]
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      const result = await chatService.getConversation(1);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/conversations/1', { params: { page: 1 } });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle pagination for messages', async () => {
      const mockResponse = { data: { conversation: {}, messages: [] } };
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      await chatService.getConversation(1, 3);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/conversations/1', { params: { page: 3 } });
    });

    it('should throw error on 404 not found', async () => {
      const mockError = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(chatService.getConversation(1)).rejects.toThrow(
        'Conversación no encontrada'
      );
    });

    it('should handle 401 authentication error when getting conversation', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized access' }
        }
      };

      (apiClient.get as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(chatService.getConversation(1)).rejects.toThrow(
        'No tienes autorización para ver esta conversación'
      );
    });

    it('should handle 403 forbidden error when getting conversation', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { message: 'Forbidden access' }
        }
      };

      (apiClient.get as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(chatService.getConversation(1)).rejects.toThrow(
        'No tienes permisos para acceder a esta conversación'
      );
    });

    it('should handle 500 server error when getting conversation', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      (apiClient.get as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(chatService.getConversation(1)).rejects.toThrow(
        'Error del servidor. Intenta más tarde'
      );
    });

    it('should handle generic error when getting conversation', async () => {
      const errorResponse = {
        message: 'Network error'
      };

      (apiClient.get as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(chatService.getConversation(1)).rejects.toThrow(
        'Error al cargar la conversación'
      );
    });
  });

  describe('createConversation', () => {
    it('should create conversation successfully', async () => {
      const mockRequest = { coach_id: 2 };
      const mockResponse = {
        data: {
          id: 1,
          created_at: '2024-01-01T00:00:00Z',
          other_participant: {
            id: 2,
            first_name: 'Coach',
            last_name: 'Test'
          }
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      const result = await chatService.createConversation(mockRequest);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/conversations', mockRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when no data returned', async () => {
      const mockRequest = { coach_id: 2 };
      const mockResponse = { data: null };

      mockApiClient.post.mockResolvedValue(mockResponse);

      await expect(chatService.createConversation(mockRequest)).rejects.toThrow(
        'Error al crear la conversación'
      );
    });

    it('should throw error when no ID returned', async () => {
      const mockRequest = { coach_id: 2 };
      const mockResponse = { data: { created_at: '2024-01-01T00:00:00Z' } };

      mockApiClient.post.mockResolvedValue(mockResponse);

      await expect(chatService.createConversation(mockRequest)).rejects.toThrow(
        'Error al crear la conversación'
      );
    });

    it('should handle validation errors', async () => {
      const mockRequest = { coach_id: 2 };
      const mockError = { 
        response: { 
          status: 422,
          data: { errors: ['Participant must exist', 'Invalid data'] }
        }
      };

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(chatService.createConversation(mockRequest)).rejects.toThrow(
        'Participant must exist, Invalid data'
      );
    });

    it('should create conversation with user_id successfully', async () => {
      const mockRequest = { user_id: 3 };
      const mockResponse = {
        data: {
          id: 2,
          created_at: '2024-01-01T00:00:00Z',
          other_participant: {
            id: 3,
            first_name: 'User',
            last_name: 'Test'
          }
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      const result = await chatService.createConversation(mockRequest);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/conversations', mockRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle 401 authentication error when creating conversation', async () => {
      const request: CreateConversationRequest = {
        coach_id: 2
      };

      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(chatService.createConversation(request)).rejects.toThrow('No tienes autorización para crear conversaciones');
    });

    it('should handle 403 forbidden error when creating conversation', async () => {
      const request: CreateConversationRequest = {
        coach_id: 2
      };

      const errorResponse = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(chatService.createConversation(request)).rejects.toThrow('No tienes permisos para chatear con este usuario');
    });

    it('should handle 500 server error when creating conversation', async () => {
      const request: CreateConversationRequest = {
        coach_id: 2
      };

      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(chatService.createConversation(request)).rejects.toThrow('Error del servidor. Intenta más tarde');
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockMessageData = { content: 'Hello!', message_type: 'text' as const };
      const mockResponse = {
        data: {
          id: 1,
          content: 'Hello!',
          sender_id: 1,
          created_at: '2024-01-01T00:00:00Z'
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      const result = await chatService.sendMessage(1, mockMessageData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/conversations/1/messages',
        { message: mockMessageData }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty message validation', async () => {
      const mockMessageData = { content: '', message_type: 'text' as const };
      const mockError = { 
        response: { 
          status: 422,
          data: { errors: ['Content cannot be blank'] }
        }
      };

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(chatService.sendMessage(1, mockMessageData)).rejects.toThrow(
        'Content cannot be blank'
      );
    });

    it('should throw error on 404 not found', async () => {
      const mockMessageData = { content: 'Hello!', message_type: 'text' as const };
      const mockError = { response: { status: 404 } };
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(chatService.sendMessage(1, mockMessageData)).rejects.toThrow(
        'Conversación no encontrada'
      );
    });

    it('should handle 401 authentication error when sending message', async () => {
      const messageData: CreateMessageRequest = {
        content: 'Hello',
        message_type: 'text'
      };

      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(chatService.sendMessage(1, messageData)).rejects.toThrow('No tienes autorización para enviar mensajes');
    });

    it('should handle 403 forbidden error when sending message', async () => {
      const messageData: CreateMessageRequest = {
        content: 'Hello',
        message_type: 'text'
      };

      const errorResponse = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(chatService.sendMessage(1, messageData)).rejects.toThrow('No tienes permisos para enviar mensajes en esta conversación');
    });

    it('should handle 500 server error when sending message', async () => {
      const messageData: CreateMessageRequest = {
        content: 'Hello',
        message_type: 'text'
      };

      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(chatService.sendMessage(1, messageData)).rejects.toThrow('Error del servidor. Intenta más tarde');
    });

    it('should handle generic error when sending message', async () => {
      const messageData: CreateMessageRequest = {
        content: 'Hello',
        message_type: 'text'
      };

      const errorResponse = {
        message: 'Network error'
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(chatService.sendMessage(1, messageData)).rejects.toThrow('Error al enviar el mensaje');
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read successfully', async () => {
      mockApiClient.put.mockResolvedValue({ data: {} });
      
      await chatService.markConversationAsRead(1);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/conversations/1/mark_as_read');
    });

    it('should handle 403 forbidden error when marking conversation as read', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };

      mockApiClient.put.mockRejectedValueOnce(errorResponse);

      await expect(chatService.markConversationAsRead(1)).rejects.toThrow('No tienes permisos para acceder a esta conversación');
    });

    it('should handle 500 server error when marking conversation as read', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      mockApiClient.put.mockRejectedValueOnce(errorResponse);

      await expect(chatService.markConversationAsRead(1)).rejects.toThrow('Error del servidor. Intenta más tarde');
    });

    it('should handle generic error when marking conversation as read', async () => {
      const errorResponse = {
        message: 'Network error'
      };

      mockApiClient.put.mockRejectedValueOnce(errorResponse);

      await expect(chatService.markConversationAsRead(1)).rejects.toThrow('Error al marcar mensajes como leídos');
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read successfully', async () => {
      mockApiClient.put.mockResolvedValue({ data: {} });
      
      await chatService.markMessageAsRead(1, 5);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/conversations/1/messages/5/mark_as_read');
    });

    it('should handle 401 authentication error when marking message as read', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      mockApiClient.put.mockRejectedValueOnce(errorResponse);

      await expect(chatService.markMessageAsRead(1, 1)).rejects.toThrow('No tienes autorización para marcar este mensaje como leído');
    });

    it('should handle 500 server error when marking message as read', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      mockApiClient.put.mockRejectedValueOnce(errorResponse);

      await expect(chatService.markMessageAsRead(1, 1)).rejects.toThrow('Error del servidor. Intenta más tarde');
    });

    it('should handle generic error when marking message as read', async () => {
      const errorResponse = {
        message: 'Network error'
      };

      mockApiClient.put.mockRejectedValueOnce(errorResponse);

      await expect(chatService.markMessageAsRead(1, 1)).rejects.toThrow('Error al marcar el mensaje como leído');
    });
  });

  describe('canChatWith', () => {
    it('should allow user to chat with coach', () => {
      const result = chatService.canChatWith('user', 'coach');
      expect(result).toBe(true);
    });

    it('should allow coach to chat with user', () => {
      const result = chatService.canChatWith('coach', 'user');
      expect(result).toBe(true);
    });

    it('should not allow user to chat with user', () => {
      const result = chatService.canChatWith('user', 'user');
      expect(result).toBe(false);
    });

    it('should not allow coach to chat with coach', () => {
      const result = chatService.canChatWith('coach', 'coach');
      expect(result).toBe(false);
    });

    it('should not allow admin role combinations', () => {
      expect(chatService.canChatWith('admin', 'user')).toBe(false);
      expect(chatService.canChatWith('user', 'admin')).toBe(false);
      expect(chatService.canChatWith('admin', 'coach')).toBe(false);
    });

  });
});
