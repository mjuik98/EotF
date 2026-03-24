# Structure Follow-Up Design

## Goal

Reduce the remaining structural drift after the first cleanup batch by deleting `game/systems` wrappers that are now test-only, formally treating `game/features/ui/app` as a thin wrapper surface, and removing presentation rendering responsibility from the class domain facade.

## Scope

This batch stays behavior-preserving. It does not redesign feature public barrels wholesale or split unrelated large files. It focuses on code paths that are either:

- already pure wrappers,
- only referenced by tests, or
- carrying an avoidable layer violation with no known runtime callers.

## Design

### 1. Remove test-only `game/systems` wrappers

Several `game/systems/*` files are only imported from tests and simply re-export canonical owners in `game/shared/*` or feature ports. Tests should move to the canonical owners directly, then the wrappers should be deleted. This shrinks the remaining transitional root without affecting runtime composition.

Target wrappers:

- `game/systems/class_progression_system.js`
- `game/systems/codex_records_system.js`
- `game/systems/item_system.js`
- `game/systems/inscription_system.js`
- `game/systems/set_bonus_system.js`
- `game/systems/save_system.js`
- `game/systems/save_migrations.js`
- `game/systems/save/save_outbox_metrics.js`
- `game/systems/save/save_outbox_queue.js`
- `game/systems/save/save_repository.js`

### 2. Formalize `game/features/ui/app` as a thin wrapper surface

`game/features/ui/app/*` already consists of re-export-only wrappers. The structure config and guardrail tests should recognize `ui/app` the same way they recognize `run/app`, `title/app`, and `event/app`.

### 3. Remove UI rendering responsibility from `game/domain/class/class_mechanics.js`

`ClassMechanics` should stay as domain behavior plus view-model shaping. The `getSpecialUI` method currently lets the domain render UI through injected callbacks. That presentation concern should be removed from the domain facade. Existing presentation code can continue to call `buildClassTraitViewModel` plus `renderClassTraitPanel` directly.

## Validation

- Add failing tests before code changes.
- Run focused Vitest files covering structure, systems wrappers, and class mechanics.
- Run `npm run lint`.
- Run `npm run test:full`.
- Run `npm run audit:structure`.
- Run `npm run audit:transition-surfaces`.
