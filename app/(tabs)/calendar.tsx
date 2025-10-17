import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

export default function CalendarScreen() {
  const { workouts } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedDate, setSelectedDate] = React.useState<string>('');

  // Create marked dates object
  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    
    workouts.forEach((workout) => {
      marked[workout.date] = {
        marked: true,
        dotColor: colors.tint,
      };
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.tint,
      };
    }

    return marked;
  }, [workouts, selectedDate, colors.tint]);

  const selectedWorkouts = workouts.filter(w => w.date === selectedDate);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  // Get current month stats
  const currentMonthWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    return workoutDate.getMonth() === now.getMonth() && 
           workoutDate.getFullYear() === now.getFullYear();
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.statsTitle}>This Month</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{currentMonthWorkouts.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Workouts</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {Math.round(currentMonthWorkouts.length / 4.3)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Per Week</ThemedText>
            </View>
          </View>
        </View>

        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
            calendarBackground: colorScheme === 'dark' ? '#000' : '#fff',
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: colors.tint,
            selectedDayTextColor: '#fff',
            todayTextColor: colors.tint,
            dayTextColor: colors.text,
            textDisabledColor: colors.icon,
            dotColor: colors.tint,
            selectedDotColor: '#fff',
            arrowColor: colors.tint,
            monthTextColor: colors.text,
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />

        {selectedDate && (
          <View style={[styles.selectedDateCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.selectedDateTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </ThemedText>
            
            {selectedWorkouts.length > 0 ? (
              selectedWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutItem}>
                  <ThemedText style={styles.workoutName}>{workout.templateName}</ThemedText>
                  <ThemedText style={styles.workoutDetail}>
                    {workout.exercises.length} exercises, {' '}
                    {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} sets
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={styles.noWorkout}>No workouts on this day</ThemedText>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  selectedDateCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 24,
  },
  workoutItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutDetail: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  noWorkout: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

