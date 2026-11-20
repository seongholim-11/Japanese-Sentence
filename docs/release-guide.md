# iOS 출시 가이드 (링고루프 일본어)

코드와 문구는 준비가 끝났어요. 아래는 **직접 하셔야 하는 단계**를 순서대로 적은 거예요. 확인한 것과 못 한 것을 구분해 두었어요. (영어 앱 출시 가이드를 일본어 앱 기준으로 다시 썼어요.)

## 0. 현재 상태 (2026-11-15 다시 실행해 확인함)

| 항목 | 상태 |
| --- | --- |
| 타입 검사 / 콘텐츠 검증 / 앱 로직 테스트 / 스토어 문구 | 모두 통과 (가나 208 · 단어 2,521 · 문형·표현 212 · 문장 850 · 대화문 82편) |
| 음성 | 7,264개, 누락·빈 파일·고아·경로 오류 0, 약 48.8MB (`reports/audio-report.md`) |
| `expo-doctor` | 20/20 통과. iOS 번들 내보내기 성공 (`reports/final-check.md`) |
| 로컬 웹 | 홈·가나·단어 카드·퀴즈·대화문·기록 화면 렌더링 확인 (캡처 스크립트로 6개 화면 촬영) |
| 앱 이름 / Bundle ID | 링고루프 일본어 / `com.damadu.lingoloop.ja` — **App Store Connect에서 사용 가능 여부 확인 필요** |
| 버전 / 빌드 번호 | `1.0.0`, 빌드 번호는 `eas.json`의 `autoIncrement`로 자동 증가. `eas init` 전이라 프로젝트 ID는 아직 없음 |
| GitHub 저장소 / Pages | 완료: https://github.com/seongholim-11/Japanese-Sentence (공개, `main` 푸시됨), 배포 성공 |
| 개인정보처리방침 / 지원 URL | 열림 확인(200): https://seongholim-11.github.io/Japanese-Sentence/privacy/ , .../support/ |
| 스토어 문구 | `docs/store-listing.md` (글자 수 통과) |
| 스크린샷·미리보기 | iPhone 6.9형 6장(1320×2868) `docs/store-previews/iphone-6.9/`, iPad 13형 6장(2064×2752) `docs/store-previews/ipad-13/`. 웹 캡처 합성이라 상태바가 없음. **헤더·검색 결과·유니버설 이미지는 없음** |
| 직접 확인 못 한 것 | 실기기 동작 전부, iOS 빌드·서명·업로드, 앱스토어 이름 중복, **음성 청취 품질**(음성은 Aoede/Charon 임시 지정), Google Cloud TTS 요금·약관 |

### 남은 일 (순서대로)

1. (직접) Apple Developer 로그인 → App Store Connect 앱 등록(2절)
2. (직접) `eas init` → `eas build --platform ios --profile production` → `eas submit` (4절). `eas init`이 `app.json`에 프로젝트 ID를 추가하면 커밋·푸시
3. (직접) TestFlight 실기기 점검(5절). 가능하면 실기기 캡처로 스크린샷 교체
4. (직접) 음성 청취: 한 글자 가나 23개(짧은 파일), 다의 읽기 문장, 대화문 A/B 목소리. 샘플 `assets/audio-samples/Aoede/` (`npm run audio -- --sample=N`)
5. (요청 시 제작) 헤더·검색 결과·유니버설 이미지: 업로드 칸이 요구하는 크기를 알려 주세요
6. 심사 제출(6절)

## 1. 계정 준비 (먼저 시작하세요)

1. Apple Developer Program 가입(영어 앱에서 쓴 계정 그대로 사용). 로그인·결제는 직접 하세요.
2. https://appstoreconnect.apple.com 에서 약관 동의 후 "앱" 메뉴 확인.
3. EAS CLI: `npm install -g eas-cli` 후 `eas login`.
4. GitHub 저장소와 Pages는 **이미 완료**됐어요(`.github/workflows/pages.yml`이 `site/` 폴더만 배포, 앱 웹 버전은 올리지 않음).

## 2. 앱 등록 (App Store Connect)

| 칸 | 넣을 값 |
| --- | --- |
| 플랫폼 | iOS |
| 이름 | `링고루프 - 일본어 회독` (이미 쓰는 이름이면 거절돼요 → 대안 필요) |
| 기본 언어 | 한국어 |
| 번들 ID | `com.damadu.lingoloop.ja` |
| SKU | 고유 문자열 (예: `lingoloop-ja-ios-1`) |

