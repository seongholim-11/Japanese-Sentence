// 콘텐츠 자동 검증 (docs/02 4장 ③). 사용: npm run validate [-- --report]
// src/data/content/json/*.json 을 읽어 스키마·중복·문자 종류·읽기·빈칸·길이·금지어를 검사한다.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'data', 'content', 'json');
const load = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
const files = fs.readdirSync(DIR).sort();

const errors = [];
const warnings = [];
const err = (where, id, msg) => errors.push(`[${where}] ${id}: ${msg}`);
const warn = (where, id, msg) => warnings.push(`[${where}] ${id}: ${msg}`);

const HANGUL = /[ㄱ-ㆎ가-힣]/;
const KANA = /[ぁ-ゖァ-ヺーー]/;
const KANJI = /[㐀-鿿々〆]/;
const LATIN = /[A-Za-z]/;
const READING_OK = /^[ぁ-ゖァ-ヺー・、。！？「」〜\s]+$/;
const WORD_TAGS = ['명사', '동사', 'い형용사', 'な형용사', '부사', '조사·접속', '대명사', '수사·조수사', '외래어', '기타', '표현'];
const PATTERN_TAGS = ['문형', '표현'];
const LEVELS = ['N5', 'N4', 'N3'];
const STYLES = ['丁寧', '普通'];

// 연령 등급 설문용 민감어(오류 아님, 목록으로 보고)
const SENSITIVE = ['酒', 'ビール', 'ワイン', 'お酒', 'タバコ', 'たばこ', '煙草', '薬', '銃', '戦争', '殺', '死', '血', '賭', 'ギャンブル', '喫煙', '飲み会', '酔'];
// 금지어(비속어·차별 표현 등) — 발견되면 오류
const BANNED = ['バカ', 'アホ', 'クソ', '死ね', 'ぶっ殺', 'エロ', 'セックス', 'ちんこ', 'まんこ', 'ブス', 'デブ', 'キチガイ', '障害者', 'ガイジン', '外人', 'ハゲ'];
// 실제 상표·고유명(예문에 쓰지 않는다) — 발견되면 오류
const BRANDS = ['マクドナルド', 'マック', 'スターバックス', 'スタバ', 'セブンイレブン', 'ローソン', 'ファミリーマート', 'ユニクロ', 'ソニー', 'トヨタ', 'ホンダ', 'ニンテンドー', '任天堂', 'アップル', 'グーグル', 'アマゾン', 'ツイッター', 'LINE', 'ヤフー', '楽天', 'ディズニー', 'ポケモン', 'ヤクルト', 'ウーバー', 'Suica', 'PASMO'];

// 일본어 문자열 s가 읽기 r과 "가나 부분이 일치"하는지: 한자·숫자 덩어리는 가나 1자 이상으로 대응
function alignReading(s, r) {
  let re = '^';
  let i = 0;
  const chars = Array.from(s);
  while (i < chars.length) {
    const ch = chars[i];
    if (KANJI.test(ch) || /[0-9０-９]/.test(ch)) {
      while (i < chars.length && (KANJI.test(chars[i]) || /[0-9０-９]/.test(chars[i]))) i++;
      re += '[\\u3041-\\u3096\\u30a1-\\u30fa\\u30fc]+?';
    } else {
      re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i++;
    }
  }
  re += '$';
  return new RegExp(re).test(r);
}

const lenJa = (s) => Array.from(s).length;

function checkText(where, id, label, s, { ja = false, ko = false } = {}) {
  if (typeof s !== 'string' || s.trim() === '') return err(where, id, `${label} 비어 있음`);
  if (s !== s.normalize('NFC')) err(where, id, `${label} NFC 정규화 아님`);
  if (s !== s.trim()) err(where, id, `${label} 앞뒤 공백`);
  if (/[\u0000-\u001f　]/.test(s)) err(where, id, `${label} 제어문자/전각 공백`);
  if (ja) {
    if (HANGUL.test(s)) err(where, id, `${label} 일본어 필드에 한글: ${s}`);
    if (LATIN.test(s)) err(where, id, `${label} 일본어 필드에 영문: ${s}`);
    if (/[.,!?]/.test(s)) warn(where, id, `${label} 반각 문장부호 (전각 사용 권장): ${s}`);
    for (const w of BANNED) if (s.includes(w)) err(where, id, `${label} 금지어 '${w}'`);
    for (const w of BRANDS) if (s.includes(w)) err(where, id, `${label} 상표/고유명 '${w}'`);
  }
  if (ko) {
    if (LATIN.test(s)) err(where, id, `${label} 한국어 필드에 영문: ${s}`);
    if (KANJI.test(s.replace(/[〜]/g, ''))) warn(where, id, `${label} 한국어 필드에 한자: ${s}`);
    if (/[ぁ-ゖァ-ヺ]/.test(s)) warn(where, id, `${label} 한국어 필드에 가나: ${s}`);
  }
}

