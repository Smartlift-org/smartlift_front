import { User } from "./http";

export interface PaginatedResponse<T> {
  members: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  filters_applied?: {
    search?: string;
    status?: string;
  };
}

export interface Member {
  id: string;
  name: string;
  email: string;
  profile?: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    fitness_goal?: string;
    experience_level?: string;
    available_days?: string[];
    equipment_available?: string[];
    activity_level?: string;
    physical_limitations?: string;
  };
  activity?: {
    total_workouts: number;
    recent_workouts: number;
    completed_workouts: number;
    this_month_workouts: number;
    last_workout_date?: string;
    activity_status: 'inactive' | 'low' | 'moderate' | 'high';
    consistency_score: number;
  };
  stats?: {
    total_volume: number;
    average_workout_rating?: number;
    total_sets_completed: number;
    total_exercises_completed: number;
    average_workout_duration?: number;
    personal_records_count: number;
    favorite_exercises: string[];
  };
  created_at: string;
  last_activity?: string;
  status?: 'active' | 'inactive';
}

export interface TrainerDashboard {
  active_members_count: number;
  total_members_count: number;
  total_workouts_count: number;
  avg_member_consistency: number;
  trainer: {
    id: string;
    name: string;
    email: string;
  };
  dashboard: {
    overview: {
      total_members: number;
      active_members: number;
      inactive_members: number;
      activity_rate: number;
      total_workouts: number;
      total_workouts_this_month: number;
      completed_workouts: number;
      completion_rate: number;
    };
    activity_metrics: {
      most_active_day: {
        day: string;
        workout_count: number;
      };
      peak_hours: Array<{
        hour: string;
        workout_count: number;
      }>;
      avg_session_duration: number;
    };
    performance_trends: any;
    member_distribution: any;
    recent_activity: Array<{
      id: string;
      member: {
        id: string;
        name: string;
      };
      type: string;
      status: string;
      duration: number;
      rating?: number;
      created_at: string;
      completed_at?: string;
    }>;
    top_performers: Array<{
      id: string;
      name: string;
      email: string;
      recent_workouts: number;
      recent_personal_records: number;
      consistency_score: number;
    }>;
    generated_at: string;
  };
}

export interface MemberProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture_url?: string;
  stats: {
    consistency_score: number;
    recent_workouts: number;
    total_workouts: number;
    avg_workout_duration: number;
    personal_records: number;
    volume_lifted: number;
    favorite_exercises: string[];
  };
  recent_activity: Array<{
    id: string;
    type: string;
    status: string;
    duration: number;
    exercises_count: number;
    created_at: string;
    completed_at?: string;
  }>;
}

export interface AvailableUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  profile_picture_url?: string;
}

export interface TrainerRoutine {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  user_id: string;
  created_at: string;
  updated_at: string;
  routine_exercises?: Array<{
    id: string;
    name: string;
    description?: string;
    sets: number;
    reps?: number;
    duration_seconds?: number;
    rest_seconds?: number;
    weight?: number;
    position: number;
    created_at: string;
    updated_at: string;
  }>;
}

export interface PaginatedRoutinesResponse {
  routines: TrainerRoutine[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  filters_applied?: {
    difficulty?: string;
  };
}