앱 정보·가격·개인정보 값은 `docs/store-listing.md`에 있어요. 이름·부제·키워드·설명·프로모션 텍스트는 그대로 붙여 넣고, 연령 등급 설문은 같은 문서의 표를 보고 **App Store Connect의 최신 질문에 직접** 답하세요(목표 13+).

심사 메모(그대로 붙여 넣기):

```
로그인이나 계정이 필요 없는 오프라인 학습 앱입니다. 모든 일본어 음성은 앱에 포함되어 인터넷 없이 재생됩니다.
알림은 설정 > 복습 알림을 켤 때만 권한을 요청합니다. 데이터는 기기 안에만 저장되고 서버로 전송하지 않습니다.
```

## 3. 스크린샷·미리보기

만든 것: iPhone 6.9형 6장, iPad 13형 6장(위 0절 경로). 재생성은 `node docs/store-previews/src/capture.cjs`(웹 서버 `npx expo start --web --port 8099` 필요) 후 `node docs/store-previews/src/build.cjs`(iPad는 `ipad` 인자).
규격(2026-11 기준 알려진 값, **업로드 칸이 요구하는 크기를 App Store Connect에서 다시 확인**): iPhone 6.9형 1320×2868, iPad 13형 2064×2752, 헤더 3840×1646, 검색 결과 3840×2560, 유니버설 5244×2950(PNG, 알파 없음). 헤더·검색 결과·유니버설은 아직 없어요. 웹 캡처에는 상태바가 없으니 TestFlight 실기기 캡처로 바꾸는 편이 안전해요. 한글·일본어 글자는 AI 이미지 생성기로 그리지 않고 HTML 글꼴로 얹었어요.

## 4. 빌드와 업로드 (Windows에서도 가능)

```
eas init
eas build --platform ios --profile production
eas submit --platform ios --latest
```

- `eas init`: 새 Expo 프로젝트를 만들고 `app.json`에 프로젝트 ID를 추가해요(영어 앱 ID는 지워 둠). 변경은 커밋하세요.
- `eas build`: Apple 로그인(2단계 인증)이 필요해요. 빌드 번호는 `eas.json`의 `autoIncrement`로 올라가요.
- `eas submit`: App Store Connect로 올려요.

## 5. TestFlight 실기기 점검표 (제출 전에 꼭)

- [ ] 첫 실행: 홈의 "처음이세요?" 안내와 "가나 1세트 시작하기"가 동작
- [ ] **무음 스위치를 켠 채** 가나·단어·예문·대화문 음성이 나오는지 / 비행기 모드에서도 나오는지
- [ ] 읽기(후리가나) 표시 3가지(뜻 보기 후·항상·숨김)가 학습·대화문·검색·퀴즈에서 일관되게 동작
- [ ] 일본어 글꼴: 한자가 중국어·한국어 글자 모양이 아니라 일본어 모양으로 보이는지, 글꼴 첫 로딩 속도
- [ ] 작은 iPhone(SE 등) + 글자 크기 "아주 크게": 읽기 줄이 더해진 카드·대화문·퀴즈 보기가 잘리지 않는지
- [ ] 대화문 전체 듣기(A/B 두 목소리), 도중에 뒤로 가기
- [ ] 퀴즈: 읽기 고르기·빈칸·가나 문제가 정상 출제되고 정답이 맞는지
- [ ] 복습 알림: 권한 허용 → 시각 변경 → 그 시각에 알림, 거부했을 때 안내
- [ ] 백업 내보내기 → 가져오기 복원, **영어 앱 백업은 거절되는지**
- [ ] 한 손 조작, 카드 빠른 연타, "직전 채점 취소"
- [ ] 설치 용량(글꼴 + 음성 mp3 약 7,260개(약 49MB))과 첫 실행 속도
- [ ] iPad 세로 화면 가운데 열(마음에 안 들면 `supportsTablet: false`)

## 6. 제출·거절 대비

심사 제출은 App Store Connect에서 직접 하세요. 거절 사유가 나오면 알려 주세요.

