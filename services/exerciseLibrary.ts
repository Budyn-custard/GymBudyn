import exerciseData from '@/exercises.json';
import { ExerciseLibraryItem } from '@/types';

export const exerciseLibrary: ExerciseLibraryItem[] = exerciseData.exercises;

export const searchExercises = (query: string): ExerciseLibraryItem[] => {
  if (!query.trim()) return exerciseLibrary;
  
  const lowerQuery = query.toLowerCase();
  return exerciseLibrary.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
    ex.equipment.toLowerCase().includes(lowerQuery)
  );
};

export const getExercisesByMuscleGroup = (muscleGroup: string): ExerciseLibraryItem[] => {
  return exerciseLibrary.filter(ex => ex.muscleGroup === muscleGroup);
};

export const getMuscleGroups = (): string[] => {
  return Array.from(new Set(exerciseLibrary.map(ex => ex.muscleGroup)));
};

