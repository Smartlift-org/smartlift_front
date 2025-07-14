export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  UserHome: undefined;
  CoachHome: undefined;
  BasicProfile: undefined;
  StatsProfile: undefined;
  RoutineList: undefined;
  RoutineCreate: undefined;
  ExerciseSelect: { routineId?: number };
  WorkoutTracker: { workoutId: number };
  WorkoutStats: { workoutId: number };
  WorkoutHistory: undefined;
  AIRoutineGenerator: undefined;
  ReviewRoutines: undefined;
  RoutineManagement: undefined;
  RoutineEdit: { routineId: number };
  ActiveWorkouts: undefined;
  RoutineSelect: undefined;
  WorkoutInProgress: { workoutId: number };
  SelectedExercises: { routineId?: number };
  MemberManagement: undefined;
  MemberProfile: { memberId: string };
};

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'coach' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

export * from './types/declarations/trainer';
