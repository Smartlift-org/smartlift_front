import { apiClient } from "./apiClient";
import {
  Workout,
  CreateWorkoutRequest,
  UpdateWorkoutStatusRequest,
  WorkoutStatus,
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
      const response = await apiClient.post("/workouts", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  updateWorkoutStatus = async (
    id: number,
    data: UpdateWorkoutStatusRequest
  ): Promise<Workout> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  logExerciseProgress = async (
    workoutId: number,
    routineExerciseId: number,
    completedSets: number,
    completed: boolean,
    notes?: string
  ) => {
    try {
      const response = await apiClient.post(`/workouts/${workoutId}/progress`, {
        workout_exercise_progress: {
          routine_exercise_id: routineExerciseId,
          completed_sets: completedSets,
          completed: completed,
          notes: notes || "",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  completeWorkout = async (id: number) => {
    try {
      return await this.updateWorkoutStatus(id, { status: "completed" });
    } catch (error) {
      throw error;
    }
  };

  pauseWorkout = async (id: number) => {
    try {
      return await this.updateWorkoutStatus(id, { status: "paused" });
    } catch (error) {
      throw error;
    }
  };

  resumeWorkout = async (id: number) => {
    try {
      return await this.updateWorkoutStatus(id, { status: "in_progress" });
    } catch (error) {
      throw error;
    }
  };
}

const workoutService = new WorkoutService();
export default workoutService;
