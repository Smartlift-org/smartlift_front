export interface AIRoutine {
  id: number;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  ai_generated: boolean;
  validation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  routine_exercises: RoutineExercise[];
}

export interface RoutineExercise {
  id: number;
  exercise_id: number;
  exercise: {
    id: number;
    name: string;
    muscle_group: string;
  };
  sets: number;
  reps: number;
  rest_time: number;
  order: number;
  group_type: 'regular' | 'superset' | 'circuit';
  weight?: number;
}

export interface RoutineModificationRequest {
  difficulty: {
    increase: boolean;
    decrease: boolean;
    maintain: boolean;
  };
  duration: {
    shorter: boolean;
    longer: boolean;
    maintain: boolean;
    specific?: number;
  };
  focus: {
    strength?: boolean;
    endurance?: boolean;
    hypertrophy?: boolean;
    cardio?: boolean;
  };
  exercises: {
    addMoreFor: string[];
    removeBodyParts: string[];
    replaceSpecific: number[];
  };
  volume: {
    moreSets: boolean;
    fewerSets: boolean;
    moreReps: boolean;
    fewerReps: boolean;
    maintain: boolean;
  };
  restTime: {
    shorter: boolean;
    longer: boolean;
    maintain: boolean;
  };
  specificInstructions: string;
}

export interface RoutineModificationPayload {
  routineId: number;
  originalRoutine: AIRoutine;
  modifications: RoutineModificationRequest;
}

export interface ModifiedRoutineResponse {
  success: boolean;
  data: {
    modifiedRoutine: AIRoutine;
    appliedModifications: {
      difficulty?: string;
      duration?: string;
      exercisesAdded?: string[];
      exercisesReplaced?: string[];
      volumeChanges?: string;
      restTimeChanges?: string;
    };
  };
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
