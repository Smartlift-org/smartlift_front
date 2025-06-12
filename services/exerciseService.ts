import { apiClient } from './apiClient';
import { AxiosError } from 'axios';
import { Exercise } from './routineService';

export interface ExerciseFormData {
  name: string;
  equipment: string;
  category: string;
  difficulty: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  image_urls: string[];
}

const exerciseService = {
  // Get all exercises
  getExercises: async (): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get('/exercises');
      return response.data;
    } catch (error) {
      console.error("Get exercises error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Get a specific exercise by ID
  getExercise: async (id: number): Promise<Exercise> => {
    try {
      const response = await apiClient.get(`/exercises/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get exercise error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Create a new exercise
  createExercise: async (exerciseData: ExerciseFormData): Promise<Exercise> => {
    try {
      const response = await apiClient.post('/exercises', { exercise: exerciseData });
      return response.data;
    } catch (error) {
      console.error("Create exercise error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Update an existing exercise
  updateExercise: async (id: number, exerciseData: ExerciseFormData): Promise<Exercise> => {
    try {
      const response = await apiClient.patch(`/exercises/${id}`, { exercise: exerciseData });
      return response.data;
    } catch (error) {
      console.error("Update exercise error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Delete an exercise
  deleteExercise: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/exercises/${id}`);
    } catch (error) {
      console.error("Delete exercise error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },
};

export default exerciseService;
