import type { TriggerRef } from '@rn-primitives/select';
import * as Linking from 'expo-linking';
import { Github, MoonStar, Sun, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { SettingSection } from '@/components/setting-section';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import { OllamaApi } from '@/lib/ollama-api';
import { canModelThink, cn } from '@/lib/utils';
import { useChats } from '@/store/chats';
import { ConnectStatus, useSettings } from '@/store/settings';

const OllamaServer = () => {
  const [settings, setSettings] = useSettings();
  const { ollama } = settings;
  const { host, connectStatus } = ollama;
  const [ollamaHost, setOllamaHost] = useState(host);
  const [connecting, setConnecting] = useState(false);
  const toast = useToast();

  const handleTestOllamaConnection = async () => {
    try {
      const ollamaApi = new OllamaApi(ollamaHost);
      setConnecting(true);
      const { models } = await ollamaApi.tags();
      setSettings(settings => {
        settings.ollama.connectStatus = ConnectStatus.SUCCESSFUL;
        settings.ollama.models = models.map(model => ({ ...model, canThink: canModelThink(model) }));
      });
      toast.success('Connect successfully!');
    } catch (error) {
      setSettings(settings => {
        settings.ollama.connectStatus = ConnectStatus.FAILED;
      });
      toast.error('Connect failed!', { description: `${error}` });
    } finally {
      setConnecting(false);
      setSettings(settings => {
        settings.ollama.host = ollamaHost;
      });
    }
  };

  return (
    <SettingSection title="Ollama Server">
      <View className="flex flex-row gap-x-2 rounded-xl bg-accent p-2">
        <Input value={ollamaHost} placeholder="e.g. localhost:11434" className="flex-1 border-0 bg-transparent" onChangeText={setOllamaHost} />
        <Button disabled={!ollamaHost || connecting} onPress={handleTestOllamaConnection}>
          <Text>{connecting ? 'Connecting' : 'Connect'}</Text>
          <View className={cn('size-2 rounded-full', connectStatus === ConnectStatus.DEFAULT ? 'bg-muted-foreground' : connectStatus === ConnectStatus.FAILED ? 'bg-red-500' : 'bg-green-500')} />
        </Button>
      </View>
    </SettingSection>
  );
};

const System = () => {
  const ref = useRef<TriggerRef>(null);
  const { colorScheme, setColorScheme } = useColorScheme();
  const [settings, setSettings] = useSettings();
  const { hapticFeedback } = settings;

  return (
    <SettingSection title="System">
      <View className="flex flex-row items-center">
        <Text className="flex-1 font-medium">Appearance</Text>
        <Select
          value={{ label: '', value: colorScheme || 'light' }}
          onValueChange={opt => {
            setColorScheme(opt?.value as 'light' | 'dark' | 'system');
          }}>
          <SelectTrigger ref={ref} className="w-[40px] border-0 bg-transparent p-0 shadow-none dark:bg-transparent" showIcon={false}>
            <Button
              size="icon"
              variant="ghost"
              className="ml-1"
              onPress={() => {
                ref.current?.open();
              }}>
              <Icon as={colorScheme === 'light' ? Sun : MoonStar} />
            </Button>
          </SelectTrigger>
          <SelectContent insets={{ left: 12, right: 12 }} className="w-[100px]" side="bottom">
            <SelectItem label="Light" value="light" />
            <SelectItem label="Dark" value="dark" />
            <SelectItem label="System" value="system" showCheck={false} />
          </SelectContent>
        </Select>
      </View>
      <View className="flex flex-row items-center">
        <Text className="flex-1 font-medium">Haptic Feedback</Text>
        <Switch
          checked={hapticFeedback}
          onCheckedChange={value => {
            setSettings(settings => {
              settings.hapticFeedback = value;
            });
          }}
        />
      </View>
    </SettingSection>
  );
};

const Actions = () => {
  const [, { clear }] = useChats();
  const [open, setOpen] = useState(false);

  const handleViewOnGithub = async () => {
    const githubUrl = 'https://github.com/TonyL1u/nano-ai';
    const supported = await Linking.canOpenURL(githubUrl);

    if (supported) {
      await Linking.openURL(githubUrl);
    }
  };

  return (
    <SettingSection title="Actions">
      <Button variant="outline" onPress={handleViewOnGithub}>
        <Text>View on Github</Text>
        <Icon as={Github} size={16} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Text>Delete All Conversations</Text>
            <Icon as={Trash2} size={16} className="text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete all your conversations.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <Text>Cancel</Text>
              </Button>
            </DialogClose>
            <Button
              onPress={() => {
                clear();
                setOpen(false);
              }}>
              <Text>Delete</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingSection>
  );
};

export default function Settings() {
  return (
    <ScrollView className="pt-safe-offset-12 flex-1 px-4">
      <View className="flex gap-y-4">
        <OllamaServer />
        <System />
        <Actions />
      </View>
    </ScrollView>
  );
}
