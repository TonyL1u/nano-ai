import { useRouter } from 'expo-router';
import { Edit, MoonStarIcon, Sidebar, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRef } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import ReanimatedDrawerLayout, { DrawerLayoutMethods } from 'react-native-gesture-handler/ReanimatedDrawerLayout';

import { ConnectTips } from '@/components/connect-tips';
import { DrawerContent } from '@/components/drawer-content';
import { MainInput } from '@/components/main-input';
import { MessageList } from '@/components/message-list';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useMessage } from '@/hooks/use-message';
import { useModel } from '@/hooks/use-model';
import { useOllama } from '@/hooks/use-ollama';
import { cn } from '@/lib/utils';
import { useChats } from '@/store/chats';
import { ConnectStatus, useSettingsValue } from '@/store/settings';

const LOGO = {
  light: require('@/assets/images/logo.png'),
  dark: require('@/assets/images/logo-dark.png')
};

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon
};

const IMAGE_STYLE = {
  height: 64,
  width: 64
};

export default function Index() {
  const { colorScheme } = useColorScheme();
  const [{ current }] = useChats();
  const [messages] = useMessage();
  const drawerRef = useRef<DrawerLayoutMethods>(null);
  const { request, abort } = useOllama();
  const requestAbortMap = useRef<Record<string, () => void>>({});

  const handleSend = async (input: string, think?: boolean) => {
    requestAbortMap.current[current] = abort;
    await request(input, think);
  };
  const handleAbort = () => {
    requestAbortMap.current[current].call(null);
  };

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      drawerWidth={300}
      renderNavigationView={() => (
        <DrawerContent
          close={() => {
            drawerRef.current?.closeDrawer();
          }}
        />
      )}>
      <View className="flex flex-1">
        <Header
          handlePressSidebarIcon={() => {
            drawerRef.current?.openDrawer();
          }}
        />
        {messages.length > 0 ? (
          <KeyboardAvoidingView behavior="padding" className="flex flex-1 flex-col items-center justify-center">
            <MessageList messages={messages} />
            <View className="pb-safe px-safe-offset-4 w-full pt-2">
              <ConnectTips className="mb-4" />
              <MainInput onSend={handleSend} onAbort={handleAbort} />
            </View>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView contentContainerClassName="flex-1" scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <View className="relative flex flex-1 flex-col items-center justify-center">
              <KeyboardAvoidingView behavior="position" className="px-safe-offset-4 w-full pb-4">
                <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" className="mx-auto mb-8" />
                <MainInput onSend={handleSend} onAbort={handleAbort} />
              </KeyboardAvoidingView>
              <ConnectTips className="bottom-safe left-safe-offset-4 right-safe-offset-4 absolute" />
            </View>
          </ScrollView>
        )}
      </View>
    </ReanimatedDrawerLayout>
  );
}

function Header(props: { handlePressSidebarIcon: () => void }) {
  const { handlePressSidebarIcon } = props;
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { ollama } = useSettingsValue();
  const { connectStatus } = ollama;
  const [messages] = useMessage();
  const [, { create }] = useChats();
  const [model] = useModel();
  const router = useRouter();

  return (
    <View className="pt-safe absolute z-10 flex w-full flex-row items-center bg-background pb-1">
      <Button onPress={handlePressSidebarIcon} size="icon" variant="ghost" className="top-safe absolute left-2 size-9 rounded-full">
        <Icon as={Sidebar} className="size-[18px]" />
      </Button>
      <Button onPress={toggleColorScheme} size="icon" variant="ghost" className="top-safe absolute left-10 size-9 rounded-full">
        <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-[18px]" />
      </Button>
      <View className="flex-1 items-center">
        <View className="flex flex-row items-center gap-x-1">
          {messages.length > 0 ? <Image source={LOGO[colorScheme ?? 'light']} resizeMode="contain" className="mb-1 size-6" /> : null}
          <Text className="text-base font-medium">Nano AI</Text>
        </View>
        <TouchableOpacity disabled={connectStatus !== ConnectStatus.SUCCESSFUL} onPress={() => router.push('/models')}>
          <Text style={{ fontFamily: 'Google_Sans_Code' }} className={cn('text-xs', connectStatus === ConnectStatus.SUCCESSFUL ? 'text-muted-foreground' : 'text-gray-300')}>
            {model ? model.name : 'select model...'}
          </Text>
        </TouchableOpacity>
      </View>
      <Button onPress={create} size="icon" variant="ghost" className="top-safe absolute right-2 size-9 rounded-full">
        <Icon as={Edit} className="size-[18px]" />
      </Button>
    </View>
  );
}
