# 링고루프 일본어 (Japanese-Sentence)

한국어 사용자가 일본어 가나·단어·문형·문장·대화문을 **카드로 여러 번 돌려 보며(회독) 익히는** 오프라인 학습 앱. 영어 회독 앱 "링고루프"(`English-Sentence`)를 복사해 만든 별도 앱이에요. Expo SDK 58 · React Native 0.88 · TypeScript.

- 기획·결정: `docs/DECISIONS.md`(확정 17개)가 가장 우선, `docs/01~04`, `prompts/`
- 진행 상황: `docs/PROGRESS.md`, 막힌 것: `docs/BLOCKERS.md`
- 검수 기록: `reports/` (Codex 검수, 읽기 대조, 최종 점검)

## 콘텐츠 (2026-11-13 기준)

가나 208 · 단어 2,521(N5 696 · N4 863 · N3 962, 비공식 구분) · 문형·표현 212 · 문장 850 · 대화문 82편(492줄). 모두 직접 작성했고 외부 데이터는 포함하지 않아요(`NOTICES.md`).

## 개발

```
npm install
npm run typecheck          # 타입 검사
npm run validate           # 콘텐츠 검증(스키마·중복·읽기 정렬·빈칸·금지어)
npm run test:scripts       # 퀴즈·저장값 복구·백업·검색 검증
node scripts/check-readings.cjs words-n5 --out reports/x.md   # kuromoji 읽기 대조
node scripts/check-store.cjs   # 스토어 문구 글자 수·수량 일치
npx expo start --web       # 로컬 웹(앱 웹 버전은 배포하지 않아요)
```

## 음성 (Google Cloud TTS Chirp 3 HD ja-JP)

`.env`(`.env.example` 참고, 키 없음 — `gcloud auth application-default login`으로 인증)를 채운 뒤:

```
npm run audio -- --dry-run          # 읽을 문구·글자 수만 계산
npm run audio -- --list-voices      # ja-JP 음성 목록
npm run audio -- --sample=20        # 샘플(assets/audio-samples, 청취 후 음성 확정)
npm run audio                       # 전체 생성(이어서 가능) + src/audio/manifest.ts 갱신
node scripts/check-audio.cjs        # 앱이 읽는 문구 ↔ 파일 존재 점검
```

## 구조

```
src/data/content/json/   콘텐츠 JSON (words-*, patterns-*, sentences-*, dialogues-*, glossary*, kana)
src/data/*.ts            카드·덱·대화문·용어집 로딩 (스키마 매핑)
src/quiz.ts search.ts progress.ts speech.ts ...
scripts/                 검증·음성·읽기 대조 스크립트
site/                    GitHub Pages(방침·지원 페이지만)
```

## 원칙

- 영어 앱 폴더는 읽기만 하고 수정하지 않아요.
- 일본어 정확성이 속도보다 우선이에요. 생성 모델(Claude)과 다른 모델(Codex)이 교차 검수해요.
- 키·비밀번호는 채팅·코드에 적지 않고, 결제·계정·로그인은 사용자가 직접 해요.
