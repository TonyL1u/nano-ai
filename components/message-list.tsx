import { ArrowDown, Lightbulb } from 'lucide-react-native';
import { useMemo, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';

import { useScrollToEnd } from '@/hooks/use-scroll-to-end';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateLayoutEffect } from '@/hooks/use-update-effect';
import type { Message } from '@/store/chats';

import { Copy } from './copy';
import { Markdown } from './markdown';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { NativeOnlyAnimatedView } from './ui/native-only-animated-view';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';

export function MessageList(props: { messages: Message[] }) {
  const { messages } = props;
  const { mutedForeground } = useThemeColor();
  const { scroller, scrollToEnd, handleScroll, handleLayout, handleContentSizeChange, isAtEnd } = useScrollToEnd(200);
  const autoScrollEnabled = useRef(true);
  const inChatting = useMemo(() => {
    if (messages.length > 0) {
      const { isPending = false, isStreaming = false, isThinking = false, isAborted = false } = messages.at(-1)!;

      return (isPending || isStreaming || isThinking) && !isAborted;
    }

    return false;
  }, [messages]);

  useUpdateLayoutEffect(() => {
    if (isAtEnd) {
      autoScrollEnabled.current = true;
    }
  }, [isAtEnd]);

  return (
    <View className="pt-safe-offset-12 relative flex-1">
      <ScrollView
        ref={scroller}
        keyboardShouldPersistTaps="handled"
        onLayout={handleLayout}
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          if (inChatting && autoScrollEnabled.current) {
            autoScrollEnabled.current = false;
          }
        }}
        onContentSizeChange={(...args) => {
          if (inChatting && autoScrollEnabled.current) {
            scrollToEnd();
          }
          handleContentSizeChange(...args);
        }}>
        <View className="px-safe-offset-4 flex flex-1 gap-y-4">
          {messages.map(({ role, content, thinkingContent, thinkingDuration, isPending, isThinking, isStreaming, isAborted }, index) => {
            if (role === 'user') {
              return (
                <View key={index} className="flex w-full scroll-mt-5 flex-row justify-end">
                  <Text className="w-max max-w-[75%] rounded-[20px] bg-accent px-4 py-2 font-medium leading-6" selectable>
                    {content}
                  </Text>
                </View>
              );
            }

            if (isPending) {
              return (
                <View key={index} className="mr-auto w-max rounded-[20px] bg-accent px-4 py-3">
                  <Spinner />
                </View>
              );
            }

            return (
              <View key={index}>
                {isThinking !== void 0 ? (
                  <>
                    <View className="flex flex-row items-center gap-x-1">
                      <Icon as={Lightbulb} size={20} />
                      <Text>{isThinking ? 'Thinking....' : `Thought for ${((thinkingDuration || 0) / 1000).toFixed(1)} seconds`}</Text>
                    </View>
                    {thinkingContent ? (
                      <View className="pl-[26px]">
                        <Markdown content={thinkingContent} style={{ fontSize: 14, color: mutedForeground, lineHeight: 21 }} />
                      </View>
                    ) : null}
                  </>
                ) : null}
                <Markdown content={content} style={{ lineHeight: 24 }} />
                {isStreaming || isThinking || isPending || isAborted ? null : <Copy className="relative right-2 w-10 text-muted-foreground" content={content} iconSize={16} showText={false} />}
              </View>
            );
          })}
        </View>
      </ScrollView>
      {isAtEnd ? null : (
        <NativeOnlyAnimatedView entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <Button size="icon" className="absolute bottom-0 left-[50%] translate-x-[-50%] rounded-full" variant="outline" onPress={() => scrollToEnd()}>
            <Icon as={ArrowDown} size={18} />
          </Button>
        </NativeOnlyAnimatedView>
      )}
    </View>
  );
}
