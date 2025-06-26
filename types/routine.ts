import { Exercise } from "../types/exercise";

export interface Routine {
  id: number;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  user_id?: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at?: string;
  updated_at?: string;
  formatted_created_at?: string;
  formatted_updated_at?: string;
  image_url?: string;
  exercises?: RoutineExercise[]; // Campo antiguo para compatibilidad
  routine_exercises?: RoutineExercise[]; // Campo actual del backend
}

export interface RoutineExercise {
  id: number;
  routine_id?: number; // Hacemos este campo opcional para compatibilidad
  exercise_id: number;
  sets: number;
  reps: number;
  rest_time: number;
  order: number;
  exercise?: Exercise;
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
