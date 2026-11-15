import type { Level } from '../decks';
import s1 from './json/sentences-01.json';
import s2 from './json/sentences-02.json';
import s3 from './json/sentences-03.json';
import s4 from './json/sentences-04.json';

// [한국어, 일본어, 읽기, 메모, 레벨, 문체]
export type SentenceRow = [string, string, string, string, Level, string?];

// 파일을 추가하면 여기 목록에 이어 붙인다 (순서가 곧 카드 순서)
export const sentenceRows = [...s1, ...s2, ...s3, ...s4] as unknown as SentenceRow[];
