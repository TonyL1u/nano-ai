import { useRef, useState } from 'react';
import type { ScrollView } from 'react-native';

export function useScrollToEnd(threshold = 0) {
  const [isAtEnd, setIsAtEnd] = useState(true);
  const scroller = useRef<ScrollView>(null);
  const scrollDistance = useRef(0);
  const viewportHeight = useRef(0);

  const handleLayout = (e => {
    viewportHeight.current = e.nativeEvent.layout.height;
  }) as NonNullable<ScrollView['props']['onLayout']>;

  const handleContentSizeChange = ((_, height) => {
    if (viewportHeight.current === 0 && scrollDistance.current === 0) return;

    setIsAtEnd(viewportHeight.current + scrollDistance.current + threshold >= height - 1);
  }) as NonNullable<ScrollView['props']['onContentSizeChange']>;

  const handleScroll = (event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    scrollDistance.current = contentOffset.y;
    viewportHeight.current = layoutMeasurement.height;

    if (scrollDistance.current < 0 && isAtEnd) {
      setIsAtEnd(true);
    } else {
      setIsAtEnd(layoutMeasurement.height + contentOffset.y + threshold >= contentSize.height - 1);
    }
  }) as NonNullable<ScrollView['props']['onScroll']>;

  const scrollToEnd = (animated = true) => {
    scroller.current?.scrollToEnd({ animated });
  };

  return { scroller, isAtEnd, handleScroll, handleLayout, handleContentSizeChange, scrollToEnd };
}
