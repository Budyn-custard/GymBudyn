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
  startDateTime?: string; // ISO datetime string - when workout started
  endDateTime?: string; // ISO datetime string - when workout was finished
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

export interface ActiveWorkoutSession {
  template: Template;
  exercises: Array<{
    id: string;
    name: string;
    sets: WorkoutSet[];
    previousData?: WorkoutExercise;
  }>;
  notes: string;
  startTime: number;
  finishedDate?: string; // ISO date string when workout was finished
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

