// 대화문 JSON 정리: 5번째 칸 제거, 반각 ?! → 전각, 말하는 사람이 私인 4칸 줄 → B(3칸). 사용: node scripts/lib/dlgfix.cjs 파일명
const fs = require('fs');
const p = require('path').join(__dirname, '..', '..', 'src', 'data', 'content', 'json', process.argv[2]);
const fw = (s) => s.replace(/!/g, '！').replace(/\?/g, '？');
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
for (const x of d) {
  x.lines = x.lines.map((l) => {
    if (l.length === 5) l = l.slice(0, 4);
    if (l.length === 4 && l[0] === '私') l = l.slice(1);
    return l.length === 4 ? [l[0], fw(l[1]), fw(l[2]), l[3]] : [fw(l[0]), fw(l[1]), l[2]];
  });
}
fs.writeFileSync(p, '[\n' + d.map((x) => JSON.stringify(x)).join(',\n') + '\n]\n');
