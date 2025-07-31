import { UserStats } from "../services/userStatsService";

export interface AIRoutineParams {
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  height: number;
  experience_level: "beginner" | "intermediate" | "advanced";
  preferences?: string;
  frequency_per_week: number;
  time_per_session: number;
  goal: string;
}

export interface AIRoutineRequest {
  userStats: UserStats;
  generatePerDay: boolean;
  preferences: {
    focusAreas?: string[];
    equipment?: string;
    additionalNotes?: string;
  };
}

export interface AIRoutineResponse {
  descripcion: string;
  routine: {
    name: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    duration: number;
    source_type?: "ai_generated" | "manual";
    validation_status?: "pending" | "approved" | "rejected";
    routine_exercises_attributes: {
      exercise_id: number;
      sets: number;
      reps: number;
      rest_time: number;
      order: number;
    }[];
  };
}

export interface RoutineValidation {
  id: number;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  source_type: "ai_generated" | "manual";
  validation_status: "pending" | "approved" | "rejected";
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  exercises_count: number;
  ai_prompt_data?: any;
  validated_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  validated_at?: string;
  validation_notes?: string;
}
