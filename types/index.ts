import { RoutineExerciseFormData } from "../services/routineService";
import { AIRoutine } from "./routineModification";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };

  UserHome: undefined;
  CoachHome: { refresh?: number } | undefined;
  BasicProfile: undefined;
  StatsProfile: { fromRedirect?: boolean };
  RoutineList: { refresh?: boolean; startWorkout?: boolean };
  RoutineManagement: { refresh?: boolean };
  RoutineCreate: { customName?: string };
  RoutineEdit: { routineId: number; refresh?: boolean };
  ActiveWorkouts: undefined;
  RoutineSelect: { fromActiveWorkouts?: boolean };
  TrainerRoutines: { refresh?: boolean };
  MemberSelection: { routineId: string; customName?: string };
  MemberProfile: { memberId: string; refresh?: boolean };
  MemberManagement: undefined;
  MemberRoutineEdit: { routineId: number; memberId: string; refresh?: boolean };

  ExerciseSelect: {
    routineData: {
      name: string;
      description: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      duration: number;
    };
  };
  WorkoutTracker: { routineId: number; workoutId?: number; viewMode?: boolean };
  WorkoutDetail: { workoutId: number };
  WorkoutStats: { workoutId?: string; message?: string };
  AIRoutineGenerator: undefined;
  WorkoutHistory: undefined;
  RoutineValidation: undefined;
  RoutineValidationDetail: { routineId: number };
  SelectedExercises: {
    selectedExercises: RoutineExerciseFormData[];
    onReturn: (updatedExercises: RoutineExerciseFormData[] | null) => void;
  };
  ReviewRoutines: {
    routines: {
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
    }[];
  };

  AdminHome: undefined;
  AdminRegisterCoach: undefined;
  AdminCoachList: undefined;
  AdminUserList: undefined;
  AdminUserDetail: { userId: string };
  AdminCoachDetail: { coachId: string };
  AdminCoachEdit: { coachId: string };
  AdminUserEdit: { userId: string };

  // Routine Modification
  RoutineModification: { routineId: number };
  ModifiedRoutineResult: {
    originalRoutine: any;
    modifiedRoutine: any;
    appliedModifications: any;
  };
  AdminAssignUsers: { coachId: string; coachName: string };
  PublicProfilesExplore: undefined;
  PublicProfileDetail: { userId: number };
  PrivacySettings: undefined;

  // Chat screens
  ConversationList: undefined;
  Chat: { conversationId: number; participantName: string };
  ChatUserSelection: undefined;

  // Exercise Management
  ExerciseManagement: undefined;
  ExerciseVideoEdit: { exerciseId: number };

};

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "user" | "coach" | "admin";
  profile_picture_url?: string | null;
  created_at?: string;
  password?: string;
  password_confirmation?: string;
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
  role?: "user" | "coach" | "admin";
}

export * from "./declarations/trainer";
