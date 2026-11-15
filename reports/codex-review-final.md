**현재는 출시 보류를 권합니다.** 기본 검증은 통과했지만, 퀴즈 복수 정답, 다의어 음성 충돌, 백업 복원 후 알림 불일치를 확인했습니다. 음성 생성 완료 후 재검증과 실기기 확인도 필요합니다.

파일 수정·커밋·푸시·음성 생성은 하지 않았습니다. 추가 검증은 메모리에서 실행했습니다. 저장소에 커밋이 없어 최근 변경 비교는 불가능했고, 현재 코드를 점검했습니다.

**검증 결과**

| 검증 | 결과 |
|---|---|
| `npm run typecheck` | `npm.cmd run typecheck`로 통과¹ |
| `node scripts/check-app.cjs` | 통과, 이번 실행에서 13,275문제 생성 |
| `node scripts/validate-content.cjs` | 오류 0, 경고 4, 민감어 후보 26 |
| `node scripts/check-store.cjs` | 통과 |
| `node scripts/check-audio.cjs` | 생성 중 스냅샷에서 실패 |
| Expo 설정 introspection | 실행 완료, 아래 설정 결과 참고 |

¹ PowerShell이 `npm.ps1` 실행을 차단하여 같은 npm 작업을 `.cmd`로 실행했습니다.

콘텐츠는 가나 208장·단어 2,521장·문형 212장·문장 851장·대화문 82편입니다. 경고 4개는 `い형용사` 설명 3개와 짧은 문장 `乾杯！`로, 그 자체를 오류로 판단하지 않았습니다. 자동 검증 통과가 일본어 의미·번역·읽기의 전수 정확성을 보장하지는 않습니다.

**높음**

**1. 빈칸·읽기·문장 퀴즈에서 복수 정답이 발생합니다 — 실행 재현**

파일: [src/quiz.ts:105](/D:/personal_project/Japanese-Sentence/src/quiz.ts:105), [129](/D:/personal_project/Japanese-Sentence/src/quiz.ts:129), [138](/D:/personal_project/Japanese-Sentence/src/quiz.ts:138)

실제 생성된 문제에서 다음 보기가 함께 나왔습니다.

| 문제 | 함께 출제된 타당한 답 |
|---|---|
| `＿＿＿をください。` / 물을 주세요 | `水`, `お水` |
| `このパンは＿＿＿です。` / 이 빵은 맛있어요 | `おいしい`, `うまい` |
| `＿＿＿休みます。` / 조금 쉴게요 | `少し`, `ちょっと` |
| `六時に家へ＿＿＿ます。` / 집으로 돌아가요 | `帰り`, `戻り` |
| 문맥 없는 `開く` 읽기 | `あく`, `ひらく` |
| 문맥 없는 `分` 읽기 | `ふん`, `ぶん` |
| 선물용으로 포장해 주세요 | `プレゼント用に包んでください。`, `贈り物用に包んでください。` |

앱은 지정된 하나만 정답 처리하므로, 맞는 답을 골라도 오답·복습 대상으로 기록합니다.

- **재현:** 해당 카드가 포함된 세트의 퀴즈를 반복하거나, 현재 출제 함수를 반복 호출하면 위 조합이 생성됩니다. 메모리에서 출제 함수를 직접 호출해 확인했습니다.
- **원인:** 빈칸은 읽기가 같은 카드만 제외하고 동의어를 제외하지 않습니다. 문장 문제는 한국어 뜻이 같은 문장을 제외하지 않습니다. 읽기 문제는 다의어 문맥이 없습니다.
- **대응:** 출시 전에는 위험 카드의 해당 유형을 제외하는 것이 빠릅니다. 이후 문맥을 추가하고, 정답 동등 그룹을 관리하세요. 한국어 뜻 문자열 비교만으로는 완전하게 해결되지 않습니다.

[docs/BLOCKERS.md](/D:/personal_project/Japanese-Sentence/docs/BLOCKERS.md)의 “읽기가 다른 동의어는 뜻 중복 필터에 의존” 설명도 현재 빈칸 코드와 맞지 않습니다.

