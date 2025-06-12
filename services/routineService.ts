import { apiClient } from './apiClient';
import { AxiosError } from 'axios';

export interface Exercise {
  id: number;
  name: string;
  equipment: string;
  category: string;
  difficulty: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  image_urls: string[];
  difficulty_level: number;
  has_equipment: boolean;
  level: string; // La API devuelve el nivel en esta propiedad
}

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
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  routine_exercises: RoutineExercise[];
  formatted_created_at: string;
  formatted_updated_at: string;
}

export interface RoutineExerciseFormData {
  exercise_id: number;
  sets: number;
  reps: number;
  rest_time: number;
  order: number;
}

export interface RoutineFormData {
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  routine_exercises_attributes?: RoutineExerciseFormData[];
}

// Data structure to track a completed workout set
export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
}

// Data structure to track a completed exercise within a workout
export interface WorkoutExercise {
  routine_exercise_id: number;
  exercise: Exercise;
  planned_sets: number;
  planned_reps: number;
  sets: WorkoutSet[];
}

// Data structure for a completed workout session
export interface WorkoutSession {
  routine_id: number;
  routine_name: string;
  date: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

const routineService = {
  // Get all routines for the current user
  getRoutines: async (): Promise<Routine[]> => {
    try {
      const response = await apiClient.get('/routines');
      return response.data;
    } catch (error) {
      console.error("Get routines error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Get a specific routine by ID
  getRoutine: async (id: number): Promise<Routine> => {
    try {
      const response = await apiClient.get(`/routines/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get routine error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Create a new routine
  createRoutine: async (routineData: RoutineFormData): Promise<Routine> => {
    try {
      const response = await apiClient.post('/routines', { routine: routineData });
      return response.data;
    } catch (error) {
      console.error("Create routine error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Update an existing routine
  updateRoutine: async (id: number, routineData: RoutineFormData): Promise<Routine> => {
    try {
      const response = await apiClient.patch(`/routines/${id}`, { routine: routineData });
      return response.data;
    } catch (error) {
      console.error("Update routine error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Delete a routine
  deleteRoutine: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/routines/${id}`);
    } catch (error) {
      console.error("Delete routine error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Add an exercise to a routine
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
      console.error("Add exercise error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Remove an exercise from a routine
  removeExerciseFromRoutine: async (routineId: number, exerciseId: number): Promise<void> => {
    try {
      await apiClient.delete(`/routines/${routineId}/exercises/${exerciseId}`);
    } catch (error) {
      console.error("Remove exercise error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },
};

export default routineService;
