import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Template, Workout, WorkoutExercise } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ExerciseState extends WorkoutExercise {
  id: string;
  isExpanded: boolean;
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
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const initializeExercises = async () => {
      const initialExercises = await Promise.all(
        template.exercises.map(async (ex) => {
          const previousData = await getLastWorkoutWithExercise(ex.name);
          return {
            id: ex.id,
            name: ex.name,
            sets: Array(ex.defaultSets).fill(null).map(() => ({
              weight: ex.defaultWeight,
              reps: ex.defaultReps,
            })),
            isExpanded: false,
            previousData: previousData || undefined,
          };
        })
      );
      setExercises(initialExercises);
    };

    initializeExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  const toggleExpanded = (id: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, isExpanded: !ex.isExpanded } : ex
    ));
  };

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

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { weight: lastSet.weight, reps: lastSet.reps }],
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
          sets: ex.previousData.sets.map(s => ({ ...s })),
        };
      }
      return ex;
    }));
  };

  const handleFinish = () => {
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
  };

  const saveAndFinish = async () => {
    try {
      console.log('Starting workout save...');
      const duration = Math.round((Date.now() - startTime) / 60000); // minutes

      const workout: Workout = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        templateId: template.id,
        templateName: template.name,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
        })),
        notes: notes.trim() || undefined,
        duration,
      };

      console.log('Workout data:', workout);
      await saveWorkout(workout);
      console.log('Workout saved successfully');
      
      Alert.alert('Success', 'Workout saved!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  return (
    <ThemedView style={styles.container}>
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
            <View
              key={exercise.id}
              style={[styles.exerciseCard, { backgroundColor: colors.card }]}
            >
              <TouchableOpacity
                style={styles.exerciseHeader}
                onPress={() => toggleExpanded(exercise.id)}
              >
                <View style={styles.exerciseHeaderLeft}>
                  <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                  {exercise.previousData && (
                    <ThemedText style={styles.previousInfo}>
                      Last: {exercise.previousData.sets[0]?.weight}kg × {exercise.previousData.sets[0]?.reps}
                    </ThemedText>
                  )}
                </View>
                 <Ionicons
                   name={exercise.isExpanded ? 'chevron-up' : 'chevron-down'}
                   size={20}
                   color={colors.icon}
                 />
              </TouchableOpacity>

              {exercise.isExpanded && (
                <View style={styles.exerciseContent}>
                  {exercise.previousData && (
                    <TouchableOpacity
                      style={[styles.autofillButton, { backgroundColor: colors.tint }]}
                      onPress={() => autofillFromPrevious(exercise.id)}
                    >
                       <Ionicons name="refresh" size={16} color="#fff" />
                      <ThemedText style={styles.autofillText}>
                        Use Previous
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  <View style={styles.setHeader}>
                    <ThemedText style={styles.setHeaderText}>Set</ThemedText>
                    <ThemedText style={styles.setHeaderText}>Weight (kg)</ThemedText>
                    <ThemedText style={styles.setHeaderText}>Reps</ThemedText>
                    <View style={styles.setHeaderSpacer} />
                  </View>

                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <ThemedText style={styles.setNumber}>{setIndex + 1}</ThemedText>
                      <TextInput
                        style={[styles.setInput, { 
                          backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                          color: colors.text,
                        }]}
                        value={set.weight.toString()}
                        onChangeText={(text) => updateSet(exercise.id, setIndex, 'weight', text)}
                        keyboardType="decimal-pad"
                      />
                      <TextInput
                        style={[styles.setInput, { 
                          backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                          color: colors.text,
                        }]}
                        value={set.reps.toString()}
                        onChangeText={(text) => updateSet(exercise.id, setIndex, 'reps', text)}
                        keyboardType="numeric"
                      />
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
                  ))}

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
              )}
            </View>
          ))}

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
            onPress={() => router.back()}
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
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseHeaderLeft: {
    flex: 1,
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
    padding: 16,
    paddingTop: 0,
  },
  autofillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
  },
  autofillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  setHeaderSpacer: {
    width: 24,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    width: 24,
  },
  setInput: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    fontSize: 16,
    textAlign: 'center',
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
});

