import { Check, CopyIcon } from 'lucide-react-native';
import { type GestureResponderEvent } from 'react-native';

import { useClipboard } from '@/hooks/use-clipboard';

import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export interface CopyProps {
  content: string | (() => string | Promise<string>);
  iconSize?: number;
  onCopied?: () => void;
  className?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Copy(props: CopyProps) {
  const { content, iconSize = 14, onCopied, className, textClassName, showText = true } = props;
  const { copied, copy } = useClipboard({ copiedDelay: 2000 });
  const iconStyle = { width: iconSize, height: iconSize };

  const handleCopy = async (e: GestureResponderEvent) => {
    if (copied) return;

    e.stopPropagation();
    e.preventDefault();

    await copy(typeof content === 'string' ? content : await content());
    onCopied?.();
  };

  return (
    <Button className={className} variant="ghost" onPress={handleCopy}>
      <Icon as={copied ? Check : CopyIcon} style={iconStyle} className={textClassName} />
      {showText ? (
        <Text className={textClassName} style={{ fontSize: 12 }}>
          {copied ? 'Copied' : 'Copy'}
        </Text>
      ) : null}
    </Button>
  );
}
