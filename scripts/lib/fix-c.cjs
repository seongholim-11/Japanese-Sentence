// 1회성 수정(Codex 콘텐츠 검수 B 반영)
const fs = require('fs');
const J = 'D:/personal_project/Japanese-Sentence/src/data/content/json/';
const rd = (f) => JSON.parse(fs.readFileSync(J + f, 'utf8'));
const wr = (f, d) => {
  if (Array.isArray(d)) fs.writeFileSync(J + f, '[\n' + d.map((r) => JSON.stringify(r)).join(',\n') + '\n]\n');
  else fs.writeFileSync(J + f, '{"level":' + JSON.stringify(d.level) + ',"rows":[\n' + d.rows.map((r) => JSON.stringify(r)).join(',\n') + '\n]}\n');
};
const miss = [];
const rowsOf = (d) => (Array.isArray(d) ? d : d.rows);
function edit(f, front, fn) { const d = rd(f); const r = rowsOf(d).find((x) => x[0] === front); if (!r) { miss.push(f + ':' + front); return; } fn(r); wr(f, d); }
function drop(f, front) { const d = rd(f); const rows = rowsOf(d); const n = rows.length; const out = rows.filter((x) => x[0] !== front); if (out.length === n) miss.push('drop ' + f + ':' + front); if (Array.isArray(d)) wr(f, out); else { d.rows = out; wr(f, d); } }
const w = (f, front, ex, er, ko, blank, back) => edit(f, front, (r) => { if (ex) { r[4] = ex; r[5] = er; r[6] = ko; } if (blank !== undefined) r[7] = blank; if (back) r[3] = back; });

