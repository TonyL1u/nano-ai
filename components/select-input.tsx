import type { ContentProps } from '@rn-primitives/popover';
import type { TriggerRef } from '@rn-primitives/popover';
import { type ComponentProps, type ReactNode, useRef } from 'react';
import { type GestureResponderEvent, Pressable, View } from 'react-native';

import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Text } from './ui/text';

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps<T> extends ComponentProps<typeof Input> {
  options?: T[];
  onPressItem?: (event: GestureResponderEvent) => void;
  renderItem?: (option: T) => ReactNode;
  contentProps?: ContentProps;
  emptyView?: ReactNode;
}

export function SelectInput<T extends SelectOption>(props: SelectInputProps<T>) {
  const { options = [], renderItem, onPressItem, contentProps, emptyView, ...inputProps } = props;
  const ref = useRef<TriggerRef>(null);

  return (
    <Popover>
      <PopoverTrigger ref={ref} asChild>
        <Input {...inputProps} />
      </PopoverTrigger>
      <PopoverContent className="w-full p-1" {...contentProps}>
        {options.length > 0 ? (
          options.map(opt => {
            return (
              <Pressable
                key={opt.value}
                className="flex flex-row items-center justify-between rounded-sm px-4 py-2 active:bg-accent"
                onPress={e => {
                  onPressItem?.(e);
                  inputProps.onChangeText?.(opt.value);
                  ref.current?.close();
                }}>
                {renderItem ? renderItem(opt) : <Text>{opt.label}</Text>}
              </Pressable>
            );
          })
        ) : (
          <View className="py-2">{emptyView || <Text className="text-center text-sm text-muted-foreground">No Records.</Text>}</View>
        )}
      </PopoverContent>
    </Popover>
  );
}
