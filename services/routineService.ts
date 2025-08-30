import { apiClient } from "./apiClient";
import { Exercise } from "../types/exercise";

export interface RoutineExercise {
  id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  rest_time: number;
  order: number;
  exercise: Exercise;
}

export interface Routine {
  id: number;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  routine_exercises: RoutineExercise[];
  formatted_created_at: string;
  formatted_updated_at: string;
  source_type?: "manual" | "ai_generated";
  ai_generated?: boolean;
  validation_status?: "pending" | "approved" | "rejected";
  validated_by_id?: number;
  validated_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  validated_at?: string;
  validation_notes?: string;
  ai_prompt_data?: any;
}

export interface RoutineExerciseFormData {
  id?: number;
  exercise_id: number;
  sets: number;
  reps: number;
  rest_time: number;
  order: number;
  name: string;
  _destroy?: boolean;
}

export interface RoutineFormData {
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  routine_exercises_attributes?: RoutineExerciseFormData[];
}

export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExercise {
  routine_exercise_id: number;
  exercise: Exercise;
  planned_sets: number;
  planned_reps: number;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id?: number;
  routine_id: number;
  routine_name: string;
  date: string;
  start_time: string;
  end_time?: string;
  total_duration?: number;
  effective_duration?: number;
  status: "in_progress" | "paused" | "completed" | "abandoned";
  exercises: WorkoutExercise[];
  notes?: string;
}

const routineService = {
  getRoutines: async (): Promise<Routine[]> => {
    try {
      const response = await apiClient.get("/routines");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRoutine: async (id: number): Promise<Routine> => {
    try {
      const response = await apiClient.get(`/routines/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createRoutine: async (routineData: RoutineFormData): Promise<Routine> => {
    try {
      const cleanedExercises = routineData.routine_exercises_attributes?.map(
        (exercise) => ({
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_time: exercise.rest_time,
          order: exercise.order,
        })
      );

      const cleanedData = {
        name: routineData.name,
        description: routineData.description,
        difficulty: routineData.difficulty,
        duration: routineData.duration,
        routine_exercises_attributes: cleanedExercises,
      };

      const response = await apiClient.post("/routines", {
        routine: cleanedData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRoutine: async (
    id: number,
    routineData: RoutineFormData
  ): Promise<Routine> => {
    try {
      const cleanedExercises = routineData.routine_exercises_attributes?.map(
        (exercise) => ({
          id: exercise.id,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_time: exercise.rest_time,
          order: exercise.order,
          _destroy: exercise._destroy || false,
        })
      );

      const cleanedData = {
        name: routineData.name,
        description: routineData.description,
        difficulty: routineData.difficulty,
        duration: routineData.duration,
        routine_exercises_attributes: cleanedExercises,
      };
      const response = await apiClient.put(`/routines/${id}`, {
        routine: cleanedData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRoutine: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/routines/${id}`);
    } catch (error) {
      throw error;
    }
  },

  addExerciseToRoutine: async (
    routineId: number,
    exerciseData: RoutineExerciseFormData
  ): Promise<RoutineExercise> => {
    try {
      const response = await apiClient.post(
        `/routines/${routineId}/exercises`,
        { routine_exercise: exerciseData }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeExerciseFromRoutine: async (
    routineId: number,
    exerciseId: number
  ): Promise<void> => {
    try {
      await apiClient.delete(`/routines/${routineId}/exercises/${exerciseId}`);
    } catch (error) {
      throw error;
    }
  },

  createWorkout: async (workoutData: any): Promise<WorkoutSession> => {
    try {
      const payload = { workout: workoutData };
      const response = await apiClient.post("/workouts", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  pauseWorkout: async (
    id: number,
    reason?: string
  ): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/pause`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resumeWorkout: async (id: number): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/resume`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  completeWorkout: async (
    id: number,
    data: {
      perceived_intensity?: number;
      energy_level?: number;
      mood?: string;
      notes?: string;
    }
  ): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/complete`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  abandonWorkout: async (id: number): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/abandon`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateWorkout: async (
    id: number,
    workoutData: Partial<WorkoutSession>
  ): Promise<WorkoutSession> => {
    try {
      if (workoutData.status === "paused") {
        return await routineService.pauseWorkout(id);
      } else if (workoutData.status === "in_progress") {
        return await routineService.resumeWorkout(id);
      } else if (workoutData.status === "completed") {
        return await routineService.completeWorkout(id, {
          notes: workoutData.notes,
        });
      } else if (workoutData.status === "abandoned") {
        return await routineService.abandonWorkout(id);
      }

      const response = await apiClient.put(`/workouts/${id}`, {
        workout: workoutData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWorkouts: async (): Promise<WorkoutSession[]> => {
    try {
      const response = await apiClient.get("/workouts");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWorkout: async (id: number): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.get(`/workouts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWorkoutsByRoutine: async (
    routineId: number
  ): Promise<WorkoutSession[]> => {
    try {
      const response = await apiClient.get("/workouts");
      const workoutsForRoutine = response.data.filter(
        (workout: any) => workout.routine_id === routineId
      );
      return workoutsForRoutine;
    } catch (error) {
      throw error;
    }
  },

  isRoutineInUse: async (routineId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get("/workouts");
      const workoutsData = response.data;

      const hasActiveWorkouts = workoutsData.some(
        (workout: any) =>
          workout.routine_id === routineId &&
          ["in_progress", "paused"].includes(workout.status)
      );

      return hasActiveWorkouts;
    } catch (error) {
      throw error;
    }
  },


  getActiveWorkouts: async (): Promise<WorkoutSession[]> => {
    try {
      const workouts = await routineService.getWorkouts();
      return workouts.filter((workout) =>
        ["in_progress", "paused"].includes(workout.status)
      );
    } catch (error) {
      throw error;
    }
  },
};

export default routineService;