**2. 서로 다른 읽기의 단어가 같은 음성 파일을 사용합니다 — 키 충돌 재현**

파일: [src/data/decks.ts:159](/D:/personal_project/Japanese-Sentence/src/data/decks.ts:159), [scripts/generate-audio.cjs:88](/D:/personal_project/Japanese-Sentence/scripts/generate-audio.cjs:88), [110](/D:/personal_project/Japanese-Sentence/scripts/generate-audio.cjs:110), [src/speech.ts:73](/D:/personal_project/Japanese-Sentence/src/speech.ts:73)

다음 카드들이 각각 동일한 `main|표기` 키로 합쳐집니다.

- `人#ひと` / `人#にん`
- `分#ふん` / `分#ぶん`
- `開く#あく` / `開く#ひらく`

- **재현:** 두 카드에 `speakText('words', card)`를 호출하면 같은 문자열이 반환됩니다.
- **영향:** 카드에 적힌 읽기는 달라도 같은 녹음이 재생됩니다. `--word-source=reading`도 중복 제거 키가 표기이므로 해결되지 않습니다. 표기만 받는 보정 사전도 두 읽기를 구분하지 못합니다.
- **대응:** 단어 음성 식별자에 읽기 또는 카드 ID를 포함하고, 생성·앱 조회·검증 규칙을 함께 바꾸세요.

실제 음성을 청취한 결과가 아니라, **서로 다른 읽기를 구분할 수 없는 구조를 확인한 결과**입니다.

**3. 현재 음성 상태로는 오프라인 음성 출시 조건을 충족하지 못합니다 — 생성 중 스냅샷**

파일: [src/audio/manifest.ts:5](/D:/personal_project/Japanese-Sentence/src/audio/manifest.ts:5), [docs/store-listing.md:48](/D:/personal_project/Japanese-Sentence/docs/store-listing.md:48)

점검 시점 결과:

- 필요한 문구 7,262개
- index 기준 누락 6,962개
- manifest 등록 0개
- 빈 파일 0개
- 디스크 MP3 약 1.4MB

manifest의 `main`, `alt`가 비어 있어 현재 앱은 기기 TTS로 대체합니다.

- **재현:** 생성 완료 전 현재 manifest로 앱을 실행하고 발음 버튼을 누릅니다.
- **대응:** 진행 중인 생성의 실패라고 단정하지 않습니다. **생성 종료 후 최종 manifest와 파일을 다시 검사하고**, 비행기 모드·일본어 음성 미설치 기기에서 확인해야 합니다.

**중간**

**4. 퀴즈 보기 연타로 같은 문제가 중복 채점됩니다 — 모의 실행 재현**

파일: [src/screens/QuizScreen.tsx:51](/D:/personal_project/Japanese-Sentence/src/screens/QuizScreen.tsx:51), [src/progress.ts:493](/D:/personal_project/Japanese-Sentence/src/progress.ts:493)

`picked`는 React 상태라 다음 렌더 전에는 두 핸들러 모두 `null`을 봅니다.

- **재현:** 렌더 전에 서로 다른 보기의 핸들러를 연속 호출했습니다. 같은 카드의 `onAnswer`가 2번 호출되고 오답 배열에도 2개가 들어갔습니다.
- **영향:** 점수·오늘 학습량·복습 상태가 중복 반영될 수 있습니다.
- **대응:** 문제별 동기식 ref 잠금과 진행 로직의 중복 채점 방어를 추가하세요.

실기기 터치 재현은 하지 않았지만, 이벤트 핸들러 수준에서 확인했습니다.

**5. 백업 복원 후 알림 설정과 실제 예약이 달라집니다 — 모의 실행 재현**

파일: [src/progress.ts:551](/D:/personal_project/Japanese-Sentence/src/progress.ts:551), [src/screens/SettingsScreen.tsx:671](/D:/personal_project/Japanese-Sentence/src/screens/SettingsScreen.tsx:671)

복원은 설정 데이터만 교체하고 OS 알림 예약을 동기화하지 않습니다.

