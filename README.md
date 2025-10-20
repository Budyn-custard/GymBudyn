# 🏋️‍♂️ GymBudyn — Workout Tracking App

A production-ready React Native (Expo) mobile app for logging workouts offline. Track your progress, create custom templates, and follow science-based workout programs. All data is stored locally with AsyncStorage, designed for easy future .NET 10 backend integration.

## ✨ Features

### Core Functionality
- ✅ **User Personalization** - Weekly frequency selection (3x-6x) and custom workout day scheduling
- ✅ **Theme Customization** - Choose between light, dark, or automatic (system) theme
- ✅ **Smart Home Screen** - Clean, organized dashboard with workout stats and schedule awareness
- ✅ **Templates** - Create/edit workout templates with exercises
- ✅ **Science-Based Programs** - 7 pre-built templates based on sports science research
- ✅ **Workout Sessions** - Log workouts with set completion tracking
- ✅ **History** - View past workouts chronologically
- ✅ **Progress Analytics** - Visual charts and statistics for exercise progression
- ✅ **Calendar** - Monthly view with workout frequency
- ✅ **Exercise Library** - 50+ exercises with search/filter
- ✅ **Progress Tracking** - Previous workout data integration
- ✅ **Dynamic Exercise Management** - Add/remove exercises during workout via swipe & picker
- ✅ **Active Workout Tracking** - Resume interrupted workouts with finished state detection
- ✅ **Quick Input** - Auto-select text on focus for fast value editing
- ✅ **DateTime Tracking** - Start and end timestamps for every workout session

### Personalization
- **Weekly Frequency Selection** - Choose 3x, 4x, 5x, or 6x workouts per week
- **Custom Day Scheduling** - Select specific days for your workouts (Mon-Sun)
- **Theme Preference** - Pick light mode, dark mode, or automatic (follows system)
- **Goal-Based Recommendations** - Optional fitness goal selection
- **Schedule Awareness** - Home screen shows if today is a scheduled workout day
- **Next Workout Preview** - Displays upcoming workout day when not scheduled today

### Progress Tracking & Analytics
- **Exercise-Specific Progress** - Track performance for each individual exercise
- **Visual Charts** - Beautiful line charts showing weight and volume progression over time
- **Performance Metrics** - Max weight, average weight, total volume, and workout count
- **Progress Indicators** - Percentage improvements and trend arrows
- **Workout History** - Recent performance data for each exercise
- **Smart Data Aggregation** - Automatically calculates progress from completed workouts

### Science-Based Templates
GymBudyn includes 7 professionally designed workout programs:
1. **Foundations A** - Full Body 3x/week (Beginner)
2. **Foundations B** - Upper/Lower 4x/week (Beginner Hypertrophy)
3. **Push Pull Legs** - 6x/week (Intermediate Hypertrophy)
4. **Upper Lower 2.0** - 4x/week (Strength-Hypertrophy Mix)
5. **Mass Builder** - 5x/week (Hypertrophy Overload)
6. **Strength Builder** - 3x/week (Power Focus)
7. **Lean Cut** - 4x/week (Maintenance Strength)

Each template includes exercise alternatives, set/rep recommendations, progression protocols, and scientific backing (NSCA, Schoenfeld, Helms).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app (for testing on mobile)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd GymBudyn
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your device:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Storage**: AsyncStorage (local persistence)
- **Charts**: react-native-chart-kit + react-native-svg
- **Icons**: Ionicons
- **UI**: Native components with custom theming

## 📁 Project Structure

```
GymBudyn/
├── app/                      # Main app screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Smart home screen with stats
│   │   ├── templates.tsx    # Template management
│   │   ├── history.tsx      # Workout history
│   │   ├── progress.tsx     # Progress analytics with charts
│   │   ├── calendar.tsx     # Calendar view
│   │   └── preferences.tsx  # User personalization & theme
│   ├── template-form.tsx    # Template creation/edit form
│   ├── workout-session.tsx  # Active workout screen
│   └── workout-detail.tsx   # Workout details view
├── components/              # Reusable UI components
│   └── ui/                  # UI-specific components
│       └── exercise-picker.tsx
├── contexts/                # React contexts (DataContext)
├── services/                # Storage and data services
│   ├── storage.ts           # AsyncStorage wrapper
│   ├── exerciseLibrary.ts   # Exercise database
│   └── defaultTemplates.ts  # Pre-built templates
├── types/                   # TypeScript type definitions
├── constants/               # App constants and theme
└── hooks/                   # Custom React hooks
```

## 📊 Data Models

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

interface UserPreferences {
  weeklyFrequency: 3 | 4 | 5 | 6;
  selectedDays: string[];
  preferredGoal?: 'general_strength' | 'hypertrophy' | 'pure_strength' | 'cutting_phase' | 'lean_bulk';
  themePreference?: 'light' | 'dark' | 'automatic';
  hasCompletedOnboarding: boolean;
}
```

## 🎯 Current Status

Production-ready MVP with offline functionality. Full workout management including:
- **User Personalization System** - Set weekly frequency (3x-6x), choose specific workout days, and customize theme
- **Progress Analytics** - Visual charts showing weight and volume progression for every exercise
- **Theme Customization** - Light, dark, or automatic theme that follows system preferences
- **Smart Home Interface** - Redesigned clean dashboard with workout stats and schedule awareness
- **Science-Based Templates** - 7 professionally designed programs
- **Flexible Template System** - Unified modal for choosing custom and default templates
- Dynamic exercise add/remove during active sessions
- Swipe-to-delete gesture support for exercises
- Active workout state persistence with finished date tracking
- Quick text selection for efficient data entry
- Complete datetime tracking with start and end timestamps
- Keyboard-aware UI with accessible Save/Cancel buttons

## 🔮 Future Enhancements

- .NET 10 Web API backend for data synchronization
- Multi-device sync
- Exercise images and videos
- Advanced analytics (1RM calculator, periodization planning)
- Social features and workout sharing
- Web UI for trainers (Blazor or React)
- Export progress data (PDF/CSV)

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**To run the app:** `npx expo start`
