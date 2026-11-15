// 앱 아이콘 생성(영어 앱과 같은 디자인 + 빨간 포인트, 말풍선 안에 「あ」). 사용: node scripts/make-icons.cjs
// SVG를 HTML에 넣고 Edge/Chrome 헤드리스로 캡처한다(글꼴은 시스템 일본어 굵은 글꼴).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const BROWSER = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
if (!BROWSER) throw new Error('Edge/Chrome 을 찾지 못했습니다');
const RED = '#D93A4C';
const OUT = path.join(__dirname, '..', 'assets');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'icons-'));

// 순환 화살표 + 말풍선(+ あ). fill: 도형 색, ink: 글자(말풍선 안) 색, cut: 글자를 마스크로 뚫기
const shapes = (fill, ink, cut) => `
  <defs>${cut ? `<mask id="m"><rect width="1024" height="1024" fill="#fff"/><text x="512" y="506" font-size="170" font-weight="900" text-anchor="middle" dominant-baseline="central" fill="#000" font-family="'Yu Gothic','Noto Sans JP','Meiryo',sans-serif">あ</text></mask>` : ''}</defs>
  <g ${cut ? 'mask="url(#m)"' : ''}>
    <path d="M714 271 A315 315 0 1 1 340 262" fill="none" stroke="${fill}" stroke-width="70" stroke-linecap="round"/>
    <polygon points="352,184 476,220 426,338" fill="${fill}" stroke="${fill}" stroke-width="22" stroke-linejoin="round"/>
    <rect x="372" y="390" width="280" height="198" rx="58" fill="${fill}"/>
    <polygon points="430,586 430,655 516,586" fill="${fill}"/>
  </g>
  ${cut ? '' : `<text x="512" y="506" font-size="170" font-weight="900" text-anchor="middle" dominant-baseline="central" fill="${ink}" font-family="'Yu Gothic','Noto Sans JP','Meiryo',sans-serif">あ</text>`}`;

function svg(size, { bg, fill, ink, cut, scale = 1 }) {
  const t = scale === 1 ? '' : `transform="translate(${512 - 512 * scale} ${512 - 512 * scale}) scale(${scale})"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  ${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}
  <g ${t}>${shapes(fill, ink, cut)}</g></svg>`;
}

function shot(name, size, markup, transparent) {
  const html = path.join(TMP, name + '.html');
  fs.writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:${transparent ? 'transparent' : '#fff'}}svg{display:block}</style></head><body>${markup}</body></html>`);
  const out = path.join(OUT, name + '.png');
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${size},${size}`, `--screenshot=${out}`, '--force-device-scale-factor=1'];
  if (transparent) args.push('--default-background-color=00000000');
  args.push('file:///' + html.replace(/\\/g, '/'));
  execFileSync(BROWSER, args, { stdio: 'ignore', timeout: 60000 });
  console.log('만듦', name, size);
}

shot('icon', 1024, svg(1024, { bg: RED, fill: '#fff', ink: RED }), false);
shot('splash-icon', 1024, svg(1024, { fill: RED, ink: '#fff', scale: 0.8 }), true);
shot('android-icon-foreground', 512, svg(512, { fill: '#fff', ink: RED, scale: 0.66 }), true);
shot('android-icon-background', 512, `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="${RED}"/></svg>`, false);
shot('android-icon-monochrome', 432, svg(432, { fill: '#fff', cut: true, scale: 0.66 }), true);
shot('favicon', 48, svg(48, { bg: RED, fill: '#fff', ink: RED }), false);
