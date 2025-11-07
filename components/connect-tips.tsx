import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { AlertCircleIcon } from 'lucide-react-native';
import { Platform, TouchableOpacity, View } from 'react-native';

import { cn } from '@/lib/utils';
import { ConnectStatus, settings as settingsAtom } from '@/store/settings';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Text } from './ui/text';

export function ConnectTips(props: { className?: string }) {
  const { className } = props;
  const { ollama } = useAtomValue(settingsAtom);
  const router = useRouter();

  if (ollama.connectStatus === ConnectStatus.SUCCESSFUL) return null;

  return (
    <View className={className}>
      <Alert variant="destructive" icon={AlertCircleIcon}>
        <AlertTitle>Ollama server connect failed.</AlertTitle>
        <AlertDescription>
          Please go to{' '}
          <TouchableOpacity
            onPress={() => {
              router.push('/settings');
            }}>
            <Text className={cn('relative underline', Platform.select({ ios: 'top-[9.5px]', android: 'top-[5px]' }))}>Settings</Text>
          </TouchableOpacity>{' '}
          and update your Ollama API endpoint.
        </AlertDescription>
      </Alert>
    </View>
  );
}
