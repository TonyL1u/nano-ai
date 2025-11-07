import { useCallback, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';

export function useScrollToEnd(threshold = 0) {
  const [isAtEnd, setIsAtEnd] = useState(true);
  const scroller = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (event => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

      const isEnd = layoutMeasurement.height + contentOffset.y + threshold >= contentSize.height - 1;
      setIsAtEnd(isEnd);
    }) as NonNullable<ScrollView['props']['onScroll']>,
    []
  );
  const scrollToEnd = useCallback(() => {
    scroller.current?.scrollToEnd({ animated: true });
  }, []);

  return { scroller, isAtEnd, handleScroll, scrollToEnd };
}
