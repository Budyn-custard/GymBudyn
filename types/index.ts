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
  customExercises?: CustomExercise[];
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

// Custom exercise created by user
export interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  isCustom: true;
}

// User Preferences
export interface UserPreferences {
  weeklyFrequency: 3 | 4 | 5 | 6; // Number of workouts per week
  selectedDays: string[]; // Array of day names: ['Monday', 'Wednesday', 'Friday']
  preferredGoal?: 'general_strength' | 'hypertrophy' | 'pure_strength' | 'cutting_phase' | 'lean_bulk';
  themePreference?: 'light' | 'dark' | 'automatic'; // Theme preference (defaults to automatic)
  hasCompletedOnboarding: boolean;
}

