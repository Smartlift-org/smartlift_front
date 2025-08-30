export interface Challenge {
  id: number;
  name: string;
  description?: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  start_date: string;
  end_date: string;
  is_active: boolean;
  estimated_duration_minutes?: number;
  coach_id: number;
  coach: UserBasic;
  challenge_exercises: ChallengeExercise[];
  participants_count: number;
  total_attempts: number;
  completed_attempts: number;
  is_active_now: boolean;
}

export interface ChallengeExercise {
  id: number;
  sets: number;
  reps: number;
  rest_time_seconds: number;
  order_index: number;
  notes?: string;
  exercise: Exercise;
}

export interface Exercise {
  id: number;
  name: string;
  primary_muscles: string[];
  difficulty_level: number;
  video_url?: string;
}

export interface ChallengeAttempt {
  id: number;
  challenge_id: number;
  user_id: number;
  completion_time_seconds?: number;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  is_best_attempt: boolean;
  exercise_times?: Record<string, number>;
  formatted_completion_time?: string;
  total_exercise_time: number;
  user: UserBasic;
  challenge: Challenge;
}

export interface LeaderboardEntry {
  position: number;
  user: UserBasic;
  completion_time: number;
  completed_at: string;
  formatted_time: string;
}

export interface ChallengeLeaderboard {
  challenge: Challenge;
  leaderboard: LeaderboardEntry[];
  user_best_attempt?: ChallengeAttempt;
  total_participants: number;
  total_completed: number;
}

export interface UserBasic {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  full_name: string;
}

export interface CreateChallengeData {
  name: string;
  description?: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  start_date: string;
  end_date: string;
  estimated_duration_minutes?: number;
  challenge_exercises_attributes: CreateChallengeExercise[];
}

export interface CreateChallengeExercise {
  exercise_id: number;
  sets: number;
  reps: number;
  rest_time_seconds: number;
  order_index: number;
  notes?: string;
}

export interface CompleteAttemptData {
  completion_time_seconds: number;
  exercise_times?: Record<string, number>;
}

export interface ChallengeResponse {
  success: boolean;
  data?: Challenge | Challenge[];
  message?: string;
  errors?: string[];
}

export interface ChallengeAttemptResponse {
  success: boolean;
  data?: ChallengeAttempt | ChallengeAttempt[];
  message?: string;
  errors?: string[];
  leaderboard_position?: number;
  is_new_personal_best?: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  data?: ChallengeLeaderboard;
  message?: string;
}

export const DIFFICULTY_LEVELS = {
  1: { name: 'Muy Fácil', color: 'bg-green-100 text-green-800', emoji: '😊' },
  2: { name: 'Fácil', color: 'bg-blue-100 text-blue-800', emoji: '🙂' },
  3: { name: 'Moderado', color: 'bg-yellow-100 text-yellow-800', emoji: '😐' },
  4: { name: 'Difícil', color: 'bg-orange-100 text-orange-800', emoji: '😤' },
  5: { name: 'Muy Difícil', color: 'bg-red-100 text-red-800', emoji: '🔥' },
} as const;
