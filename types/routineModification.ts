export interface AIRoutine {
  id: number;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  ai_generated: boolean;
  validation_status: "pending" | "approved" | "rejected";
  created_at: string;
  formatted_created_at: string;
  formatted_updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  routine_exercises: RoutineExercise[];
}

export interface RoutineExercise {
  id: number;
  exercise_id: number;
  exercise: {
    id: number;
    name: string;
    primary_muscles: string;
    images: string[];
    difficulty_level: string;
  };
  sets: number;
  reps: number;
  rest_time: number;
  order: number;
  needs_modification?: boolean;
  weight?: number;
}

export interface ExerciseModificationPayload {
  user_message: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    rest_time: number;
    order: number;
  }[];
}

export interface ModifiedExercisesResponse {
  success: boolean;
  data: {
    exercises: {
      name: string;
      sets: number;
      reps: number;
      rest_time: number;
      order: number;
      group_type: string;
      group_order: number;
      weight: number;
      exercise_id: number;
    }[];
    generated_at: string;
  };
}

export interface RoutineModificationPayload {
  routine: {
    name: string;
    routine_exercises_attributes: {
      exercise_id: number;
      sets: number;
      reps: number;
      rest_time: number;
      order: number;
      needs_modification: boolean;
    }[];
  };
  modification_message: string;
}

export interface ModifiedRoutineResponse {
  success: boolean;
  data: {
    routines: Array<{
      routine: AIRoutine;
    }>;
    generated_at: string;
  };
}

export interface ExerciseModificationSelection {
  exerciseId: number;
  exerciseName: string;
  needsModification: boolean;
}

export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Brazos",
  "Piernas",
  "Glúteos",
  "Abdomen",
  "Cardio",
];
