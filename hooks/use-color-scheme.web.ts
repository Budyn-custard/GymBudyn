import { DataContext } from '@/contexts/DataContext';
import { useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemColorScheme = useRNColorScheme();
  
  // Safely access context - it might not be available yet (before DataProvider mounts)
  const context = useContext(DataContext);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }

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
