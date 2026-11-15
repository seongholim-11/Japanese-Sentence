import { Card, CardDeckId, cardDecks, setCards } from './data/decks';

// 퀴즈 한 문제.
// meaning: 일본어 → 한국어 뜻 / reading: 한자 → 읽기 / ko2ja: 한국어 → 일본어 표기
// blank: 예문 빈칸 / sentence: 한국어 → 일본어 문장 / kana: 문자 → 한글 독음 / kanaRev: 한글 독음 → 문자
export type QuestionKind = 'meaning' | 'reading' | 'ko2ja' | 'blank' | 'sentence' | 'kana' | 'kanaRev';

export type Question = {
  card: Card;
  kind: QuestionKind;
  prompt: string;
  hint: string;
  choices: string[];
  answer: number;
  // 보기가 일본어 글자인지 (글꼴 선택용)
  choiceJa: boolean;
  // 풀이 때 보여 줄 읽기 (있으면)
  reading?: string;
};

export const QUIZ_LENGTH = 10;

const rand = (n: number) => Math.floor(Math.random() * n);

const shuffle = <T,>(a: T[]): T[] => {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

export const BLANK = '＿＿＿';

const HAN = /[㐀-鿿々〆]/;
export const hasKanji = (s: string) => HAN.test(s);

// 뜻이 쉼표로 나열된 카드끼리 같은 뜻이 겹치면(예: "괜찮은, 좋은"과 "좋은") 오답이 정답처럼 보인다
const items = (m: string) =>
  m
    .replace(/\([^)]*\)/g, '')
    .split(/[,;·]/)
    .map((x) => x.replace(/[~\s]+/g, ' ').trim())
    .filter(Boolean);
export const overlaps = (a: string, b: string) => {
  const bs = items(b);
  return items(a).some((x) => bs.includes(x));
};

// 오답 보기: 풀에서 무작위로 뽑되, 조건(ok)을 만족하고 이미 쓴 문구와 겹치지 않게 한다
const pick = (pool: Card[], n: number, ok: (c: Card) => boolean, text: (c: Card) => string, taken: string[]): string[] => {
  const out: string[] = [];
  const seen = new Set(taken);
  if (pool.length === 0) return out;
  for (let tries = 0; out.length < n && tries < 600; tries++) {
    const c = pool[rand(pool.length)];
    const t = text(c);
    if (t && ok(c) && !seen.has(t)) {
      out.push(t);
      seen.add(t);
    }
  }
  return out;
};

// 보기가 최소 2개는 있어야 문제가 된다. 4개가 이상적이지만 풀이 작으면 줄어든다
const finish = (card: Card, kind: QuestionKind, prompt: string, hint: string, right: string, wrong: string[], choiceJa: boolean, reading?: string): Question | null => {
  if (wrong.length < 1) return null;
  const choices = shuffle([right, ...wrong]);
  return { card, kind, prompt, hint, choices, answer: choices.indexOf(right), choiceJa, reading };
};

const script = (c: Card) => c.tag.split('·')[0];

// 한글 독음이 같은 가나(じ/ぢ, ず/づ, お/を)는 독음만으로 문자를 정할 수 없다
const kanaUnique = (c: Card) => cardDecks.kana.filter((k) => script(k) === script(c) && k.back === c.back).length === 1;

const kanaQuestion = (card: Card, rev: boolean): Question | null => {
  const pool = cardDecks.kana.filter((k) => script(k) === script(card));
  const sameRow = (k: Card) => k.id !== card.id && k.tag === card.tag;
  if (rev && kanaUnique(card)) {
    const wrong = pick(pool, 3, (k) => sameRow(k) && k.back !== card.back, (k) => k.front, [card.front]);
    return finish(card, 'kanaRev', card.back, '이 소리에 알맞은 글자를 고르세요', card.front, wrong, true);
  }
  const wrong = pick(pool, 3, (k) => sameRow(k) && k.back !== card.back, (k) => k.back, [card.back]);
  return finish(card, 'kana', card.front, '알맞은 한글 독음을 고르세요', card.back, wrong, false, card.reading);
};

const meaningQuestion = (deck: CardDeckId, card: Card): Question | null => {
  const pool = cardDecks[deck];
  const same = (c: Card) => c.id !== card.id && c.tag === card.tag && !overlaps(c.back, card.back);
  let wrong = pick(pool, 3, same, (c) => c.back, [card.back]);
  if (wrong.length < 3) {
    wrong = wrong.concat(pick(pool, 3 - wrong.length, (c) => c.id !== card.id && !overlaps(c.back, card.back), (c) => c.back, [card.back, ...wrong]));
  }
  return finish(card, 'meaning', card.front, '알맞은 뜻을 고르세요', card.back, wrong, false, card.reading !== card.front ? card.reading : undefined);
};

