# AGENTS.md

## Purpose

This file is the working contract for engineers and coding agents in this repository. Keep it concise, current, and rule-focused.

## Read First

- `README.md`

## Document Model

- `README.md` is the onboarding entrypoint.
- `AGENTS.md` is the source of truth for repository rules, architecture boundaries, validation, and documentation workflow.
- Canonical human-maintained docs are `README.md` and `AGENTS.md`.
- Agent-generated planning/spec artifacts may exist under `docs/superpowers/*`; treat them as execution artifacts, not source-of-truth architecture docs.
- Current priorities, batch history, and execution notes live primarily in Git history, PRs, and issues rather than repository markdown files.
- Machine-owned quality config lives under `config/quality/*`.
- Architecture policy lives in `config/architecture_policy.json`.
- Generated dependency outputs live in `artifacts/dependency_map.json` and `artifacts/dependency_map.md`.

## Core Rules

- Prefer small, behavior-preserving changes unless the task explicitly asks for refactoring.
- Read the touched area and nearby call paths before editing.
- Match existing local conventions.
- Do not touch unrelated files.
- Never claim validation passed unless you actually ran it.
- Do not hand-edit generated artifacts unless the task explicitly requires it.

## Architecture

- New implementation belongs under `game/features/<feature>/`, `game/shared/*`, or `game/platform/*`.
- The current tree still includes `game/ui/`, `game/app/`, `game/combat/`, `game/domain/`, `game/state/`, `game/presentation/`, and `game/systems/`; these roots currently have zero canonical runtime file ownership and should stay compat/transitional unless the task explicitly targets them.
- Keep `game/core/` orchestration-only, with composition/bootstrap/store wiring concentrated there.
- Cross-feature imports should use `game/features/<feature>/public.js` or `ports/*`, not feature internals.
- Broad compat support barrels are deprecated and must not be used for new runtime imports.
- Feature port files should prefer explicit `public_*` names; reserve `runtime_*` names for runtime debug or orchestration surfaces.
- Feature-internal transitional dirs such as `app`, `bindings`, `compat`, `contracts`, `runtime`, `modules`, and feature-local `ui` should stay thin wrappers around canonical ownership.
- Browser runtime code must not use Node-only APIs.
- Browser globals, DOM access, canvas, timers, storage, and audio bindings belong in feature `platform/*` or `game/platform/browser/*`.
- New `window.*` / `GAME.*` exposure belongs only in `game/platform/legacy/*`.
- New UI composition belongs in `game/platform/browser/composition/*`.
- `game/core/*` must not import `game/ui/*` except composition/bootstrap entrypoints:
  - `game/core/main.js`
  - `game/core/event_bindings.js`
  - `game/core/init_sequence.js`
  - `game/core/deps_factory.js`
  - `game/core/bindings/*`
  - `game/core/composition/*`
- `game/ui/*` must not import `game/core/main.js` or `game/core/event_bindings.js`.

## State, Events, and Standards

- State changes should go through `GS.dispatch(...)` or feature/shared state command modules, not new direct mutation.
- Reducers in `game/core/state_actions.js` are the preferred mutation point.
- Action events use namespaced keys such as `player:damage`.
- Event payloads are normalized and validated in `game/core/event_contracts.js`.
- Runtime config belongs in `game/core/app_config.js`.
- Error codes belong in `game/core/error_codes.js`.
- Structured runtime errors go through `game/core/error_reporter.js`.
- Logging goes through `game/utils/logger.js`.

## Validation

- Run `npm test` for fast logic and behavior changes.
- Run `npm run test:manifest` when test files move between suites or new test files are added.
- Run `npm run test:guardrails` for architecture, boundary, compat, or composition changes.
- Run `npm run test:full` when a change spans both runtime behavior and guardrail coverage.
- Run `npm run test:slow-report` when a fast-suite change may affect local/CI cycle time; treat recurring slowest files as optimization candidates.
- Run `npm run lint` for architecture, boundary, state-flow, global API, or data/content changes.
- Run `npm run build` for user-visible browser changes and before handoff on substantial work.
- Run `npm run quality:sync` when test ownership and dependency-map outputs both changed.
- Run `npm run deps:map` when dependency flow or ownership changes.
- Run `npm run deps:map:check` to verify generated dependency map outputs are current before handoff on dependency-flow changes.
- For UI-affecting changes, do at least one browser smoke check:
  - click `#mainStartBtn`
  - confirm character select renders
  - check for console/page errors
  - prefer `npm run smoke:browser` for a consistent multi-flow smoke run

## Quality Config and Outputs

- `config/architecture_policy.json` defines architecture scan scope and boundary rules for scripts.
- `config/quality/*` stores allowlists, baselines, targets, and thresholds used by quality scripts and tests.
- `artifacts/dependency_map.json` and `artifacts/dependency_map.md` are generated outputs from `npm run deps:map`.
- Generated outputs are not source-of-truth design docs.

## Documentation Workflow

- The repository's canonical human-maintained markdown docs are `README.md` and `AGENTS.md`.
- Agent-generated plan/spec artifacts may exist under `docs/superpowers/*`, but they are not source-of-truth product or architecture docs.
- Do not add new top-level status logs, roadmap markdown, or batch-history markdown inside the repo.
- Treat any legacy scratch notes that remain in the repo as non-canonical and avoid extending them.
- In a normal PR, update `AGENTS.md` only when rules or boundaries change.
- Update `README.md` only when onboarding, commands, or repo layout changes.

## Careful Files

Only modify these when the task requires it:

- `.github/workflows/*`
- `scripts/*`
- `config/quality/*`
- `config/architecture_policy.json`
- `artifacts/*`
- `AGENTS.md`
