import { apiClient } from "./apiClient";
import { ChallengeAttempt, CompleteAttemptData } from "../types/challenge";
import { executeApiCall, handleApiResponse } from "../utils/serviceUtils";

export const challengeAttemptService = {
  startAttempt: async (challengeId: number): Promise<ChallengeAttempt> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.post(
          `/api/v1/challenges/${challengeId}/attempts`
        );
        return handleApiResponse<ChallengeAttempt>(response, "Error al iniciar el intento");
      },
      {
        409: "Ya tienes un intento activo",
        403: "No tienes acceso a este desafío",
        422: "Este desafío no está activo"
      }
    );
  },

  completeAttempt: async (
    challengeId: number,
    attemptId: number,
    data: CompleteAttemptData
  ): Promise<{
    attempt: ChallengeAttempt;
    leaderboard_position?: number;
    is_new_personal_best?: boolean;
  }> => {
    return executeApiCall(
      async () => {
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
      },
      {
        422: "Datos inválidos para completar el intento",
        404: "Intento no encontrado"
      }
    );
  },

  abandonAttempt: async (
    challengeId: number,
    attemptId: number
  ): Promise<ChallengeAttempt> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.put(
          `/api/v1/challenges/${challengeId}/attempts/${attemptId}/abandon`
        );
        return handleApiResponse<ChallengeAttempt>(response, "Error al abandonar el intento");
      },
      {
        422: "No se puede abandonar este intento",
        404: "Intento no encontrado"
      }
    );
  },

  getMyAttempts: async (challengeId: number): Promise<ChallengeAttempt[]> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.get(
          `/api/v1/challenges/${challengeId}/attempts`
        );
        return handleApiResponse<ChallengeAttempt[]>(response, "Error al obtener el historial");
      },
      { 404: "Desafío no encontrado" }
    );
  },

  getAllMyAttempts: async (): Promise<ChallengeAttempt[]> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.get("/api/v1/my-attempts");
        return handleApiResponse<ChallengeAttempt[]>(response, "Error al obtener el historial");
      },
      { 404: "No tienes intentos registrados" }
    );
  },

  getAttemptDetail: async (
    challengeId: number,
    attemptId: number
  ): Promise<ChallengeAttempt> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.get(
          `/api/v1/challenges/${challengeId}/attempts/${attemptId}`
        );
        return handleApiResponse<ChallengeAttempt>(response, "Error al obtener el intento");
      },
      { 404: "Intento no encontrado" }
    );
  },
};