// 한자가 들어간 단어만: 표기 → 읽기. 같은 읽기가 두 번 나오지 않게(동음이의어) 한다
const readingQuestion = (card: Card): Question | null => {
  if (!hasKanji(card.front) || card.reading === card.front) return null;
  // 같은 표기에 읽기가 둘 이상인 단어(開く あく/ひらく 등)는 문맥 없이는 답이 하나로 정해지지 않는다
  if (cardDecks.words.some((c) => c.id !== card.id && c.front === card.front)) return null;
  const len = card.reading.length;
  const pool = cardDecks.words;
  const near = (c: Card) => c.id !== card.id && c.reading !== card.reading && Math.abs(c.reading.length - len) <= 1 && !hasKanji(c.reading);
  let wrong = pick(pool, 3, (c) => near(c) && c.tag === card.tag, (c) => c.reading, [card.reading]);
  if (wrong.length < 3) wrong = wrong.concat(pick(pool, 3 - wrong.length, near, (c) => c.reading, [card.reading, ...wrong]));
  return finish(card, 'reading', card.front, '알맞은 읽기를 고르세요', card.reading, wrong, true);
};

// 한국어 뜻 → 일본어 표기. 같은 표기(읽기만 다른 단어)나 뜻이 겹치는 카드는 보기에서 뺀다
const ko2jaQuestion = (deck: CardDeckId, card: Card): Question | null => {
  const pool = cardDecks[deck];
  const ok = (c: Card) => c.id !== card.id && c.front !== card.front && !overlaps(c.back, card.back);
  let wrong = pick(pool, 3, (c) => ok(c) && c.tag === card.tag, (c) => c.front, [card.front]);
  if (wrong.length < 3) wrong = wrong.concat(pick(pool, 3 - wrong.length, ok, (c) => c.front, [card.front, ...wrong]));
  return finish(card, 'ko2ja', card.back, '알맞은 일본어를 고르세요', card.front, wrong, true, card.reading !== card.front ? card.reading : undefined);
};

// 데이터에 미리 표시한 blank만 빈칸으로 만든다. 오답은 같은 덱 다른 카드의 blank 값이고, 예문에 이미 있는 글자 조합은 쓰지 않는다
const blankQuestion = (deck: CardDeckId, card: Card): Question | null => {
  const b = card.blank;
  if (!b) return null;
  const first = card.ex.indexOf(b);
  if (first < 0 || card.ex.indexOf(b, first + 1) >= 0) return null;
  const sentence = card.ex.slice(0, first) + BLANK + card.ex.slice(first + b.length);
  const pool = cardDecks[deck];
  // 읽기가 같은 카드(표기만 다른 같은 단어)는 오답으로 쓰지 않는다: 둘 다 정답처럼 보인다
  const ok = (c: Card) => c.id !== card.id && !!c.blank && c.blank !== b && !card.ex.includes(c.blank!) && c.reading !== card.reading && !overlaps(c.back, card.back);
  let wrong = pick(pool, 3, (c) => ok(c) && c.tag === card.tag, (c) => c.blank ?? '', [b]);
  if (wrong.length < 3) wrong = wrong.concat(pick(pool, 3 - wrong.length, ok, (c) => c.blank ?? '', [b, ...wrong]));
  return finish(card, 'blank', sentence, `${card.exKo} — 빈칸에 알맞은 말은?`, b, wrong, true);
};

// 문장 덱: 한국어 → 일본어 문장. 오답은 같은 레벨·문체 문장을 먼저 쓴다
const sentenceQuestion = (card: Card): Question | null => {
  const pool = cardDecks.sentences;
  const ok = (c: Card) => c.id !== card.id && c.back !== card.back && c.front !== card.front;
  let wrong = pick(pool, 3, (c) => ok(c) && c.level === card.level && c.style === card.style, (c) => c.back, [card.back]);
  if (wrong.length < 3) wrong = wrong.concat(pick(pool, 3 - wrong.length, ok, (c) => c.back, [card.back, ...wrong]));
  return finish(card, 'sentence', card.front, '알맞은 일본어 문장을 고르세요', card.back, wrong, true, card.reading);
};

// 카드 하나에 어떤 유형을 낼지는 순서(i)에 따라 돌아가며 정하고, 못 만들면 다음 유형으로 넘어간다
const questionFor = (deck: CardDeckId, card: Card, i: number): Question | null => {
  if (deck === 'kana') return kanaQuestion(card, i % 2 === 1);
  if (deck === 'sentences') return sentenceQuestion(card);
  const order: ((() => Question | null))[] =
    deck === 'words'
      ? [() => meaningQuestion(deck, card), () => blankQuestion(deck, card), () => ko2jaQuestion(deck, card), () => readingQuestion(card)]
      : [() => meaningQuestion(deck, card), () => blankQuestion(deck, card), () => ko2jaQuestion(deck, card)];
  for (let k = 0; k < order.length; k++) {
    const q = order[(i + k) % order.length]();
    if (q) return q;
  }
  return null;
};

export function makeQuiz(deck: CardDeckId, set: number, n = QUIZ_LENGTH): Question[] {
  const cards = shuffle(setCards(deck, set)).slice(0, n);
  const out: Question[] = [];
  cards.forEach((card, i) => {
    const q = questionFor(deck, card, i);
    if (q) out.push(q);
  });
  return out;
}