// ---- 단어: 높음
edit('words-n4-02.json', '主人', (r) => { r[3] = '주인, (자신의) 남편'; });
edit('words-n5-07.json', '飲食', (r) => { r[3] = '음식물을 먹고 마심'; r[6] = '관내에서는 음식물을 먹거나 마시면 안 돼요.'; });
edit('words-n3-07.json', '損', (r) => { r[4] = '安いと思って買いましたが、損をしました。'; r[5] = 'やすいとおもってかいましたが、そんをしました。'; r[6] = '싸다고 생각해서 샀는데 손해를 봤어요.'; r[7] = '損'; });
edit('words-n3-08.json', '恐る', (r) => { r[0] = '恐る恐る'; r[1] = 'おそるおそる'; r[2] = '부사'; r[3] = '조심조심, 두려워하며'; r[4] = '恐る恐るドアを開けました。'; r[5] = 'おそるおそるドアをあけました。'; r[6] = '조심조심 문을 열었어요.'; r[7] = '恐る恐る'; });
drop('words-n4-03.json', '真面目');
drop('words-n4-08.json', '言葉づかい');
drop('words-n3-07.json', '随分');
drop('words-n3-09.json', '中々');
drop('words-n4-05.json', '足りない');
drop('words-n5-07.json', '去月');
// ---- 단어: 중간
w('words-n3-05.json', '麦', undefined, undefined, undefined, undefined, '보리, 밀 등의 맥류');
w('words-n4-08.json', '雨具', '雨具を持って出かけます。', 'あまぐをもってでかけます。', '비 가림 용품을 가지고 나가요.', undefined, '우산·우비 등 비 가림 용품');
w('words-n3-02.json', '細かい', undefined, undefined, undefined, undefined, '잘다, 자잘하다, 세세하다');
w('words-n3-09.json', '年頃', '年頃の娘がいます。', 'としごろのむすめがいます。', '한창 나이의 딸이 있어요.', undefined, '한창 나이, 적령기');
w('words-n3-09.json', '握り', '握りを二つ注文しました。', 'にぎりをふたつちゅうもんしました。', '니기리 초밥을 두 개 주문했어요.', '握り', '쥠, 니기리(초밥)');
w('words-n3-04.json', '抜く', '庭の雑草を抜きます。', 'にわのざっそうをぬきます。', '마당의 잡초를 뽑아요.', '抜き');
w('words-n4-05.json', '縫う', 'シャツにボタンを縫い付けます。', 'シャツにボタンをぬいつけます。', '셔츠에 단추를 달아요.', '縫い付け');
w('words-n4-07.json', '心臓', '走ると心臓の鼓動が速くなります。', 'はしるとしんぞうのこどうがはやくなります。', '달리면 심장 박동이 빨라져요.', '心臓');
w('words-n4-06.json', '香水', '香りの弱い香水をつけます。', 'かおりのよわいこうすいをつけます。', '향이 은은한 향수를 뿌려요.', '香水');
w('words-n3-07.json', '距離', '駅までの距離は長いです。', 'えきまでのきょりはながいです。', '역까지의 거리는 길어요.', '距離');
w('words-n3-07.json', '孤独', '一人暮らしは孤独を感じます。', 'ひとりぐらしはこどくをかんじます。', '혼자 살면 외로움을 느껴요.', '孤独');
w('words-n4-05.json', '気がする', undefined, undefined, '누군가 나를 보고 있는 것 같아요.', undefined);
w('words-n4-08.json', '学年', '何年生ですか。', 'なんねんせいですか。', '몇 학년이에요?', '年生');
w('words-n5-07.json', '毛布', '毛布を出します。', 'もうふをだします。', '담요를 꺼내요.', '毛布');
w('words-n5-07.json', '枕', 'この枕は高いです。', 'このまくらはたかいです。', '이 베개는 높아요.', '枕');
w('words-n5-08.json', '市', 'この市に住んでいます。', 'このしにすんでいます。', '이 시에 살고 있어요.', '市');
w('words-n4-04.json', '名字', undefined, undefined, undefined, undefined, '성씨');
// ---- patterns
const P1 = rd('patterns-01.json'); const P2 = rd('patterns-02.json');
const pf = (arr, front) => arr.find((r) => r[0] === front);
const note = (arr, front, n) => { const r = pf(arr, front); if (!r) { miss.push('p:' + front); return; } r[3] = n; };
note(P1, '〜かどうか', '동사·い형용사 보통형 + かどうか. 명사·な형용사의 현재 긍정은 だ 없이 + かどうか(学生かどうか, 静かかどうか)');
note(P2, '〜わけではない', '동사·い형용사 보통형 + わけではない. な형용사는 + なわけではない(嫌いなわけではない), 명사는 + なわけではない 또는 + というわけではない');
note(P2, '〜はずがない', '동사·い형용사 보통형 + はずがない. 명사는 + のはずがない, な형용사는 + なはずがない');
note(P2, '〜に違いない', '동사·い형용사 보통형, 명사·な형용사는 だ 없이 + に違いない(学生に違いない, 静かに違いない). 강한 추측');
note(P2, '〜でしょう？', '동사·い형용사 보통형 + でしょう？ 명사·な형용사는 だ 없이 + でしょう？(静かでしょう？). 확인·동의 구하기');
note(P2, '〜んです', '동사·い형용사 보통형 + んです. 명사·な형용사의 현재 긍정은 + なんです(学生なんです, 静かなんです). 설명·이유를 덧붙임');
note(P2, '〜うちに', '동사 사전형·ない형, い형용사 + うちに. な형용사는 + なうちに(元気なうちに), 명사는 + のうちに(学生のうちに)');
note(P2, '〜ことは〜が', '동사·い형용사 보통형 + ことは + 같은 말 + が. な형용사는 + なことは(静かなことは静かですが)');
note(P2, '〜ばかりでなく', '동사·い형용사 보통형 + ばかりでなく + も. 명사는 그대로, な형용사는 + なばかりでなく(便利なばかりでなく)');
note(P2, '〜おりません', '(~て)おりません: 동사 て형 + おりません은 ~하고 있지 않습니다(겸양). いる의 겸양어 おる의 부정형 おりません은 있지 않습니다(자리에 없습니다)');
note(P2, '〜いたします', 'お + 동사 ます형(ます를 뺀 꼴) + いたします, 또는 ご + 한자어 명사 + いたします (ご案内いたします)');
const nj = pf(P2, '〜んじゃない'); if (nj) { nj[4] = '少し食べすぎたんじゃない？'; nj[5] = 'すこしたべすぎたんじゃない？'; nj[6] = '조금 과식한 거 아니야?'; nj[8] = 'たんじゃない'; }
const ome = pf(P2, '〜お目にかかれて'); if (ome) { ome[4] = 'お目にかかれてうれしいです。'; ome[5] = 'おめにかかれてうれしいです。'; ome[6] = '뵙게 되어 기쁩니다.'; ome[8] = 'お目にかかれて'; }
const doumo = pf(P2, 'どうも'); if (doumo) { doumo[3] = '고맙습니다·안녕하세요 등을 가볍게 말하는 인사'; doumo[4] = 'どうも。助かりました。'; doumo[5] = 'どうも。たすかりました。'; doumo[6] = '고마워요. 도움이 됐어요.'; doumo[8] = 'どうも'; }
const itte = pf(P2, 'いってらっしゃい'); if (itte) { itte[4] = 'いってらっしゃい。気をつけてください。'; itte[5] = 'いってらっしゃい。きをつけてください。'; itte[6] = '다녀오세요. 조심하세요.'; itte[8] = 'いってらっしゃい'; }
// blank 확대: 목표 문형까지 가린다
const widen = { '〜てもらえませんか': '撮ってもらえません', '〜ていただけませんか': '説明していただけません', '〜てくださいませんか': '手伝ってくださいません', '〜ていただく': '教えていただき', '〜てくださる': '教えてくださいました', '〜ていらっしゃる': '読んでいらっしゃい' };
for (const [k, v] of Object.entries(widen)) { const r = pf(P2, k); if (r && r[4].includes(v)) r[8] = v; else miss.push('widen2 ' + k); }
// ます형 설명 통일
for (const P of [P1, P2]) for (const r of P) { r[3] = r[3].replace(/ます형 \+/g, 'ます형(ます를 뺀 꼴) +').replace(/ます형\(ます를 뺀 꼴\)\(ます를 뺀 꼴\)/g, 'ます형(ます를 뺀 꼴)'); }
wr('patterns-01.json', P1); wr('patterns-02.json', P2);
// ---- 대화문
const D3 = rd('dialogues-03.json');
const mayoi = D3.find((x) => x.id === 'mayoi'); if (mayoi) mayoi.lines[5] = ['では、失礼します。', 'では、しつれいします。', '그럼 가 보겠습니다.'];
const wari = D3.find((x) => x.id === 'warikan');
if (wari) wari.lines[3] = ['じゃあ、私が二人分をまとめて払うよ。', 'じゃあ、わたしがふたりぶんをまとめてはらうよ。', '그럼 내가 두 사람 몫을 한꺼번에 낼게.'];
if (wari) wari.lines[4] = ['友達', 'ありがとう。じゃあ、二千円を渡すね。', 'ありがとう。じゃあ、にせんえんをわたすね。', '고마워. 그럼 2000엔 줄게.'];
if (wari) wari.lines[5] = ['うん、確かに受け取ったよ。', 'うん、たしかにうけとったよ。', '응, 확실히 받았어.'];
if (wari) wari.expressions = ['割り勘', '払う'];
wr('dialogues-03.json', D3);
// ---- 용어집
const g2 = JSON.parse(fs.readFileSync(J + 'glossary-02.json', 'utf8'));
if (g2['割り勘']) g2['割り勘'][1] = '각자 똑같이 나누어 냄(더치페이)';
if (g2['別々']) g2['別々'][1] = '따로따로';
fs.writeFileSync(J + 'glossary-02.json', JSON.stringify(g2).replace(/\],"/g, '],\n"').replace(/^\{/, '{\n').replace(/\}$/, '\n}') + '\n');
console.log('miss:', JSON.stringify(miss));
