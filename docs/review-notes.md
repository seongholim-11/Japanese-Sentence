# 심사 답변 (Guideline 2.1 - Information Needed)

2026-11-16 Apple이 "추가 정보 필요"로 반려(거절 아님, 정보 요청)했어요. 아래 영문 블록을 App Store Connect > 앱 심사 정보 > **메모(Notes)** 에 붙여 넣고 다시 제출하세요. 심사관은 영어로 읽으므로 영어로 썼어요.

## 직접 해야 하는 것: 1번 화면 녹화

문서로 대신할 수 없어요. 실기기(최신 iOS)에서 아래 순서로 녹화하세요(약 1~2분).

1. 홈 화면에서 앱 아이콘을 눌러 **앱 실행**부터 녹화 시작
2. 홈 → "가나 1세트 시작하기" → 카드 몇 장 넘기며 🔊 음성 재생(무음 스위치 켠 상태에서도 소리 나는지 같이 확인)
3. 비행기 모드를 켠 채 다른 카드 음성 재생(오프라인 동작 증명)
4. 덱 목록 → 단어/문형/문장 덱 → 세트 퀴즈 풀기
5. 대화문 → 일본어 가리기 → 전체 듣기
6. 검색 → 기록(통계) 화면
7. 설정 → 복습 알림 켜기(권한 팝업) → 백업 내보내기 화면

이 앱엔 **계정·로그인·계정 삭제·사용자 작성 콘텐츠·유료 기능이 없으니** 녹화에 넣을 필요 없어요(메모에 없다고 적어 둠). 녹화 파일은 Notes 칸에 못 넣을 수 있으니, App Store Connect의 앱 심사 정보에 첨부 칸이 있으면 거기에 올리고, 없으면 링크(공개 비공개 링크 영상)를 Notes에 적으세요. 첨부 방식은 제가 확인하지 못했어요. 화면에 알림 팝업이나 개인 정보가 비치지 않게 하세요.

## Notes에 붙여 넣을 문구 (English)

```
Thank you for the review. Answers to the requested items:

1. SCREEN RECORDING
A screen recording captured on a physical device (latest iOS) is attached / linked below. It starts from launching the app and shows the typical flow: first-run guide, studying cards with audio, set quiz, dialogues, search, statistics, and enabling the optional review reminder.
The app has no account registration, login, account deletion, user-generated content (so no reporting/blocking), and no paid content or In-App Purchases.
Recording: <PASTE LINK HERE IF NOT ATTACHED>

2. PURPOSE AND TARGET AUDIENCE
"Lingoloop Japanese" is a study app for Korean-speaking learners of Japanese, from absolute beginners (kana) to roughly N3 level. Problem: learners read a word list once and forget it. The app splits content into small sets (kana 208, words 2,521, grammar patterns/expressions 212, sentences 850, dialogues 82) and has users go through each set repeatedly in rounds, with spaced review (1/3/7/14/30-day intervals), per-set quizzes, hide-the-Japanese dialogue practice, and optional furigana-style readings. The UI is in Korean. The N5/N4/N3 labels are an unofficial grouping by the developer, not affiliated with or endorsed by the JLPT organizers.

3. HOW TO USE THE MAIN FEATURES
No login, account, or sample file is needed. Everything works right after launch.
- Home: tap "Start kana set 1" (first run) to begin a study round. Tap a card to see the meaning; mark "I know" / "Again".
- Decks tab: choose Kana / Words / Patterns / Sentences / Dialogues, then a set.
- Speaker icon on a card plays bundled Japanese audio.
- Quiz: available at the end of a set (meaning, reading, blank, sentence questions).
- Dialogues: open one, use "hide Japanese" and "play all".
- Settings: reading display, speech speed, optional daily review reminder (notification permission is requested only when the user turns the reminder on), backup export/import (copy and paste text), licenses.

4. EXTERNAL SERVICES
At runtime the app uses NO external services: no server, no network requests, no analytics, no advertising, no authentication or payment provider. Progress is stored only on the device. Reminders are local notifications (no push server).
At development time only: the Japanese audio files were pre-generated with Google Cloud Text-to-Speech (ja-JP voices) and are bundled in the app, so they play offline. The study content (words, sentences, dialogues) was written by the developer with AI assistance and cross-checked; it is not fetched from any service. Builds are made with Expo EAS.

5. REGIONAL DIFFERENCES
None. Features and content are identical in all regions. The interface language is Korean.

6. REGULATED INDUSTRY / THIRD-PARTY MATERIAL
The app is not in a regulated industry. It contains no third-party protected content such as dictionaries, textbooks, or JLPT past exams; all study content is original. Bundled fonts (Noto Sans JP, IBM Plex Sans KR, Space Grotesk) are licensed under the SIL Open Font License; the notices are shown in Settings > Licenses.

Privacy policy: https://seongholim-11.github.io/Japanese-Sentence/privacy/
Support: https://seongholim-11.github.io/Japanese-Sentence/support/
```

## 확인 후 제출 전에

- Notes 문구의 수치(가나 208 등)는 현재 앱 기준이에요. 콘텐츠를 바꿨다면 맞춰 고치세요.
- 설정 화면에 "라이선스" 메뉴가 실제로 있는지, "가나 1세트 시작하기" 문구가 앱과 같은지 실기기에서 한 번 보고 다르면 Notes를 고치세요.
- 빌드는 바꿀 필요 없어요. 메타데이터(Notes)만 채워 **다시 제출**하면 돼요.
