import { storageService } from '@/services/storage';
import { Template, Workout } from '@/types';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface DataContextType {
  templates: Template[];
  workouts: Workout[];
  loading: boolean;
  refreshData: () => Promise<void>;
  saveTemplate: (template: Template) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  saveWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getLastWorkoutWithExercise: (exerciseName: string) => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      console.log('[DataContext] Starting data refresh...');
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Storage timeout')), 5000)
      );
      
      const dataPromise = storageService.getData();
      const data = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      console.log('[DataContext] Data loaded:', data);
      setTemplates(data.templates);
      setWorkouts(data.workouts.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error('[DataContext] Error refreshing data:', error);
      // Set empty data on error to prevent hanging
      setTemplates([]);
      setWorkouts([]);
    } finally {
      setLoading(false);
      console.log('[DataContext] Loading complete');
    }
  };

  useEffect(() => {
    console.log('[DataContext] Component mounted, initializing...');
    refreshData();
  }, []);

  const saveTemplate = async (template: Template) => {
    await storageService.saveTemplate(template);
    await refreshData();
  };

  const deleteTemplate = async (templateId: string) => {
    await storageService.deleteTemplate(templateId);
    await refreshData();
  };

  const saveWorkout = async (workout: Workout) => {
    await storageService.saveWorkout(workout);
    await refreshData();
  };

  const deleteWorkout = async (workoutId: string) => {
    await storageService.deleteWorkout(workoutId);
    await refreshData();
  };

  const getLastWorkoutWithExercise = async (exerciseName: string) => {
    return await storageService.getLastWorkoutWithExercise(exerciseName);
  };

  return (
    <DataContext.Provider
      value={{
        templates,
        workouts,
        loading,
        refreshData,
        saveTemplate,
        deleteTemplate,
        saveWorkout,
        deleteWorkout,
        getLastWorkoutWithExercise,
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

