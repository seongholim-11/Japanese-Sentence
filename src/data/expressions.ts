import { cardDecks } from './decks';
import glossaryJson from './content/json/glossary.json';
import glossaryJson2 from './content/json/glossary-02.json';
import glossaryJson3 from './content/json/glossary-03.json';

export type ExpressionInfo = {
  term: string;
  reading: string;
  meaning: string;
  ex: string;
  exReading: string;
  exKo: string;
};

// 단어·문형 덱에 없는 대화문 표현: 표현 → [읽기, 뜻, 예문, 예문 읽기, 예문 뜻]
// 덱에 있는 표현은 그 카드의 뜻과 예문을 그대로 쓴다 (explainExpression 참고)
const glossary = { ...glossaryJson, ...glossaryJson2, ...glossaryJson3 } as unknown as Record<string, [string, string, string, string, string]>;

export const glossaryEntries = glossary;

let cardIndex: Map<string, ExpressionInfo> | null = null;

// 단어·문형 덱의 카드를 표기(앞면) 기준으로 찾을 수 있게 한 번만 만든다
function cards() {
  if (!cardIndex) {
    cardIndex = new Map();
    for (const deck of ['patterns', 'words'] as const) {
      for (const c of cardDecks[deck]) {
        if (!cardIndex.has(c.front)) {
          cardIndex.set(c.front, { term: c.front, reading: c.reading, meaning: c.back, ex: c.ex, exReading: c.exReading, exKo: c.exKo });
        }
      }
    }
  }
  return cardIndex;
}

// 대화문의 표현 하나에 대한 뜻과 예문. 못 찾으면 null
export function explainExpression(expression: string): ExpressionInfo | null {
  const key = expression.trim();
  const g = glossary[key];
  if (g) return { term: expression, reading: g[0], meaning: g[1], ex: g[2], exReading: g[3], exKo: g[4] };
  return cards().get(key) ?? null;
}
