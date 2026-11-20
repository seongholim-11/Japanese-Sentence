// 음성 점검: 앱이 읽는 모든 문구 → manifest·파일 존재, 빈 파일·고아 파일, 용량. 사용: node scripts/check-audio.cjs
// 앱이 읽는 문구는 src/data/decks.ts 의 speakText·speakExample, DialogueScreen(줄의 ja), expressions(표현·예문) 규칙을 따른다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load } = require('./lib/ts-loader.cjs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'audio');
const { cardDecks, speakText, speakExample } = load('src/data/decks.ts');
const { dialogues } = load('src/data/dialogues.ts');
const { explainExpression } = load('src/data/expressions.ts');

// 읽을 문구 모으기 (voice|text)
const need = new Map();
const add = (voice, text, kind) => text && need.set(`${voice}|${text}`, kind);
for (const [deck, cards] of Object.entries(cardDecks)) {
  for (const c of cards) {
    add('main', speakText(deck, c), deck);
    if (deck !== 'sentences') add('main', speakExample(c), deck + '-example');
  }
}
for (const d of dialogues) for (const l of d.lines) add(l.who === 'A' ? 'main' : 'alt', l.ja, 'dialogue');
for (const d of dialogues) {
  for (const e of d.expressions) {
    const info = explainExpression(e);
    if (!info) { console.log(`설명 없는 표현: ${d.id}/${e}`); continue; }
    add('main', info.term, 'expression');
    add('main', info.ex, 'expression-example');
  }
}

add('main', '今日もよろしくお願いします。', 'settings'); // 생성기가 설정 샘플로 함께 만드는 문구

const indexFile = path.join(OUT, 'index.json');
if (!fs.existsSync(indexFile)) {
  console.log(`음성 파일이 아직 없습니다. 읽을 문구 ${need.size}개 (npm run audio 로 생성).`);
  process.exit(2);
}
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
let missing = 0, empty = 0, bytes = 0;
const used = new Set();
for (const [key, kind] of need) {
  const f = index.files[key];
  if (!f || !fs.existsSync(path.join(OUT, f))) { missing++; if (missing <= 15) console.log(`누락: ${key} (${kind})`); continue; }
  const st = fs.statSync(path.join(OUT, f));
  if (st.size < 500) { empty++; console.log(`빈 파일: ${f} ${key}`); }
  // 한두 글자 문구는 합성이 가끔 거의 빈 소리(1KB 안팎)로 나온다. 정상은 3KB 안팎이라 2.5KB 미만이면 다시 만든다 (npm run audio -- --redo-short)
  else if ([...key.split('|').slice(1).join('|')].length <= 3 && st.size < 2500) { empty++; console.log(`너무 짧은 소리: ${f} ${key} ${st.size}B`); }
  used.add(f);
}
const onDisk = fs.readdirSync(OUT).filter((f) => f.endsWith('.mp3'));
const orphan = onDisk.filter((f) => !used.has(f));
for (const f of onDisk) bytes += fs.statSync(path.join(OUT, f)).size;
// manifest 일치: manifest.ts 의 voice → 문구 → 파일을 읽어 필요한 문구와 전수 비교한다
const manifest = fs.readFileSync(path.join(ROOT, 'src', 'audio', 'manifest.ts'), 'utf8');
const inMan = new Map();
let pathBad = 0;
let voice = null;
for (const line of manifest.split(String.fromCharCode(10))) {
  const v = line.match(/^  (main|alt): [{]/);
  if (v) { voice = v[1]; continue; }
  const m = line.match(/^ {4}(".*"): require[(]'([^']+[.]mp3)'[)],$/);
  if (m && voice) {
    const full = path.resolve(ROOT, 'src', 'audio', m[2]);
    // 경로가 assets/audio 안의 실제 파일을 가리켜야 한다
    if (path.dirname(full) !== OUT || !fs.existsSync(full)) pathBad++;
    inMan.set(voice + '|' + JSON.parse(m[1]), path.basename(full));
  }
}
let manMissing = 0, manWrong = 0;
for (const key of need.keys()) {
  if (!inMan.has(key)) { manMissing++; if (manMissing <= 10) console.log('manifest 누락: ' + key); }
  else if (index.files[key] !== inMan.get(key)) manWrong++;
}
const inManifest = inMan.size;
// 파일 이름 규칙(키 해시)이 index 와 맞는지 전수 확인
let hashBad = 0;
for (const [key, f] of Object.entries(index.files)) {
  const h = crypto.createHash('sha1').update(key).digest('hex').slice(0, 12) + '.mp3';
  if (h !== f) hashBad++;
}
console.log(`읽을 문구 ${need.size}개 / 누락 ${missing} / 빈 파일 ${empty} / 고아 파일 ${orphan.length} / manifest ${inManifest}개(누락 ${manMissing}, 파일 불일치 ${manWrong}) / 용량 ${(bytes / 1048576).toFixed(1)}MB / 해시 불일치 ${hashBad} / manifest 경로 오류 ${pathBad}`);
if (orphan.length) console.log('고아 예: ' + orphan.slice(0, 5).join(', '));
process.exit(missing || empty || hashBad || manMissing || manWrong || pathBad ? 1 : 0);
