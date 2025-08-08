import { apiClient } from "./apiClient";
import { 
  AIRoutine, 
  RoutineModificationPayload, 
  ModifiedRoutineResponse 
} from "../types/routineModification";

const routineModificationService = {
  // Obtener rutinas IA del usuario
  getUserAIRoutines: async (): Promise<AIRoutine[]> => {
    try {
      const response = await apiClient.get("/api/v1/ai/workout_routines/user_routines");
      
      if (response.data.success) {
        return response.data.data.routines || [];
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No hay token de autenticación");
      } else if (error.response?.status === 404) {
        throw new Error("No se encontraron rutinas IA");
      } else {
        throw new Error(
          error.response?.data?.error || 
          error.message || 
          "Error al obtener rutinas IA"
        );
      }
    }
  },

  // Enviar solicitud de modificación
  modifyRoutine: async (payload: RoutineModificationPayload): Promise<ModifiedRoutineResponse> => {
    try {
      const response = await apiClient.post("/api/v1/ai/workout_routines/modify", payload);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error("Error al modificar la rutina");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No hay token de autenticación");
      } else if (error.response?.status === 422) {
        throw new Error("Datos de modificación inválidos");
      } else if (error.response?.status === 503) {
        throw new Error("Servicio de IA temporalmente no disponible");
      } else {
        throw new Error(
          error.response?.data?.error || 
          error.message || 
          "Error al modificar la rutina"
        );
      }
    }
  },

  // Obtener detalles de una rutina específica
  getRoutineDetails: async (routineId: number): Promise<AIRoutine> => {
    try {
      const response = await apiClient.get(`/api/v1/routines/${routineId}`);
      
      if (response.data.success) {
        return response.data.data.routine;
      } else {
        throw new Error("Rutina no encontrada");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Rutina no encontrada");
      } else {
        throw new Error(
          error.response?.data?.error || 
          error.message || 
          "Error al obtener detalles de la rutina"
        );
      }
    }
  }
};

export default routineModificationService;
