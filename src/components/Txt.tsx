import { Children, ReactNode } from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

import { colors, fontScale, fontState } from '../theme';

export type Weight = 400 | 500 | 600 | 700;

const latin: Record<Weight, string> = {
  400: 'SpaceGrotesk_400Regular',
  500: 'SpaceGrotesk_500Medium',
  600: 'SpaceGrotesk_600SemiBold',
  700: 'SpaceGrotesk_700Bold',
};

const korean: Record<Weight, string> = {
  400: 'IBMPlexSansKR_400Regular',
  500: 'IBMPlexSansKR_500Medium',
  600: 'IBMPlexSansKR_600SemiBold',
  700: 'IBMPlexSansKR_700Bold',
};

// 일본어 글꼴은 600이 없어 700으로 대신한다 (파일 크기를 줄이려고 400·500·700만 싣는다)
const japanese: Record<Weight, string> = {
  400: 'NotoSansJP_400Regular',
  500: 'NotoSansJP_500Medium',
  600: 'NotoSansJP_700Bold',
  700: 'NotoSansJP_700Bold',
};

const HANGUL = /[ㄱ-ㆎ가-힣]/;
// 가나, 한자, 일본어 문장부호, 전각 기호
const JAPANESE = /[　-ヿ㐀-鿿々〆＀-￯]/;

type Kind = 'ja' | 'ko' | 'latin';
const kindOf = (ch: string): Kind | null => (HANGUL.test(ch) ? 'ko' : JAPANESE.test(ch) ? 'ja' : null);

const fontFor = (kind: Kind, weight: Weight) => (kind === 'ja' ? japanese[weight] : kind === 'ko' ? korean[weight] : latin[weight]);

// 문자열을 일본어/한국어/그 밖의 덩어리로 나눈다. 공백·숫자·영문은 앞 덩어리를 따라간다
function runs(text: string): { kind: Kind; text: string }[] {
  const out: { kind: Kind; text: string }[] = [];
  let pending = '';
  for (const ch of text) {
    const k = kindOf(ch);
    if (k === null) {
      pending += ch;
      continue;
    }
    const last = out[out.length - 1];
    if (last && last.kind === k) last.text += pending + ch;
    else if (last) {
      last.text += pending;
      out.push({ kind: k, text: ch });
    } else out.push({ kind: k, text: pending + ch });
    pending = '';
  }
  if (pending) {
    if (out.length) out[out.length - 1].text += pending;
    else out.push({ kind: 'latin', text: pending });
  }
  return out;
}

const textOf = (children: ReactNode): string =>
  Children.toArray(children)
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
    .join('');

type Props = TextProps & {
  size?: number;
  weight?: Weight;
  color?: string;
  lineHeight?: number;
  tabular?: boolean;
  style?: TextStyle | TextStyle[];
};

// 한 문자열 안에 한국어와 일본어가 섞여 있으면 글자 종류마다 알맞은 글꼴로 나눠 그린다.
// React Native에는 글꼴 폴백 체인이 없어서, 일본어 한자가 한국어 글꼴 모양으로 그려지거나 빠지는 것을 막으려는 처리다.
export function Txt({ size = 14, weight = 400, color = colors.ink, lineHeight, tabular, style, children, ...rest }: Props) {
  const plain = Children.toArray(children).every((c) => typeof c === 'string' || typeof c === 'number');
  const parts = plain ? runs(textOf(children)) : [];
  const first: Kind = parts[0]?.kind ?? 'latin';
  const mixed = parts.length > 1;
  const family = fontFor(first, weight);
  const isJa = parts.some((p) => p.kind === 'ja');
  return (
    <Text
      {...rest}
      {...(isJa ? ({ lang: 'ja' } as object) : null)}
      style={[
        fontState.fallback ? { fontWeight: String(weight) as TextStyle['fontWeight'] } : { fontFamily: family },
        { fontSize: size * fontScale.value, color },
        lineHeight ? { lineHeight: size * fontScale.value * lineHeight } : null,
        tabular ? styles.tabular : null,
        style,
      ]}
    >
      {mixed && !fontState.fallback
        ? parts.map((p, i) => (
            <Text key={i} style={{ fontFamily: fontFor(p.kind, weight) }}>
              {p.text}
            </Text>
          ))
        : children}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
});
