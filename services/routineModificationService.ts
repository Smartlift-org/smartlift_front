import { apiClient } from "./apiClient";
import {
  AIRoutine,
  RoutineModificationPayload,
  ModifiedRoutineResponse,
} from "../types/routineModification";

const routineModificationService = {
  getUserAIRoutines: async (): Promise<AIRoutine[]> => {
    try {
      const response = await apiClient.get("/routines");

      const allRoutines: AIRoutine[] = response.data || [];
      const aiRoutines = allRoutines.filter(
        (routine) => routine.ai_generated === true
      );

      return aiRoutines;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No hay token de autenticación");
      } else if (error.response?.status === 404) {
        throw new Error("No se encontraron rutinas");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al obtener rutinas IA"
        );
      }
    }
  },

  modifyRoutine: async (
    payload: RoutineModificationPayload
  ): Promise<ModifiedRoutineResponse> => {
    try {
      const response = await apiClient.post(
        "/api/v1/ai/workout_routines/modify",
        payload
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error("Error al modificar la rutina");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No hay token de autenticación");
      } else if (error.response?.status === 400) {
        const details = error.response?.data?.details;
        if (details && typeof details === "object") {
          const errorMessages = Object.entries(details)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          throw new Error(`Datos inválidos: ${errorMessages}`);
        }
        throw new Error("Datos de modificación inválidos");
      } else if (error.response?.status === 422) {
        throw new Error("Servicio de IA devolvió respuesta inválida");
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

  getRoutineDetails: async (routineId: number): Promise<AIRoutine> => {
    try {
      const response = await apiClient.get(`/routines/${routineId}`);

      return response.data;
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
  },

  saveModifiedRoutine: async (
    modifiedRoutineData: any,
    originalRoutineId?: number
  ): Promise<AIRoutine> => {
    try {
      const cleanRoutineData = {
        name: modifiedRoutineData.name,
        description: modifiedRoutineData.description,
        difficulty: modifiedRoutineData.difficulty,
        duration: modifiedRoutineData.duration,
        source_type: "ai_generated",
        ai_generated: true,
        validation_status: "pending",
      };

      const cleanExercises =
        modifiedRoutineData.routine_exercises?.map(
          (exercise: any, index: number) => ({
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_time: exercise.rest_time,
            order: index + 1,
            _destroy: false,
          })
        ) || [];

      const routineToSave = {
        ...cleanRoutineData,
        routine_exercises_attributes: cleanExercises,
      };

      let response;
      if (originalRoutineId) {
        response = await apiClient.put(`/routines/${originalRoutineId}`, {
          routine: routineToSave,
        });
      } else {
        response = await apiClient.post("/routines", {
          routine: routineToSave,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Rutina no encontrada para actualizar");
      } else if (error.response?.status === 422) {
        const errorDetails = error.response?.data?.errors || [];
        const errorMessage = Array.isArray(errorDetails)
          ? errorDetails.join(", ")
          : "Datos de rutina inválidos para guardar";
        throw new Error(`Error de validación: ${errorMessage}`);
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al guardar la rutina modificada"
        );
      }
    }
  },

  cleanRoutineForAI: (routine: any): any => {
    return {
      name: routine.name,
      description: routine.description,
      difficulty: routine.difficulty,
      duration: routine.duration,
      routine_exercises_attributes:
        routine.routine_exercises?.map((exercise: any, index: number) => ({
          exercise_id: exercise.exercise_id,
          name: exercise.exercise?.name || exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_time: exercise.rest_time,
          order: index + 1,
          needs_modification: exercise.needs_modification || false,
        })) || [],
    };
  },

  mergeAIResponseWithOriginal: (aiResponse: any, originalRoutine: any): any => {
    const aiRoutineData = aiResponse.routine || aiResponse;

    return {
      id: originalRoutine.id,
      user_id: originalRoutine.user_id,
      created_at: originalRoutine.created_at,

      name: aiRoutineData.name,
      description: aiRoutineData.description,
      difficulty: aiRoutineData.difficulty,
      duration: aiRoutineData.duration,

      source_type: "ai_generated",
      ai_generated: true,
      validation_status: "pending",
      routine_exercises_attributes:
        aiRoutineData.routine_exercises_attributes?.map(
          (exercise: any, index: number) => ({
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_time: exercise.rest_time,
            order: index + 1,
            _destroy: false,
          })
        ) || [],
    };
  },

  modifyAndSaveRoutine: async (
    payload: RoutineModificationPayload,
    originalRoutineId?: number
  ): Promise<{
    modifiedRoutine: AIRoutine;
    aiResponse: ModifiedRoutineResponse;
  }> => {
    try {
      const cleanRoutine = routineModificationService.cleanRoutineForAI(
        payload.routine
      );
      const cleanPayload = {
        routine: cleanRoutine,
        modification_message: payload.modification_message,
      };

      const aiResponse = await routineModificationService.modifyRoutine(
        cleanPayload
      );

      const aiRoutineData =
        aiResponse.data?.routines?.[0]?.routine || aiResponse;

      const mergedRoutineData =
        routineModificationService.mergeAIResponseWithOriginal(
          aiRoutineData,
          payload.routine
        );

      const savedRoutine = await routineModificationService.saveModifiedRoutine(
        mergedRoutineData,
        originalRoutineId
      );

      return {
        modifiedRoutine: savedRoutine,
        aiResponse: aiResponse,
      };
    } catch (error: any) {
      console.error("❌ [ERROR]:", error.message);
      throw new Error(
        error.message || "Error al modificar y guardar la rutina"
      );
    }
  },
};

export default routineModificationService;
