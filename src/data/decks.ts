import { colors } from '../theme';
import { kanaRows } from './content/kana';
import { patternRows } from './content/patterns';
import { sentenceRows } from './content/sentences';
import { wordFiles } from './content/words';

export type Level = 'N5' | 'N4' | 'N3';
export type Style = '丁寧' | '普通';

// 카드 한 장. 덱마다 쓰는 필드가 조금 다르다 (docs/02 참고)
// - words/patterns: front=표기, reading=읽기(가나), back=한국어 뜻, ex·exReading·exKo=예문
// - sentences: front=한국어, back=일본어 정답, reading=정답의 읽기(가나), note=핵심 표현 풀이
// - kana: front=문자, reading=로마자, back=한글 독음(대략), ex·exReading·exKo=예 단어
export type Card = {
  id: string;
  tag: string;
  front: string;
  // 앞면 아래 작은 글씨: 단어·문형은 읽기, 가나는 로마자, 문장은 안내 문구
  hint: string;
  back: string;
  ex: string;
  exKo: string;
  reading: string;
  exReading: string;
  level?: Level;
  style?: Style;
  // 빈칸 퀴즈용: 예문에 한 번만 나오는 활용된 부분 문자열
  blank?: string;
  note?: string;
};

export type CardDeckId = 'kana' | 'words' | 'patterns' | 'sentences';
export type DeckId = CardDeckId | 'dialogue';

export type DeckMeta = {
  id: DeckId;
  name: string;
  sub: string;
  mono: string;
  color: string;
  soft: string;
  deep: string;
  bigFront: boolean;
};

const empty = '';

// kana: [문자, 로마자, 분류, 한글 독음, 예 단어, 예 단어 읽기, 예 단어 뜻, 메모?]
const kana: Card[] = kanaRows.map(([front, romaji, tag, hangul, ex, exReading, exKo, note]) => ({
  id: front,
  tag,
  front,
  hint: romaji,
  back: hangul,
  ex,
  exKo,
  reading: romaji,
  exReading,
  note: note || undefined,
}));

// words: 파일마다 { level, rows }, 행은 [표기, 읽기, 품사, 뜻, 예문, 예문 읽기, 예문 뜻, 빈칸?, 문체?]
const words: Card[] = wordFiles.flatMap((file) =>
  file.rows.map(([front, reading, tag, back, ex, exReading, exKo, blank, style]): Card => ({
    id: `${front}#${reading}`,
    tag,
    front,
    hint: reading === front ? empty : reading,
    back,
    ex,
    exKo,
    reading,
    exReading,
    level: file.level,
    style: style === '普通' ? '普通' : '丁寧',
    blank: blank || undefined,
  })),
);

// patterns: [문형, 분류, 뜻, 접속 메모, 예문, 예문 읽기, 예문 뜻, 레벨, 빈칸?, 문체?]
const patterns: Card[] = patternRows.map(([front, tag, back, note, ex, exReading, exKo, level, blank, style]): Card => ({
  id: front,
  tag,
  front,
  hint: empty,
  back,
  ex,
  exKo,
  reading: front,
  exReading,
  level,
  style: style === '普通' ? '普通' : '丁寧',
  blank: blank || undefined,
  note,
}));

// sentences: [한국어, 일본어, 읽기, 메모, 레벨, 문체?]
const sentences: Card[] = sentenceRows.map(([ko, ja, reading, note, level, style]): Card => ({
  id: ja,
  tag: '한국어 → 일본어',
  front: ko,
  hint: '일본어로 말해 보세요',
  back: ja,
  ex: empty,
  exKo: empty,
  reading,
  exReading: empty,
  level,
  style: style === '普通' ? '普通' : '丁寧',
  note,
}));

export const cardDecks: Record<CardDeckId, Card[]> = { kana, words, patterns, sentences };

// 어두운 테마에서는 연한 배경 대신 어두운 톤을 쓴다
const deckMeta0 = (
  m: Omit<DeckMeta, 'soft' | 'deep'>,
  light: { soft: string; deep: string },
  dark: { soft: string; deep: string },
): DeckMeta => ({
  ...m,
  get soft() {
    return colors.mode === 'dark' ? dark.soft : light.soft;
  },
  get deep() {
    return colors.mode === 'dark' ? dark.deep : light.deep;
  },
});

