// 앱스토어 미리보기 이미지 생성: 실제 앱 캡처(screens/*.png)를 폰 틀에 넣고 한국어 문구를 HTML로 얹어 Chrome 헤드리스로 캡처한다.
// 사용: node docs/store-previews/src/build.cjs   (먼저 capture.cjs 로 screens/ 를 만든다)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const SP = path.join(ROOT, 'docs', 'store-previews');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
const font = (name, rel, w) => `@font-face{font-family:'${name}';font-weight:${w};src:url('${b64(path.join(ROOT, rel), 'font/ttf')}')}`;
const FONTS = [
  font('KR', 'node_modules/@expo-google-fonts/ibm-plex-sans-kr/700Bold/IBMPlexSansKR_700Bold.ttf', 700),
  font('KR', 'node_modules/@expo-google-fonts/ibm-plex-sans-kr/400Regular/IBMPlexSansKR_400Regular.ttf', 400),
  font('JP', 'node_modules/@expo-google-fonts/noto-sans-jp/700Bold/NotoSansJP_700Bold.ttf', 700),
].join('');
const icon = b64(path.join(ROOT, 'assets', 'icon.png'), 'image/png');
const shotOf = (n) => b64(path.join(SP, 'screens', n + '.png'), 'image/png');
const RED = '#D93A4C';
const IPAD = process.argv[2] === 'ipad';
const W = IPAD ? 2064 : 1320, H = IPAD ? 2752 : 2868, K = IPAD ? 1.33 : 1;
const OUTDIR = IPAD ? 'ipad-13' : 'iphone-6.9';

const slides = [
  { id: '01-loop', dark: true, a: '한 번 보고 끝내지 말고', b: '다시 돌려 보세요', sub: '가나부터 N3까지, 일본어 회독 앱', shot: '03-study' },
  { id: '02-review', dark: false, a: '잊을 때쯤', b: '다시 나와요', sub: '1·3·7·14·30일 간격 복습', shot: '01-home' },
  { id: '03-decks', dark: false, a: '가나·단어·문형·문장', b: '대화문까지 한 곳에서', sub: '세트로 나눠 부담 없이 시작', shot: '02-decks' },
  { id: '04-quiz', dark: true, a: '세트마다', b: '퀴즈로 확인', sub: '뜻 · 읽기 · 빈칸 · 문장 고르기', shot: '04-quiz' },
  { id: '05-dialogue', dark: false, a: '대화를 가리고', b: '말해 보세요', sub: '일본어 가리기 · 전체 듣기', shot: '05-dialogue' },
  { id: '06-stats', dark: true, a: '가입도 광고도 없이', b: '내 기록은 내 기기에', sub: '음성이 앱에 들어 있어 인터넷 없이도 OK', shot: '06-stats' },
];

const page = (s) => `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
*{box-sizing:border-box}html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
body{font-family:KR,JP,sans-serif;-webkit-font-smoothing:antialiased}
.stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${s.dark ? `linear-gradient(155deg,${RED} 0%,#c02a3d 50%,#8f1a2b 100%)` : '#F6F3F1'};color:${s.dark ? '#fff' : '#2b1215'}}
h1{position:absolute;top:${IPAD ? 120 : 150}px;left:60px;width:${W - 120}px;margin:0;text-align:center;font-size:${Math.round(112 * (IPAD ? 1.1 : 1))}px;line-height:1.3;font-weight:700;letter-spacing:-4px}
h1 span,h1 strong{display:block;white-space:nowrap}h1 strong{color:${s.dark ? '#ffe3e6' : RED}}
p{position:absolute;top:${IPAD ? 420 : 470}px;left:60px;width:${W - 120}px;margin:0;text-align:center;font-size:${IPAD ? 50 : 44}px;font-weight:400;color:${s.dark ? '#ffe3e6' : '#7a5a5e'}}
.phone{position:absolute;left:${(W - (IPAD ? 1060 : 940)) / 2}px;top:${IPAD ? 560 : 640}px;width:${IPAD ? 1060 : 940}px;padding:19px;border:4px solid #8b8d96;border-radius:128px;background:#101114;box-shadow:0 50px 90px #0003}
.phone img.screen{display:block;width:100%;border-radius:105px}
.ic{position:absolute;right:70px;top:60px;width:110px;height:110px;border-radius:26px;display:${s.dark ? 'none' : 'block'}}
</style></head><body><div class="stage"><h1><span>${s.a}</span><strong>${s.b}</strong></h1><p>${s.sub}</p><div class="phone"><img class="screen" src="${shotOf(s.shot)}"></div></div></body></html>`;

const tmp = path.join(require('os').tmpdir(), 'jp-previews');
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync(path.join(SP, OUTDIR), { recursive: true });
for (const s of slides) {
  const html = path.join(tmp, s.id + '.html');
  fs.writeFileSync(html, page(s));
  const out = path.join(SP, OUTDIR, s.id + '.png');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${W},${H}`, '--force-device-scale-factor=1', `--screenshot=${out}`, 'file:///' + html.split(path.sep).join('/')], { stdio: 'ignore', timeout: 90000 });
  console.log('만듦', s.id);
}
