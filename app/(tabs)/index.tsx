import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Template } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { templates, workouts } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const thisWeekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return workoutDate >= weekStart;
  });

  const lastWorkout = workouts[0];

  const handleStartWorkout = () => {
    if (templates.length === 0) {
      Alert.alert(
        'No Templates',
        'Create a workout template first before starting a workout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Template', onPress: () => router.push('/template-form') },
        ]
      );
      return;
    }
    setShowTemplateSelector(true);
  };

  const handleSelectTemplate = (template: Template) => {
    setShowTemplateSelector(false);
    router.push({
      pathname: '/workout-session',
      params: { template: JSON.stringify(template) },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.heroTitle}>💪 Ready to Train?</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            {thisWeekWorkouts.length} workout{thisWeekWorkouts.length !== 1 ? 's' : ''} this week
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          onPress={handleStartWorkout}
        >
          <Ionicons name="play" size={24} color="#fff" />
          <ThemedText style={styles.primaryButtonText}>Start Workout</ThemedText>
        </TouchableOpacity>

        {showTemplateSelector && (
          <View style={[styles.templateSelector, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.selectorTitle}>Select a Template</ThemedText>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[styles.templateOption, { borderColor: colors.border }]}
                onPress={() => handleSelectTemplate(template)}
              >
                <View style={styles.templateOptionContent}>
                  <ThemedText style={styles.templateOptionName}>{template.name}</ThemedText>
                  <ThemedText style={styles.templateOptionDetail}>
                    {template.exercises.length} exercises
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTemplateSelector(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={() => router.push('/templates')}
          >
            <Ionicons name="document-text" size={32} color={colors.tint} />
            <ThemedText style={styles.actionTitle}>Templates</ThemedText>
            <ThemedText style={styles.actionSubtitle}>{templates.length} total</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={() => router.push('/history')}
          >
            <Ionicons name="time" size={32} color={colors.tint} />
            <ThemedText style={styles.actionTitle}>History</ThemedText>
            <ThemedText style={styles.actionSubtitle}>{workouts.length} workouts</ThemedText>
          </TouchableOpacity>
        </View>

        {lastWorkout && (
          <View style={[styles.lastWorkoutCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Last Workout</ThemedText>
            <View style={styles.lastWorkoutContent}>
              <View>
                <ThemedText style={styles.lastWorkoutName}>
                  {lastWorkout.templateName}
                </ThemedText>
                <ThemedText style={styles.lastWorkoutDate}>
                  {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/workout-detail',
                  params: { workout: JSON.stringify(lastWorkout) },
                })}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
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
  content: {
    padding: 16,
  },
  heroCard: {
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    opacity: 0.9,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  templateSelector: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  templateOptionContent: {
    flex: 1,
  },
  templateOptionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  templateOptionDetail: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  lastWorkoutCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  lastWorkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastWorkoutDate: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
});