- **재현 A:** 새 기기에서 알림 ON·오전 7시 백업을 복원합니다. 모의 실행 결과 저장 설정은 ON이지만 예약 호출은 0회였습니다.
- **재현 B:** 현재 알림이 켜진 기기에 OFF 백업을 복원합니다. 기존 예약을 취소하는 경로가 없습니다.
- **영향:** 켜졌다고 표시되는데 알림이 없거나, 꺼졌다고 표시되는데 기존 알림이 옵니다.
- **대응:** 복원 시 예약을 조정하고 권한 거부·예약 실패를 설정에 반영하세요.

**6. 음성 검사기가 빈 manifest도 통과시킬 수 있습니다 — 모의 실행 재현**

파일: [scripts/check-audio.cjs:51](/D:/personal_project/Japanese-Sentence/scripts/check-audio.cjs:51), [62](/D:/personal_project/Japanese-Sentence/scripts/check-audio.cjs:62)

manifest의 `require()` 개수를 출력하지만 성공·실패 판정에는 사용하지 않습니다.

- **재현:** 메모리에서 index·파일을 모두 정상으로 제공하고 manifest만 비웠습니다. **`manifest 0개`인데 종료 코드 0**이 나왔습니다.
- **추가 누락:** 생성기는 [106줄](/D:/personal_project/Japanese-Sentence/scripts/generate-audio.cjs:106)의 설정 미리 듣기 문구도 수집하지만 검사기는 포함하지 않습니다.
- **대응:** 필요한 `voice|text → 실제 파일` 매핑을 manifest와 전수 비교하고, 설정 샘플도 검사하세요. 해시 검사는 현재 첫 200개만 확인합니다.

**7. 손상된 저장값 일부가 복구되지 않습니다 — 실행 재현**

파일: [src/progress.ts:209](/D:/personal_project/Japanese-Sentence/src/progress.ts:209), [231](/D:/personal_project/Japanese-Sentence/src/progress.ts:231), [239](/D:/personal_project/Japanese-Sentence/src/progress.ts:239)

`sanitize()`에서 다음 값이 그대로 살아남았습니다.

- 복습일 `9999-99-99`
- 같은 카드가 중복된 `queue`
- 아직 처리하지 않은 다른 카드가 들어간 `again`
- 음수 퀴즈 세트 키 `words:-1`

- **재현:** 위 값을 포함한 저장 객체를 `sanitize()`에 전달합니다.
- **영향:** 잘못된 날짜 때문에 복습이 사실상 무기한 밀리거나, 카드·회독 집계가 중복될 수 있습니다.
- **대응:** 실제 날짜 유효성, 큐 중복 제거, 처리 위치와 `known/again`의 일관성, 세트 번호 하한을 검사하세요.

기존에 문제였던 누락 배열·음수 위치·잘못된 `reading`은 현재 방어하고 있습니다. 이번 점검에서 손상 저장값에 의한 즉시 크래시는 확인하지 못했습니다.

**8. 글꼴 라이선스 전문·저작권 고지의 배포 경로가 불명확합니다 — 코드 확인, 완성 바이너리 미확인**

파일: [NOTICES.md:13](/D:/personal_project/Japanese-Sentence/NOTICES.md:13), [src/screens/SettingsScreen.tsx:796](/D:/personal_project/Japanese-Sentence/src/screens/SettingsScreen.tsx:796)

앱은 글꼴명과 외부 OFL 링크를 제공하지만, 각 글꼴의 저작권 고지와 전문을 앱에서 보여 주는 경로는 없습니다. 설치된 패키지에는 각 `LICENSE_FONT`가 있습니다.

- **재현:** 비행기 모드에서 설정 → 출처·라이선스를 엽니다. 전문은 외부 링크에 의존합니다.
- **대응:** 세 글꼴의 원문 고지를 앱에서 읽을 수 있게 동봉하고, 실제 배포물 포함 여부를 확인하세요.
- **범위:** 최종 바이너리의 글꼴 메타데이터까지 검사하지 않았으므로 법적 위반을 확정한 것은 아닙니다.

**9. 작은 화면·큰 글자에서 복습 카드와 고정 높이 버튼이 취약합니다 — 코드 추정**

