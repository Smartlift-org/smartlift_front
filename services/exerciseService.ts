import { apiClient } from "./apiClient";
import { Exercise } from "../types/exercise";

export interface ExerciseFormData {
  name: string;
  equipment: string;
  category: string;
  difficulty: string;
  primary_muscles: string[];
  image_urls: string[];
}

const exerciseService = {
  getExercises: async (): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get("/exercises");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default exerciseService;
