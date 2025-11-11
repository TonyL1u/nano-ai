import * as Linking from 'expo-linking';
import { type Router, useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Platform, TouchableOpacity } from 'react-native';

import { cn } from '@/lib/utils';

import { Text } from './ui/text';

type TypedUrl = Parameters<Router['push']>[0];

export function TextLink(props: PropsWithChildren<{ url?: string | TypedUrl; external?: boolean; className?: string }>) {
  const { url, external = false, className, children } = props;
  const router = useRouter();

  const handleRoute = async () => {
    if (!url) return;

    if (external) {
      const supported = await Linking.canOpenURL(url as string);
      if (supported) {
        await Linking.openURL(url as string);
      }
    } else {
      router.push(url as TypedUrl);
    }
  };

  return (
    <TouchableOpacity onPress={handleRoute}>
      <Text className={cn('relative underline', Platform.select({ ios: 'top-[9.5px]', android: 'top-[5px]' }), className)}>{children}</Text>
    </TouchableOpacity>
  );
}
