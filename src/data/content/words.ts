import type { Level } from '../decks';
import n501 from './json/words-n5-01.json';
import n502 from './json/words-n5-02.json';
import n503 from './json/words-n5-03.json';
import n504 from './json/words-n5-04.json';
import n505 from './json/words-n5-05.json';
import n506 from './json/words-n5-06.json';
import n401 from './json/words-n4-01.json';

import w_n4_02 from './json/words-n4-02.json';

import w_n4_03 from './json/words-n4-03.json';

import w_n4_04 from './json/words-n4-04.json';

import w_n4_05 from './json/words-n4-05.json';

import w_n3_01 from './json/words-n3-01.json';

import w_n3_02 from './json/words-n3-02.json';

import w_n3_03 from './json/words-n3-03.json';

import w_n3_04 from './json/words-n3-04.json';

import w_n3_05 from './json/words-n3-05.json';

import w_n4_06 from './json/words-n4-06.json';

import w_n4_07 from './json/words-n4-07.json';

import w_n3_06 from './json/words-n3-06.json';

import w_n3_07 from './json/words-n3-07.json';

import w_n3_08 from './json/words-n3-08.json';

import w_n5_07 from './json/words-n5-07.json';

import w_n4_08 from './json/words-n4-08.json';

import w_n3_09 from './json/words-n3-09.json';

import w_n5_08 from './json/words-n5-08.json';

// 행: [표기, 읽기, 품사, 뜻, 예문, 예문 읽기, 예문 뜻, 빈칸, 문체]
export type WordRow = [string, string, string, string, string, string, string, string?, string?];
export type WordFile = { level: Level; rows: WordRow[] };

// 파일을 추가하면 여기 목록에 이어 붙인다 (순서가 곧 카드 순서)
export const wordFiles = [n501, n502, n503, n504, n505, n506, n401, w_n4_02, w_n4_03, w_n4_04, w_n4_05, w_n3_01, w_n3_02, w_n3_03, w_n3_04, w_n3_05, w_n4_06, w_n4_07, w_n3_06, w_n3_07, w_n3_08, w_n5_07, w_n4_08, w_n3_09, w_n5_08] as unknown as WordFile[];