const sensitiveHits = [];
const scanSensitive = (where, id, s) => {
  for (const w of SENSITIVE) if (s.includes(w)) sensitiveHits.push(`${where} ${id}: '${w}'`);
};

const stats = { kana: 0, words: 0, patterns: 0, sentences: 0, dialogues: 0 };
const wordIds = new Set();
const wordKeys = new Set();
const exampleSet = new Map();
const deckFronts = new Set();

function checkExample(where, id, ex, exReading, exKo, blank) {
  checkText(where, id, 'ex', ex, { ja: true });
  checkText(where, id, 'exReading', exReading, { ja: true });
  checkText(where, id, 'exKo', exKo, { ko: true });
  if (typeof ex === 'string' && typeof exReading === 'string') {
    if (!READING_OK.test(exReading)) err(where, id, `exReading에 한자/기호 섞임: ${exReading}`);
    else if (!alignReading(ex, exReading)) err(where, id, `ex와 exReading의 가나 부분 불일치: ${ex} / ${exReading}`);
    const n = lenJa(ex);
    if (n < 5 || n > 40) warn(where, id, `예문 길이 ${n}자: ${ex}`);
    if (exampleSet.has(ex)) err(where, id, `예문 중복 (${exampleSet.get(ex)}): ${ex}`);
    exampleSet.set(ex, id);
    scanSensitive(where, id, ex);
  }
  if (blank) {
    const first = ex.indexOf(blank);
    if (first < 0) err(where, id, `blank '${blank}' 가 예문에 없음`);
    else if (ex.indexOf(blank, first + 1) >= 0) err(where, id, `blank '${blank}' 가 예문에 2번 이상 나옴`);
  }
}

