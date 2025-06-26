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
  group_type?: string;
  group_order?: number;
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
  id?: number;
  routine_id: number;
  routine_name: string;
  date: string;
  start_time: string;
  end_time?: string;
  total_duration?: number; // in seconds
  effective_duration?: number; // in seconds (excluding pauses)
  status: 'in_progress' | 'paused' | 'completed' | 'abandoned';
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
      const response = await apiClient.put(`/routines/${id}`, { routine: routineData });
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
  // Create a new workout session
  createWorkout: async (workoutData: any): Promise<WorkoutSession> => {
    try {
      // Aseguramos que los datos tienen la estructura correcta que espera el backend
      const payload = { workout: workoutData };
      
      // Log de depuración para ver exactamente qué se está enviando
      console.log('Enviando payload al backend:', JSON.stringify(payload));
      
      const response = await apiClient.post('/workouts', payload);
      console.log('Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      // Log más detallado del error para diagnóstico
      if ((error as AxiosError).response) {
        const axiosError = error as AxiosError;
        console.error("Create workout error status:", axiosError.response?.status);
        console.error("Create workout error data:", JSON.stringify(axiosError.response?.data));
        // No podemos acceder directamente a config.data como está tipado
        console.error("Request failed with error");
      } else {
        console.error("Create workout non-response error:", (error as Error).message);
      }
      throw error;
    }
  },

  // Pausar un workout
  pauseWorkout: async (id: number, reason?: string): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/pause`, { reason });
      return response.data;
    } catch (error) {
      console.error("Pause workout error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Reanudar un workout pausado
  resumeWorkout: async (id: number): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/resume`, {});
      return response.data;
    } catch (error) {
      console.error("Resume workout error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Completar un workout
  completeWorkout: async (id: number, data: { perceived_intensity?: number, energy_level?: number, mood?: string, notes?: string }): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/complete`, data);
      return response.data;
    } catch (error) {
      console.error("Complete workout error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Abandonar un workout
  abandonWorkout: async (id: number): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/abandon`, {});
      return response.data;
    } catch (error) {
      console.error("Abandon workout error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Update an existing workout session (obsoleto, mantener para compatibilidad)
  updateWorkout: async (id: number, workoutData: Partial<WorkoutSession>): Promise<WorkoutSession> => {
    console.warn('updateWorkout está obsoleto. Usar métodos específicos como pauseWorkout, resumeWorkout, etc.');
    try {
      // Determinar qué tipo de actualización es según el estado
      if (workoutData.status === 'paused') {
        return await routineService.pauseWorkout(id);
      } else if (workoutData.status === 'in_progress') {
        return await routineService.resumeWorkout(id);
      } else if (workoutData.status === 'completed') {
        return await routineService.completeWorkout(id, { notes: workoutData.notes });
      } else if (workoutData.status === 'abandoned') {
        return await routineService.abandonWorkout(id);
      }
      
      // Fallback a la implementación original
      const response = await apiClient.put(`/workouts/${id}`, { workout: workoutData });
      return response.data;
    } catch (error) {
      console.error("Update workout error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Get all workouts for the current user
  getWorkouts: async (): Promise<WorkoutSession[]> => {
    try {
      const response = await apiClient.get('/workouts');
      return response.data;
    } catch (error) {
      console.error("Get workouts error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Get a specific workout by ID
  getWorkout: async (id: number): Promise<WorkoutSession> => {
    try {
      const response = await apiClient.get(`/workouts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get workout error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Get workout history for a specific routine
  getWorkoutsByRoutine: async (routineId: number): Promise<WorkoutSession[]> => {
    try {
      // En lugar de usar una ruta que no existe, obtenemos todos los workouts y filtramos
      const response = await apiClient.get('/workouts');
      // Filtramos los workouts que corresponden a la rutina específica
      const workoutsForRoutine = response.data.filter((workout: any) => workout.routine_id === routineId);
      return workoutsForRoutine;
    } catch (error) {
      console.error("Get workouts by routine error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },

  // Verificar si una rutina está siendo utilizada en algún entrenamiento
  isRoutineInUse: async (routineId: number): Promise<boolean> => {
    try {
      const workouts = await routineService.getWorkoutsByRoutine(routineId);
      // Una rutina está en uso si tiene entrenamientos activos (en progreso o pausados)
      return workouts.some(workout => ['in_progress', 'paused'].includes(workout.status));
    } catch (error) {
      console.error("Check routine in use error:", (error as AxiosError).response?.data || (error as Error).message);
      // En caso de error, asumimos que no está en uso para evitar bloquear la funcionalidad
      return false;
    }
  },

  // Obtener todos los workouts activos del usuario actual
  getActiveWorkouts: async (): Promise<WorkoutSession[]> => {
    try {
      // Obtener todos los workouts y filtrar los activos
      const workouts = await routineService.getWorkouts();
      return workouts.filter(workout => ['in_progress', 'paused'].includes(workout.status));
    } catch (error) {
      console.error("Get active workouts error:", (error as AxiosError).response?.data || (error as Error).message);
      throw error;
    }
  },
};

export default routineService;
