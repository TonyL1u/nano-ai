import { useRef, useState } from 'react';
import type { ScrollView } from 'react-native';

export function useScrollToEnd(threshold = 0) {
  const [isAtEnd, setIsAtEnd] = useState(true);
  const scroller = useRef<ScrollView>(null);
  const scrollDistance = useRef(0);
  const contentHeight = useRef(0);
  const viewportHeight = useRef(0);

  const updateInitialState = () => {
    setIsAtEnd(viewportHeight.current + scrollDistance.current + threshold >= contentHeight.current - 1);
  };

  const handleContentSizeChange = ((_, height) => {
    contentHeight.current = height;
    updateInitialState();
  }) as NonNullable<ScrollView['props']['onContentSizeChange']>;

  const handleScroll = (event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    scrollDistance.current = contentOffset.y;
    viewportHeight.current = layoutMeasurement.height;

    setIsAtEnd(layoutMeasurement.height + contentOffset.y + threshold >= contentSize.height - 1);
  }) as NonNullable<ScrollView['props']['onScroll']>;

  const scrollToEnd = (animated = true) => {
    scroller.current?.scrollToEnd({ animated });
  };

  return { scroller, isAtEnd, handleScroll, handleContentSizeChange, scrollToEnd };
}