for (const f of files) {
  const data = load(f);
  if (f.startsWith('kana')) {
    for (const r of data) {
      stats.kana++;
      const [ch, rom, tag, han, ex, exR, exKo, note] = r;
      if (r.length !== 8) err('kana', ch, `필드 수 ${r.length} (8개여야 함)`);
      if (wordIds.has('kana:' + ch)) err('kana', ch, '중복');
      wordIds.add('kana:' + ch);
      checkText('kana', ch, 'front', ch, { ja: true });
      checkText('kana', ch, 'ex', ex, { ja: true });
      checkText('kana', ch, 'exKo', exKo, { ko: true });
      if (typeof ch === 'string' && (ch.length < 1 || ch.length > 2 || !KANA.test(ch))) err('kana', ch, '문자 형식');
      if (!/^[a-z]+$/.test(rom)) err('kana', ch, `로마자 형식: ${rom}`);
      if (!HANGUL.test(han)) err('kana', ch, `한글 독음 아님: ${han}`);
      if (!exR || !READING_OK.test(exR)) err('kana', ch, `예 단어 읽기 형식: ${exR}`);
      if (ex !== exR) err('kana', ch, `예 단어와 읽기가 다름: ${ex} / ${exR}`);
      if (!/(히라가나|가타카나)·(청음|탁음|반탁음|요음)/.test(tag)) err('kana', ch, `분류 값: ${tag}`);
      if (!exKo) err('kana', ch, '예 단어 뜻 없음');
    }
  } else if (f.startsWith('words')) {
    if (!LEVELS.includes(data.level)) err(f, '-', `level ${data.level}`);
    for (const r of data.rows) {
      stats.words++;
      const [front, reading, tag, back, ex, exReading, exKo, blank, style] = r;
      const id = `${front}#${reading}`;
      const where = f;
      if (r.length < 7 || r.length > 9) err(where, id, `필드 수 ${r.length}`);
      checkText(where, id, 'front', front, { ja: true });
      checkText(where, id, 'reading', reading, { ja: true });
      checkText(where, id, 'back', back, { ko: true });
      if (!WORD_TAGS.includes(tag)) err(where, id, `tag '${tag}'`);
      if (style && !STYLES.includes(style)) err(where, id, `style '${style}'`);
      if (wordIds.has(id)) err(where, id, 'id 중복');
      wordIds.add(id);
      if (typeof reading === 'string' && !READING_OK.test(reading)) err(where, id, `reading에 가나 아닌 문자: ${reading}`);
      else if (typeof front === 'string' && typeof reading === 'string' && !alignReading(front, reading)) err(where, id, `표기와 읽기 불일치: ${front} / ${reading}`);
      if (!KANJI.test(front) && front !== reading) warn(where, id, `가나 표기인데 읽기가 다름: ${front} / ${reading}`);
      checkExample(where, id, ex, exReading, exKo, blank);
      if (typeof ex === 'string' && typeof front === 'string' && blank === undefined) warn(where, id, 'blank 없음 (빈칸 문제 제외)');
    }
  } else if (f.startsWith('patterns')) {
    for (const r of data) {
      stats.patterns++;
      const [front, tag, back, note, ex, exReading, exKo, level, blank, style] = r;
      const id = front;
      const where = f;
      if (r.length < 8 || r.length > 10) err(where, id, `필드 수 ${r.length}`);
      checkText(where, id, 'front', front, { ja: true });
      checkText(where, id, 'back', back, { ko: true });
      checkText(where, id, 'note', note, {});
      if (!PATTERN_TAGS.includes(tag)) err(where, id, `tag '${tag}'`);
      if (!LEVELS.includes(level)) err(where, id, `level '${level}'`);
      if (style && !STYLES.includes(style)) err(where, id, `style '${style}'`);
      if (deckFronts.has('p:' + front)) err(where, id, 'id 중복');
      deckFronts.add('p:' + front);
      checkExample(where, id, ex, exReading, exKo, blank);
    }
  } else if (f.startsWith('sentences')) {
    for (const r of data) {
      stats.sentences++;
      const [ko, ja, reading, note, level, style] = r;
      const id = ja;
      const where = f;
      if (r.length < 5 || r.length > 6) err(where, id, `필드 수 ${r.length}`);
      checkText(where, id, 'front(ko)', ko, {});
      if (typeof ko === 'string' && !HANGUL.test(ko)) err(where, id, `front에 한글 없음: ${ko}`);
      checkText(where, id, 'ja', ja, { ja: true });
      checkText(where, id, 'reading', reading, { ja: true });
      checkText(where, id, 'note', note, {});
      if (!LEVELS.includes(level)) err(where, id, `level '${level}'`);
      if (style && !STYLES.includes(style)) err(where, id, `style '${style}'`);
      if (deckFronts.has('s:' + ja)) err(where, id, 'ja 중복');
      if (deckFronts.has('k:' + ko)) err(where, id, `같은 한국어 문장이 이미 있음(퀴즈 복수 정답): ${ko}`);
      deckFronts.add('k:' + ko);
      deckFronts.add('s:' + ja);
      if (typeof reading === 'string' && !READING_OK.test(reading)) err(where, id, `reading에 가나 아닌 문자: ${reading}`);
      else if (!alignReading(ja, reading)) err(where, id, `ja와 reading의 가나 부분 불일치: ${ja} / ${reading}`);
      const n = lenJa(ja);
      if (n < 4 || n > 40) warn(where, id, `문장 길이 ${n}자`);
      scanSensitive(where, id, ja);
    }
  }
}

