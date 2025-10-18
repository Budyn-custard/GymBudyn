import defaultTemplatesData from '@/defaultTemplates.json';
import { exerciseLibrary } from '@/services/exerciseLibrary';
import { Exercise, Template } from '@/types';

// Define the structure of default templates from JSON
interface DefaultTemplateExercise {
  exerciseId: number;
  sets: number;
  reps: string;
  muscleGroup: string;
  alternatives?: number[];
  notes?: string;
}

interface DefaultTemplateDay {
  dayName: string;
  exercises: DefaultTemplateExercise[];
}

interface DefaultTemplate {
  id: number;
  name: string;
  goal: string;
  split: string;
  frequencyPerWeek: number;
  scienceBase: string;
  progression: {
    type: string;
    logic: string;
    deloadFrequencyWeeks: number;
  };
  days: DefaultTemplateDay[];
}

interface DefaultTemplatesJson {
  templates: DefaultTemplate[];
}

/**
 * Convert a default template to the app's Template format
 * For templates with multiple days, creates separate templates for each day
 */
export const convertDefaultTemplate = (defaultTemplate: DefaultTemplate, dayIndex?: number): Template | null => {
  try {
    // If dayIndex is specified, convert only that day
    // Otherwise, if there's only one day, convert it
    // If multiple days and no index, return null (caller should specify which day)
    
    let dayToConvert: DefaultTemplateDay;
    let templateName: string;
    
    if (defaultTemplate.days.length === 1) {
      dayToConvert = defaultTemplate.days[0];
      templateName = defaultTemplate.name;
    } else if (dayIndex !== undefined && dayIndex < defaultTemplate.days.length) {
      dayToConvert = defaultTemplate.days[dayIndex];
      templateName = `${defaultTemplate.name} - ${dayToConvert.dayName}`;
    } else {
      return null;
    }
    
    // Convert exercises
    const exercises: Exercise[] = dayToConvert.exercises.map((ex, index) => {
      const libraryExercise = exerciseLibrary.find(e => e.id === ex.exerciseId);
      
      if (!libraryExercise) {
        console.warn(`Exercise with id ${ex.exerciseId} not found in library`);
        return null;
      }
      
      // Parse reps - take the middle or lower value for defaultReps
      let defaultReps = 10; // fallback
      if (ex.reps.includes('–')) {
        const [min, max] = ex.reps.split('–').map(r => parseInt(r.trim()));
        defaultReps = Math.floor((min + max) / 2);
      } else {
        defaultReps = parseInt(ex.reps) || 10;
      }
      
      return {
        id: `${defaultTemplate.id}-${dayIndex || 0}-${index}`,
        name: libraryExercise.name,
        defaultSets: ex.sets,
        defaultReps: defaultReps,
        defaultWeight: 0, // User will set this
      };
    }).filter((e): e is Exercise => e !== null);
    
    if (exercises.length === 0) {
      return null;
    }
    
    return {
      id: `default-${defaultTemplate.id}-${dayIndex || 0}`,
      name: templateName,
      exercises,
    };
  } catch (error) {
    console.error('Error converting default template:', error);
    return null;
  }
};

/**
 * Get all default templates
 */
export const getDefaultTemplates = (): DefaultTemplate[] => {
  const data = defaultTemplatesData as DefaultTemplatesJson;
  return data.templates;
};

/**
 * Get a specific default template by id
 */
export const getDefaultTemplateById = (id: number): DefaultTemplate | undefined => {
  const templates = getDefaultTemplates();
  return templates.find(t => t.id === id);
};

/**
 * Get all possible template variations (each day as separate template)
 * Returns an array of objects with template info and day index
 */
export const getDefaultTemplateOptions = (): Array<{
  template: DefaultTemplate;
  dayIndex: number;
  displayName: string;
  exerciseCount: number;
}> => {
  const templates = getDefaultTemplates();
  const options: Array<{
    template: DefaultTemplate;
    dayIndex: number;
    displayName: string;
    exerciseCount: number;
  }> = [];
  
  templates.forEach(template => {
    if (template.days.length === 1) {
      // Single day template
      options.push({
        template,
        dayIndex: 0,
        displayName: template.name,
        exerciseCount: template.days[0].exercises.length,
      });
    } else {
      // Multi-day template - create option for each day
      template.days.forEach((day, index) => {
        options.push({
          template,
          dayIndex: index,
          displayName: `${template.name} - ${day.dayName}`,
          exerciseCount: day.exercises.length,
        });
      });
    }
  });
  
  return options;
};

