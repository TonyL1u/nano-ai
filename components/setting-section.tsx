import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

import { Text } from './ui/text';

export function SettingSection(props: PropsWithChildren<{ title: string; className?: string }>) {
  const { title, className, children } = props;

  return (
    <View>
      <Text className="my-2 text-sm text-muted-foreground">{title}</Text>
      <View className={cn('gap-2', className)}>{children}</View>
    </View>
  );
}
