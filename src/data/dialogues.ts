import dialogues1 from './content/json/dialogues-01.json';
import dialogues2 from './content/json/dialogues-02.json';
import dialogues3 from './content/json/dialogues-03.json';
import dialogues4 from './content/json/dialogues-04.json';

export type Line = {
  who: 'A' | 'B';
  speaker: string;
  ja: string;
  reading: string;
  ko: string;
};

export type Dialogue = {
  id: string;
  title: string;
  // 이 대화에서 배울 표현. 단어·문형 덱에 있거나 용어집(expressions.ts)에 설명이 있다
  expressions: string[];
  lines: Line[];
};

// JSON 줄 형식: A(상대)는 [말하는 사람, 일본어, 읽기, 한국어], B(나, 학습자)는 [일본어, 읽기, 한국어]. 칸 수로 구분하므로 B가 먼저 말하는 대화도 쓸 수 있다
type RawLine = [string, string, string, string] | [string, string, string];
type RawDialogue = { id: string; title: string; expressions: string[]; lines: RawLine[] };

const build = (d: RawDialogue): Dialogue => ({
  id: d.id,
  title: d.title,
  expressions: d.expressions,
  lines: d.lines.map((l): Line =>
    l.length === 4 ? { who: 'A', speaker: l[0], ja: l[1], reading: l[2], ko: l[3] } : { who: 'B', speaker: '私', ja: l[0], reading: l[1], ko: l[2] },
  ),
});

// 파일을 추가하면 여기 목록에 이어 붙인다
const files = [dialogues1, dialogues2, dialogues3, dialogues4] as unknown as RawDialogue[][];

export const dialogues: Dialogue[] = files.flat().map(build);
