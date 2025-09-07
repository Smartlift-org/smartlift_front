import { apiClient } from "./apiClient";
import { Challenge, CreateChallengeData, ChallengeLeaderboard } from "../types/challenge";
import { executeApiCall } from "../utils/serviceUtils";

export const challengeService = {
  getAvailableChallenges: async (): Promise<Challenge[]> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.get("/challenges");
        return response.data;
      },
      { 404: "No tienes un entrenador asignado" }
    );
  },

  getChallengeDetail: async (challengeId: number): Promise<Challenge> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.get(`/challenges/${challengeId}`);
        return response.data;
      },
      { 404: "Desafío no encontrado" }
    );
  },

  getChallengeLeaderboard: async (challengeId: number): Promise<ChallengeLeaderboard> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.get(
          `/challenges/${challengeId}/leaderboard`
        );
        if (response.data.success) {
          return response.data.data;
        }
        throw new Error(response.data.message || "Error al obtener el ranking");
      },
      { 404: "Desafío no encontrado" }
    );
  },

  getMyChallenges: async (): Promise<Challenge[]> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.get("/challenges/my_challenges");
        return response.data;
      },
      { 403: "Solo los entrenadores pueden acceder a esta función" }
    );
  },

  createChallenge: async (
    challengeData: CreateChallengeData
  ): Promise<Challenge> => {
    return executeApiCall(
      async () => {
        const response = await apiClient.post("/challenges", {
          challenge: challengeData,
        });
        return response.data;
      },
      { 403: "Solo los entrenadores pueden crear desafíos" }
    );
  },

  deleteChallenge: async (challengeId: number): Promise<void> => {
    return executeApiCall(
      async () => {
        await apiClient.delete(`/challenges/${challengeId}`);
      },
      {
        403: "No tienes permisos para eliminar este desafío",
        404: "Desafío no encontrado"
      }
    );
  },
};
