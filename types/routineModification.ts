export interface AIRoutine {
  id: number;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  ai_generated: boolean;
  validation_status: 'pending' | 'approved' | 'rejected';
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
  needs_modification?: boolean; // Para marcar ejercicios que necesitan modificación
  weight?: number;
}

// Payload para modificar ejercicios específicos (NUEVO FLUJO)
export interface ExerciseModificationPayload {
  user_message: string;
  exercises: {
    exercise_id: number;
    sets: number;
    reps: number;
    rest_time: number;
    order: number;
  }[];
}

// Respuesta del backend para modificación de ejercicios (NUEVO FLUJO)
export interface ModifiedExercisesResponse {
  success: boolean;
  data: {
    exercises: {
      exercise_id: number;
      sets: number;
      reps: number;
      rest_time: number;
      order: number;
    }[];
    generated_at: string;
  };
}

// DEPRECATED - Mantener para compatibilidad
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

// DEPRECATED - Mantener para compatibilidad
export interface ModifiedRoutineResponse {
  success: boolean;
  data: {
    routines: Array<{
      routine: AIRoutine;
    }>;
    generated_at: string;
  };
}

// Interface para la UI de selección de ejercicios
export interface ExerciseModificationSelection {
  exerciseId: number;
  exerciseName: string;
  needsModification: boolean;
}

export const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda', 
  'Hombros',
  'Brazos',
  'Piernas',
  'Glúteos',
  'Abdomen',
  'Cardio'
];
