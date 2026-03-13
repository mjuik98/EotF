# ECHO OF THE FALLEN

기억의 잔향이 뒤엉킨 미궁을 탐색하며 덱을 성장시키는 로그라이크 덱빌딩 RPG입니다. 클래스, 카드, 유물, 이벤트를 조합해 매 런마다 다른 전투 흐름을 만들고, 조각난 세계의 기록을 하나씩 복원하는 경험을 목표로 합니다.

## What Is This?

`ECHO OF THE FALLEN`은 브라우저에서 실행되는 JavaScript 기반 싱글플레이 덱빌딩 게임입니다. 현재는 플레이 가능한 프로토타입이자, 동시에 구조 개선과 안정화가 계속 진행 중인 개발 중 프로젝트입니다.

## Core Features

- 로그라이크 덱빌딩 전투
- 클래스 선택과 클래스별 특성 구성
- 카드, 유물, 상태 이상 기반의 시너지 빌드
- 이벤트 선택지와 보상 분기
- 맵/미로 진행과 런 흐름 관리
- 도감(Codex)과 진행 기록 UI
- 런 규칙, 각인, 난이도 확장 구조

## Current Status

- 개발 단계: playable prototype
- 현재 초점: 신규 기능보다 리팩터링, 구조 정리, 회귀 방지
- 최근 방향:
  - `feature-local app/use_case/state/presentation/platform` 경계를 늘리고, 기존 `ui/*`와 `platform/legacy/*`는 compat facade로 점진 축소
  - 현재 리팩토링 중심축은 `combat + state`, `title/ending/help_pause`, `reward/navigation`
  - 최근 배치에서 `reward/navigation` alias surface를 공통화했고, `help_pause`/`ending`도 overlay/payload/session bootstrap을 runtime helper 단위로 분리해 UI shell을 더 얇게 만들고 있음
- 최신 검증 기준:
  - `npm run lint`
  - `npm test` (`371 files / 869 tests` PASS 기준)
  - `npm run build`
  - Playwright 기반 브라우저 smoke + `render_game_to_text` 확인 (`output/web-game/arch-refactor-smoke-34`)

자세한 현재 상태와 최근 작업 요약은 [progress.md](progress.md)에서 확인할 수 있습니다.

## Quick Start

```bash
npm install
npm run dev
```

개발 서버 실행 후 브라우저에서 Vite가 안내한 로컬 주소를 열면 됩니다.

프로덕션 빌드와 프리뷰:

```bash
npm run build
npm run preview
```

## Tech Stack

- `JavaScript`
- `Vite`
- `Vitest`
- Playwright 기반 브라우저 검증

## Project Structure

```text
.
├── game/
│   ├── core/         # bootstrap, registry, event/runtime kernel, contracts
│   ├── features/     # feature-local app/state/presentation/platform 경계
│   ├── platform/     # browser/legacy/storage adapters
│   ├── presentation/ # transition-layer presenter/facade/view-model
│   ├── state/        # cross-feature state commands
│   └── ui/           # 기존 UI 구현 및 compat entry 경계
├── data/            # 카드, 적, 이벤트, 유물, 지역 데이터
├── tests/           # 회귀 테스트
└── docs/            # 아키텍처/운영 문서
```

현재 신규 구조 작업은 가능하면 `game/features/<feature>/...` 아래에 추가하고, 기존 `game/ui/*`는 touched flow만 얇게 만드는 방향을 따른다.

## Development Commands

```bash
# 개발 서버
npm run dev

# 생성 산출물 정리
npm run clean

# 테스트
npm run test
npm run test:coverage

# 빌드 / 프리뷰
npm run build
npm run preview

# 구조 및 품질 검사
npm run lint
npm run quality
```

## Architecture Notes

이 프로젝트는 전면 재작성보다 점진적 구조 개선을 우선합니다.

- 목표 흐름: `Input -> feature app -> state/domain -> presentation -> platform adapter -> ui shell`
- `game/core/`: bootstrap, registry, routing, event/runtime kernel만 유지
- `game/features/`: 신규 로직의 기본 진입점. feature-local `app/use_case/state/presentation/platform` 경계 우선
- `game/platform/legacy/`: `GAME`, `window.*`, 기존 API 이름을 유지하는 호환 shim
- `game/ui/`: 기존 UI 구현과 compat entry를 단계적으로 축소
- `data/`: 정적 게임 데이터. 브라우저 전역 side effect는 `platform/browser` 또는 `platform/legacy`로 이동

최근 리팩터링 기준은 다음 세 가지입니다.

- feature slice 중심 모듈화
- 레거시/global 의존성 고립
- direct state mutation과 화면 정책 중복 축소

## Developer Docs

- [progress.md](progress.md): 현재 상태와 최근 핵심 변화
- [docs/architecture_boundaries.md](docs/architecture_boundaries.md): 레이어 경계와 품질 가드
- [docs/scaling_playbook.md](docs/scaling_playbook.md): 구조 개선 방향
- [docs/metrics/dependency_map.md](docs/metrics/dependency_map.md): 의존성 메트릭

## License

ISC
