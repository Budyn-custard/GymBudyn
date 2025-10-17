// Data models for GymBudyn

export interface Exercise {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  imageUri?: string;
}

export interface Template {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  completed?: boolean;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: string; // ISO date string
  templateId?: string;
  templateName: string;
  exercises: WorkoutExercise[];
  notes?: string;
  duration?: number; // in minutes
}

export interface AppData {
  templates: Template[];
  workouts: Workout[];
}

// Exercise library from JSON
export interface ExerciseLibraryItem {
  id: number;
  name: string;
  muscleGroup: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  isCompound: boolean;
  unit: string;
  instructions: string;
}

