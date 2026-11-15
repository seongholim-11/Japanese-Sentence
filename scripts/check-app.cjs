// 앱 로직 검증: 퀴즈 생성, 저장값 복구(sanitize), 백업, 검색. 사용: npm run test:scripts
const assert = require('assert');
const { load } = require('./lib/ts-loader.cjs');

const decks = load('src/data/decks.ts');
const quiz = load('src/quiz.ts');
const progress = load('src/progress.ts');
const backup = load('src/backup.ts');
const search = load('src/search.ts');

let failures = 0;
const fail = (msg) => {
  failures++;
  if (failures <= 40) console.log('  ✗ ' + msg);
};
const ok = (cond, msg) => cond || fail(msg);

// ── 1. 퀴즈 ─────────────────────────────────────────────
let made = 0;
const kindCount = {};
for (const deck of Object.keys(decks.cardDecks)) {
  for (const size of decks.SET_SIZES) {
    decks.applySetSize(size);
    const sets = decks.setCount(deck);
    const picks = [...new Set([0, Math.floor(sets / 2), sets - 1])].filter((n) => n >= 0 && n < sets);
    for (const set of picks) {
      for (let round = 0; round < 25; round++) {
        let qs;
        try {
          qs = quiz.makeQuiz(deck, set);
        } catch (e) {
          fail(`${deck}/${size}/${set}: 예외 ${e.message}`);
          continue;
        }
        const cards = decks.setCards(deck, set);
        ok(qs.length <= 10, `${deck}: 문제 수 ${qs.length} > 10`);
        ok(qs.length >= Math.min(cards.length, 10) * 0.7 || cards.length < 4, `${deck}/${size}/${set}: 문제가 너무 적음 ${qs.length}/${cards.length}`);
        const seenCards = new Set();
        for (const q of qs) {
          made++;
          kindCount[q.kind] = (kindCount[q.kind] || 0) + 1;
          const where = `${deck}/${size}/${set} ${q.kind} ${q.card.id}`;
          ok(!seenCards.has(q.card.id), `${where}: 같은 카드가 한 퀴즈에 두 번`);
          seenCards.add(q.card.id);
          ok(q.choices.length >= 2 && q.choices.length <= 4, `${where}: 보기 ${q.choices.length}개`);
          if (decks.cardDecks[deck].length >= 30) ok(q.choices.length === 4, `${where}: 보기가 4개가 아님 (${q.choices.length})`);
          ok(new Set(q.choices).size === q.choices.length, `${where}: 보기 중복 ${q.choices.join(' | ')}`);
          ok(q.answer >= 0 && q.answer < q.choices.length, `${where}: 정답 위치 이상`);
          const right = q.choices[q.answer];
          if (q.kind === 'meaning') {
            ok(right === q.card.back, `${where}: 정답이 뜻과 다름`);
            q.choices.forEach((c, i) => i !== q.answer && ok(!quiz.overlaps(c, right), `${where}: 뜻 겹침 '${c}' vs '${right}'`));
          }
          if (q.kind === 'reading') {
            ok(right === q.card.reading, `${where}: 정답이 읽기와 다름`);
            ok(quiz.hasKanji(q.card.front), `${where}: 한자 없는 단어에 읽기 문제`);
          }
          if (q.kind === 'ko2ja') {
            ok(right === q.card.front, `${where}: 정답이 표기와 다름`);
            q.choices.forEach((c, i) => i !== q.answer && ok(c !== q.card.front, `${where}: 같은 표기`));
          }
          if (q.kind === 'blank') {
            ok(q.prompt.split(quiz.BLANK).length === 2, `${where}: 빈칸이 한 번이 아님`);
            ok(q.prompt.replace(quiz.BLANK, right) === q.card.ex, `${where}: 빈칸을 채워도 예문과 다름`);
            q.choices.forEach((c, i) => i !== q.answer && ok(!q.card.ex.includes(c), `${where}: 오답 '${c}'이 예문에 이미 있음`));
          }
          if (q.kind === 'sentence') {
            ok(right === q.card.back, `${where}: 정답이 일본어 문장과 다름`);
            const kos = new Set(decks.cardDecks.sentences.filter((c) => q.choices.includes(c.back)).map((c) => c.front));
            ok(kos.size === q.choices.length, `${where}: 한국어 뜻이 같은 문장이 보기에 함께 나옴`);
          }
          if (q.kind === 'blank') q.choices.forEach((c, i) => i !== q.answer && ok(true, ''));
          if (q.kind === 'kana') ok(right === q.card.back, `${where}: 정답이 독음과 다름`);
          if (q.kind === 'kanaRev') {
            ok(right === q.card.front, `${where}: 정답이 문자와 다름`);
            const same = decks.cardDecks.kana.filter((k) => k.tag.split('·')[0] === q.card.tag.split('·')[0] && k.back === q.card.back);
            ok(same.length === 1, `${where}: 독음이 같은 글자가 있는데 글자 고르기 출제`);
          }
        }
      }
    }
  }
}
decks.applySetSize(50);
console.log(`퀴즈: ${made}문제 생성`, JSON.stringify(kindCount));

