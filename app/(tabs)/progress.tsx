import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ExerciseProgress {
  exerciseName: string;
  totalWorkouts: number;
  lastPerformed: string;
  maxWeight: number;
  avgWeight: number;
  totalVolume: number;
  progressData: {
    date: string;
    maxWeight: number;
    totalVolume: number;
    avgReps: number;
  }[];
}

export default function ProgressScreen() {
  const { workouts } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Calculate progress data for all exercises
  const exerciseProgressMap = useMemo(() => {
    const progressMap = new Map<string, ExerciseProgress>();

    // Get completed workouts only
    const completedWorkouts = workouts.filter(w => w.endDateTime);

    completedWorkouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const existing = progressMap.get(exercise.name);
        
        // Calculate metrics for this exercise in this workout
        const completedSets = exercise.sets.filter(s => s.completed);
        const maxWeight = Math.max(...completedSets.map(s => s.weight), 0);
        const avgWeight = completedSets.length > 0
          ? completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length
          : 0;
        const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        const avgReps = completedSets.length > 0
          ? completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length
          : 0;

        if (existing) {
          // Update existing entry
          existing.totalWorkouts += 1;
          existing.lastPerformed = workout.date;
          existing.maxWeight = Math.max(existing.maxWeight, maxWeight);
          existing.avgWeight = (existing.avgWeight + avgWeight) / 2;
          existing.totalVolume += totalVolume;
          existing.progressData.push({
            date: workout.date,
            maxWeight,
            totalVolume,
            avgReps,
          });
        } else {
          // Create new entry
          progressMap.set(exercise.name, {
            exerciseName: exercise.name,
            totalWorkouts: 1,
            lastPerformed: workout.date,
            maxWeight,
            avgWeight,
            totalVolume,
            progressData: [{
              date: workout.date,
              maxWeight,
              totalVolume,
              avgReps,
            }],
          });
        }
      });
    });

    // Sort progress data by date for each exercise
    progressMap.forEach((progress) => {
      progress.progressData.sort((a, b) => a.date.localeCompare(b.date));
    });

    return progressMap;
  }, [workouts]);

  // Get list of exercises sorted by last performed date
  const exerciseList = useMemo(() => {
    return Array.from(exerciseProgressMap.values())
      .sort((a, b) => b.lastPerformed.localeCompare(a.lastPerformed));
  }, [exerciseProgressMap]);

  // Filter exercise list based on search text
  const filteredExerciseList = useMemo(() => {
    if (!filterText.trim()) {
      return exerciseList;
    }
    return exerciseList.filter(exercise =>
      exercise.exerciseName.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [exerciseList, filterText]);

  // Auto-select first exercise if none selected
  useEffect(() => {
    if (!selectedExercise && exerciseList.length > 0) {
      setSelectedExercise(exerciseList[0].exerciseName);
    }
  }, [exerciseList, selectedExercise]);

  const selectedProgress = selectedExercise
    ? exerciseProgressMap.get(selectedExercise)
    : null;

  const renderExerciseStats = () => {
    if (!selectedProgress) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="fitness" size={64} color={colors.icon} />
          <ThemedText style={styles.emptyText}>
            No exercise data yet. Complete some workouts to see your progress!
          </ThemedText>
        </View>
      );
    }

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 32;

    // Prepare chart data
    const dates = selectedProgress.progressData.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const weights = selectedProgress.progressData.map(d => d.maxWeight);
    const volumes = selectedProgress.progressData.map(d => d.totalVolume);
    
    // Calculate trend
    const firstWeight = weights[0];
    const lastWeight = weights[weights.length - 1];
    const weightChange = lastWeight - firstWeight;
    const percentChange = firstWeight > 0 ? ((weightChange / firstWeight) * 100) : 0;

    return (
      <View style={styles.statsContainer}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Ionicons name="barbell" size={24} color={colors.tint} />
            <ThemedText style={styles.summaryValue}>
              {selectedProgress.maxWeight.toFixed(1)} kg
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Max Weight</ThemedText>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Ionicons name="trophy" size={24} color={colors.tint} />
            <ThemedText style={styles.summaryValue}>
              {selectedProgress.totalWorkouts}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Workouts</ThemedText>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Ionicons name="trending-up" size={24} color={colors.tint} />
            <ThemedText style={styles.summaryValue}>
              {selectedProgress.avgWeight.toFixed(1)} kg
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Avg Weight</ThemedText>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Ionicons name="stats-chart" size={24} color={colors.tint} />
            <ThemedText style={styles.summaryValue}>
              {selectedProgress.totalVolume.toFixed(0)}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Volume</ThemedText>
          </View>
        </View>

        {/* Progress Indicator */}
        {selectedProgress.progressData.length > 1 && (
          <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressTitle}>Weight Progress</ThemedText>
              <View style={styles.progressBadge}>
                <Ionicons
                  name={weightChange >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={weightChange >= 0 ? '#4caf50' : '#f44336'}
                />
                <ThemedText
                  style={[
                    styles.progressPercent,
                    { color: weightChange >= 0 ? '#4caf50' : '#f44336' }
                  ]}
                >
                  {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.progressSubtitle}>
              {firstWeight.toFixed(1)} kg → {lastWeight.toFixed(1)} kg
            </ThemedText>
          </View>
        )}

        {/* Weight Chart */}
        {selectedProgress.progressData.length > 1 && (
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.chartTitle}>Weight Progression</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: dates,
                  datasets: [{ data: weights }],
                }}
                width={Math.max(chartWidth, dates.length * 60)}
                height={220}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 1,
                  color: (opacity = 1) => colors.tint,
                  labelColor: (opacity = 1) => colors.text,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: colors.tint,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          </View>
        )}

        {/* Volume Chart */}
        {selectedProgress.progressData.length > 1 && (
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.chartTitle}>Volume Progression</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: dates,
                  datasets: [{ data: volumes }],
                }}
                width={Math.max(chartWidth, dates.length * 60)}
                height={220}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.tint,
                  labelColor: (opacity = 1) => colors.text,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: colors.tint,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          </View>
        )}

        {/* Workout History */}
        <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.historyTitle}>Recent Workouts</ThemedText>
          {selectedProgress.progressData.slice(-5).reverse().map((data, index) => (
            <View key={index} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <View>
                <ThemedText style={styles.historyDate}>
                  {new Date(data.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </ThemedText>
                <ThemedText style={styles.historyDetail}>
                  {data.avgReps.toFixed(1)} avg reps
                </ThemedText>
              </View>
              <View style={styles.historyStats}>
                <ThemedText style={styles.historyWeight}>
                  {data.maxWeight.toFixed(1)} kg
                </ThemedText>
                <ThemedText style={styles.historyVolume}>
                  Vol: {data.totalVolume.toFixed(0)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Progress</ThemedText>
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: colors.tint }]}
          onPress={() => setShowExercisePicker(true)}
        >
          <ThemedText style={styles.selectButtonText}>
            {selectedExercise || 'Select Exercise'}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderExerciseStats()}
      </ScrollView>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowExercisePicker(false);
          setFilterText('');
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => {
            setShowExercisePicker(false);
            setFilterText('');
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={styles.modalWrapper}
            >
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Select Exercise</ThemedText>
                  <TouchableOpacity onPress={() => {
                    setShowExercisePicker(false);
                    setFilterText('');
                  }}>
                    <Ionicons name="close" size={28} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                {/* Search Filter */}
                <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                  <Ionicons name="search" size={20} color={colors.icon} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search exercises..."
                    placeholderTextColor={colors.icon}
                    value={filterText}
                    onChangeText={setFilterText}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {filterText.length > 0 && (
                    <TouchableOpacity onPress={() => setFilterText('')}>
                      <Ionicons name="close-circle" size={20} color={colors.icon} />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={styles.exerciseList}>
                  {filteredExerciseList.length > 0 ? (
                    filteredExerciseList.map((exercise) => (
                <TouchableOpacity
                  key={exercise.exerciseName}
                  style={[
                    styles.exerciseItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedExercise === exercise.exerciseName && {
                      backgroundColor: colors.tint,
                    },
                  ]}
                  onPress={() => {
                    setSelectedExercise(exercise.exerciseName);
                    setShowExercisePicker(false);
                  }}
                >
                  <View style={styles.exerciseItemContent}>
                    <ThemedText
                      style={[
                        styles.exerciseName,
                        selectedExercise === exercise.exerciseName && styles.exerciseNameSelected,
                      ]}
                    >
                      {exercise.exerciseName}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.exerciseInfo,
                        selectedExercise === exercise.exerciseName && styles.exerciseInfoSelected,
                      ]}
                    >
                      {exercise.totalWorkouts} workouts • Last: {new Date(exercise.lastPerformed).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  {selectedExercise === exercise.exerciseName && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={48} color={colors.icon} />
                  <ThemedText style={styles.noResultsText}>
                    No exercises found matching "{filterText}"
                  </ThemedText>
                </View>
              )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  statsContainer: {
    gap: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyVolume: {
    fontSize: 12,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  keyboardView: {
    width: '100%',
    maxHeight: '90%',
    marginTop: 60,
  },
  modalWrapper: {
    width: '100%',
  },
  modalContent: {
    borderRadius: 20,
    marginHorizontal: 16,
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  exerciseList: {
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseNameSelected: {
    color: '#fff',
  },
  exerciseInfo: {
    fontSize: 12,
    opacity: 0.7,
  },
  exerciseInfoSelected: {
    color: '#fff',
    opacity: 0.9,
  },
});

