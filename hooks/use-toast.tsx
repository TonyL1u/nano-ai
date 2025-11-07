import { Toast } from '@sekizlipenguen/react-native-popup-confirm-toast';
import { Check, X } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';

import { useThemeColor } from './use-theme-color';

interface ToastConfig {
  description?: string;
  position?: 'top' | 'bottom';
  duration?: number;
}

type ToastMethod = (text: string, config?: ToastConfig) => void;

type UseToastReturn = Record<'success' | 'error', ToastMethod>;

export function useToast(): UseToastReturn {
  const { background, foreground, secondaryForeground } = useThemeColor();
  const baseConfig = {
    titleTextStyle: { color: foreground, marginTop: 12 },
    descTextStyle: { color: secondaryForeground, marginBottom: 12 },
    backgroundColor: background,
    timeColor: 'transparent',
    statusBarHidden: true
  } as const;

  return {
    success: (text, config) => {
      const { description, position = 'top', duration = 1000 } = config || {};

      Toast.show({
        ...baseConfig,
        title: text,
        text: description,
        timing: duration,
        icon: <Icon as={Check} size={24} className="mt-2" />,
        position
      });
    },
    error: (text, config) => {
      const { description, position = 'top', duration = 1000 } = config || {};

      Toast.show({
        ...baseConfig,
        title: text,
        text: description,
        timing: duration,
        icon: <Icon as={X} size={24} className="mt-2" />,
        position
      });
    }
  };
}