export const decks: DeckMeta[] = [
  deckMeta0({ id: 'kana', name: '가나', sub: 'ひらがな・カタカナ', mono: 'あ', color: '#D93A4C', bigFront: true }, { soft: '#FBE4E7', deep: '#A8202F' }, { soft: '#3D1E24', deep: '#F59AA6' }),
  deckMeta0({ id: 'words', name: '단어', sub: '単語', mono: '語', color: '#2F5BFF', bigFront: true }, { soft: '#E7ECFF', deep: '#2140C4' }, { soft: '#1F2A52', deep: '#9DB2FF' }),
  deckMeta0({ id: 'patterns', name: '문형·표현', sub: '文型・表現', mono: '〜', color: '#E8752A', bigFront: true }, { soft: '#FDEBDD', deep: '#A84A10' }, { soft: '#3D2A1B', deep: '#F5A872' }),
  deckMeta0({ id: 'sentences', name: '문장', sub: '文', mono: '文', color: '#1A9E7A', bigFront: false }, { soft: '#DDF3EC', deep: '#0F6E54' }, { soft: '#18362D', deep: '#6FD6B5' }),
  deckMeta0({ id: 'dialogue', name: '대화문', sub: '会話', mono: '話', color: '#7A4DE0', bigFront: false }, { soft: '#ECE4FB', deep: '#5630B0' }, { soft: '#2D2347', deep: '#B9A0F5' }),
];

export const deckMeta = (id: DeckId): DeckMeta => decks.find((d) => d.id === id) ?? decks[1];

// 카드 덱은 세트로 나눠 공부한다. 한 세트의 카드 수는 설정에서 고른다 (기본 50장)
export const SET_SIZES = [10, 20, 30, 50, 100];
export const DEFAULT_SET_SIZE = 50;

export const validSetSize = (n: unknown): number => (typeof n === 'number' && SET_SIZES.includes(n) ? n : DEFAULT_SET_SIZE);

// 지금 쓰는 세트 크기. 저장된 설정을 불러올 때와 화면을 그릴 때 applySetSize로 맞춘다
let currentSetSize = DEFAULT_SET_SIZE;
export const applySetSize = (n: unknown) => {
  currentSetSize = validSetSize(n);
};
export const getSetSize = () => currentSetSize;

// 가나는 개수가 아니라 흔히 쓰는 분류(청음·탁음·반탁음·요음)로 세트를 나눈다. 세트 크기 설정과 무관하다
const kanaGroups: Card[][] = [];
const kanaGroupNames: string[] = [];
for (const c of kana) {
  const i = kanaGroupNames.indexOf(c.tag);
  if (i < 0) {
    kanaGroupNames.push(c.tag);
    kanaGroups.push([c]);
  } else kanaGroups[i].push(c);
}

export const setCount = (deck: CardDeckId) => (deck === 'kana' ? kanaGroups.length : Math.ceil(cardDecks[deck].length / currentSetSize));

export const setCards = (deck: CardDeckId, set: number) =>
  deck === 'kana' ? (kanaGroups[set] ?? []) : cardDecks[deck].slice(set * currentSetSize, (set + 1) * currentSetSize);

// 세트 이름: 가나는 분류 이름(예: 히라가나 청음), 나머지는 "N세트"
export const setTitle = (deck: CardDeckId, set: number) => (deck === 'kana' ? (kanaGroupNames[set] ?? '').replace('·', ' ') : `${set + 1}세트`);

// 세트 카드가 덱 전체에서 차지하는 번호 범위 (1부터)
export const setRange = (deck: CardDeckId, set: number): [number, number] => {
  if (deck === 'kana') {
    const start = kanaGroups.slice(0, set).reduce((n, g) => n + g.length, 0);
    return [start + 1, start + (kanaGroups[set]?.length ?? 0)];
  }
  return [set * currentSetSize + 1, set * currentSetSize + setCards(deck, set).length];
};

// "세트 크기" 설정이 적용되는 덱인지 (가나는 분류로 고정)
export const usesSetSize = (deck: CardDeckId) => deck !== 'kana';

// 카드를 읽어 줄 때 쓰는 문자열. 음성 파일(scripts/generate-audio.cjs)도 같은 규칙으로 문구를 모은다.
// 단어·문형·가나는 표기(front), 문장은 일본어 정답(back). 05 단계에서 표기/읽기 기준을 확정하면 여기만 바꾼다
// 같은 표기에 읽기가 다른 단어(人 ひと/にん, 分 ふん/ぶん, 開く あく/ひらく)는 음성 키가 겹치지 않게 읽기(가나)를 읽는다
let ambiguous: Set<string> | null = null;
const isAmbiguous = (front: string) => {
  if (!ambiguous) {
    const seen = new Set<string>();
    ambiguous = new Set<string>();
    for (const w of words) (seen.has(w.front) ? ambiguous : seen).add(w.front);
  }
  return ambiguous.has(front);
};
export const speakText = (deck: CardDeckId, c: Card): string => {
  if (deck === 'sentences') return c.back;
  if (deck === 'words' && c.reading && isAmbiguous(c.front)) return c.reading;
  return c.front;
};
// 예문을 읽어 줄 때 쓰는 문자열
export const speakExample = (c: Card): string => c.ex;
