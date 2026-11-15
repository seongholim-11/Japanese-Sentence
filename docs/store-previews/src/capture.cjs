// 앱 화면 캡처(1320x2868): 예시 학습 기록을 localStorage에 넣고 Chrome 헤드리스(CDP)로 각 화면을 찍는다.
// 사용: (다른 터미널에서 npx expo start --web --port 8099) 후 node docs/store-previews/src/capture.cjs
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { load } = require('../../../scripts/lib/ts-loader.cjs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(__dirname, '..', 'screens');
fs.mkdirSync(OUT, { recursive: true });
const URL_ = 'http://localhost:8099';

// ---- 예시 진행 상태
const { cardDecks } = load('src/data/decks.ts');
const { dialogues } = load('src/data/dialogues.ts');
const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const mastered = { kana: cardDecks.kana.slice(0, 46).map((c) => c.id), words: cardDecks.words.slice(0, 31).map((c) => c.id), patterns: cardDecks.patterns.slice(0, 12).map((c) => c.id), sentences: cardDecks.sentences.slice(0, 9).map((c) => c.id) };
const cards = {};
for (const [deck, ids] of Object.entries(mastered)) ids.forEach((id, i) => { cards[`${deck}:${id}`] = { box: 1 + (i % 4), due: i % 3 === 0 ? day(0) : day(-3) }; });
const history = {}; [12, 30, 25, 41, 18, 33, 22].forEach((n, i) => (history[day(6 - i)] = n));
const progress = {
  sets: {}, mastered, dialogue: { round: 1, pos: 4, done: [0, 1, 2, 3] }, cards, quiz: { 'kana:0': { best: 9, total: 10 } },
  lastDeck: 'words', lastSet: null, today: { date: day(0), count: 22 }, history, goal: 30,
  prefs: { speechRate: 0.9, autoSpeak: false, reminder: { on: false, hour: 20, minute: 0 }, theme: 'light', fontScale: 1, setSize: 50, reading: 'always' },
  favorites: [], streak: 7, lastStudyDate: day(0), studyDays: 24,
};

// ---- CDP
const port = 9333;
const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', '--no-first-run', '--user-data-dir=' + path.join(require('os').tmpdir(), 'cap-profile-' + Date.now()), 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  let tabs;
  for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(500); } }
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 440, height: 956, deviceScaleFactor: 3, mobile: true });
  await send('Page.navigate', { url: URL_ });
  await sleep(8000);
  await ev(`localStorage.setItem('lingoloop-ja/progress/v1', ${JSON.stringify(JSON.stringify(progress))}); 1`);
  await send('Page.navigate', { url: URL_ });
  await sleep(9000);
  const shot = async (name) => {
    await sleep(900);
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.result.data, 'base64'));
    console.log('캡처', name);
  };
  // 텍스트가 포함된 클릭 가능한 요소를 찾아 누른다
  const click = async (text, nth = 0) => {
    const ok = await ev(`(() => { const els = [...document.querySelectorAll('[role=button],[role=tab],[role=radio],[tabindex="0"]')].filter(e => (e.getAttribute('aria-label')||e.innerText||'').includes(${JSON.stringify(text)})); const e = els[${nth}]; if (!e) return false; e.click(); return true; })()`);
    if (!ok) console.log('못 찾음:', text);
    await sleep(1200);
  };
  await shot('01-home');
  await click('덱'); await shot('02-decks');
  // 단어 덱 → 1세트 암기 → 카드 펼치기
  await click('단어'); await sleep(500);
  await click('암기'); await sleep(800);
  // 카드 탭해서 뜻 보기
  await click('뜻 보기'); await shot('03-study');
  await click('뒤로'); await sleep(500);
  await click('퀴즈'); await shot('04-quiz');
  await send('Page.navigate', { url: URL_ }); await sleep(8000);
  await click('대화문 복습'); await sleep(800); await click('일본어 문장 · 탭해서 보기'); await shot('05-dialogue');
  await send('Page.navigate', { url: URL_ }); await sleep(8000);
  await click('기록'); await shot('06-stats');
  ws.close(); proc.kill();
  process.exit(0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
