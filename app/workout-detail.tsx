import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Workout } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const workout: Workout = JSON.parse(params.workout as string);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.templateName}>{workout.templateName}</ThemedText>
          <ThemedText style={styles.date}>{formatDate(workout.date)}</ThemedText>
          
          {workout.duration && (
            <ThemedText style={styles.duration}>Duration: {workout.duration} minutes</ThemedText>
          )}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{workout.exercises.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Exercises</ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{totalSets}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Sets</ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{Math.round(totalVolume)}</ThemedText>
            <ThemedText style={styles.statLabel}>Volume (kg)</ThemedText>
          </View>
        </View>

        {workout.notes && (
          <View style={[styles.notesCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.notesTitle}>Notes</ThemedText>
            <ThemedText style={styles.notesText}>{workout.notes}</ThemedText>
          </View>
        )}

        <View style={styles.exercisesSection}>
          <ThemedText style={styles.sectionTitle}>Exercises</ThemedText>
          
          {workout.exercises.map((exercise, index) => {
            const exerciseVolume = exercise.sets.reduce(
              (sum, set) => sum + set.weight * set.reps,
              0
            );

            return (
              <View
                key={index}
                style={[styles.exerciseCard, { backgroundColor: colors.card }]}
              >
                <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                
                <View style={styles.setsTable}>
                  <View style={styles.tableHeader}>
                    <ThemedText style={styles.tableHeaderText}>Set</ThemedText>
                    <ThemedText style={styles.tableHeaderText}>Weight</ThemedText>
                    <ThemedText style={styles.tableHeaderText}>Reps</ThemedText>
                    <ThemedText style={styles.tableHeaderText}>Volume</ThemedText>
                  </View>

                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.tableRow}>
                      <ThemedText style={styles.tableCell}>{setIndex + 1}</ThemedText>
                      <ThemedText style={styles.tableCell}>{set.weight} kg</ThemedText>
                      <ThemedText style={styles.tableCell}>{set.reps}</ThemedText>
                      <ThemedText style={styles.tableCell}>
                        {Math.round(set.weight * set.reps)} kg
                      </ThemedText>
                    </View>
                  ))}

                  <View style={[styles.tableFooter, { borderTopColor: colors.border }]}>
                    <ThemedText style={styles.tableFooterText}>
                      {exercise.sets.length} sets - {Math.round(exerciseVolume)} kg total
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  duration: {
    fontSize: 14,
    marginTop: 8,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  notesCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exercisesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  setsTable: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.7,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  tableFooter: {
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  tableFooterText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

