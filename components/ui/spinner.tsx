import { Loader2Icon } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

import { Icon } from './icon';

function Spinner({ className }: React.ComponentProps<'svg'>) {
  return (
    <View className="pointer-events-none animate-spin">
      <Icon as={Loader2Icon} aria-label="Loading" className={cn('size-4', className)} />
    </View>
  );
}

export { Spinner };
