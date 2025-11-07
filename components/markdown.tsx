import { useTheme } from '@react-navigation/native';
import markdownItMath from 'markdown-it-math';
import { ScrollView, type ScrollViewProps, type TextStyle, View } from 'react-native';
import RNMarkdown, { MarkdownIt } from 'react-native-markdown-display';
import MathView from 'react-native-math-view';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/styles/hljs';

import { useThemeColor } from '@/hooks/use-theme-color';

import { Copy } from './copy';
import { Text } from './ui/text';

const markdownIt = new MarkdownIt({ typographer: true }).use(markdownItMath, {
  inlineOpen: '\\(',
  inlineClose: '\\)',
  blockOpen: '\\[',
  blockClose: '\\]'
});

const createPreTag = (sourceInfo: string, content: string) => {
  return function Pre(props: ScrollViewProps) {
    const { children, style } = props;

    return (
      <View className="relative" style={style}>
        <View className="absolute left-4 top-3.5 z-10 flex w-full flex-row justify-between">
          <Text className="text-sm text-muted-foreground">{sourceInfo}</Text>
          <Copy className="h-5 gap-x-1.5 p-0" textClassName="text-muted-foreground" content={content} iconSize={12} />
        </View>
        <ScrollView horizontal className="pt-6">
          {children}
        </ScrollView>
      </View>
    );
  };
};

export function Markdown(props: { content: string; style?: TextStyle }) {
  const { content, style } = props;
  const { colors, dark } = useTheme();
  const { muted, border, mutedForeground } = useThemeColor();

  return (
    <RNMarkdown
      markdownit={markdownIt}
      style={{
        body: { fontSize: 16, color: colors.text, ...style },
        list_item: { marginVertical: 4 },
        bullet_list_icon: { fontSize: 32, marginHorizontal: 0, marginTop: 8 },
        ordered_list_icon: { marginTop: 2 },
        code_inline: { fontFamily: 'Fira_Code', backgroundColor: muted },
        hr: { marginBottom: 16, marginTop: 8, backgroundColor: colors.border, height: 2 },
        blockquote: {
          backgroundColor: muted,
          color: mutedForeground,
          paddingLeft: 12,
          marginVertical: 8
        },
        heading1: { fontWeight: 700, marginVertical: 16, lineHeight: 48 },
        heading2: { fontWeight: 600, marginVertical: 12, lineHeight: 36 },
        heading3: { fontWeight: 600, marginVertical: 4, lineHeight: 27 },
        table: {
          borderColor: border,
          borderRadius: 6,
          marginVertical: 8
        },
        tbody: {
          borderRadius: 6,
          fontSize: 14
        },
        thead: {
          backgroundColor: muted,
          fontWeight: 'bold',
          borderWidth: 0,
          padding: 0
        },
        tr: {
          borderColor: border
        },
        th: {
          padding: 12
        },
        td: {
          padding: 12
        },
        textgroup: {
          padding: 0
        }
      }}
      rules={{
        fence: node => {
          // we trim new lines off the end of code blocks because the parser sends an extra one.
          // @ts-expect-error type error
          const { key, sourceInfo, content } = node;

          return (
            <SyntaxHighlighter
              key={key}
              language={sourceInfo}
              highlighter="hljs"
              style={dark ? atomOneDark : atomOneLight}
              fontSize={14}
              fontFamily="Fira_Code"
              customStyle={{
                backgroundColor: muted,
                borderRadius: 16,
                padding: 16,
                marginTop: 8,
                marginBottom: 8
              }}
              PreTag={createPreTag(sourceInfo, content)}
              CodeTag={Text}>
              {content.trimEnd()}
            </SyntaxHighlighter>
          );
        },
        // textgroup: (node, children, parent, styles) => {
        //   return (
        //     <TextInput key={node.key} style={styles.textgroup} editable={false} multiline>
        //       {children}
        //     </TextInput>
        //   );
        // },
        table: (node, children, parent, styles) => {
          // @ts-expect-error react node type
          const columns: number = children[1].props?.children[0]?.props?.children?.length;

          return (
            <ScrollView key={node.key} horizontal showsHorizontalScrollIndicator style={styles.table}>
              <View style={{ width: columns * 125 || 400 }}>{children}</View>
            </ScrollView>
          );
        },
        math_inline: node => {
          const { content, key } = node;

          return <MathView key={key} math={content} style={{ color: colors.text }} />;
        },
        math_block: node => {
          const { content, key } = node;

          return (
            <View key={key} className="flex-1 py-4">
              <Text className="mx-auto">
                <MathView math={content} style={{ color: colors.text }} />
              </Text>
            </View>
          );
        }
      }}>
      {content}
    </RNMarkdown>
  );
}
