import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Template } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TemplatesScreen() {
  const { templates, deleteTemplate } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDelete = (template: Template) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTemplate(template.id),
        },
      ]
    );
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
    };
    router.push({
      pathname: '/template-form',
      params: { template: JSON.stringify(newTemplate) },
    });
  };

  const renderTemplate = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push({
        pathname: '/template-form',
        params: { template: JSON.stringify(item) },
      })}
    >
      <View style={styles.cardHeader}>
        <ThemedText style={styles.templateName}>{item.name}</ThemedText>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDuplicate(item)}
          >
            <Ionicons name="copy" size={20} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      <ThemedText style={styles.exerciseCount}>
        {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}
      </ThemedText>
      {item.exercises.slice(0, 3).map((exercise, index) => (
        <ThemedText key={index} style={styles.exerciseName}>
          • {exercise.name}
        </ThemedText>
      ))}
      {item.exercises.length > 3 && (
        <ThemedText style={styles.moreText}>
          +{item.exercises.length - 3} more...
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={64} color={colors.icon} />
            <ThemedText style={styles.emptyText}>No templates yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Create your first workout template
            </ThemedText>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/template-form')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  exerciseCount: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 14,
    marginLeft: 8,
    marginTop: 4,
  },
  moreText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
    opacity: 0.7,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