// 대화문
const glossary = Object.assign({}, ...files.filter((x) => x.startsWith('glossary')).map(load));
const patternFronts = new Set();
const wordFronts = new Set();
for (const f of files) {
  if (f.startsWith('patterns')) for (const r of load(f)) patternFronts.add(r[0]);
  if (f.startsWith('words')) for (const r of load(f).rows) wordFronts.add(r[0]);
}
const dialogueIds = new Set();
for (const f of files.filter((x) => x.startsWith('dialogues'))) {
  for (const d of load(f)) {
    stats.dialogues++;
    const where = f;
    const id = d.id;
    if (dialogueIds.has(id)) err(where, id, 'id 중복');
    dialogueIds.add(id);
    checkText(where, id, 'title', d.title, {});
    if (!Array.isArray(d.lines) || d.lines.length !== 6) err(where, id, `줄 수 ${d.lines && d.lines.length} (6이어야 함)`);
    if (!Array.isArray(d.expressions) || d.expressions.length < 2 || d.expressions.length > 4) err(where, id, `expressions ${d.expressions && d.expressions.length}개 (2~4)`);
    for (const e of d.expressions || []) {
      if (!patternFronts.has(e) && !wordFronts.has(e) && !glossary[e]) err(where, id, `표현 '${e}' 설명 없음 (덱·용어집에 추가)`);
    }
    (d.lines || []).forEach((l, i) => {
      const isA = l.length === 4;
      if (l.length !== 3 && l.length !== 4) err(where, id, `줄 ${i + 1}은 A [말하는 사람, 일본어, 읽기, 한국어] 4칸 또는 B [일본어, 읽기, 한국어] 3칸`);
      if (i > 0 && (d.lines[i - 1].length === 4) === isA) err(where, id, `줄 ${i + 1}: A/B가 번갈아 나오지 않음`);
      if (isA && l[0] === '私') err(where, id, `줄 ${i + 1}: A 줄의 speaker가 私 (B 3칸으로 쓸 것)`);
      const [ja, rd, ko] = isA ? [l[1], l[2], l[3]] : [l[0], l[1], l[2]];
      checkText(where, id + '#' + (i + 1), 'ja', ja, { ja: true });
      checkText(where, id + '#' + (i + 1), 'reading', rd, { ja: true });
      checkText(where, id + '#' + (i + 1), 'ko', ko, { ko: true });
      if (typeof rd === 'string' && !READING_OK.test(rd)) err(where, id + '#' + (i + 1), `reading에 가나 아닌 문자: ${rd}`);
      else if (typeof ja === 'string' && typeof rd === 'string' && !alignReading(ja, rd)) err(where, id + '#' + (i + 1), `ja와 reading 불일치: ${ja} / ${rd}`);
      if (typeof ja === 'string' && lenJa(ja) > 40) warn(where, id + '#' + (i + 1), `한 줄 ${lenJa(ja)}자 (40자 이하 권장)`);
      if (typeof ja === 'string') scanSensitive(where, id + '#' + (i + 1), ja);
    });
  }
}
// 용어집 검증
for (const [k, v] of Object.entries(glossary)) {
  if (!Array.isArray(v) || v.length !== 5) { err('glossary', k, '5칸 [읽기, 뜻, 예문, 예문 읽기, 예문 뜻]'); continue; }
  checkText('glossary', k, 'term', k, { ja: true });
  const [rd, meaning, ex, exR, exKo] = v;
  if (!READING_OK.test(rd) || !alignReading(k, rd)) err('glossary', k, `읽기 불일치: ${rd}`);
  checkText('glossary', k, 'meaning', meaning, { ko: true });
  if (!READING_OK.test(exR) || !alignReading(ex, exR)) err('glossary', k, `예문 읽기 불일치: ${ex} / ${exR}`);
  checkText('glossary', k, 'ex', ex, { ja: true });
  checkText('glossary', k, 'exKo', exKo, { ko: true });
}

console.log('개수:', JSON.stringify(stats));
if (process.argv.includes('--sensitive') && sensitiveHits.length) console.log('민감어(연령 등급 설문용):\n  ' + sensitiveHits.join('\n  '));
else console.log(`민감어 후보 ${sensitiveHits.length}건 (--sensitive 로 목록 보기)`);
const showWarn = process.argv.includes('--warnings');
console.log(`경고 ${warnings.length}건${showWarn ? '' : ' (--warnings 로 목록 보기)'}`);
if (showWarn) console.log(warnings.join('\n'));
if (errors.length) {
  console.log(`\n오류 ${errors.length}건:\n` + errors.slice(0, 200).join('\n'));
  if (errors.length > 200) console.log(`... 외 ${errors.length - 200}건`);
  process.exit(1);
}
console.log('오류 0건 ✓');
