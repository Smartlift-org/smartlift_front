export interface Exercise {
  id: number;
  name: string;
  instructions: string;
  primary_muscles: string[];
  level: "beginner" | "intermediate" | "expert";
  images: string[];
  video_url?: string;
  difficulty_level: number;
}

export interface ExerciseCategory {
  id: number;
  name: string;
}