파일: [src/screens/HomeScreen.tsx:169](/D:/personal_project/Japanese-Sentence/src/screens/HomeScreen.tsx:169), [src/screens/SettingsScreen.tsx:900](/D:/personal_project/Japanese-Sentence/src/screens/SettingsScreen.tsx:900), [src/components/Bits.tsx:86](/D:/personal_project/Japanese-Sentence/src/components/Bits.tsx:86)

- 홈은 `gridH > 0`이어야 복습 카드를 렌더합니다. 작은 화면이나 큰 글자로 나머지 공간이 없어 측정 높이가 0이면, 카드가 생성되지 않는 순환 조건이 생길 수 있습니다.
- 설정 선택지는 높이 34, 공통 버튼은 고정 높이와 한 줄 텍스트를 사용합니다. 앱 글자 1.25배에 OS 글자 확대까지 적용하면 잘림 가능성이 있습니다.
- **재현 조건:** 작은 iPhone 크기 + 앱 “아주 크게” + OS 글자 확대에서 홈·설정·학습·퀴즈·대화문을 확인하세요.
- **대응:** 홈 카드 렌더를 측정값과 분리하고, 버튼은 최소 높이와 내용에 따른 확장을 허용하세요.

학습 카드·퀴즈 본문/보기·대화문에는 스크롤 방어가 있습니다. **실제 화면 잘림이나 홈 카드 실종은 이번에 관찰하지 않았습니다.**

**낮음**

**10. 출시 문서의 확인 완료 표현과 수치가 현재 증거와 맞지 않습니다**

파일: [docs/release-guide.md:3](/D:/personal_project/Japanese-Sentence/docs/release-guide.md:3), [12](/D:/personal_project/Japanese-Sentence/docs/release-guide.md:12), [75](/D:/personal_project/Japanese-Sentence/docs/release-guide.md:75)

- 참조하는 `reports/final-check.md`, `reports/audio-report.md`가 없습니다.
- 음성 약 5,300개라는 설명은 현재 필요 문구 7,262개 및 설정 샘플과 맞지 않습니다.
- “코드와 문구는 준비가 끝났다”는 표현은 위 결함과 남은 확인 사항을 반영하지 못합니다.
- **재현:** 해당 보고서 경로를 열고 음성 검사 결과와 비교합니다.
- **대응:** 완료·미완료·검증 증거를 실제 상태로 갱신하세요.

**그 밖의 확인 결과**

- **검색:** 전체 카드의 일본어 표기 정확 검색에서 해당 카드가 결과에 없는 사례는 0건이었습니다. 히라가나·가타카나·반각 정규화 검증도 통과했습니다. 대화문·용어집은 현재 카드 검색 대상이 아닙니다.
- **백업:** 일본어 백업 왕복과 영어 앱 `app: "lingoloop"` 백업 거절이 통과했습니다.
- **읽기 설정:** 기본값 `after`, 정상값 유지·잘못된 값 복구를 확인했습니다. 가나는 뜻 보기 후 로마자 표시, 퀴즈는 채점 후 읽기 표시로 별도 동작합니다.
- **혼합 글꼴:** [Txt.tsx:40](/D:/personal_project/Japanese-Sentence/src/components/Txt.tsx:40)은 일반 문자열의 한글·일본어를 분리합니다. 폰트 실패 시 기본 글꼴로 진행하는 방어도 있습니다. 실제 자형·줄 높이·스크린리더 발음은 미확인입니다.
- **음성:** 생성기와 앱은 공통 `speakText/speakExample`을 사용하며, 대화문 A/B 키도 일치합니다. 다만 위 다의어 충돌은 별도 문제입니다. `ja-JP-` 음성명 가드와 런타임 `ja-JP` 설정이 있습니다.
- **환경변수:** 앱 코드에서 TTS 환경변수를 참조하지 않습니다. `.env`에는 `EXPO_PUBLIC_` 변수가 없었고, 값은 출력하지 않았습니다. 인증 토큰을 manifest에 저장하거나 출력하는 코드도 발견하지 못했습니다.
- **설정·아이콘:** 이름과 Bundle ID는 일본어 앱으로 분리되어 있습니다. 아이콘은 실제로 확인했으며 `あ`가 있는 일본어 디자인, 1024×1024 RGB입니다. 설정 introspection에서 마이크 권한·iOS 백그라운드 오디오 선언은 발견하지 못했습니다. 최종 네이티브 권한 병합 결과는 빌드 후 확인해야 합니다.
- **개인정보·지원 문구:** 로컬 저장·선택적 알림·기기 백업·수동 백업·TTS 대체 설명은 대체로 코드와 맞습니다. 앱 코드에서 분석·광고·사용자 데이터 전송 경로는 발견하지 못했습니다.
- **공개 URL:** 로컬 사이트 파일은 있지만, 공개 URL 요청은 도구 접근 실패로 **정상 제공 여부를 확인하지 못했습니다**. 문서에도 Pages 미배포로 기록되어 있습니다. 404로 확정하지 않습니다.
- **영어 앱 잔재 검색:** `rg`로 `English-Sentence`, `다시봄`, `dasibom`, 영어 TTS 언어·기존 출처를 검색했습니다. 실행 코드·사이트의 잘못된 영어 앱 이름/URL은 발견하지 못했습니다. 원본 프로젝트 언급은 README·기획·작업 프롬프트에 남아 있고, 영어 백업 테스트와 숫자 서식 `en-US`는 의도된 사용입니다.

