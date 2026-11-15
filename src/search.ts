import { Card, CardDeckId, cardDecks } from './data/decks';

export type Hit = { deck: CardDeckId; card: Card };

const DECKS = Object.keys(cardDecks) as CardDeckId[];

export const MAX_HITS = 60;

// 가타카나를 히라가나로 바꾼다 (ァ~ヶ → ぁ~ゖ). 장음 ー는 그대로 둔다
const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));

// 전각/반각을 맞추고(NFKC) 가타카나를 히라가나로, 영문은 소문자로 맞춘다. 공백은 없앤다
export const normalize = (s: string) => toHira(s.normalize('NFKC').toLowerCase()).replace(/\s+/g, '');

type Indexed = { deck: CardDeckId; card: Card; front: string; reading: string; rest: string };
let index: Indexed[] | null = null;

const build = (): Indexed[] => {
  if (!index) {
    index = [];
    for (const deck of DECKS) {
      for (const card of cardDecks[deck]) {
        // 문장 덱은 앞면이 한국어, 일본어 정답은 back에 있다
        const front = deck === 'sentences' ? card.back : card.front;
        index.push({
          deck,
          card,
          front: normalize(front),
          reading: normalize(card.reading),
          rest: normalize([card.back, card.front, card.ex, card.exReading, card.exKo, card.note ?? ''].join('|')),
        });
      }
    }
  }
  return index;
};

// 표기·읽기·한국어 뜻·예문으로 찾는다. 표기나 읽기가 정확히 같거나 앞에서 시작하는 카드를 먼저 보여 준다.
// 히라가나로 검색하면 한자 단어(읽기 일치)도, 가타카나 단어도 나온다
export function searchCards(query: string): Hit[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const first: Hit[] = [];
  const rest: Hit[] = [];
  for (const it of build()) {
    if (it.front === q || it.front.startsWith(q) || it.reading === q || it.reading.startsWith(q)) first.push({ deck: it.deck, card: it.card });
    else if (it.front.includes(q) || it.reading.includes(q) || it.rest.includes(q)) rest.push({ deck: it.deck, card: it.card });
    if (first.length >= MAX_HITS) return first;
  }
  return first.concat(rest).slice(0, MAX_HITS);
}
