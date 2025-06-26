import { Exercise } from "../types/exercise";

export interface Routine {
  id: number;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  exercises?: RoutineExercise[];
}

export interface RoutineExercise {
  id: number;
  routine_id: number;
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
