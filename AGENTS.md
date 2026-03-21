# AGENTS.md

## Purpose

This file is the working contract for engineers and coding agents in this repository. Keep it concise, current, and rule-focused.

## Read First

- `README.md`

## Document Model

- `README.md` is the onboarding entrypoint.
- `AGENTS.md` is the source of truth for repository rules, architecture boundaries, validation, and documentation workflow.
- Current priorities, batch history, and execution notes live in Git history, PRs, and issues rather than repository markdown files.
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
- Treat `game/ui/`, `game/app/`, `game/combat/`, `game/state/`, `game/presentation/`, and `game/systems/` as compat or transitional surfaces.
- Keep `game/core/` orchestration-only.
- Cross-feature imports should use `game/features/<feature>/public.js` or `ports/*`, not feature internals.
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

- Run `npm test` for logic and behavior changes.
- Run `npm run lint` for architecture, boundary, state-flow, global API, or data/content changes.
- Run `npm run build` for user-visible browser changes and before handoff on substantial work.
- Run `npm run deps:map` when dependency flow or ownership changes.
- For UI-affecting changes, do at least one browser smoke check:
  - click `#mainStartBtn`
  - confirm character select renders
  - check for console/page errors

## Quality Config and Outputs

- `config/architecture_policy.json` defines architecture scan scope and boundary rules for scripts.
- `config/quality/*` stores allowlists, baselines, targets, and thresholds used by quality scripts and tests.
- `artifacts/dependency_map.json` and `artifacts/dependency_map.md` are generated outputs from `npm run deps:map`.
- Generated outputs are not source-of-truth design docs.

## Documentation Workflow

- The repository keeps only two human-facing markdown docs: `README.md` and `AGENTS.md`.
- Do not recreate status logs, roadmap markdown, or batch-history markdown inside the repo.
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
