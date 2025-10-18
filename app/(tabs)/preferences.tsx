import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserPreferences } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FREQUENCY_OPTIONS = [
  { value: 3, label: '3x per week', description: 'Great for beginners' },
  { value: 4, label: '4x per week', description: 'Balanced approach' },
  { value: 5, label: '5x per week', description: 'Intermediate level' },
  { value: 6, label: '6x per week', description: 'Advanced training' },
] as const;

const GOAL_OPTIONS = [
  { value: 'general_strength', label: 'General Strength', icon: 'fitness' },
  { value: 'hypertrophy', label: 'Muscle Growth', icon: 'body' },
  { value: 'pure_strength', label: 'Maximum Strength', icon: 'barbell' },
  { value: 'cutting_phase', label: 'Fat Loss', icon: 'trending-down' },
  { value: 'lean_bulk', label: 'Lean Bulk', icon: 'trending-up' },
] as const;

export default function PreferencesScreen() {
  const { userPreferences, saveUserPreferences } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [weeklyFrequency, setWeeklyFrequency] = useState<3 | 4 | 5 | 6>(3);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [preferredGoal, setPreferredGoal] = useState<string | undefined>();

  useEffect(() => {
    if (userPreferences) {
      setWeeklyFrequency(userPreferences.weeklyFrequency);
      setSelectedDays(userPreferences.selectedDays || []);
      setPreferredGoal(userPreferences.preferredGoal);
    }
  }, [userPreferences]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      if (selectedDays.length < weeklyFrequency) {
        setSelectedDays([...selectedDays, day]);
      } else {
        Alert.alert(
          'Maximum Days Reached',
          `You can only select ${weeklyFrequency} days based on your weekly frequency.`
        );
      }
    }
  };

  const handleSave = async () => {
    if (selectedDays.length !== weeklyFrequency) {
      Alert.alert(
        'Incomplete Selection',
        `Please select exactly ${weeklyFrequency} workout days to match your weekly frequency.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const preferences: UserPreferences = {
      weeklyFrequency,
      selectedDays,
      preferredGoal: preferredGoal as any,
      hasCompletedOnboarding: true,
    };

    try {
      await saveUserPreferences(preferences);
      Alert.alert(
        'Preferences Saved',
        'Your workout preferences have been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Workout Preferences</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Weekly Frequency</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            How many times per week do you want to workout?
          </ThemedText>
          <View style={styles.frequencyOptions}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  { borderColor: colors.border },
                  weeklyFrequency === option.value && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => {
                  setWeeklyFrequency(option.value);
                  setSelectedDays([]); // Reset selected days when frequency changes
                }}
              >
                <ThemedText
                  style={[
                    styles.frequencyLabel,
                    weeklyFrequency === option.value && styles.frequencyLabelSelected,
                  ]}
                >
                  {option.label}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.frequencyDescription,
                    weeklyFrequency === option.value && styles.frequencyDescriptionSelected,
                  ]}
                >
                  {option.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Workout Days</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Select {weeklyFrequency} days for your workouts ({selectedDays.length}/{weeklyFrequency} selected)
          </ThemedText>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayOption,
                  { borderColor: colors.border },
                  selectedDays.includes(day) && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => toggleDay(day)}
              >
                <ThemedText
                  style={[
                    styles.dayLabel,
                    selectedDays.includes(day) && styles.dayLabelSelected,
                  ]}
                >
                  {day.substring(0, 3)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Training Goal (Optional)</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            What's your primary fitness goal?
          </ThemedText>
          <View style={styles.goalOptions}>
            {GOAL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.goalOption,
                  { borderColor: colors.border },
                  preferredGoal === option.value && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => setPreferredGoal(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={preferredGoal === option.value ? '#fff' : colors.icon}
                />
                <ThemedText
                  style={[
                    styles.goalLabel,
                    preferredGoal === option.value && styles.goalLabelSelected,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
          onPress={handleSave}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <ThemedText style={styles.saveButtonText}>Save Preferences</ThemedText>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  frequencyOptions: {
    gap: 12,
  },
  frequencyOption: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  frequencyLabelSelected: {
    color: '#fff',
  },
  frequencyDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  frequencyDescriptionSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayOption: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayLabelSelected: {
    color: '#fff',
  },
  goalOptions: {
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    gap: 12,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalLabelSelected: {
    color: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

