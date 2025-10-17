# 🏋️‍♂️ GymBudyn

A mobile workout logging app built with React Native (Expo). Track your workouts, create custom templates, and monitor your progress over time.

## Features

- **Templates**: Create reusable workout templates with custom exercises, sets, reps, and weights
- **Workout Sessions**: Log workouts with real-time tracking and previous performance data
- **History**: View all completed workouts with detailed stats and volume tracking
- **Calendar**: Visualize your workout frequency with a monthly calendar view
- **Progress Tracking**: See your previous workout data to track improvements
- **Offline First**: All data stored locally using AsyncStorage

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Storage**: AsyncStorage
- **UI**: React Native components with SF Symbols

## Getting Started

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
   npm start
   ```

4. Run on your device:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## Project Structure

```
GymBudyn/
├── app/                      # Main app screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home screen
│   │   ├── templates.tsx    # Templates list
│   │   ├── history.tsx      # Workout history
│   │   └── calendar.tsx     # Calendar view
│   ├── template-form.tsx    # Template creation/edit form
│   ├── workout-session.tsx  # Active workout screen
│   └── workout-detail.tsx   # Workout details view
├── components/              # Reusable UI components
├── contexts/                # React contexts (DataContext)
├── services/                # Storage service layer
├── types/                   # TypeScript type definitions
├── constants/               # App constants and theme
└── hooks/                   # Custom React hooks
```

## Features in Detail

### Templates
- Create and manage workout templates
- Add multiple exercises with default sets/reps/weights
- Duplicate existing templates
- Edit and delete templates

### Workout Sessions
- Start a workout from any template
- See previous workout data for each exercise
- Add/remove sets dynamically
- One-tap autofill from previous sessions
- Add optional workout notes

### History & Calendar
- View all completed workouts chronologically
- See detailed stats (exercises, sets, volume)
- Calendar view with workout day highlights
- Monthly workout frequency tracking

## Future Enhancements

- .NET 10 Web API backend for data synchronization
- Multi-device sync
- Exercise images and videos
- Advanced progress charts and analytics
- Social features and workout sharing
- Web UI for trainers (Blazor or React)

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
