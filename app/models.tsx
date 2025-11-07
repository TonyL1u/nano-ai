import { useRouter } from 'expo-router';
import { Lightbulb } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useModel } from '@/hooks/use-model';
import { cn } from '@/lib/utils';
import { useSettingsValue } from '@/store/settings';

export default function ModalScreen() {
  const router = useRouter();
  const [currentModel, setCurrentModel] = useModel();
  const { ollama } = useSettingsValue();
  const { models } = ollama;

  return (
    <ScrollView>
      <View className="flex gap-y-1 px-2 py-5">
        {models.map(model => {
          const { name, canThink } = model;
          const isCurrent = name === currentModel?.name;

          return (
            <Button
              key={name}
              variant="ghost"
              className={cn('flex flex-row justify-between', isCurrent ? 'bg-accent' : '')}
              onPress={() => {
                setCurrentModel(model);
                router.dismiss();
              }}>
              <Text className="text-base">{name}</Text>
              {canThink ? (
                <Badge variant="secondary" className="rounded-full">
                  <Icon as={Lightbulb} className="text-blue-500" />
                </Badge>
              ) : null}
            </Button>
          );
        })}
      </View>
    </ScrollView>
  );
}
