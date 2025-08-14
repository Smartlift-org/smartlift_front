import { apiClient } from "./apiClient";
import {
  PushTokenRegistration,
  PushTokenResponse,
} from "../types/notifications";

class PushTokenService {
  async updatePushToken(
    tokenData: PushTokenRegistration
  ): Promise<PushTokenResponse> {
    try {
      const response = await apiClient.put("/push-token", tokenData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error(
          "No tienes autorización para actualizar el token de notificaciones"
        );
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors || [];
        throw new Error(
          errors.join(", ") || "Token de notificaciones inválido"
        );
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al actualizar token de notificaciones");
      }
    }
  }

  async deletePushToken(): Promise<PushTokenResponse> {
    try {
      const response = await apiClient.delete("/push-token");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error(
          "No tienes autorización para eliminar el token de notificaciones"
        );
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al eliminar token de notificaciones");
      }
    }
  }

  async toggleNotifications(): Promise<PushTokenResponse> {
    try {
      const response = await apiClient.put("/push-notifications/toggle");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error(
          "No tienes autorización para cambiar configuración de notificaciones"
        );
      } else if (error.response?.status >= 500) {
        throw new Error("Error del servidor. Intenta más tarde");
      } else {
        throw new Error("Error al cambiar configuración de notificaciones");
      }
    }
  }
}

export default new PushTokenService();
