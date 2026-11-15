// 읽기 자동 대조 (docs/02 4장 ④): kuromoji 로 표기의 읽기를 만들어 데이터의 reading/exReading 과 비교한다.
// 다의 읽기·숫자·고유 읽기 때문에 정상적인 불일치가 있다. 목록은 사람이 확인한다.
// 사용: node scripts/check-readings.cjs [파일 접두어(words-n5 등)] [--out reports/reading-mismatch-xxx.md]
const fs = require('fs');
const path = require('path');
const kuromoji = require('kuromoji');

const DIR = path.join(__dirname, '..', 'src', 'data', 'content', 'json');
const prefix = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '';
const outIdx = process.argv.indexOf('--out');
const outFile = outIdx > 0 ? process.argv[outIdx + 1] : null;

const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
// 장음·표기 차이를 줄여 비교: 가타카나→히라가나, 長音 ー 은 앞 모음으로 풀지 않고 제거, 문장부호·공백 제거
const norm = (s) => toHira(s).replace(/[ー・、。！？「」〜\s]/g, '');

const items = [];
for (const f of fs.readdirSync(DIR).sort()) {
  if (prefix && !f.startsWith(prefix)) continue;
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (f.startsWith('words')) for (const r of data.rows) { items.push([f, r[0], 'reading', r[0], r[1]]); items.push([f, r[0], 'exReading', r[4], r[5]]); }
  else if (f.startsWith('patterns')) for (const r of data) items.push([f, r[0], 'exReading', r[4], r[5]]);
  else if (f.startsWith('sentences')) for (const r of data) items.push([f, r[1], 'reading', r[1], r[2]]);
  else if (f.startsWith('dialogues')) for (const d of data) d.lines.forEach((l, i) => { const a = l.length === 4; items.push([f, `${d.id}#${i + 1}`, 'reading', a ? l[1] : l[0], a ? l[2] : l[1]]); });
  else if (f.startsWith('glossary')) for (const [k, v] of Object.entries(data)) { items.push([f, k, 'reading', k, v[0]]); items.push([f, k, 'exReading', v[2], v[3]]); }
}

kuromoji.builder({ dicPath: path.join(__dirname, '..', 'node_modules', 'kuromoji', 'dict') }).build((err, tk) => {
  if (err) throw err;
  const mism = [];
  for (const [f, id, kind, text, given] of items) {
    const guess = tk.tokenize(text).map((t) => t.reading || t.surface_form).join('');
    // 숫자 등 사전에 읽기가 없는 토큰이 있으면 비교하지 않는다
    if (/[0-9０-９]/.test(text)) continue;
    if (norm(guess) !== norm(given)) mism.push({ f, id, kind, text, given, guess: toHira(guess) });
  }
  const lines = [`# 읽기 자동 대조 결과 (${prefix || '전체'})`, '', `검사 ${items.length}건 중 불일치 ${mism.length}건. kuromoji(IPADIC) 기준이라 다의 읽기·고유 읽기는 정상 불일치일 수 있다.`, '', '| 파일 | id | 필드 | 문자열 | 데이터의 읽기 | kuromoji 읽기 |', '|---|---|---|---|---|---|'];
  for (const m of mism) lines.push(`| ${m.f} | ${m.id} | ${m.kind} | ${m.text} | ${m.given} | ${m.guess} |`);
  const text = lines.join('\n') + '\n';
  if (outFile) fs.writeFileSync(path.join(__dirname, '..', outFile), text);
  console.log(`검사 ${items.length}건, 불일치 ${mism.length}건` + (outFile ? ` → ${outFile}` : ''));
  if (!outFile) console.log(text);
});
