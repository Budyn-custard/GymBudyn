import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExercisePicker } from '@/components/ui/exercise-picker';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { storageService } from '@/services/storage';
import { ExerciseLibraryItem, Template, Workout, WorkoutExercise } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface ExerciseState extends WorkoutExercise {
  id: string;
  previousData?: WorkoutExercise;
}

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { saveWorkout, getLastWorkoutWithExercise } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const template: Template = JSON.parse(params.template as string);
  
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [swappingExerciseId, setSwappingExerciseId] = useState<string | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load active workout or initialize new one
  useEffect(() => {
    const initializeWorkout = async () => {
      try {
        // Try to load active workout
        const activeWorkout = await storageService.getActiveWorkout();
        
        // Check if active workout exists and matches current template
        if (activeWorkout && activeWorkout.template.id === template.id) {
          setExercises(activeWorkout.exercises);
          setNotes(activeWorkout.notes);
          setStartTime(activeWorkout.startTime);
          setIsLoaded(true);
          return;
        }
        
        // Initialize new workout
        const initialExercises = await Promise.all(
          template.exercises.map(async (ex) => {
            const previousData = await getLastWorkoutWithExercise(ex.name);
            return {
              id: ex.id,
              name: ex.name,
              sets: Array.from({ length: ex.defaultSets }, () => ({
                weight: ex.defaultWeight,
                reps: ex.defaultReps,
                completed: false,
              })),
              previousData: previousData || undefined,
            };
          })
        );
        setExercises(initialExercises);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error initializing workout:', error);
        setIsLoaded(true);
      }
    };

    initializeWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  // Save active workout whenever state changes
  useEffect(() => {
    if (!isLoaded || exercises.length === 0) return;

    // Debounce saves to avoid excessive writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await storageService.saveActiveWorkout({
          template,
          exercises,
          notes,
          startTime,
        });
      } catch (error) {
        console.error('Error saving active workout:', error);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [exercises, notes, template, startTime, isLoaded]);

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = {
          ...newSets[setIndex],
          [field]: parseFloat(value) || 0,
        };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = {
          ...newSets[setIndex],
          completed: !newSets[setIndex].completed,
        };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        // Use default values if lastSet is null/undefined or if no sets exist
        const defaultWeight = lastSet?.weight ?? 0;
        const defaultReps = lastSet?.reps ?? 0;
        return {
          ...ex,
          sets: [...ex.sets, { weight: defaultWeight, reps: defaultReps, completed: false }],
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId && ex.sets.length > 1) {
        return {
          ...ex,
          sets: ex.sets.filter((_, i) => i !== setIndex),
        };
      }
      return ex;
    }));
  };

  const autofillFromPrevious = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId && ex.previousData) {
        return {
          ...ex,
          sets: ex.previousData.sets.map(s => ({ ...s, completed: false })),
        };
      }
      return ex;
    }));
  };

  const swapExercise = (exerciseId: string) => {
    setSwappingExerciseId(exerciseId);
    setIsAddingExercise(false);
    setShowExercisePicker(true);
  };

  const handleExerciseSwap = async (libraryExercise: ExerciseLibraryItem) => {
    if (!swappingExerciseId) return;

    const previousData = await getLastWorkoutWithExercise(libraryExercise.name);

    setExercises(exercises.map(ex => {
      if (ex.id === swappingExerciseId) {
        return {
          ...ex,
          name: libraryExercise.name,
          previousData: previousData || undefined,
        };
      }
      return ex;
    }));

    setSwappingExerciseId(null);
  };

  const handleAddExercise = () => {
    setIsAddingExercise(true);
    setSwappingExerciseId(null);
    setShowExercisePicker(true);
  };

  const handleExerciseAdd = async (libraryExercise: ExerciseLibraryItem) => {
    const previousData = await getLastWorkoutWithExercise(libraryExercise.name);

    const newExercise: ExerciseState = {
      id: Date.now().toString(),
      name: libraryExercise.name,
      sets: [{ weight: 0, reps: 0, completed: false }],
      previousData: previousData || undefined,
    };

    setExercises([...exercises, newExercise]);
    setIsAddingExercise(false);
  };

  const handleExerciseSelect = async (libraryExercise: ExerciseLibraryItem) => {
    if (isAddingExercise) {
      await handleExerciseAdd(libraryExercise);
    } else if (swappingExerciseId) {
      await handleExerciseSwap(libraryExercise);
    }
  };

  const removeExercise = (exerciseId: string) => {
    if (exercises.length === 1) {
      Alert.alert(
        'Cannot Remove',
        'You must have at least one exercise in your workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise from the workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises(exercises.filter(ex => ex.id !== exerciseId));
          },
        },
      ]
    );
  };

  const handleFinish = () => {
    const unfinishedSets = exercises.flatMap(exercise => 
      exercise.sets.map((set, setIndex) => ({ 
        exerciseName: exercise.name, 
        setNumber: setIndex + 1, 
        completed: set.completed 
      }))
    ).filter(set => !set.completed);

    if (unfinishedSets.length > 0) {
      const exerciseNames = [...new Set(unfinishedSets.map(s => s.exerciseName))];
      Alert.alert(
        'Unfinished Sets',
        `You have ${unfinishedSets.length} unfinished sets in ${exerciseNames.length} exercise(s). What would you like to do?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete All',
            onPress: () => completeAllSetsAndFinish(),
          },
          {
            text: 'Remove Unfinished',
            onPress: () => removeUnfinishedSetsAndFinish(),
            style: 'destructive',
          },
        ]
      );
    } else {
      Alert.alert(
        'Finish Workout',
        'Are you sure you want to finish this workout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish',
            onPress: saveAndFinish,
          },
        ]
      );
    }
  };

  const completeAllSetsAndFinish = () => {
    setExercises(exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({ ...set, completed: true }))
    })));
    
    setTimeout(() => {
      Alert.alert(
        'Finish Workout',
        'All sets marked as complete. Are you sure you want to finish this workout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish',
            onPress: saveAndFinish,
          },
        ]
      );
    }, 100);
  };

  const removeUnfinishedSetsAndFinish = () => {
    setExercises(exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.filter(set => set.completed)
    })));
    
    setTimeout(() => {
      Alert.alert(
        'Finish Workout',
        'Unfinished sets removed. Are you sure you want to finish this workout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish',
            onPress: saveAndFinish,
          },
        ]
      );
    }, 100);
  };

  const saveAndFinish = async () => {
    try {
      console.log('Starting workout save...');
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 60000); // minutes

      const completedExercises = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.filter(set => set.completed), // Only save completed sets
      })).filter(ex => ex.sets.length > 0); // Only include exercises with completed sets

      if (completedExercises.length === 0) {
        Alert.alert('Error', 'No completed sets to save. Please complete at least one set.');
        return;
      }

      const workout: Workout = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        startDateTime: new Date(startTime).toISOString(),
        endDateTime: new Date(endTime).toISOString(),
        templateId: template.id,
        templateName: template.name,
        exercises: completedExercises,
        notes: notes.trim() || undefined,
        duration,
      };

      console.log('Workout data:', workout);
      
      // Save the completed workout
      await saveWorkout(workout);
      
      // Mark active workout as finished before clearing
      const currentActiveWorkout = await storageService.getActiveWorkout();
      if (currentActiveWorkout) {
        await storageService.saveActiveWorkout({
          ...currentActiveWorkout,
          finishedDate: new Date().toISOString(),
        });
      }
      
      // Clear active workout now that it's saved
      await storageService.clearActiveWorkout();
      console.log('Workout saved successfully and active workout cleared');
      
      // Navigate back first to trigger the home screen refresh
      router.back();
      
      // Then show success message after a brief delay to ensure navigation completes
      setTimeout(() => {
        Alert.alert('Success', 'Workout saved!');
      }, 100);
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? Your progress is saved and you can resume later.',
      [
        { text: 'Resume', style: 'cancel' },
        {
          text: 'Discard Workout',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearActiveWorkout();
            router.back();
          },
        },
        {
          text: 'Keep & Exit',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderRightActions = (exerciseId: string) => (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => removeExercise(exerciseId)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ExercisePicker
        visible={showExercisePicker}
        onClose={() => {
          setShowExercisePicker(false);
          setSwappingExerciseId(null);
          setIsAddingExercise(false);
        }}
        onSelect={handleExerciseSelect}
        title={isAddingExercise ? "Add Exercise" : "Swap Exercise"}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.templateName}>{template.name}</ThemedText>
            <ThemedText style={styles.timeInfo}>
              Started {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </View>

          {exercises.map((exercise, exerciseIndex) => (
            <Swipeable
              key={exercise.id}
              renderRightActions={renderRightActions(exercise.id)}
              overshootRight={false}
            >
              <View
                style={[styles.exerciseCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.exerciseHeaderContainer}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseHeaderLeft}>
                      <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                      {exercise.previousData && exercise.previousData.sets[0] && (
                        <ThemedText style={styles.previousInfo}>
                          Last: {exercise.previousData.sets[0].weight}kg × {exercise.previousData.sets[0].reps}
                        </ThemedText>
                      )}
                    </View>
                    <View style={styles.exerciseHeaderActions}>
                      {exercise.previousData && (
                        <TouchableOpacity
                          style={[styles.iconButton, { backgroundColor: colors.tint }]}
                          onPress={() => autofillFromPrevious(exercise.id)}
                        >
                          <Ionicons name="refresh" size={18} color="#fff" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: colors.tint + '40' }]}
                        onPress={() => swapExercise(exercise.id)}
                      >
                        <Ionicons name="swap-horizontal" size={18} color={colors.tint} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

              <View style={styles.exerciseContent}>
                <View style={styles.setHeader}>
                  <ThemedText style={[styles.setHeaderText, styles.setNumberHeader]}>Set</ThemedText>
                  <ThemedText style={[styles.setHeaderText, styles.setInputHeader]}>Weight (kg)</ThemedText>
                  <ThemedText style={[styles.setHeaderText, styles.setInputHeader]}>Reps</ThemedText>
                  <ThemedText style={[styles.setHeaderText, styles.checkButtonHeader]}>Done</ThemedText>
                  <View style={styles.setHeaderSpacer} />
                </View>

                {exercise.sets.map((set, setIndex) => {
                  const previousSet = exercise.previousData?.sets[setIndex];
                  const hasImprovement = previousSet && (
                    set.weight > previousSet.weight || 
                    (set.weight === previousSet.weight && set.reps > previousSet.reps)
                  );
                  
                  return (
                    <View key={setIndex}>
                      <View style={styles.setRow}>
                        <ThemedText style={styles.setNumber}>{setIndex + 1}</ThemedText>
                        <TextInput
                          style={[styles.setInput, { 
                            backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                            color: colors.text,
                            opacity: set.completed ? 0.5 : 1,
                          }]}
                          value={set.weight.toString()}
                          onChangeText={(text) => updateSet(exercise.id, setIndex, 'weight', text)}
                          keyboardType="decimal-pad"
                          editable={!set.completed}
                          selectTextOnFocus={true}
                        />
                        <TextInput
                          style={[styles.setInput, { 
                            backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                            color: colors.text,
                            opacity: set.completed ? 0.5 : 1,
                          }]}
                          value={set.reps.toString()}
                          onChangeText={(text) => updateSet(exercise.id, setIndex, 'reps', text)}
                          keyboardType="numeric"
                          editable={!set.completed}
                          selectTextOnFocus={true}
                        />
                        <TouchableOpacity
                          style={[
                            styles.checkButton,
                            { 
                              backgroundColor: set.completed ? '#34C759' : 'transparent',
                              borderColor: set.completed ? '#34C759' : colors.border,
                            }
                          ]}
                          onPress={() => toggleSetComplete(exercise.id, setIndex)}
                        >
                          {set.completed && (
                            <Ionicons name="checkmark" size={18} color="#fff" />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeSet(exercise.id, setIndex)}
                          disabled={exercise.sets.length === 1}
                        >
                           <Ionicons
                             name="trash"
                             size={20}
                             color={exercise.sets.length > 1 ? '#FF3B30' : colors.icon}
                           />
                        </TouchableOpacity>
                      </View>
                      {previousSet && (
                        <View style={[styles.previousSetBadge, {
                          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 159, 10, 0.12)' : 'rgba(255, 149, 0, 0.08)',
                          borderColor: hasImprovement && set.completed
                            ? '#34C759' 
                            : colorScheme === 'dark' ? 'rgba(255, 159, 10, 0.3)' : 'rgba(255, 149, 0, 0.2)',
                        }]}>
                          <View style={styles.previousSetContent}>
                            <Ionicons 
                              name={hasImprovement && set.completed ? "trending-up" : "time-outline"} 
                              size={12} 
                              color={hasImprovement && set.completed ? '#34C759' : colorScheme === 'dark' ? '#FF9F0A' : '#FF9500'} 
                            />
                            <ThemedText style={[styles.previousSetText, {
                              color: hasImprovement && set.completed ? '#34C759' : colorScheme === 'dark' ? '#FF9F0A' : '#FF9500',
                            }]}>
                              Last: {previousSet.weight}kg × {previousSet.reps}
                            </ThemedText>
                            {hasImprovement && set.completed && (
                              <ThemedText style={[styles.improvementBadge, { color: '#34C759' }]}>
                                💪
                              </ThemedText>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={[styles.addSetButton, { borderColor: colors.tint }]}
                  onPress={() => addSet(exercise.id)}
                >
                   <Ionicons name="add" size={16} color={colors.tint} />
                  <ThemedText style={[styles.addSetText, { color: colors.tint }]}>
                    Add Set
                  </ThemedText>
                </TouchableOpacity>
              </View>
              </View>
            </Swipeable>
          ))}

          <TouchableOpacity
            style={[styles.addExerciseButton, { borderColor: colors.tint, backgroundColor: colors.card }]}
            onPress={handleAddExercise}
          >
            <Ionicons name="add-circle" size={24} color={colors.tint} />
            <ThemedText style={[styles.addExerciseText, { color: colors.tint }]}>
              Add Exercise
            </ThemedText>
          </TouchableOpacity>

          <View style={[styles.notesCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.notesLabel}>Notes (Optional)</ThemedText>
            <TextInput
              style={[styles.notesInput, { 
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: colors.text,
              }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did the workout feel?"
              placeholderTextColor={colors.icon}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={handleCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.finishButton, { backgroundColor: colors.tint }]}
            onPress={handleFinish}
          >
            <ThemedText style={styles.finishButtonText}>Finish Workout</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  templateName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeInfo: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  exerciseCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeaderContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseHeaderLeft: {
    flex: 1,
  },
  exerciseHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previousInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  exerciseContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  setHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  setNumberHeader: {
    width: 32,
    textAlign: 'center',
  },
  setInputHeader: {
    flex: 1,
    textAlign: 'center',
  },
  checkButtonHeader: {
    width: 32,
    textAlign: 'center',
  },
  setHeaderSpacer: {
    width: 24,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  previousSetBadge: {
    marginLeft: 40,
    marginRight: 32,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  previousSetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previousSetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  improvementBadge: {
    fontSize: 12,
    marginLeft: 2,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    fontSize: 16,
    textAlign: 'center',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

