export interface Exercise {
  id: number;
  name: string;
  equipment: string;
  category: string;
  difficulty: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions?: string[];
  image_url?: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseCategory {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}
