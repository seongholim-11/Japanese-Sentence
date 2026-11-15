**높음 등급 문제는 확인하지 못했습니다. 중간 3건·낮음 2건을 발견했습니다.** 파일은 수정하지 않았습니다.

검증 결과는 모두 통과했습니다.

| 검증 | 결과 |
|---|---|
| `npm.cmd run typecheck` | 통과 |
| `node scripts/check-app.cjs` | 7,375문제 생성, 전체 통과 |
| `node scripts/validate-content.cjs` | 오류 0·경고 0 |

아래의 **직접 확인**은 Node에서 앱 로직 실행, 네이티브 모듈을 대체한 컴포넌트 출력 검사, 메모리에서만 데이터를 바꾼 검증을 뜻합니다. 실제 기기 화면·터치·글꼴 렌더링은 확인하지 않았습니다.

1. **[중간 / 직접 확인] 읽기 ‘숨김’ 설정이 일부 화면에서 무시됩니다.**

   파일: [SearchScreen.tsx:138](/D:/personal_project/Japanese-Sentence/src/screens/SearchScreen.tsx:138), [DialogueScreen.tsx:178](/D:/personal_project/Japanese-Sentence/src/screens/DialogueScreen.tsx:178), [DialogueScreen.tsx:196](/D:/personal_project/Japanese-Sentence/src/screens/DialogueScreen.tsx:196)

   재현: 설정에서 읽기를 **숨김**으로 변경합니다. 검색에서 `私は韓国人です。` 카드를 펼치면 `わたしはかんこくじんです。`가 표시됩니다. 대화문의 `お願いします` 표현을 펼쳐도 표제어·예문의 읽기가 표시됩니다.

   원인: 이 경로들은 읽기 설정을 검사하지 않습니다. 학습 화면·대화 말풍선과 동작이 달라집니다.

   **코드 확인 추가:** [QuizScreen.tsx:147](/D:/personal_project/Japanese-Sentence/src/screens/QuizScreen.tsx:147)도 설정을 전달받지 않고 답을 선택하면 읽기를 표시합니다. 읽기 자체가 정답인 문제와 보조 읽기 표시는 구분해 적용해야 합니다.

2. **[중간 / 직접 확인] 콘텐츠 검증기가 영문 잔재·가나 금지어를 놓칩니다.**

   파일: [validate-content.cjs:65](/D:/personal_project/Japanese-Sentence/scripts/validate-content.cjs:65), [validate-content.cjs:103](/D:/personal_project/Japanese-Sentence/scripts/validate-content.cjs:103)

   파일을 건드리지 않고 입력만 메모리에서 바꿔 다음을 확인했습니다.

   | 잘못된 입력 | 검증 결과 |
   |---|---|
   | 단어의 한국어 뜻을 `eat`으로 변경 | 오류 0건 |
   | 가나 문자를 `English`로 변경 | 오류 0건 |
   | 가나 예 단어·읽기를 금지어 `バカ`로 변경 | 오류 0건 |

   원인: 한국어 검사에 영문 검출이 없고, 가나 분기는 공통 문자열·금지어 검사를 호출하지 않습니다. 현재 샘플의 오류라는 뜻은 아니지만, 이후 콘텐츠를 추가할 때 검증 통과를 신뢰하기 어렵습니다.

3. **[중간 / 직접 확인] 상표 검사가 정상적인 일반 명사를 차단합니다.**

   파일: [validate-content.cjs:30](/D:/personal_project/Japanese-Sentence/scripts/validate-content.cjs:30), [validate-content.cjs:63](/D:/personal_project/Japanese-Sentence/scripts/validate-content.cjs:63)

   재현: 메모리에서 `スイカ / 수박 / スイカを食べます。` 카드를 추가하고 검증합니다. 표기·읽기·예문·예문 읽기에 상표 오류가 총 4건 발생합니다.

   원인: `スイカ`를 문맥과 관계없이 상표로 처리합니다. 부분 문자열 비교이므로 `ライン`이 포함된 일반 표현도 차단될 수 있습니다. 일반어와 상표가 겹치는 항목은 별도 검토나 예외 처리가 필요합니다.

4. **[낮음 / 직접 확인] 전체 검색과 즐겨찾기 검색의 대상 필드가 다릅니다.**

   파일: [SearchScreen.tsx:42](/D:/personal_project/Japanese-Sentence/src/screens/SearchScreen.tsx:42), [search.ts:30](/D:/personal_project/Japanese-Sentence/src/search.ts:30)

   재현: `저는 한국 사람이에요.` 문장을 즐겨찾기합니다. 전체 검색에서 `국적`을 검색하면 해당 카드가 나오지만, 즐겨찾기 탭에서는 나오지 않습니다.

   원인: 전체 검색은 `note`를 포함하지만 즐겨찾기 검색은 제외합니다. 동일한 검색 필드 구성을 공유해야 합니다.

5. **[낮음 / 코드 확인] 검색 검증 한 줄이 항상 통과합니다.**

   파일: [check-app.cjs:118](/D:/personal_project/Japanese-Sentence/scripts/check-app.cjs:118)

   재현: `has('アイス', 'ア')`가 어떤 값을 반환해도 `=== false || true` 때문에 검증은 통과합니다.

   이 항목은 실제 검색 동작을 검증하지 못합니다. 기대 결과를 명시한 조건으로 바꿔야 합니다.

추가로 확인한 정상 동작은 다음과 같습니다.

- 저장 키는 `lingoloop-ja/progress/v1`, 백업 앱 ID는 `lingoloop-ja`로 분리되어 있습니다. 영어 앱 백업도 거절합니다.
- 읽기 기본값은 `after`이며, 정상 설정의 백업 왕복·잘못된 설정의 기본값 복구·백업 미리보기 후 세트 크기 복원이 정상입니다.
- 기본 한·일 혼합 문자열은 `Txt`에서 한국어와 일본어 글꼴로 분리됩니다. 실제 기기의 한자 모양·잘림·폴백은 미검증입니다.
- 생성한 퀴즈에서는 보기 문자열 중복·정답과의 쉼표 단위 뜻 겹침·빈칸 복원 오류가 검출되지 않았습니다. 의미상 복수 정답이나 오답의 자연스러움까지 보장하는 검사는 아닙니다.
- 검사한 범위에서 사용자에게 표시되는 영어 앱 문구는 발견하지 못했습니다. [StudyScreen.tsx:60](/D:/personal_project/Japanese-Sentence/src/screens/StudyScreen.tsx:60)의 “영어가 보이는”은 주석 잔재입니다.

**M1·M2 완료 전에 우선 고칠 것은 읽기 숨김 누락과 콘텐츠 검증기의 누락·오탐입니다.** 상태 꼬임이나 글꼴 문제의 실기기 재현 여부는 별도 확인이 필요합니다.

