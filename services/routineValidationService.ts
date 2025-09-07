import { apiClient } from "./apiClient";
import { RoutineValidation } from "../types/aiRoutines";

const routineValidationService = {
  getPendingRoutines: async (): Promise<RoutineValidation[]> => {
    try {
      const response = await apiClient.get("/routine_validations");

      if (response.data.success) {
        return response.data.data.routines;
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(
          "Acceso denegado. Solo los entrenadores pueden validar rutinas."
        );
      } else if (error.response?.status === 401) {
        throw new Error("No hay token de autenticación");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error de conexión. Verifica tu internet."
        );
      }
    }
  },

  getRoutineDetails: async (routineId: number): Promise<any> => {
    try {
      const response = await apiClient.get(
        `/routine_validations/${routineId}`
      );

      if (response.data.success) {
        return response.data.data.routine;
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          "Rutina no encontrada o no es una rutina generada por IA"
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "Acceso denegado. Solo los entrenadores pueden validar rutinas."
        );
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al obtener detalles de la rutina"
        );
      }
    }
  },

  approveRoutine: async (routineId: number, notes?: string): Promise<void> => {
    try {
      const response = await apiClient.post(
        `/routine_validations/${routineId}/approve`,
        {
          notes: notes,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Error al aprobar la rutina");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error("Esta rutina ya ha sido validada");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Acceso denegado. Solo los entrenadores pueden validar rutinas."
        );
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al aprobar la rutina"
        );
      }
    }
  },

  rejectRoutine: async (routineId: number, notes: string): Promise<void> => {
    try {
      if (!notes || notes.trim().length === 0) {
        throw new Error("Las notas de rechazo son obligatorias");
      }

      const response = await apiClient.post(
        `/routine_validations/${routineId}/reject`,
        {
          notes: notes.trim(),
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Error al rechazar la rutina");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Las notas de rechazo son obligatorias");
      } else if (error.response?.status === 422) {
        throw new Error("Esta rutina ya ha sido validada");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Acceso denegado. Solo los entrenadores pueden validar rutinas."
        );
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al rechazar la rutina"
        );
      }
    }
  },

  editRoutine: async (
    routineId: number,
    editData: {
      name?: string;
      description?: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      duration?: number;
      routine_exercises_attributes?: Array<{
        id?: number;
        exercise_id?: number;
        sets?: number;
        reps?: number;
        rest_time?: number;
        order?: number;
        _destroy?: boolean;
      }>;
      auto_validate?: boolean;
      validation_notes?: string;
    }
  ): Promise<any> => {
    try {
      const response = await apiClient.put(
        `/routine_validations/${routineId}/edit`,
        editData
      );

      if (response.data.success) {
        return response.data.data.routine;
      } else {
        throw new Error(response.data.error || "Error al editar la rutina");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error("Solo se pueden editar rutinas pendientes de validación");
      } else if (error.response?.status === 400) {
        const details = error.response?.data?.details;
        if (details && Array.isArray(details)) {
          throw new Error(`Datos inválidos: ${details.join(", ")}`);
        }
        throw new Error("Datos de edición inválidos");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Acceso denegado. Solo los entrenadores pueden editar rutinas."
        );
      } else if (error.response?.status === 404) {
        throw new Error("Rutina no encontrada");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al editar la rutina"
        );
      }
    }
  },
};

export default routineValidationService;
