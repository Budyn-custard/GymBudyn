import { DataContext } from '@/contexts/DataContext';
import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  
  // Safely access context - it might not be available yet (before DataProvider mounts)
  const context = useContext(DataContext);
  
  // If context is not available or no preferences, use system color scheme
  if (!context?.userPreferences) {
    return systemColorScheme;
  }
  
  const themePreference = context.userPreferences.themePreference ?? 'automatic';
  
  if (themePreference === 'automatic') {
    return systemColorScheme;
  }
  
  return themePreference;
}
