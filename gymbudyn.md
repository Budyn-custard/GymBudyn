# 🏋️‍♂️ GymBudyn — Workout Tracking App

## Overview
**GymBudyn** is a React Native (Expo) mobile app for logging workouts offline. Stores data locally with AsyncStorage, designed for easy future .NET 10 backend integration.

## Tech Stack
- **Frontend:** React Native (Expo) + TypeScript
- **Storage:** AsyncStorage (local persistence)
- **Navigation:** Expo Router
- **Icons:** Ionicons

## Core Features
- ✅ **User Personalization** - Weekly frequency selection (3x-6x) and custom workout day scheduling
- ✅ **Theme Customization** - Choose between light, dark, or automatic (system) theme
- ✅ **Smart Home Screen** - Clean, organized dashboard with workout stats and schedule awareness
- ✅ **Templates** - Create/edit workout templates with exercises
- ✅ **Science-Based Programs** - 7 pre-built templates based on sports science research
- ✅ **Workout Sessions** - Log workouts with set completion tracking
- ✅ **History** - View past workouts chronologically
- ✅ **Progress Analytics** - Visual charts and statistics for exercise progression
- ✅ **Exercise Library** - 50+ exercises with search/filter and custom exercise creation
- ✅ **Custom Exercises** - Add your own exercises with muscle group and equipment tracking
- ✅ **Progress Tracking** - Previous workout data integration
- ✅ **Dynamic Exercise Management** - Add/remove exercises during workout via swipe & picker
- ✅ **Active Workout Tracking** - Resume interrupted workouts with improved visual design
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

interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  isCustom: true;
}

interface UserPreferences {
  weeklyFrequency: 3 | 4 | 5 | 6; // Number of workouts per week
  selectedDays: string[]; // Array of day names
  preferredGoal?: 'general_strength' | 'hypertrophy' | 'pure_strength' | 'cutting_phase' | 'lean_bulk';
  themePreference?: 'light' | 'dark' | 'automatic'; // Theme preference (defaults to automatic)
  hasCompletedOnboarding: boolean;
}
```

## Key Screens
- **Home** - Smart dashboard with stats, schedule awareness, and improved resume workout card
- **Preferences** - Personalize weekly frequency, workout days, theme, and fitness goals
- **Templates** - Manage workout templates
- **Workout Session** - Log sets with completion tracking
- **History** - Past workout list
- **Progress** - Exercise-specific analytics with visual charts
- **Exercises** - Browse 50+ exercises and create custom ones

## Current Status
Production ready MVP with offline functionality. Full workout management including:
- **User Personalization System** - Set weekly frequency (3x-6x), choose specific workout days, and customize theme
- **Progress Analytics** - Visual charts showing weight and volume progression for every exercise
- **Theme Customization** - Light, dark, or automatic theme that follows system preferences
- **Smart Home Interface** - Clean dashboard with workout stats, schedule awareness, and enhanced resume workout card
- **Science-Based Templates** - 7 professionally designed programs (Foundations, PPL, Upper/Lower, etc.)
- **Flexible Template System** - Unified modal for choosing custom and default templates
- **Exercise Management** - 50+ built-in exercises with search/filter by muscle group
- **Custom Exercise Creation** - Add your own exercises with muscle group and equipment tracking
- Dynamic exercise add/remove during active sessions
- Swipe-to-delete gesture support for exercises
- Active workout state persistence with improved visual design
- Quick text selection for efficient data entry
- Complete datetime tracking with start and end timestamps
- Active workout tile filters out completed workouts (with endDateTime set)
- **Keyboard-Aware UI** - Save/Cancel buttons remain accessible when keyboard is open in template form

## Personalization Features
- **Weekly Frequency Selection** - Choose 3x, 4x, 5x, or 6x workouts per week
- **Custom Day Scheduling** - Select specific days for your workouts (Mon-Sun)
- **Theme Preference** - Pick light mode, dark mode, or automatic (follows system)
- **Goal-Based Recommendations** - Optional fitness goal selection
- **Schedule Awareness** - Home screen shows if today is a scheduled workout day
- **Next Workout Preview** - Displays upcoming workout day when not scheduled today

## Progress Analytics Features
- **Exercise-Specific Tracking** - View progress for each individual exercise
- **Visual Charts** - Beautiful line charts showing weight and volume progression
- **Performance Metrics** - Max weight, average weight, total volume, and workout count
- **Progress Indicators** - Percentage improvements and trend arrows
- **Workout History** - Recent performance data for each exercise
- **Smart Data Aggregation** - Automatically calculates progress from completed workouts

## Science-Based Templates
GymBudyn includes 7 professionally designed workout programs:
1. **Foundations A** - Full Body 3x/week (Beginner)
2. **Foundations B** - Upper/Lower 4x/week (Beginner Hypertrophy)
3. **Push Pull Legs** - 6x/week (Intermediate Hypertrophy)
4. **Upper Lower 2.0** - 4x/week (Strength-Hypertrophy Mix)
5. **Mass Builder** - 5x/week (Hypertrophy Overload)
6. **Strength Builder** - 3x/week (Power Focus)
7. **Lean Cut** - 4x/week (Maintenance Strength)

Each template includes:
- Exercise alternatives
- Set/rep recommendations
- Progression protocols
- Scientific backing (NSCA, Schoenfeld, Helms)

**To run:** `npx expo start`