import { apiClient } from "./apiClient";
import {
  ChallengeAttempt,
  ChallengeAttemptResponse,
  CompleteAttemptData,
} from "../types/challenge";

export const challengeAttemptService = {
  // Iniciar un nuevo intento de desafío
  startAttempt: async (challengeId: number): Promise<ChallengeAttempt> => {
    try {
      const response = await apiClient.post(
        `/api/v1/challenges/${challengeId}/attempts`
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Error al iniciar el intento");
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error(
          error.response.data.message || "Ya tienes un intento activo"
        );
      }
      if (error.response?.status === 403) {
        throw new Error("No tienes acceso a este desafío");
      }
      if (error.response?.status === 422) {
        throw new Error("Este desafío no está activo");
      }
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  },

  // Completar un intento
  completeAttempt: async (
    challengeId: number,
    attemptId: number,
    data: CompleteAttemptData
  ): Promise<{
    attempt: ChallengeAttempt;
    leaderboard_position?: number;
    is_new_personal_best?: boolean;
  }> => {
    try {
      const response = await apiClient.put(
        `/api/v1/challenges/${challengeId}/attempts/${attemptId}/complete`,
        data
      );
      if (response.data.success) {
        return {
          attempt: response.data.data,
          leaderboard_position: response.data.leaderboard_position,
          is_new_personal_best: response.data.is_new_personal_best,
        };
      }
      throw new Error(response.data.message || "Error al completar el intento");
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error(
          error.response.data.message ||
            "Datos inválidos para completar el intento"
        );
      }
      if (error.response?.status === 404) {
        throw new Error("Intento no encontrado");
      }
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  },

  // Abandonar un intento
  abandonAttempt: async (
    challengeId: number,
    attemptId: number
  ): Promise<ChallengeAttempt> => {
    try {
      const response = await apiClient.put(
        `/api/v1/challenges/${challengeId}/attempts/${attemptId}/abandon`
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Error al abandonar el intento");
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error(
          error.response.data.message || "No se puede abandonar este intento"
        );
      }
      if (error.response?.status === 404) {
        throw new Error("Intento no encontrado");
      }
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  },

  // Obtener historial de intentos del usuario para un desafío específico
  getMyAttempts: async (challengeId: number): Promise<ChallengeAttempt[]> => {
    try {
      const response = await apiClient.get(
        `/api/v1/challenges/${challengeId}/attempts`
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Error al obtener el historial");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Desafío no encontrado");
      }
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  },

  // Obtener todos los intentos del usuario (sin filtrar por desafío)
  getAllMyAttempts: async (): Promise<ChallengeAttempt[]> => {
    try {
      const response = await apiClient.get("/api/v1/my-attempts");
      if (response.data.success) {
        console.log("🔍 Backend response (getAllMyAttempts):", response.data.data);
        console.log("🔍 First attempt challenge data:", response.data.data[0]?.challenge);
        return response.data.data;
      }
      throw new Error(response.data.message || "Error al obtener el historial");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("No tienes intentos registrados");
      }
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  },

  // Obtener detalle de un intento específico
  getAttemptDetail: async (
    challengeId: number,
    attemptId: number
  ): Promise<ChallengeAttempt> => {
    try {
      const response = await apiClient.get(
        `/api/v1/challenges/${challengeId}/attempts/${attemptId}`
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Error al obtener el intento");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Intento no encontrado");
      }
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  },
};
