import { storageService } from '@/services/storage';
import { CustomExercise, Template, UserPreferences, Workout } from '@/types';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface DataContextType {
  templates: Template[];
  workouts: Workout[];
  userPreferences: UserPreferences | null;
  customExercises: CustomExercise[];
  loading: boolean;
  refreshData: () => Promise<void>;
  saveTemplate: (template: Template) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  saveWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getLastWorkoutWithExercise: (exerciseName: string) => Promise<any>;
  saveUserPreferences: (preferences: UserPreferences) => Promise<void>;
  saveCustomExercise: (exercise: CustomExercise) => Promise<void>;
  deleteCustomExercise: (exerciseId: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Storage timeout')), 5000)
      );
      
      const dataPromise = storageService.getData();
      const data = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      setTemplates(data.templates);
      setWorkouts(data.workouts.sort((a, b) => b.date.localeCompare(a.date)));
      setCustomExercises(data.customExercises || []);
      
      // Load user preferences
      const preferences = await storageService.getUserPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('[DataContext] Error refreshing data:', error);
      // Set empty data on error to prevent hanging
      setTemplates([]);
      setWorkouts([]);
      setCustomExercises([]);
      setUserPreferences(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const saveTemplate = useCallback(async (template: Template) => {
    await storageService.saveTemplate(template);
    await refreshData();
  }, [refreshData]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    await storageService.deleteTemplate(templateId);
    await refreshData();
  }, [refreshData]);

  const saveWorkout = useCallback(async (workout: Workout) => {
    await storageService.saveWorkout(workout);
    await refreshData();
  }, [refreshData]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    await storageService.deleteWorkout(workoutId);
    await refreshData();
  }, [refreshData]);

  const getLastWorkoutWithExercise = useCallback(async (exerciseName: string) => {
    return await storageService.getLastWorkoutWithExercise(exerciseName);
  }, []);

  const saveUserPreferencesCallback = useCallback(async (preferences: UserPreferences) => {
    await storageService.saveUserPreferences(preferences);
    setUserPreferences(preferences);
  }, []);

  const saveCustomExerciseCallback = useCallback(async (exercise: CustomExercise) => {
    await storageService.saveCustomExercise(exercise);
    await refreshData();
  }, [refreshData]);

  const deleteCustomExerciseCallback = useCallback(async (exerciseId: string) => {
    await storageService.deleteCustomExercise(exerciseId);
    await refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider
      value={{
        templates,
        workouts,
        userPreferences,
        customExercises,
        loading,
        refreshData,
        saveTemplate,
        deleteTemplate,
        saveWorkout,
        deleteWorkout,
        getLastWorkoutWithExercise,
        saveUserPreferences: saveUserPreferencesCallback,
        saveCustomExercise: saveCustomExerciseCallback,
        deleteCustomExercise: deleteCustomExerciseCallback,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

