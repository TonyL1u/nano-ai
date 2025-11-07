import { useColorScheme } from 'nativewind';

import { THEME } from '@/lib/theme';

export function useThemeColor() {
  const { colorScheme } = useColorScheme();

  return THEME[colorScheme || 'light'];
}
