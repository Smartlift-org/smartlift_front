import { apiClient } from "./apiClient";
import {
  Workout,
  CreateWorkoutRequest,
  WorkoutCompletionData,
} from "../types/workout";

class WorkoutService {
  getWorkouts = async (): Promise<Workout[]> => {
    try {
      const response = await apiClient.get("/workouts");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getWorkoutsByRoutine = async (routineId: number): Promise<Workout[]> => {
    try {
      const workouts = await this.getWorkouts();
      return workouts.filter((workout) => workout.routine_id === routineId);
    } catch (error) {
      throw error;
    }
  };

  getActiveWorkouts = async (): Promise<Workout[]> => {
    try {
      const response = await apiClient.get("/workouts");
      const activeWorkouts = response.data.filter(
        (workout: Workout) =>
          workout.status === "in_progress" || workout.status === "paused"
      );
      return activeWorkouts;
    } catch (error) {
      throw error;
    }
  };

  getWorkout = async (id: number): Promise<Workout> => {
    try {
      const response = await apiClient.get(`/workouts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  createWorkout = async (data: CreateWorkoutRequest): Promise<Workout> => {
    try {
      const response = await apiClient.post("/workouts", { workout: data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  createFreeWorkout = async (name: string): Promise<Workout> => {
    try {
      const response = await apiClient.post("/workouts/free", {
        workout: { name },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  completeWorkout = async (
    id: number,
    data?: WorkoutCompletionData
  ): Promise<Workout> => {
    try {
      const response = await apiClient.put(
        `/workouts/${id}/complete`,
        data || {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  pauseWorkout = async (id: number, reason?: string): Promise<Workout> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/pause`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  resumeWorkout = async (id: number): Promise<Workout> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/resume`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  abandonWorkout = async (id: number): Promise<Workout> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/abandon`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getWorkoutExercises = async (workoutId: number) => {
    try {
      const response = await apiClient.get(`/workout/exercises`, {
        params: { workout_id: workoutId },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  addWorkoutExercise = async (workoutId: number, exerciseData: any) => {
    try {
      const response = await apiClient.post(`/workout/exercises`, {
        workout_id: workoutId,
        workout_exercise: exerciseData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  createWorkoutExercise = async (workoutId: number, exerciseData: any) => {
    try {
      const response = await apiClient.post(`/workout/exercises`, {
        workout_id: workoutId,
        workout_exercise: exerciseData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  recordExerciseSet = async (workoutExerciseId: number, setData: any) => {
    try {
      const response = await apiClient.post(
        `/workout/exercises/${workoutExerciseId}/record_set`,
        {
          set: setData,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  completeExercise = async (workoutExerciseId: number) => {
    try {
      const response = await apiClient.put(
        `/workout/exercises/${workoutExerciseId}/complete`,
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getSets = async (exerciseId: number) => {
    try {
      const response = await apiClient.get(
        `/workout/exercises/${exerciseId}/sets`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  createSet = async (exerciseId: number, setData: any) => {
    try {
      const response = await apiClient.post(
        `/workout/exercises/${exerciseId}/sets`,
        {
          set: setData,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  completeSet = async (exerciseId: number, setId: number, data: any) => {
    try {
      const response = await apiClient.put(
        `/workout/exercises/${exerciseId}/sets/${setId}/complete`,
        {
          set: data,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  startSet = async (exerciseId: number, setId: number) => {
    try {
      const response = await apiClient.put(
        `/workout/exercises/${exerciseId}/sets/${setId}/start`,
        {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };
}

const workoutService = new WorkoutService();
export default workoutService;