// ── 2. 저장값 복구 ──────────────────────────────────────
const junk = [null, undefined, 5, 'x', [], {}, { prefs: 5 }, { prefs: { reading: 'zzz', setSize: 'a', fontScale: {}, speechRate: -1, theme: 9, reminder: 3 } }, { sets: { 'kana:0': 7, 'words:9999': {}, 'bad:0': {} }, mastered: { kana: 5, words: ['없는카드'] }, cards: { 'kana:あ': { box: 99, due: 'x' }, 'zzz:q': {} }, quiz: { 'kana:0': { best: 5, total: 2 } }, dialogue: { pos: -5, done: ['a', 1e9] }, history: { x: 1, '2026-01-01': -3 }, favorites: ['kana:あ', 'kana:없음', 7], goal: 'a', streak: -1 }];
for (const j of junk) {
  try {
    const p = progress.sanitize(j);
    ok(['always', 'after', 'hidden'].includes(p.prefs.reading), `sanitize(${JSON.stringify(j)}): reading=${p.prefs.reading}`);
    ok(p.goal >= progress.GOAL_MIN && p.goal <= progress.GOAL_MAX, 'sanitize: goal 범위');
    ok(Object.keys(p.sets).every((k) => k.startsWith('kana:') || k.startsWith('words:') || k.startsWith('patterns:') || k.startsWith('sentences:')), 'sanitize: 알 수 없는 세트');
    ok(!('kana:없음' in {}) && p.favorites.every((k) => k !== 'kana:없음'), 'sanitize: 없는 카드 즐겨찾기');
    ok(Object.values(p.cards).every((c) => c.box >= 0 && c.box <= 5 && /^\d{4}-\d{2}-\d{2}$/.test(c.due)), 'sanitize: 복습 상태');
  } catch (e) {
    fail(`sanitize 예외 (${JSON.stringify(j)}): ${e.message}`);
  }
}
const def = progress.defaultPrefs();
ok(def.reading === 'after', '읽기 기본값이 "뜻 보기 후"가 아님');
const good = progress.sanitize({ prefs: { reading: 'always' } });
ok(good.prefs.reading === 'always', '정상 reading 값이 유지되지 않음');
const bad = progress.sanitize({ cards: { 'kana:あ': { box: 1, due: '9999-99-99' }, 'kana:い': { box: 1, due: '2026-02-31' } }, sets: { 'kana:0': { round: 1, queue: ['あ', 'あ', 'い'], pos: 0, known: 0, again: ['う', 'い'] } }, quiz: { 'words:-1': { best: 1, total: 2 } } });
ok(Object.values(bad.cards).every((c) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(c.due) && c.due < '2100'), 'sanitize: 가짜 날짜가 남음');
ok(new Set(bad.sets['kana:0'].queue).size === bad.sets['kana:0'].queue.length, 'sanitize: queue 중복');
ok(bad.sets['kana:0'].again.every((id) => bad.sets['kana:0'].queue.includes(id)), 'sanitize: again 이 queue 밖 카드를 포함');
ok(!('words:-1' in bad.quiz), 'sanitize: 음수 세트 키');
const inc = progress.sanitize({ sets: { 'kana:0': { round: 1, queue: ['あ', 'い', 'う'], pos: 0, known: 3, again: ['う'] } } }).sets['kana:0'];
ok(inc.again.length === 0 && inc.known === 0, `sanitize: 불가능한 회독 상태 (known ${inc.known}, again ${inc.again})`);
console.log('저장값 복구: 완료');

// ── 3. 백업 ─────────────────────────────────────────────
const roundtrip = backup.parseBackup(backup.makeBackup(good));
ok(roundtrip.ok && roundtrip.progress.prefs.reading === 'always', '백업 왕복 실패');
const english = JSON.stringify({ app: 'lingoloop', version: 1, data: {} });
ok(!backup.parseBackup(english).ok, '영어 앱 백업이 일본어 앱에 들어옴');
ok(!backup.parseBackup('').ok && !backup.parseBackup('{').ok && !backup.parseBackup('[]').ok, '깨진 백업을 거절하지 않음');
ok(backup.BACKUP_APP === 'lingoloop-ja', 'BACKUP_APP');
console.log('백업: 완료');

// ── 4. 검색 ─────────────────────────────────────────────
const has = (q, id) => search.searchCards(q).some((h) => h.card.id === id || h.card.front === id);
ok(has('たべる', '食べる#たべる'), '히라가나 검색으로 한자 단어를 못 찾음');
ok(has('食べる', '食べる#たべる'), '한자 검색 실패');
ok(has('먹다', '食べる#たべる'), '한국어 뜻 검색 실패');
ok(has('コーヒー', 'コーヒー#コーヒー') && has('こーひー', 'コーヒー#コーヒー'), '가타카나↔히라가나 검색 실패');
ok(has('ｺｰﾋｰ', 'コーヒー#コーヒー'), '반각 가타카나 검색 실패');
ok(has('たべる', '食べる#たべる') && !search.searchCards('たべる').some((h) => h.card.id === 'ア'), '검색 결과에 무관한 카드');
ok(search.searchCards('').length === 0 && search.searchCards('   ').length === 0, '빈 검색');
ok(search.searchCards('の').length <= search.MAX_HITS, '검색 상한');
console.log('검색: 완료');

if (failures) {
  console.log(`\n실패 ${failures}건`);
  process.exit(1);
}
console.log('모든 검증 통과 ✓');
