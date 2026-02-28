# Architecture Boundaries

This project uses a layered structure to keep growth manageable:

1. `engine/` and `data/`
2. `game/core/`, `game/systems/`, `game/combat/`, `game/utils/`
3. `game/ui/`

## Dependency Direction

- `game/ui/*` may depend on `game/core/*`, `game/systems/*`, `game/combat/*`, `game/utils/*`, `engine/*`, `data/*`.
- `game/combat/*` and `game/systems/*` must not import `game/ui/*`.
- `game/core/*` must not import `game/ui/*` except the composition root files:
  - `game/core/main.js`
  - `game/core/event_bindings.js`
  - `game/core/init_sequence.js`
  - `game/core/deps_factory.js`
  - `game/core/bindings/*`
- Feature modules should use dependency injection contracts from `game/core/deps_factory.js` and avoid direct `window.*` access.

## State Mutation Rule

- State changes should enter through `GS.dispatch(action, payload)`.
- Reducers in `game/core/state_actions.js` are the preferred mutation point.
- Direct mutations outside reducers are tracked by `scripts/check-state-mutations.mjs` with a baseline; new direct mutation growth fails lint.

## Event Contract Rule

- Action events use namespaced keys (for example, `player:damage`).
- Event payloads are normalized in `game/core/event_contracts.js`.
- New action names should be added to both:
  - `Actions` in `game/core/state_actions.js`
  - `EventContracts` in `game/core/event_contracts.js`

