import { apiClient } from "./apiClient";
import { AIRoutineParams, AIRoutineResponse } from "../types/aiRoutines";

const aiRoutineService = {
  generateRoutines: async (
    params: AIRoutineParams
  ): Promise<AIRoutineResponse[]> => {
    try {
      const response = await apiClient.post(
        "/api/v1/ai/workout_routines",
        params
      );

      if (response.data.success && response.data.data.routines) {
        return response.data.data.routines;
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const details = error.response.data.details;
        const errorMessages: string[] = [];

        if (details) {
          Object.keys(details).forEach((field) => {
            const fieldErrors = details[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((err) => {
                errorMessages.push(`${field}: ${err}`);
              });
            }
          });
        }

        const finalError =
          errorMessages.length > 0
            ? `Datos inválidos:\n${errorMessages.join("\n")}`
            : "Verifica que todos los campos estén correctos";

        throw new Error(finalError);
      } else if (error.response?.status === 422) {
        throw new Error("Error en la respuesta de IA. Intenta nuevamente.");
      } else if (error.response?.status === 503) {
        throw new Error(
          "Servicio de IA temporalmente no disponible. Intenta más tarde."
        );
      } else if (error.response?.status === 500) {
        throw new Error("Error interno del servidor. Intenta más tarde.");
      } else {
        throw new Error(
          error.message || "Error de conexión. Verifica tu internet."
        );
      }
    }
  },

  saveGeneratedRoutines: async (
    routines: AIRoutineResponse[]
  ): Promise<{ success: number; failed: number; results: any[] }> => {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const routineResponse of routines) {
      try {
        const routineData = routineResponse.routine as any;
        const transformedRoutine = {
          name: routineData.name,
          description: routineData.description,
          difficulty: routineData.difficulty,
          duration: routineData.duration,
          source_type: "ai_generated",
          validation_status: "pending",
          routine_exercises_attributes:
            routineData.exercises?.map((exercise: any) => ({
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_time: exercise.rest_time || 0,
              order: exercise.order || 1,
            })) || [],
        };

        const response = await apiClient.post("/routines", {
          routine: transformedRoutine,
        });

        results.push({
          success: true,
          routine: response.data,
          originalName: routineResponse.routine.name,
        });
        successCount++;
      } catch (error: any) {
        results.push({
          success: false,
          error: error.response?.data || error.message,
          originalName: routineResponse.routine.name,
        });
        failedCount++;
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  },

  generateAndSaveRoutines: async (
    params: AIRoutineParams
  ): Promise<{
    routines: AIRoutineResponse[];
    savedResults: { success: number; failed: number; results: any[] };
  }> => {
    try {
      const routines = await aiRoutineService.generateRoutines(params);
      const savedResults = await aiRoutineService.saveGeneratedRoutines(
        routines
      );

      return {
        routines,
        savedResults,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default aiRoutineService;
