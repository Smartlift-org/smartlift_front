import { Exercise } from "./exercise";

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
  date?: string;
  started_at?: string;
  completed_at?: string;
  paused_at?: string;
  total_duration?: number;
  effective_duration?: number;
  total_duration_seconds?: number;
  completed_exercises?: number;
  perceived_intensity?: number;
  energy_level?: number;
  mood?: string;
  notes?: string;
  exercises?: WorkoutExercise[];
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

export type WorkoutStatus =
  | "not_started"
  | "in_progress"
  | "paused"
  | "completed";

export interface WorkoutExerciseProgress {
  id?: number;
  workout_id: number;
  routine_exercise_id: number;
  completed_sets: number;
  completed: boolean;
  notes?: string;
}

export interface CreateWorkoutRequest {
  routine_id: number;
  name?: string;
  workout_type?: string;
}

export interface WorkoutCompletionData {
  workout_rating?: number;
  perceived_intensity?: number;
  energy_level?: number;
  mood?: string;
  notes?: string;
  total_duration_seconds?: number;      // Duración total del workout en segundos (actualizado para API)
}
