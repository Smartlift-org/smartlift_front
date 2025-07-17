export interface Exercise {
  id: number;
  name: string;
  instructions: string;
  primary_muscles: string[];
  level: "beginner" | "intermediate" | "expert";
  images: string[];
  difficulty_level: number; // Calculado en el backend (1=beginner, 2=intermediate, 3=expert)
}

export interface ExerciseCategory {
  id: number;
  name: string;
}
