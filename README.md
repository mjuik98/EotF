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
├── game/            # 게임 로직, 서비스, UI, runtime
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

이 프로젝트는 레이어 경계를 강하게 유지하는 편입니다.

- UI는 `game/ui/`
- 핵심 규칙과 계산은 `game/domain/`, `game/combat/`
- 유스케이스/서비스 조합은 `game/app/`
- 진입점, 상태, composition은 `game/core/`
- 정적 게임 데이터는 `data/`

최근 리팩터링은 전역 접근을 줄이고, UI와 도메인 로직을 더 명확히 분리하는 방향으로 진행 중입니다.

## Developer Docs

- [progress.md](progress.md): 현재 상태와 최근 핵심 변화
- [docs/architecture_boundaries.md](docs/architecture_boundaries.md): 레이어 경계와 품질 가드
- [docs/scaling_playbook.md](docs/scaling_playbook.md): 구조 개선 방향
- [docs/metrics/dependency_map.md](docs/metrics/dependency_map.md): 의존성 메트릭
- [vibe_templates/README.md](vibe_templates/README.md): AI 작업용 기록 템플릿 안내
- [vibe_templates/ARCHITECTURE.md](vibe_templates/ARCHITECTURE.md): AI 시작용 아키텍처 요약

## License

ISC
