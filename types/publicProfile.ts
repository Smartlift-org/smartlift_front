// Types for public profiles functionality

export interface PrivacySettings {
  show_name: boolean;
  show_profile_picture: boolean;
  show_workout_count: boolean;
  show_join_date: boolean;
  show_personal_records: boolean;
  show_favorite_exercises: boolean;
  is_profile_public: boolean;
}

export interface PersonalRecord {
  exercise_name: string;
  weight: number;
  reps: number;
  pr_type: 'weight' | 'reps' | 'volume';
  achieved_at: string;
}

export interface PersonalRecordsData {
  recent: PersonalRecord[];
  total_count: number;
}

export interface PublicProfile {
  id: number;
  name?: string;
  profile_picture_url?: string;
  completed_workouts_count?: number;
  join_date?: string;
  personal_records?: PersonalRecordsData;
  favorite_exercises?: string[];
  stats?: {
    workouts_count: number;
    has_personal_records: boolean;
    favorite_exercises_count: number;
  };
}

export interface PublicProfilesResponse {
  success: boolean;
  data: {
    profiles: PublicProfile[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
    };
    filters_applied: {
      search?: string;
    };
  };
}

export interface PublicProfileDetailResponse {
  success: boolean;
  data: {
    profile: PublicProfile;
  };
}

export interface PrivacySettingsResponse {
  success: boolean;
  data: PrivacySettings;
  message?: string;
  error?: string;
  details?: string[];
}
