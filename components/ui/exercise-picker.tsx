import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { exerciseLibrary, getMuscleGroups, searchExercises } from '@/services/exerciseLibrary';
import { ExerciseLibraryItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ExercisePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseLibraryItem) => void;
  title?: string;
}

export function ExercisePicker({ visible, onClose, onSelect, title = 'Select Exercise' }: ExercisePickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  const muscleGroups = getMuscleGroups();
  const filteredExercises = searchQuery 
    ? searchExercises(searchQuery)
    : selectedMuscleGroup
      ? exerciseLibrary.filter(ex => ex.muscleGroup === selectedMuscleGroup)
      : exerciseLibrary;

  const handleSelect = (exercise: ExerciseLibraryItem) => {
    onSelect(exercise);
    setSearchQuery('');
    setSelectedMuscleGroup(null);
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMuscleGroup(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerTop}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
              color: colors.text,
            }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedMuscleGroup && !searchQuery && { backgroundColor: colors.tint },
                { borderColor: colors.border }
              ]}
              onPress={clearFilters}
            >
              <ThemedText style={[
                styles.filterChipText,
                !selectedMuscleGroup && !searchQuery && { color: '#fff' }
              ]}>
                All
              </ThemedText>
            </TouchableOpacity>
            {muscleGroups.map(group => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.filterChip,
                  selectedMuscleGroup === group && { backgroundColor: colors.tint },
                  { borderColor: colors.border }
                ]}
                onPress={() => setSelectedMuscleGroup(group === selectedMuscleGroup ? null : group)}
              >
                <ThemedText style={[
                  styles.filterChipText,
                  selectedMuscleGroup === group && { color: '#fff' }
                ]}>
                  {group}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.exerciseItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
                <View style={styles.exerciseMeta}>
                  <View style={[styles.badge, { backgroundColor: colors.tint + '20' }]}>
                    <ThemedText style={[styles.badgeText, { color: colors.tint }]}>
                      {item.muscleGroup}
                    </ThemedText>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.icon + '20' }]}>
                    <ThemedText style={[styles.badgeText, { color: colors.icon }]}>
                      {item.equipment}
                    </ThemedText>
                  </View>
                  {item.isCompound && (
                    <View style={[styles.badge, { backgroundColor: '#34C759' + '20' }]}>
                      <ThemedText style={[styles.badgeText, { color: '#34C759' }]}>
                        Compound
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={colors.icon} />
              <ThemedText style={styles.emptyText}>No exercises found</ThemedText>
              <ThemedText style={styles.emptySubtext}>Try a different search term</ThemedText>
            </View>
          }
        />
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
});

