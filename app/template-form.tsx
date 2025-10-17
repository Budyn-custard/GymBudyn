import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExercisePicker } from '@/components/ui/exercise-picker';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Exercise, ExerciseLibraryItem, Template } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function TemplateFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { saveTemplate } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const existingTemplate: Template | null = params.template 
    ? JSON.parse(params.template as string) 
    : null;

  const [name, setName] = useState(existingTemplate?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(
    existingTemplate?.exercises || []
  );
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  const addExercise = () => {
    setEditingExerciseId(null);
    setShowExercisePicker(true);
  };

  const handleExerciseSelect = (libraryExercise: ExerciseLibraryItem) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: libraryExercise.name,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 0,
    };
    
    if (editingExerciseId) {
      // Replace existing exercise
      setExercises(exercises.map(ex => 
        ex.id === editingExerciseId 
          ? { ...ex, name: libraryExercise.name }
          : ex
      ));
    } else {
      // Add new exercise
      setExercises([...exercises, newExercise]);
    }
  };

  const changeExercise = (exerciseId: string) => {
    setEditingExerciseId(exerciseId);
    setShowExercisePicker(true);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    const emptyExercise = exercises.find(ex => !ex.name.trim());
    if (emptyExercise) {
      Alert.alert('Error', 'Please fill in all exercise names');
      return;
    }

    const template: Template = {
      id: existingTemplate?.id || Date.now().toString(),
      name: name.trim(),
      exercises: exercises.map(ex => ({
        ...ex,
        name: ex.name.trim(),
      })),
    };

    try {
      await saveTemplate(template);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save template');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ExercisePicker
        visible={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handleExerciseSelect}
        title={editingExerciseId ? 'Change Exercise' : 'Select Exercise'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.label}>Template Name</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: colors.text,
              }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Push Day, Leg Day"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Exercises ({exercises.length})
              </ThemedText>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.tint }]}
                onPress={addExercise}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {exercises.map((exercise, index) => (
              <View
                key={exercise.id}
                style={[styles.exerciseCard, { 
                  backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fafafa',
                  borderColor: colors.border,
                }]}
              >
                <View style={styles.exerciseHeader}>
                  <ThemedText style={styles.exerciseNumber}>#{index + 1}</ThemedText>
                  <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <ThemedText style={styles.fieldLabel}>Exercise Name</ThemedText>
                <TouchableOpacity 
                  style={[styles.exerciseNameButton, { 
                    backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                    borderColor: colors.border,
                  }]}
                  onPress={() => changeExercise(exercise.id)}
                >
                  <ThemedText style={[styles.exerciseNameText, !exercise.name && { opacity: 0.5 }]}>
                    {exercise.name || 'Select from library'}
                  </ThemedText>
                  <Ionicons name="chevron-down" size={20} color={colors.icon} />
                </TouchableOpacity>

                <View style={styles.row}>
                  <View style={styles.field}>
                    <ThemedText style={styles.fieldLabel}>Sets</ThemedText>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                        color: colors.text,
                      }]}
                      value={exercise.defaultSets.toString()}
                      onChangeText={(text) => 
                        updateExercise(exercise.id, 'defaultSets', parseInt(text) || 0)
                      }
                      keyboardType="numeric"
                      placeholderTextColor={colors.icon}
                    />
                  </View>

                  <View style={styles.field}>
                    <ThemedText style={styles.fieldLabel}>Reps</ThemedText>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                        color: colors.text,
                      }]}
                      value={exercise.defaultReps.toString()}
                      onChangeText={(text) => 
                        updateExercise(exercise.id, 'defaultReps', parseInt(text) || 0)
                      }
                      keyboardType="numeric"
                      placeholderTextColor={colors.icon}
                    />
                  </View>

                  <View style={styles.field}>
                    <ThemedText style={styles.fieldLabel}>Weight (kg)</ThemedText>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                        color: colors.text,
                      }]}
                      value={exercise.defaultWeight.toString()}
                      onChangeText={(text) => 
                        updateExercise(exercise.id, 'defaultWeight', parseFloat(text) || 0)
                      }
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.icon}
                    />
                  </View>
                </View>
              </View>
            ))}

            {exercises.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="document-text" size={48} color={colors.icon} />
                <ThemedText style={styles.emptyText}>No exercises yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>Tap + to add an exercise</ThemedText>
              </View>
            )}
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
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={handleSave}
          >
            <ThemedText style={styles.saveButtonText}>
              {existingTemplate ? 'Update' : 'Save'}
            </ThemedText>
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
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
  exerciseNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  exerciseNameText: {
    fontSize: 16,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
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
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

