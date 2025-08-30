import { apiClient } from "./apiClient";
import {
  Conversation,
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationRequest,
  CreateMessageRequest,
  Message,
} from "../types/chat";
import logger from "../utils/logger";

class ChatService {
  async getConversations(page: number = 1): Promise<ConversationListResponse> {
    try {
      const response = await apiClient.get("/conversations", {
        params: { page },
      });
      if (!response.data) {
        return { conversations: [] };
      }
      if (Array.isArray(response.data)) {
        const mappedConversations = response.data.map((conv: any) => {
          const otherParticipant = conv.user || conv.coach;

          return {
            ...conv,
            other_participant: otherParticipant,
          };
        });

        return { conversations: mappedConversations };
      }

      if (response.data && !response.data.conversations) {
        logger.warn("API returned object but no conversations property");
        return { conversations: [] };
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No tienes autorización para ver las conversaciones");
      } else if (error.response?.status === 403) {
        throw new Error("No tienes permisos para acceder a esta función");
      } else if (error.response?.status === 404) {
        throw new Error("No se encontraron conversaciones");
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al cargar conversaciones");
      }
    }
  }

  async getConversation(
    conversationId: number,
    page: number = 1
  ): Promise<ConversationDetailResponse> {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}`, {
        params: { page },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No tienes autorización para ver esta conversación");
      } else if (error.response?.status === 403) {
        throw new Error("No tienes permisos para acceder a esta conversación");
      } else if (error.response?.status === 404) {
        throw new Error("Conversación no encontrada");
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al cargar la conversación");
      }
    }
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation> {
    try {
      const response = await apiClient.post("/conversations", request);

      if (!response.data) {
        throw new Error(
          "El servidor no devolvió datos de conversación válidos"
        );
      }

      if (!response.data.id) {
        throw new Error("El servidor devolvió una conversación sin ID válido");
      }

      return response.data;
    } catch (error: any) {
      logger.error("createConversation error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new Error("No tienes autorización para crear conversaciones");
      } else if (error.response?.status === 403) {
        throw new Error("No tienes permisos para chatear con este usuario");
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors || [];
        throw new Error(
          errors.join(", ") || "Datos inválidos para crear la conversación"
        );
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al crear la conversación");
      }
    }
  }

  async sendMessage(
    conversationId: number,
    messageData: CreateMessageRequest
  ): Promise<Message> {
    try {
      const response = await apiClient.post(
        `/conversations/${conversationId}/messages`,
        {
          message: messageData,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No tienes autorización para enviar mensajes");
      } else if (error.response?.status === 403) {
        throw new Error(
          "No tienes permisos para enviar mensajes en esta conversación"
        );
      } else if (error.response?.status === 404) {
        throw new Error("Conversación no encontrada");
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors || [];
        throw new Error(errors.join(", ") || "El mensaje no puede estar vacío");
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al enviar el mensaje");
      }
    }
  }

  async markConversationAsRead(conversationId: number): Promise<void> {
    try {
      await apiClient.put(`/conversations/${conversationId}/mark_as_read`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error(
          "No tienes autorización para marcar mensajes como leídos"
        );
      } else if (error.response?.status === 403) {
        throw new Error("No tienes permisos para acceder a esta conversación");
      } else if (error.response?.status === 404) {
        throw new Error("Conversación no encontrada");
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al marcar mensajes como leídos");
      }
    }
  }

  async markMessageAsRead(
    conversationId: number,
    messageId: number
  ): Promise<void> {
    try {
      await apiClient.put(
        `/conversations/${conversationId}/messages/${messageId}/mark_as_read`
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error(
          "No tienes autorización para marcar este mensaje como leído"
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "No tienes permisos para marcar este mensaje como leído"
        );
      } else if (error.response?.status === 404) {
        throw new Error("Mensaje no encontrado");
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al marcar el mensaje como leído");
      }
    }
  }

  canChatWith(currentUserRole: string, targetUserRole: string): boolean {
    return (
      (currentUserRole === "user" && targetUserRole === "coach") ||
      (currentUserRole === "coach" && targetUserRole === "user")
    );
  }
}

export default new ChatService();
