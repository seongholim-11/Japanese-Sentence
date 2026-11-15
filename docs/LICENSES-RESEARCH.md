# 라이선스 조사 기록 (확인 날짜·조건)

> 마지막 갱신: 2026-11-13. DECISIONS #16에 따라 외부 데이터(JMdict 등)는 **앱에 포함·배포하지 않는다**. 아래는 개발 중 참고하거나 도구로 쓴 것의 기록이다. 법률 자문이 아니다.

| 자료·도구 | 용도 | 앱에 포함? | 조건(확인한 것) | 확인 |
| --- | --- | --- | --- | --- |
| 직접 작성한 콘텐츠(AI 초안 + AI 교차검수) | 가나·단어·문형·문장·대화문·용어집 | 예 | 외부 사전·교재 복사 없음. 저자가 직접 작성(AI 생성 포함) | 2026-11-13 |
| kuromoji(npm `kuromoji`, IPADIC 사전 포함) | 읽기 자동 대조(개발용 `scripts/check-readings.cjs`) | 아니오(devDependency) | Apache License 2.0 + IPADIC 사전 라이선스(NAIST/ICOT 계열 조건). 앱·배포물에 포함하지 않아 고지 의무는 개발 단계에 한정됨(확인하지 못한 세부 조건은 출시 전 npm 패키지의 LICENSE로 재확인) | 2026-11-13 |
| JMdict(EDRDG) | 사용하지 않음 | 아니오 | 필요 시 EDRDG 라이선스 확인 필요(이번 버전에서는 참고하지 않음) | - |
| JLPT 단어 목록 | 사용하지 않음 | 아니오 | 공식 목록은 2010년 이후 공개되지 않는 것으로 알려져 있음(확인하지 못함). 레벨은 "비공식 구분"으로만 표기 | - |
| Noto Sans JP / IBM Plex Sans KR / Space Grotesk (`@expo-google-fonts/*`) | 글꼴 | 예 | SIL Open Font License 1.1 | 2026-11-13 |
| Google Cloud Text-to-Speech Chirp 3 HD (ja-JP) | 합성 음성 mp3 | 예(결과물) | Google Cloud 약관·가격 정책을 따름. 결과 음성의 재배포 조건과 요금·무료 한도는 **공식 문서에서 직접 확인하지 못함** → 출시 전 확인 필요 | 확인 필요 |

## 확인하지 못한 것(출시 전 확인)

- Google Cloud TTS 요금·무료 한도의 현재 값과 합성 결과물의 앱 번들 포함 조건
- kuromoji/IPADIC 사전의 정확한 라이선스 문구(앱에 포함하지 않으므로 낮은 위험)
- 실존 상표·인명이 예문에 없는지 최종 확인(자동 스캔은 통과, 목록은 `scripts/validate-content.cjs`의 BRANDS)
