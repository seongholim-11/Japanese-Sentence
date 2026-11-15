// 콘텐츠 JSON에서 특정 행의 예문 3칸(예문, 읽기, 한국어)을 바꾼다. 사용: node scripts/lib/rowfix.cjs 파일 <<< JSON [[표기, 새 예문, 새 읽기, 새 해석, (새 blank)]...]
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'src', 'data', 'content', 'json', process.argv[2]);
const fixes = JSON.parse(fs.readFileSync(0, 'utf8'));
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = Array.isArray(data) ? data : data.rows;
for (const [front, ex, er, ko, blank] of fixes) {
  const r = rows.find((x) => x[0] === front);
  if (!r) { console.log('없음:', front); continue; }
  const isPattern = Array.isArray(data);
  const i = isPattern ? 4 : 4;
  r[i] = ex; r[i + 1] = er; r[i + 2] = ko;
  if (blank !== undefined) r[isPattern ? 8 : 7] = blank;
}
const out = Array.isArray(data) ? '[\n' + rows.map((r) => JSON.stringify(r)).join(',\n') + '\n]\n' : '{"level":' + JSON.stringify(data.level) + ',"rows":[\n' + rows.map((r) => JSON.stringify(r)).join(',\n') + '\n]}\n';
fs.writeFileSync(file, out);
