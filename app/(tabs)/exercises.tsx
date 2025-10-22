import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { exerciseLibrary, getMuscleGroups } from '@/services/exerciseLibrary';
import { CustomExercise, ExerciseLibraryItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type CombinedExercise = 
  | (ExerciseLibraryItem & { isCustom: false })
  | (CustomExercise & { isCustom: true });

export default function ExercisesScreen() {
  const { customExercises, saveCustomExercise, deleteCustomExercise } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [filterText, setFilterText] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('All');
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  
  // Form state for adding custom exercise
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('');
  const [newExerciseEquipment, setNewExerciseEquipment] = useState('');

  const muscleGroups = useMemo(() => {
    const groups = getMuscleGroups();
    return ['All', ...groups];
  }, []);

  // Combine library and custom exercises
  const allExercises: CombinedExercise[] = useMemo(() => {
    const library = exerciseLibrary.map(ex => ({ ...ex, isCustom: false as const })) as (ExerciseLibraryItem & { isCustom: false })[];
    const custom = customExercises.map(ex => ({ ...ex, isCustom: true as const })) as (CustomExercise & { isCustom: true })[];
    return [...custom, ...library];
  }, [customExercises]);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let filtered = allExercises;

    // Filter by muscle group
    if (selectedMuscleGroup !== 'All') {
      filtered = filtered.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    // Filter by search text
    if (filterText.trim()) {
      const lowerQuery = filterText.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(lowerQuery) ||
        ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
        ex.equipment.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [allExercises, selectedMuscleGroup, filterText]);

  const handleAddCustomExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }
    if (!newExerciseMuscleGroup.trim()) {
      Alert.alert('Error', 'Please enter a muscle group');
      return;
    }
    if (!newExerciseEquipment.trim()) {
      Alert.alert('Error', 'Please enter equipment type');
      return;
    }

    const customExercise: CustomExercise = {
      id: Date.now().toString(),
      name: newExerciseName.trim(),
      muscleGroup: newExerciseMuscleGroup.trim(),
      equipment: newExerciseEquipment.trim(),
      isCustom: true,
    };

    await saveCustomExercise(customExercise);
    
    // Reset form
    setNewExerciseName('');
    setNewExerciseMuscleGroup('');
    setNewExerciseEquipment('');
    setShowAddExerciseModal(false);
  };

  const handleDeleteCustomExercise = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomExercise(exerciseId),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        {/* Search Bar */}
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

        {/* Muscle Group Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {muscleGroups.map((group) => (
            <TouchableOpacity
              key={group}
              style={[
                styles.filterChip,
                { borderColor: colors.border },
                selectedMuscleGroup === group && {
                  backgroundColor: colors.tint,
                  borderColor: colors.tint,
                },
              ]}
              onPress={() => setSelectedMuscleGroup(group)}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  selectedMuscleGroup === group && styles.filterChipTextSelected,
                ]}
              >
                {group}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => setShowAddExerciseModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <ThemedText style={styles.addButtonText}>Add Custom Exercise</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.resultsCount}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
        </ThemedText>

        {filteredExercises.map((exercise) => (
          <View
            key={`${exercise.isCustom ? 'custom' : 'lib'}-${exercise.isCustom ? (exercise as CustomExercise).id : (exercise as ExerciseLibraryItem).id}`}
            style={[styles.exerciseItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.exerciseItemContent}>
              <View style={styles.exerciseItemHeader}>
                <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                {exercise.isCustom && (
                  <View style={[styles.customBadge, { backgroundColor: colors.tint }]}>
                    <ThemedText style={styles.customBadgeText}>Custom</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.exerciseDetails}>
                <View style={styles.exerciseDetail}>
                  <Ionicons name="body" size={14} color={colors.icon} />
                  <ThemedText style={styles.exerciseDetailText}>{exercise.muscleGroup}</ThemedText>
                </View>
                <View style={styles.exerciseDetail}>
                  <Ionicons name="barbell" size={14} color={colors.icon} />
                  <ThemedText style={styles.exerciseDetailText}>{exercise.equipment}</ThemedText>
                </View>
                {!exercise.isCustom && 'difficulty' in exercise && (
                  <View style={styles.exerciseDetail}>
                    <Ionicons name="trending-up" size={14} color={colors.icon} />
                    <ThemedText style={styles.exerciseDetailText}>{exercise.difficulty}</ThemedText>
                  </View>
                )}
              </View>
            </View>
            {exercise.isCustom && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCustomExercise((exercise as CustomExercise).id, exercise.name)}
              >
                <Ionicons name="trash-outline" size={20} color="#f44336" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="fitness" size={64} color={colors.icon} />
            <ThemedText style={styles.emptyText}>
              No exercises found matching your criteria
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Add Custom Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddExerciseModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddExerciseModal(false)}
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
                  <ThemedText style={styles.modalTitle}>Add Custom Exercise</ThemedText>
                  <TouchableOpacity onPress={() => setShowAddExerciseModal(false)}>
                    <Ionicons name="close" size={28} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalForm}>
                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>Exercise Name *</ThemedText>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                      placeholder="e.g. Decline Bench Press"
                      placeholderTextColor={colors.icon}
                      value={newExerciseName}
                      onChangeText={setNewExerciseName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>Muscle Group *</ThemedText>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                      placeholder="e.g. Chest"
                      placeholderTextColor={colors.icon}
                      value={newExerciseMuscleGroup}
                      onChangeText={setNewExerciseMuscleGroup}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>Equipment *</ThemedText>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                      placeholder="e.g. Barbell"
                      placeholderTextColor={colors.icon}
                      value={newExerciseEquipment}
                      onChangeText={setNewExerciseEquipment}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                      onPress={() => {
                        setNewExerciseName('');
                        setNewExerciseMuscleGroup('');
                        setNewExerciseEquipment('');
                        setShowAddExerciseModal(false);
                      }}
                    >
                      <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.tint }]}
                      onPress={handleAddCustomExercise}
                    >
                      <ThemedText style={styles.saveButtonText}>Add Exercise</ThemedText>
                    </TouchableOpacity>
                  </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  filterContainer: {
    flexGrow: 0,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  resultsCount: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
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
  exerciseItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  customBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseDetailText: {
    fontSize: 12,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
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
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

