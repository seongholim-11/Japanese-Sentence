import type { Level } from '../decks';
import p1 from './json/patterns-01.json';
import p2 from './json/patterns-02.json';

// [문형, 분류, 뜻, 접속 메모, 예문, 예문 읽기, 예문 뜻, 레벨, 빈칸, 문체]
export type PatternRow = [string, string, string, string, string, string, string, Level, string?, string?];

export const patternRows = [...p1, ...p2] as unknown as PatternRow[];
