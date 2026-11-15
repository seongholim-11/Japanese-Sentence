// 스토어 문구 글자 수와 카드 수 일치를 점검한다. 사용: node scripts/check-store.cjs
const fs = require('fs');
const { load } = require('./lib/ts-loader.cjs');
const t = fs.readFileSync('docs/store-listing.md', 'utf8');
const len = (s) => [...s].length;
const get = (re) => (t.match(re) || [])[1] || '';
const name = get(/\| 앱 이름 \(30자 이하\) \| (.+?) \|/);
const sub = get(/\| 부제 \(30자 이하\) \| (.+?) \|/);
const promo = get(/## 프로모션 텍스트 \(170자 이하\)\n\n([\s\S]+?)\n\n/);
const kw = get(/## 키워드 \(100자 이하[^\n]*\n\n(.+?)\n/);
const desc = get(/## 설명 \(4,000자 이하\)\n\n([\s\S]+?)\n\n## 이 버전/);
const rows = [['이름', name, 30], ['부제', sub, 30], ['프로모션', promo, 170], ['키워드', kw, 100], ['설명', desc, 4000]];
let bad = 0;
for (const [k, v, max] of rows) {
  const n = len(v);
  console.log(`${k}: ${n}/${max}${n > max || n === 0 ? '  ✗' : ''}`);
  if (n > max || n === 0) bad++;
}
const d = load('src/data/decks.ts').cardDecks;
const dl = load('src/data/dialogues.ts').dialogues;
const fmt = (n) => n.toLocaleString('en-US');
const must = [`가나 ${d.kana.length}장`, `단어 ${fmt(d.words.length)}장`, `문형·표현 ${d.patterns.length}장`, `문장 ${d.sentences.length}장`, `대화문 ${dl.length}편`];
for (const m of must) if (!desc.includes(m)) { console.log(`설명의 수량이 데이터와 다름: ${m} 없음 ✗`); bad++; }
if (!bad) console.log('스토어 문구 점검 통과 ✓');
process.exit(bad ? 1 : 0);
