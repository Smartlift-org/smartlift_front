import { apiClient } from "./apiClient";
import { Workout, CreateWorkoutRequest, UpdateWorkoutStatusRequest, WorkoutStatus } from "../types/workout";

// Servicio para manejar los entrenamientos y su progreso
class WorkoutService {
  // Obtener todos los entrenamientos de un usuario
  getWorkouts = async (): Promise<Workout[]> => {
    try {
      const response = await apiClient.get('/workouts');
      return response.data;
    } catch (error) {
      console.error('Error al obtener entrenamientos:', error);
      throw error;
    }
  };

  // Obtener solo entrenamientos activos (en progreso o pausados)
  getActiveWorkouts = async (): Promise<Workout[]> => {
    try {
      // Usamos el endpoint general y filtramos en el cliente
      const response = await apiClient.get('/workouts');
      // Filtramos los entrenamientos con status 'in_progress' o 'paused'
      const activeWorkouts = response.data.filter(
        (workout: Workout) => workout.status === 'in_progress' || workout.status === 'paused'
      );
      return activeWorkouts;
    } catch (error) {
      console.error('Error al obtener entrenamientos activos:', error);
      throw error;
    }
  };

  // Obtener un entrenamiento específico por ID
  getWorkout = async (id: number): Promise<Workout> => {
    try {
      const response = await apiClient.get(`/workouts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entrenamiento ID ${id}:`, error);
      throw error;
    }
  };

  // Crear un nuevo entrenamiento a partir de una rutina
  createWorkout = async (data: CreateWorkoutRequest): Promise<Workout> => {
    try {
      const response = await apiClient.post('/workouts', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear entrenamiento:', error);
      throw error;
    }
  };

  // Actualizar el estado de un entrenamiento (pausar, reanudar, completar)
  updateWorkoutStatus = async (id: number, data: UpdateWorkoutStatusRequest): Promise<Workout> => {
    try {
      const response = await apiClient.put(`/workouts/${id}/status`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado del entrenamiento ${id}:`, error);
      throw error;
    }
  };

  // Registrar progreso en un ejercicio durante el entrenamiento
  logExerciseProgress = async (workoutId: number, routineExerciseId: number, completedSets: number, completed: boolean, notes?: string) => {
    try {
      const response = await apiClient.post(`/workouts/${workoutId}/progress`, {
        workout_exercise_progress: {
          routine_exercise_id: routineExerciseId,
          completed_sets: completedSets,
          completed: completed,
          notes: notes || ""
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar progreso de ejercicio:', error);
      throw error;
    }
  };

  // Finalizar un entrenamiento
  completeWorkout = async (id: number) => {
    try {
      return await this.updateWorkoutStatus(id, { status: 'completed' });
    } catch (error) {
      console.error(`Error al completar entrenamiento ${id}:`, error);
      throw error;
    }
  };

  // Pausar un entrenamiento
  pauseWorkout = async (id: number) => {
    try {
      return await this.updateWorkoutStatus(id, { status: 'paused' });
    } catch (error) {
      console.error(`Error al pausar entrenamiento ${id}:`, error);
      throw error;
    }
  };

  // Reanudar un entrenamiento pausado
  resumeWorkout = async (id: number) => {
    try {
      return await this.updateWorkoutStatus(id, { status: 'in_progress' });
    } catch (error) {
      console.error(`Error al reanudar entrenamiento ${id}:`, error);
      throw error;
    }
  };
}

const workoutService = new WorkoutService();
export default workoutService;
