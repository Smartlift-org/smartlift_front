import { Exercise } from "./exercise";

// Tipos para el seguimiento de entrenamientos activos
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

export interface Workout {
  id: number;
  user_id: number;
  routine_id: number;
  status: WorkoutStatus;
  created_at: string;
  updated_at: string;
  completed_exercises?: number;
  perceived_intensity?: number;
  energy_level?: number;
  mood?: string;
  notes?: string;
  // Datos de los ejercicios completados
  exercises?: WorkoutExercise[];
  // Relación con la rutina asociada (puede venir del backend)
  routine?: {
    id: number;
    name: string;
    description: string;
    difficulty: string;
    duration: number;
    exercises?: Array<{
      id: number;
      exercise_id: number;
      sets: number;
      reps: number;
      rest_time: number;
      order: number;
      exercise?: Exercise;
    }>;
  };
}

// Posibles estados de un entrenamiento
export type WorkoutStatus = 'not_started' | 'in_progress' | 'paused' | 'completed';

// Tipos para registrar el progreso de un ejercicio durante un entrenamiento
export interface WorkoutExerciseProgress {
  id?: number;
  workout_id: number;
  routine_exercise_id: number;
  completed_sets: number;
  completed: boolean;
  notes?: string;
}

// Tipo para enviar al backend para crear un nuevo entrenamiento
export interface CreateWorkoutRequest {
  routine_id: number;
}

// Tipo para actualizar el estado de un entrenamiento
export interface UpdateWorkoutStatusRequest {
  status: WorkoutStatus;
}
