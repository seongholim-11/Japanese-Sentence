// 새 단어 파일에서 이미 있는 id(표기#읽기)나 예문과 겹치는 행을 지운다. 사용: node scripts/lib/dedupe.cjs words-n4-02.json
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '..', 'src', 'data', 'content', 'json');
const target = process.argv[2];
const ids = new Set();
const exs = new Set();
const add = (r) => { ids.add(`${r[0]}#${r[1]}`); exs.add(r[4]); };
for (const f of fs.readdirSync(DIR).sort()) {
  if (f === target) continue;
  if (f.startsWith('words')) for (const r of JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')).rows) add(r);
  if (f.startsWith('patterns')) for (const r of JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))) exs.add(r[4]);
}
const d = JSON.parse(fs.readFileSync(path.join(DIR, target), 'utf8'));
const dropped = [];
d.rows = d.rows.filter((r) => {
  const id = `${r[0]}#${r[1]}`;
  if (ids.has(id) || exs.has(r[4])) { dropped.push(r[0]); return false; }
  ids.add(id); exs.add(r[4]); return true;
});
fs.writeFileSync(path.join(DIR, target), '{"level":' + JSON.stringify(d.level) + ',"rows":[\n' + d.rows.map((r) => JSON.stringify(r)).join(',\n') + '\n]}\n');
console.log(`유지 ${d.rows.length}, 삭제 ${dropped.length}: ${dropped.join(' ')}`);