**(a) 출시 전 반드시 고칠 것**

1. 빈칸·읽기·문장 퀴즈의 복수 정답을 차단하세요.
2. 다의어 음성 키를 분리하고 해당 파일을 다시 검증하세요.
3. 퀴즈 중복 채점과 백업 복원 후 알림 예약 불일치를 수정하세요.
4. 음성 검사기를 보완하고, 생성 종료 후 manifest·파일 전수 검사를 통과시키세요.
5. 글꼴 고지를 동봉하고 Google TTS 결과물 사용 조건의 미확인 항목을 정리하세요.
6. 개인정보·지원 URL 공개 접근과 출시 문서의 증거를 확인하세요.
7. TestFlight에서 비행기 모드·무음 모드·작은 화면/큰 글자·알림·백업을 확인하세요.

**(b) 출시 전에 넣으면 좋은 기능 상위 5개**

읽기 설정·가나 카드·헷갈린 카드 복습·백업·알림은 이미 있습니다. 아래는 이를 보완하는 제안입니다. **필수 수정이 끝난 뒤 여력이 있을 때만** 추가하세요.

| 순위 | 기능 | 사용자 이득 | 난이도 | 시점 |
|---|---|---|---|---|
| 1 | 카드별 읽기 잠깐 보기 | 전역 설정을 바꾸지 않고 어려운 한자만 확인 | 작음 | 출시 전 |
| 2 | N5/N4/N3·가나 종류별 진입 | 실력에 맞는 학습 시작점 선택 | 중간 | 출시 전 |
| 3 | 퀴즈 결과 → 이번 오답만 즉시 복습 | 틀린 직후 기억을 보완 | 중간 | 출시 전 |
| 4 | 가나 오십음도와 해당 카드 연결 | 글자 위치·탁음·요음을 체계적으로 학습 | 중간 | 출시 전 |
| 5 | 모바일 백업 파일 저장·선택 | 긴 JSON 복사 없이 기기 이전 | 중간 | 출시 전 |

**(c) 출시 후로 미룰 것**

| 기능 | 이득 | 난이도 |
|---|---|---|
| 한자별 관련 단어·읽기 묶음 | 한자를 단어 관계로 학습 | 중간 |
| 한자 필기·획순·부수 | 쓰기까지 확장 | 큼 |
| 글자별 루비 | 긴 문장 읽기 편의 | 큼 |
| 가나 듣기 전용·장단음/촉음 훈련 | 한글 독음 의존 감소 | 중간 |
| 알림 테스트 버튼·복습량별 알림 | 예약 확인과 학습 유도 | 작음~중간 |
| 계정·클라우드 동기화 | 여러 기기 연속 학습 | 큼 |
| 발음 평가·N2 이상 확장 | 학습 범위 확대 | 큼 |

지금은 **퀴즈 정답 신뢰성 → 음성 식별과 완성 검증 → 알림·실기기 확인** 순서로 진행하는 것이 좋습니다.

