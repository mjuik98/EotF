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
- 최근 방향: 대형 UI/런타임 파일을 더 작은 facade/service/helper 단위로 분리
- 검증 루프: `Vitest`, `Vite build`, Playwright 기반 브라우저 확인

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
│   ├── core/        # bootstrap, registry, runtime contracts
│   ├── features/    # title/run/combat/event 등 기능 단위 slice
│   ├── platform/    # browser/legacy/storage adapters
│   ├── presentation/# presenter/facade/view-model
│   ├── state/       # cross-feature state commands
│   └── ui/          # 기존 UI 구현 및 compat re-export 경계
├── data/            # 카드, 적, 이벤트, 유물, 지역 데이터
├── tests/           # 회귀 테스트
├── docs/            # 아키텍처/운영 문서
└── vibe_templates/  # AI 작업용 기록 템플릿 세트
```

## Development Commands

```bash
# 개발 서버
npm run dev

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

- `game/core/`: bootstrap, registry, runtime contracts만 유지
- `game/features/`: 기능 단위의 `app/state/presentation/platform` 경계로 신규 코드 추가
- `game/platform/legacy/`: `GAME`, `window.*`, 기존 API 이름을 유지하는 호환 shim
- `game/ui/`: 기존 UI 구현과 compat entry를 단계적으로 축소
- `data/`: 정적 게임 데이터, 브라우저 전역 side effect는 platform/legacy 쪽으로 이동 중

최근 리팩터링의 기준은 feature slice 중심 모듈화, 레거시 의존성 고립, 상태 변경 경로 축소입니다.

## Developer Docs

- [progress.md](progress.md): 현재 상태와 최근 핵심 변화
- [docs/architecture_boundaries.md](docs/architecture_boundaries.md): 레이어 경계와 품질 가드
- [docs/scaling_playbook.md](docs/scaling_playbook.md): 구조 개선 방향
- [docs/metrics/dependency_map.md](docs/metrics/dependency_map.md): 의존성 메트릭
- [vibe_templates/README.md](vibe_templates/README.md): AI 작업용 기록 템플릿 안내
- [vibe_templates/ARCHITECTURE.md](vibe_templates/ARCHITECTURE.md): AI 시작용 아키텍처 요약

## License

ISC
