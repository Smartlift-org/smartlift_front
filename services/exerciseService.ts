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
      return response.data.exercises || response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No hay token de autenticación");
      } else if (error.response?.status === 404) {
        throw new Error("No se encontraron ejercicios");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al obtener ejercicios"
        );
      }
    }
  },

  getExercise: async (id: number): Promise<Exercise> => {
    try {
      const response = await apiClient.get(`/exercises/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Ejercicio no encontrado");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al obtener ejercicio"
        );
      }
    }
  },

  updateVideoUrl: async (id: number, videoUrl: string): Promise<Exercise> => {
    try {
      const response = await apiClient.put(`/exercises/${id}/video_url`, {
        video_url: videoUrl,
      });
      return response.data.exercise || response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No tienes permisos para editar ejercicios");
      } else if (error.response?.status === 404) {
        throw new Error("Ejercicio no encontrado");
      } else if (error.response?.status === 422) {
        const details = error.response?.data?.details;
        if (details && Array.isArray(details)) {
          throw new Error(`Datos inválidos: ${details.join(", ")}`);
        }
        throw new Error("URL de video inválida");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al actualizar URL del video"
        );
      }
    }
  },

  createExercise: async (data: ExerciseFormData): Promise<Exercise> => {
    try {
      const response = await apiClient.post("/exercises", {
        exercise: data,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No tienes permisos para crear ejercicios");
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          throw new Error(`Error de validación: ${errors.join(", ")}`);
        }
        throw new Error("Datos de ejercicio inválidos");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al crear ejercicio"
        );
      }
    }
  },

  updateExercise: async (
    id: number,
    data: Partial<ExerciseFormData>
  ): Promise<Exercise> => {
    try {
      const response = await apiClient.put(`/exercises/${id}`, {
        exercise: data,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No tienes permisos para editar ejercicios");
      } else if (error.response?.status === 404) {
        throw new Error("Ejercicio no encontrado");
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          throw new Error(`Error de validación: ${errors.join(", ")}`);
        }
        throw new Error("Datos de ejercicio inválidos");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al actualizar ejercicio"
        );
      }
    }
  },

  deleteExercise: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/exercises/${id}`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("No tienes permisos para eliminar ejercicios");
      } else if (error.response?.status === 404) {
        throw new Error("Ejercicio no encontrado");
      } else {
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Error al eliminar ejercicio"
        );
      }
    }
  },
};

export default exerciseService;
