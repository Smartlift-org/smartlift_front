import { RoutineFormData } from '../services/routineService';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserHome: undefined;
  CoachHome: undefined;
  BasicProfile: undefined;
  StatsProfile: { fromRedirect?: boolean };
  RoutineList: { refresh?: boolean; startWorkout?: boolean };
  RoutineManagement: { refresh?: boolean };
  RoutineCreate: undefined;
  ExerciseSelect: { 
    routineData: {
      name: string;
      description: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      duration: number;
    } 
  };
  WorkoutTracker: { routineId: number };
  WorkoutStats: undefined;
  AIRoutineGenerator: undefined;
  ReviewRoutines: { 
    routines: {
      descripcion: string;
      routine: {
        name: string;
        description: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        duration: number;
        routine_exercises_attributes: {
          exercise_id: number;
          sets: number;
          reps: number;
          rest_time: number;
          order: number;
        }[];
      };
    }[];
  };
};

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'coach';
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'user' | 'coach';
}
