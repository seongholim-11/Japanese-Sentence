// 만든 미리보기를 App Store의 다른 화면 크기 칸에 맞게 변환한다(cover 리사이즈, 알파 없음). 사용: node resize.cjs
const Jimp = require('jimp-compact');
const fs = require('fs');
const path = require('path');
const SP = path.resolve(__dirname, '..');
const sets = [
  ['iphone-6.9', 'iphone-6.5-1284x2778', 1284, 2778],
  ['iphone-6.9', 'iphone-6.5-1242x2688', 1242, 2688],
  ['iphone-6.9', 'iphone-6.3-1206x2622', 1206, 2622],
  ['iphone-6.9', 'iphone-6.9-1290x2796', 1290, 2796],
  ['ipad-13', 'ipad-12.9-2048x2732', 2048, 2732],
];
(async () => {
  for (const [src, dst, w, h] of sets) {
    fs.mkdirSync(path.join(SP, dst), { recursive: true });
    for (const f of fs.readdirSync(path.join(SP, src)).filter((x) => x.endsWith('.png'))) {
      const img = await Jimp.read(path.join(SP, src, f));
      img.cover(w, h).background(0xffffffff);
      // 알파 채널 제거: 불투명 값으로 고정
      img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, i) { this.bitmap.data[i + 3] = 255; });
      await img.writeAsync(path.join(SP, dst, f));
    }
    console.log('만듦', dst, w + 'x' + h);
  }
})();
