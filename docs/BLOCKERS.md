# 막힌 것·메모 (건너뛰고 기록한 항목)

| # | 항목 | 상태·이유 | 대응 |
| --- | --- | --- | --- |
| 1 | herdr 옆 패널에 Codex 열기 | herdr 서버가 실행 중이 아니고 이 세션이 herdr 관리 패널(`HERDR_ENV`)이 아니라 패널 제어 불가 | 대체: `codex exec -m gpt-6.1-sol`(~/.codex/config.toml의 모델 sol)을 백그라운드로 직접 실행, 결과를 `reports/codex-review-*.md`에 저장 |
| 2 | 음성 청취 확인(표기/읽기 기준·음성 2종 확정) | 소리를 들을 수 없음 | `.env`에 ja-JP-Chirp3-HD-Aoede(main)/Charon(alt)를 임시 지정(영어 앱과 같은 이름 패턴). 표제어는 표기 기준(surface)으로 생성. 청취 후 `--word-source=reading`·`audio-overrides.json`·음성 교체 가능(바꾸면 `npm run audio` 다시) |
| 3 | 스크린샷·미리보기 | iPhone 6.9형 6장 제작(웹 캡처 합성, `docs/store-previews/src/capture.cjs`·`build.cjs`). iPad 13형·헤더·검색 결과 이미지는 미제작 | 사용자가 칸별 요구 크기를 알려 주면 같은 방식으로 제작, 실기기 캡처 권장 |
| 4 | 새 GitHub 저장소·Pages·`eas init`·App Store Connect 등록 | 계정·결제·로그인은 사용자가 직접 | release-guide 순서대로 |
| 5 | 실기기 점검(무음 모드·알림·작은 iPhone 큰 글자) | 환경 없음 | release-guide 5절 점검표 |
| 6 | 원어민 검수 | DECISIONS #17에 따라 하지 않음 | AI 교차검수(Claude 작성 → Codex 2회 검수) + 오류 신고 경로(지원 페이지) + v1.0.1 계획 |
| 7 | Google Cloud TTS 요금·무료 한도·결과물 사용 조건 | 공식 문서를 직접 확인하지 못함 | 출시 전 확인(`docs/LICENSES-RESEARCH.md`). dry-run은 약 6만 자(스크립트가 가정한 무료 한도 100만 자의 약 6%) |
| 8 | `expo-doctor` | 20/20 통과(해결됨) | - |
| 9 | 퀴즈의 의미상 동의어 오답 | 읽기가 같거나 뜻이 겹치는 카드·같은 표기 다른 읽기·같은 한국어 문장은 출제에서 제외하도록 보완함. 읽기·뜻 문자열이 모두 다른 동의어는 막지 못함 | 출시 후 신고 반영 |
| 10 | 패턴 `〜と申します` 예문의 이름 | 문형 특성상 이름이 필요(명세의 '개인 이름 금지'와 충돌하는 유일한 예외) | `田中` 같은 일반 성씨 사용, 실존 인물 아님 |
