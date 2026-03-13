Original prompt: 우리 프로젝트 코드를 분석하고, 단순 코드 정리가 아니라 프로젝트 전체 관점에서 구조 개선안을 제시하고, 모듈화/책임 분리/관심사 분리/구조화/공통 로직 일원화/의존성 관리/상태 흐름 정리/유지보수성과 확장성 향상을 목표로 점진적으로 구현한다.

# Progress Summary

This file keeps only the current truth. Historical batch logs were intentionally deleted.

## Current State

- Project status: playable prototype
- Main priority: structural refactor and regression prevention over net-new feature work
- Working direction:
  - grow `feature-local application/domain/state/presentation/platform` ownership
  - shrink compat-heavy surfaces in `game/ui/*`, `game/app/*`, `game/state/*`, `game/combat/*`, and `game/systems/*`
  - keep `game/core/*` focused on orchestration only
- Source-of-truth docs:
  - `docs/architecture_boundaries.md`
  - `docs/architecture_refactoring_plan.md`
  - `docs/metrics/*`
- Latest structural move in progress:
  - `game/systems/event_manager.js` now routes to `game/features/event/application/event_manager_compat.js`
  - `game/combat/combat_lifecycle.js`, `game/combat/death_handler.js`, and `game/combat/turn_manager.js` now route to feature-owned compat facades under `game/features/combat/application/*`
  - `game/combat/card_methods.js`, `game/combat/combat_methods.js`, `game/combat/damage_system.js`, and `game/combat/damage_system_helpers.js` now also route to feature-owned canonical files under `game/features/combat/application/*`
  - compat allowlist is now empty; scanned compat surfaces are thin re-export shims only

## Current Validation Standard

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run deps:map` when dependency flow or ownership changes

Browser-level smoke for UI work:

1. Start the app.
2. Click `#mainStartBtn`.
3. Confirm the character select panel renders correctly.
4. Check for new console or page errors.

Optional deeper smoke:

- `npm run smoke:reward`

## Current Focus

- Continue moving real implementation inward to canonical feature/shared/platform owners.
- Keep compat paths thin and stable for existing callers.
- Reduce legacy global access outside `game/platform/legacy/*`.
- Reduce direct state mutation and accidental cross-layer imports.
- Preserve title -> character select -> run/combat/reward flow while refactoring.

## Current Risks

- Compat surfaces still create wide fan-out and make ownership easy to regress.
- Some browser/runtime flows remain sensitive to boundary changes.
- Bundle size and chunk boundaries still need attention after structural moves.
- Composition/bootstrap code can regain feature-specific knowledge if not guarded.

## Current Workspace Note

The current worktree contains validated changes around compat guardrails, combat/reward presentation ownership, feature public surfaces, browser effect compatibility, and combat/event compat-facade ownership inversion. Browser smoke, lint, tests, and build are green after the latest combat compat collapse.

## Next Actions

1. Finish and validate the current in-progress ownership and compat-surface changes.
2. Continue collapsing touched compat files into thin re-exports instead of adding new implementation there.
3. Keep `TurnManager` and similar compat facades lazy-initialized when they sit on feature public-surface import paths to avoid circular module init regressions.
4. Continue shrinking runtime-only fallback paths inside feature-owned combat helpers, especially legacy/browser lookups that still bypass explicit ports.
5. Regenerate metrics only when architectural change is intentional, not to silence checks.
