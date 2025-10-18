import { ActiveWorkoutSession, AppData, Template, UserPreferences, Workout, WorkoutExercise } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gymbudyn_data';
const ACTIVE_WORKOUT_KEY = '@gymbudyn_active_workout';
const PREFERENCES_KEY = '@gymbudyn_preferences';

const defaultData: AppData = {
  templates: [],
  workouts: [],
};

export const storageService = {
  // Initialize storage
  async initialize(): Promise<AppData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    } catch (error) {
      console.error('Error initializing storage:', error);
      return defaultData;
    }
  },

  // Get all data
  async getData(): Promise<AppData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : defaultData;
    } catch (error) {
      console.error('[Storage] Error getting data:', error);
      return defaultData;
    }
  },

  // Save all data
  async saveData(data: AppData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  },

  // Templates
  async getTemplates(): Promise<Template[]> {
    const data = await this.getData();
    return data.templates;
  },

  async saveTemplate(template: Template): Promise<void> {
    const data = await this.getData();
    const index = data.templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      data.templates[index] = template;
    } else {
      data.templates.push(template);
    }
    await this.saveData(data);
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const data = await this.getData();
    data.templates = data.templates.filter(t => t.id !== templateId);
    await this.saveData(data);
  },

  // Workouts
  async getWorkouts(): Promise<Workout[]> {
    const data = await this.getData();
    return data.workouts.sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
  },

  async saveWorkout(workout: Workout): Promise<void> {
    const data = await this.getData();
    const index = data.workouts.findIndex(w => w.id === workout.id);
    if (index >= 0) {
      data.workouts[index] = workout;
    } else {
      data.workouts.push(workout);
    }
    await this.saveData(data);
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    const data = await this.getData();
    data.workouts = data.workouts.filter(w => w.id !== workoutId);
    await this.saveData(data);
  },

  async getWorkoutsByDate(date: string): Promise<Workout[]> {
    const workouts = await this.getWorkouts();
    return workouts.filter(w => w.date === date);
  },

  async getLastWorkoutWithExercise(exerciseName: string): Promise<WorkoutExercise | null> {
    const workouts = await this.getWorkouts();
    for (const workout of workouts) {
      const exercise = workout.exercises.find(e => e.name === exerciseName);
      if (exercise) {
        return exercise;
      }
    }
    return null;
  },

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },

  // Active Workout Session
  async saveActiveWorkout(session: ActiveWorkoutSession): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving active workout:', error);
      throw error;
    }
  },

  async getActiveWorkout(): Promise<ActiveWorkoutSession | null> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting active workout:', error);
      return null;
    }
  },

  async clearActiveWorkout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
    } catch (error) {
      console.error('Error clearing active workout:', error);
    }
  },

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Default preferences
      return {
        weeklyFrequency: 3,
        selectedDays: [],
        hasCompletedOnboarding: false,
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        weeklyFrequency: 3,
        selectedDays: [],
        hasCompletedOnboarding: false,
      };
    }
  },

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  },
};

