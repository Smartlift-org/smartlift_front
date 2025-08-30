import { apiClient } from "./apiClient";
import {
  AIRoutine,
  RoutineModificationPayload,
  ModifiedRoutineResponse,
  ExerciseModificationPayload,
  ModifiedExercisesResponse,
  RoutineExercise,
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

  modifyExercises: async (
    payload: ExerciseModificationPayload
  ): Promise<ModifiedExercisesResponse> => {
    try {
      const response = await apiClient.post(
        "/api/v1/ai/workout_routines/modify",
        payload
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error("Error al modificar los ejercicios");
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
            "Error al modificar los ejercicios"
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
      };

      const cleanExercises =
        (
          modifiedRoutineData.routine_exercises_attributes ||
          modifiedRoutineData.routine_exercises
        )?.map((exercise: any, index: number) => ({
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_time: exercise.rest_time,
          order: index + 1,
          _destroy: false,
        })) || [];

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
          })
        ) || [],
    };
  },

  saveModifiedRoutineWithReplacement: async (
    routineUpdateData: any,
    originalRoutine: AIRoutine
  ): Promise<AIRoutine> => {
    try {
      const exercisesToDestroy = routineUpdateData.selectedExerciseIds.map(
        (id: number) => ({
          id: id,
          _destroy: true,
        })
      );

      const deletePayload = {
        name: routineUpdateData.name,
        description: routineUpdateData.description,
        difficulty: routineUpdateData.difficulty,
        duration: routineUpdateData.duration,
        routine_exercises_attributes: exercisesToDestroy,
      };

      await apiClient.put(`/routines/${originalRoutine.id}`, {
        routine: deletePayload,
      });

      const updatedRoutineResponse = await apiClient.get(
        `/routines/${originalRoutine.id}`
      );
      const updatedRoutine = updatedRoutineResponse.data;

      const currentOrders = (updatedRoutine.routine_exercises || [])
        .map((ex: any) => ex.order)
        .sort((a: number, b: number) => a - b);

      const findAvailableOrders = (
        currentOrders: number[],
        neededCount: number
      ): number[] => {
        const availableOrders: number[] = [];
        let currentIndex = 1;

        for (
          let i = 0;
          i < currentOrders.length && availableOrders.length < neededCount;
          i++
        ) {
          while (
            currentIndex < currentOrders[i] &&
            availableOrders.length < neededCount
          ) {
            availableOrders.push(currentIndex);
            currentIndex++;
          }
          currentIndex = currentOrders[i] + 1;
        }

        while (availableOrders.length < neededCount) {
          availableOrders.push(currentIndex);
          currentIndex++;
        }

        return availableOrders;
      };

      const availableOrders = findAvailableOrders(
        currentOrders,
        routineUpdateData.newExercises.length
      );

      const newExercises = routineUpdateData.newExercises.map(
        (aiExercise: any, index: number) => ({
          exercise_id: aiExercise.exercise_id,
          sets: aiExercise.sets,
          reps: aiExercise.reps,
          rest_time: aiExercise.rest_time,
          order: availableOrders[index],
        })
      );

      const addPayload = {
        name: routineUpdateData.name,
        description: routineUpdateData.description,
        difficulty: routineUpdateData.difficulty,
        duration: routineUpdateData.duration,
        routine_exercises_attributes: newExercises,
      };

      const finalResponse = await apiClient.put(
        `/routines/${originalRoutine.id}`,
        {
          routine: addPayload,
        }
      );

      return finalResponse.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errorDetails = error.response?.data?.errors || [];
        const errorMessage = Array.isArray(errorDetails)
          ? errorDetails.join(", ")
          : "Error de validación al reemplazar ejercicios";
        throw new Error(`Error de validación: ${errorMessage}`);
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al guardar rutina con ejercicios reemplazados"
        );
      }
    }
  },

  modifyExercisesAndSaveRoutine: async (
    routine: AIRoutine,
    selectedExercises: RoutineExercise[],
    userMessage: string
  ): Promise<AIRoutine> => {
    try {
      const exercisesPayload: ExerciseModificationPayload = {
        user_message: userMessage,
        exercises: selectedExercises.map((exercise, index) => ({
          name: exercise.exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_time: exercise.rest_time,
          order: index + 1,
        })),
      };

      const aiResponse = await routineModificationService.modifyExercises(
        exercisesPayload
      );
      const limitedAiExercises = aiResponse.data.exercises.slice(
        0,
        selectedExercises.length
      );

      const routineUpdateData = {
        name: routine.name,
        description: routine.description,
        difficulty: routine.difficulty,
        duration: routine.duration,
        selectedExerciseIds: selectedExercises.map((ex) => ex.id),
        newExercises: limitedAiExercises,
      };

      const savedRoutine =
        await routineModificationService.saveModifiedRoutineWithReplacement(
          routineUpdateData,
          routine
        );
      return savedRoutine;
    } catch (error: any) {
      console.error("❌ [ERROR]:", error.message);
      throw new Error(
        error.message || "Error al modificar ejercicios y guardar la rutina"
      );
    }
  },

  replaceExercisesInRoutine: (
    originalRoutine: AIRoutine,
    originalExercises: RoutineExercise[],
    newExercises: any[]
  ): any => {
    const originalExerciseIds = new Set(
      originalExercises.map((ex) => ex.exercise_id)
    );

    const unchangedExercises = originalRoutine.routine_exercises.filter(
      (exercise) => !originalExerciseIds.has(exercise.exercise_id)
    );

    const allExercises = [
      ...unchangedExercises.map((exercise, index) => ({
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_time: exercise.rest_time,
        order: index + 1,
        _destroy: false,
      })),
      ...newExercises.map((exercise, index) => ({
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_time: exercise.rest_time,
        order: unchangedExercises.length + index + 1,
        _destroy: false,
      })),
    ];

    allExercises.forEach((exercise, index) => {
      exercise.order = index + 1;
    });

    return {
      id: originalRoutine.id,
      user_id: originalRoutine.user.id,
      name: originalRoutine.name,
      description: originalRoutine.description,
      difficulty: originalRoutine.difficulty,
      duration: originalRoutine.duration,
      source_type: "ai_generated",
      ai_generated: true,
      validation_status: "pending",
      routine_exercises_attributes: allExercises,
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
