import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { convertDefaultTemplate, getDefaultTemplateOptions } from '@/services/defaultTemplates';
import { storageService } from '@/services/storage';
import { ActiveWorkoutSession, Template } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { templates, workouts, userPreferences } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutSession | null>(null);

  // Check for active workout when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkActiveWorkout = async () => {
        console.log('[HomeScreen] Checking for active workout...');
        const active = await storageService.getActiveWorkout();
        console.log('[HomeScreen] Active workout:', active ? 'Found' : 'None', active?.finishedDate ? '(finished)' : '');
        
        // Only show active workout if it doesn't have a finishedDate set
        // This ensures we never display a workout that has been completed
        if (active && !active.finishedDate) {
          console.log('[HomeScreen] Setting active workout:', active.template.name);
          setActiveWorkout(active);
        } else if (active && active.finishedDate) {
          console.log('[HomeScreen] Clearing finished workout from storage');
          // Clear finished workout from storage if it somehow wasn't cleared
          await storageService.clearActiveWorkout();
          setActiveWorkout(null);
        } else {
          console.log('[HomeScreen] No active workout to display');
          setActiveWorkout(null);
        }
      };
      checkActiveWorkout();
    }, [])
  );

  const thisWeekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return workoutDate >= weekStart;
  });

  const lastWorkout = workouts[0];

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isScheduledToday = userPreferences?.selectedDays.includes(today);
  const nextWorkoutDay = userPreferences?.selectedDays.find(day => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const dayIndex = daysOfWeek.indexOf(day);
    return dayIndex > todayIndex;
  }) || userPreferences?.selectedDays[0];

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

  const handleResumeWorkout = () => {
    if (activeWorkout) {
      router.push({
        pathname: '/workout-session',
        params: { template: JSON.stringify(activeWorkout.template) },
      });
    }
  };

  const handleDiscardActiveWorkout = () => {
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard your active workout? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearActiveWorkout();
            setActiveWorkout(null);
          },
        },
      ]
    );
  };

  const handleSelectDefaultTemplate = (templateOption: ReturnType<typeof getDefaultTemplateOptions>[0]) => {
    const convertedTemplate = convertDefaultTemplate(templateOption.template, templateOption.dayIndex);
    
    if (!convertedTemplate) {
      Alert.alert('Error', 'Failed to load template. Please try again.');
      return;
    }
    
    setShowTemplateSelector(false);
    router.push({
      pathname: '/workout-session',
      params: { template: JSON.stringify(convertedTemplate) },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Message */}
        <ThemedText style={styles.welcomeText}>Welcome back!</ThemedText>

        {/* Active Workout or Main Action Card */}
        {activeWorkout ? (
          <View style={styles.activeWorkoutContainer}>
            <ThemedText style={styles.activeWorkoutLabel}>Active Workout</ThemedText>
            <TouchableOpacity
              style={[styles.resumeCard, { backgroundColor: colors.tint }]}
              onPress={handleResumeWorkout}
            >
              <View style={styles.resumeCardContent}>
                <View style={styles.resumeCardIcon}>
                  <Ionicons name="play-circle" size={48} color="#fff" />
                </View>
                <View style={styles.resumeCardInfo}>
                  <ThemedText style={styles.resumeCardTitle}>{activeWorkout.template.name}</ThemedText>
                  <ThemedText style={styles.resumeCardSubtitle}>Tap to continue</ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDiscardActiveWorkout();
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.mainCard, { backgroundColor: colors.tint }]}>
            <View style={styles.mainCardIconContainer}>
              <Image 
                source={require('@/assets/images/icon.png')} 
                style={styles.mainCardLogo}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={styles.mainCardTitle}>Ready to Train?</ThemedText>
            <ThemedText style={styles.mainCardSubtitle}>
              {isScheduledToday ? "Let's crush today's workout!" : `Next workout: ${nextWorkoutDay || 'Set your schedule'}`}
            </ThemedText>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorkout}
            >
              <Ionicons name="play" size={20} color={colors.tint} />
              <ThemedText style={[styles.startButtonText, { color: colors.tint }]}>
                Start Workout
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Weekly Progress */}
        {userPreferences && userPreferences.weeklyFrequency > 0 && (
          <View style={styles.progressSection}>
            <ThemedText style={styles.sectionTitle}>Weekly Progress</ThemedText>
            <View style={styles.progressContent}>
              <View style={styles.progressDots}>
                {Array.from({ length: userPreferences.weeklyFrequency }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index < thisWeekWorkouts.length
                        ? { backgroundColor: colors.tint }
                        : { backgroundColor: colors.border },
                    ]}
                  />
                ))}
              </View>
              <ThemedText style={styles.progressText}>
                {thisWeekWorkouts.length}/{userPreferences.weeklyFrequency} workouts completed
              </ThemedText>
            </View>
          </View>
        )}

        {/* Science-Based Templates */}
        <View style={styles.templatesSection}>
          <ThemedText style={styles.sectionTitle}>Science-Based Templates</ThemedText>
          <View style={styles.templatesList}>
            {getDefaultTemplateOptions().slice(0, 3).map((option) => (
              <TouchableOpacity
                key={`${option.template.id}-${option.dayIndex}`}
                style={[styles.templateCard, { backgroundColor: colors.card }]}
                onPress={() => handleSelectDefaultTemplate(option)}
              >
                <View style={styles.templateCardIcon}>
                  <Ionicons name="fitness" size={20} color={colors.tint} />
                </View>
                <View style={styles.templateCardContent}>
                  <ThemedText style={styles.templateCardName}>{option.displayName}</ThemedText>
                  <ThemedText style={styles.templateCardDetail}>
                    {option.exerciseCount} exercises
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Last Workout */}
        {lastWorkout && (
          <View style={styles.lastWorkoutSection}>
            <ThemedText style={styles.sectionTitle}>Last Workout</ThemedText>
            <TouchableOpacity
              style={[styles.lastWorkoutCard, { backgroundColor: colors.card }]}
              onPress={() => router.push({
                pathname: '/workout-detail',
                params: { workout: JSON.stringify(lastWorkout) },
              })}
            >
              <View style={styles.lastWorkoutContent}>
                <View>
                  <ThemedText style={styles.lastWorkoutName}>
                    {lastWorkout.templateName}
                  </ThemedText>
                  <ThemedText style={styles.lastWorkoutDate}>
                    {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Template Selector Modal - Positioned Above Content */}
      {showTemplateSelector && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTemplateSelector(false)}
          />
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Choose Template</ThemedText>
              <TouchableOpacity onPress={() => setShowTemplateSelector(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {templates.length > 0 && (
                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>My Templates</ThemedText>
                  {templates.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={[styles.modalOption, { borderColor: colors.border }]}
                      onPress={() => handleSelectTemplate(template)}
                    >
                      <Ionicons name="document-text" size={22} color={colors.tint} />
                      <View style={styles.modalOptionContent}>
                        <ThemedText style={styles.modalOptionName}>{template.name}</ThemedText>
                        <ThemedText style={styles.modalOptionDetail}>
                          {template.exercises.length} exercises
                        </ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>Science-Based Programs</ThemedText>
                {getDefaultTemplateOptions().map((option) => (
                  <TouchableOpacity
                    key={`${option.template.id}-${option.dayIndex}`}
                    style={[styles.modalOption, { borderColor: colors.border }]}
                    onPress={() => handleSelectDefaultTemplate(option)}
                  >
                    <Ionicons name="fitness" size={22} color={colors.tint} />
                    <View style={styles.modalOptionContent}>
                      <ThemedText style={styles.modalOptionName}>
                        {option.displayName}
                      </ThemedText>
                      <ThemedText style={styles.modalOptionDetail}>
                        {option.exerciseCount} exercises • {option.template.split}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  mainCard: {
    padding: 32,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  mainCardIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  mainCardLogo: {
    width: 150,
    height: 150
  },
  activeWorkoutContainer: {
    marginBottom: 24,
  },
  activeWorkoutLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumeCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  resumeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resumeCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeCardInfo: {
    flex: 1,
  },
  resumeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  resumeCardSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  discardButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  mainCardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 34,
  },
  mainCardSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 28,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  templatesSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  templatesList: {
    gap: 12,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  templateCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateCardContent: {
    flex: 1,
  },
  templateCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateCardDetail: {
    fontSize: 13,
    opacity: 0.7,
  },
  lastWorkoutSection: {
    marginBottom: 24,
  },
  lastWorkoutCard: {
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lastWorkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastWorkoutDate: {
    fontSize: 13,
    opacity: 0.7,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalSection: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionDetail: {
    fontSize: 13,
    opacity: 0.7,
  },
});
