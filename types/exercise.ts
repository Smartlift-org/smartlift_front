export interface Exercise {
  id: number;
  name: string;
  instructions: string;
  primary_muscles: string[];
  level: string;
  images: string[];
  difficulty_level: number;
}

export interface ExerciseCategory {
  id: number;
  name: string;
}
