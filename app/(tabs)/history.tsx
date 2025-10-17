import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Workout } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const { workouts, deleteWorkout } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleDelete = (workout: Workout) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(workout.id),
        },
      ]
    );
  };

  const renderWorkout = ({ item }: { item: Workout }) => {
    const totalSets = item.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalVolume = item.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    );

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => router.push({
          pathname: '/workout-detail',
          params: { workout: JSON.stringify(item) },
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.templateName}>{item.templateName}</ThemedText>
            <ThemedText style={styles.date}>{formatDate(item.date)}</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{item.exercises.length}</ThemedText>
            <ThemedText style={styles.statLabel}>exercises</ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{totalSets}</ThemedText>
            <ThemedText style={styles.statLabel}>sets</ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{Math.round(totalVolume)}</ThemedText>
            <ThemedText style={styles.statLabel}>kg volume</ThemedText>
          </View>
        </View>

        {item.notes && (
          <ThemedText style={styles.notes} numberOfLines={2}>
            📝 {item.notes}
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time" size={64} color={colors.icon} />
            <ThemedText style={styles.emptyText}>No workouts yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Start your first workout from Home
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  notes: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
});

