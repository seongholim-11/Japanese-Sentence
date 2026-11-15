// words.ts 에 새 단어 파일을 등록한다. 사용: node scripts/lib/addword.cjs words-n4-02.json
const fs = require('fs');
const path = require('path');
const f = process.argv[2];
const name = 'w_' + f.replace(/^words-/, '').replace(/\.json$/, '').replace(/-/g, '_');
const p = path.join(__dirname, '..', '..', 'src', 'data', 'content', 'words.ts');
let t = fs.readFileSync(p, 'utf8');
if (t.includes(`./json/${f}`)) process.exit(0);
t = t.replace("\n// 행:", `\nimport ${name} from './json/${f}';\n\n// 행:`);
t = t.replace(/export const wordFiles = \[(.*)\] as unknown as WordFile\[\];/, (m, a) => `export const wordFiles = [${a}, ${name}] as unknown as WordFile[];`);
fs.writeFileSync(p, t);
