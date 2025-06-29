// Tipos para la generación de rutinas con IA
import { UserStats } from "../services/userStatsService";

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
    routine_exercises_attributes: {
      exercise_id: number;
      sets: number;
      reps: number;
      rest_time: number;
      order: number;
    }[];
  };
}
