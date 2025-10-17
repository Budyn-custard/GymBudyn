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
- ✅ **Dynamic Exercise Management** - Add/remove exercises during workout via swipe & picker
- ✅ **Active Workout Tracking** - Resume interrupted workouts with finished state detection
- ✅ **Quick Input** - Auto-select text on focus for fast value editing
- ✅ **DateTime Tracking** - Start and end timestamps for every workout session

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
  startDateTime?: string; // ISO datetime when workout started
  endDateTime?: string; // ISO datetime when workout finished
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
Production ready MVP with offline functionality. Full workout management including:
- Dynamic exercise add/remove during active sessions
- Swipe-to-delete gesture support for exercises
- Active workout state persistence with finished date tracking
- Quick text selection for efficient data entry
- Complete datetime tracking with start and end timestamps
- Active workout tile filters out completed workouts (with endDateTime set)

**To run:** `npx expo start`