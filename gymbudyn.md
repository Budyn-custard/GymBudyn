# 🏋️‍♂️ GymBudyn — Workout Tracking App

## Overview
**GymBudyn** is a React Native (Expo) mobile app for logging workouts offline. Stores data locally with AsyncStorage, designed for easy future .NET 10 backend integration.

## Tech Stack
- **Frontend:** React Native (Expo) + TypeScript
- **Storage:** AsyncStorage (local persistence)
- **Navigation:** Expo Router
- **Icons:** Ionicons

## Core Features
- ✅ **Templates** - Create/edit workout templates with exercises
- ✅ **Workout Sessions** - Log workouts with set completion tracking
- ✅ **History** - View past workouts chronologically
- ✅ **Calendar** - Monthly view with workout frequency
- ✅ **Exercise Library** - 50+ exercises with search/filter
- ✅ **Progress Tracking** - Previous workout data integration

## Data Models
```typescript
interface Template {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface Workout {
  id: string;
  date: string;
  templateName: string;
  exercises: WorkoutExercise[];
  notes?: string;
  duration?: number;
}

interface WorkoutSet {
  weight: number;
  reps: number;
  completed?: boolean;
}
```

## Key Screens
- **Home** - Quick access to start workouts
- **Templates** - Manage workout templates
- **Workout Session** - Log sets with completion tracking
- **History** - Past workout list
- **Calendar** - Monthly workout view

## Current Status
Production ready MVP with offline functionality. All core features implemented including set completion tracking, exercise library integration, and template management.

**To run:** `npx expo start`