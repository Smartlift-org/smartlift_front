export interface Exercise {
  id: number;
  name: string;
  equipment: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  image_urls: string[];
  difficulty_level: number;
  has_equipment: boolean;
  level: string;
  instructions?: string;
}

export interface ExerciseCategory {
  id: number;
  name: string;
}
