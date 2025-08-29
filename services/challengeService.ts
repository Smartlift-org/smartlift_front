import { apiClient } from './apiClient';
import { 
  Challenge, 
  ChallengeResponse, 
  CreateChallengeData 
} from "../types/challenge";

export const challengeService = {
  // Para usuarios - obtener desafíos disponibles
  getAvailableChallenges: async (): Promise<Challenge[]> => {
    try {
      const response = await apiClient.get('/api/v1/challenges');
      return response.data;  // Direct array like routines
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('No tienes un entrenador asignado');
      }
      if (error.response?.status === 401) {
        throw new Error('No estás autorizado');
      }
      throw new Error(error.response?.data?.error || 'Error de conexión');
    }
  },

  // Obtener detalle de un desafío específico
  getChallengeDetail: async (challengeId: number): Promise<Challenge> => {
    try {
      const response = await apiClient.get(`/api/v1/challenges/${challengeId}`);
      return response.data;  // Direct object like routines
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Desafío no encontrado');
      }
      throw new Error(error.response?.data?.error || 'Error de conexión');
    }
  },

  // Obtener ranking de un desafío
  getChallengeLeaderboard: async (challengeId: number) => {
    try {
      const response = await apiClient.get(`/api/v1/challenges/${challengeId}/leaderboard`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al obtener el ranking');
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Desafío no encontrado');
      }
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  },

  // Para entrenadores - obtener sus desafíos creados
  getMyChallenges: async (): Promise<Challenge[]> => {
    try {
      const response = await apiClient.get('/api/v1/challenges/my_challenges');
      return response.data;  // Direct array like routines
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Solo los entrenadores pueden acceder a esta función');
      }
      throw new Error(error.response?.data?.error || 'Error de conexión');
    }
  },

  // Crear nuevo desafío (solo entrenadores)
  createChallenge: async (challengeData: CreateChallengeData): Promise<Challenge> => {
    try {
      const response = await apiClient.post('/api/v1/challenges', {
        challenge: challengeData
      });
      return response.data;  // Direct object like routines
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Solo los entrenadores pueden crear desafíos');
      }
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || ['Datos inválidos'];
        throw new Error(errors.join(', '));
      }
      throw new Error(error.response?.data?.error || 'Error de conexión');
    }
  },

  // Eliminar desafío (solo entrenadores)
  deleteChallenge: async (challengeId: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/challenges/${challengeId}`);
      // No content response (204) like routines
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar este desafío');
      }
      if (error.response?.status === 404) {
        throw new Error('Desafío no encontrado');
      }
      throw new Error(error.response?.data?.error || 'Error de conexión');
    }
  }
};
