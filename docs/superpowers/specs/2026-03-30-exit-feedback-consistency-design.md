# Exit Feedback Consistency Design

## Goal

ESC pause menu와 타이틀 화면의 이탈 액션을 같은 정보 구조로 정렬하고, `게임 종료` 확인 흐름을 브라우저 환경에서도 덜 불안하게 느껴지도록 만든다.

## Decisions

- pause 이탈 구역의 eyebrow는 `세션 이탈`로 통일한다.
- 타이틀 우측 패널은 `저장된 런` 구역과 `세션 이탈` 구역으로 나눈다.
- `게임 종료` 확인은 동일한 shared overlay frame을 유지하되, 브라우저 fallback일 때는 `alert` 대신 오버레이 내부 상태 문구로 후속 안내를 보여준다.
- wrapper/native 환경이 있으면 optional `quitGameRequest` hook으로 종료 요청을 우선 위임한다.

## UI Structure

- pause:
  - 계속 플레이 액션
  - `세션 이탈`
    - `타이틀로 돌아가기`
    - `이번 런 포기`
    - `게임 종료`
- title:
  - `저장된 런`
    - continue card
    - save slot controls
  - main navigation
  - `세션 이탈`
    - quit button

## Runtime Behavior

- native quit hook present:
  - hook 호출 후 confirm overlay 제거
- browser fallback:
  - `window.close()` 시도
  - overlay 유지
  - status text를 `창 닫기를 요청했습니다... 직접 닫아주세요`로 갱신
  - submit button을 disabled 상태의 `종료 요청됨`으로 전환
  - cancel button은 `닫기`로 바꿔 정리 행동을 명확히 한다

## Verification

- unit tests:
  - pause/title copy and section structure
  - quit confirm runtime fallback/native branch
- smoke:
  - pause/quit/return-title shared frame snapshots
  - title section labels and quit meta snapshot