| 이유 | 이 앱의 대비 |
| --- | --- |
| 개인정보처리방침 URL이 안 열림 | 새 저장소의 Pages가 켜져 있어야 해요 |
| 최소 기능(4.2) | 오프라인 음성, 알림, 간격 복습, 백업 등 앱 기능이 있어요 |
| 메타데이터 불일치 | 스크린샷은 실제 앱 화면과 같아야 해요 |
| 연령 등급 | 설문을 정직하게 답했는지 |
| 이름 중복·상표 | 이름이 중복이면 대안이 필요해요 |
| "JLPT" 표현 | 스토어 문구는 "비공식 구분"으로 표기했고 합격 보장 표현이 없어요 |

## 7. 출시 후

- v1.0.1: 오류 신고(GitHub 이슈) 반영 빠른 수정 업데이트를 계획해요(DECISIONS #17의 위험 대응).
- 개인정보 관련 기능(계정·분석·광고)을 추가하면 방침과 App Privacy 답변을 먼저 고쳐야 해요.
- 후보: 가나 쓰기 순서, 한자 위 루비, N2 단어.

## 8. 알려진 한계

- 일본어 콘텐츠는 AI 교차검수만 거쳤고 원어민 검수는 하지 않았어요(DECISIONS #17). 오류 신고 경로는 지원 페이지에 있어요.
- 합성 음성의 다의 읽기(行った, 今日 등) 오류 가능성이 있어요. 음성 청취는 사용자가 해야 해요.
- 알림 문구는 고정이에요. 백업은 복사·붙여넣기 방식이에요. 안드로이드는 출시 준비를 하지 않았어요.
- 한자 쓰기(필기·획순)는 지원하지 않아요.
- Google Cloud TTS의 요금·무료 한도·결과물 사용 조건은 공식 문서에서 직접 확인하지 못했어요(`docs/LICENSES-RESEARCH.md`).

## 부록. 스크린샷 크기별 폴더 (업로드 오류 "파일 크기가 유효하지 않습니다" 대응)

App Store Connect는 **칸마다 허용 크기가 정해져 있어요.** 올리려는 칸의 안내 문구를 보고 아래 폴더에서 고르세요(모두 알파 채널 없는 RGB PNG, 6장씩).

| 칸 | 폴더 (크기) |
| --- | --- |
| iPhone 6.9형 | `iphone-6.9` (1320×2868), `iphone-6.9-1290x2796` |
| iPhone 6.5형 | `iphone-6.5-1284x2778`, `iphone-6.5-1242x2688` |
| iPhone 6.3형 | `iphone-6.3-1206x2622` |
| iPad 13형 | `ipad-13` (2064×2752) |
| iPad 12.9형 | `ipad-12.9-2048x2732` |

모두 `docs/store-previews/` 아래에 있어요. 허용 크기는 Apple이 바꿀 수 있으니 칸의 안내가 최종 기준이에요. 변환 스크립트: `docs/store-previews/src/resize.cjs`.

## 부록 2. 심사 중 새 빌드 올리기 (2026-11-20 기준)

2026-11-16 Apple이 "추가 정보 필요(2.1)"로 회신했어요(거절 아님). 답변 문구와 화면 녹화 순서는 `docs/review-notes.md`에 있어요.
그 뒤 바뀐 점: 가나를 분류 8세트로 나눔, 뜻 보기 내용을 버튼 위로 이동, 거의 빈 소리였던 짧은 음성 46개 재생성, 대화문 제목 한글화, 재생 중 말풍선 테두리 잘림 수정.

순서(Apple 로그인이 필요한 단계는 직접):

1. `eas build --platform ios --profile production` → 끝나면 빌드 번호가 자동으로 올라가요(`appVersionSource: remote`). 버전은 `1.0.0` 그대로 두면 돼요.
2. `eas submit --platform ios --latest` → App Store Connect에서 "처리 중"이 끝날 때까지 기다려요(보통 10~30분, 메일이 와요).
3. TestFlight(내부 테스트 그룹에 본인과 새 빌드 추가)에서 실기기로 설치해 **화면 녹화**를 찍어요(순서는 `docs/review-notes.md`).
4. App Store Connect > 앱 버전 > "빌드"에서 **새 빌드를 선택**하고, 앱 심사 정보 > 메모에 `docs/review-notes.md`의 영문 블록을 붙인 뒤 다시 제출해요.

확인 못 한 것: 실기기 동작, 새 가나 세트 화면, 수정한 음성의 실제 발음, `expo` 패치 버전 차이 1건(`npx expo install --check`로 확인, 빌드엔 영향 없음).
