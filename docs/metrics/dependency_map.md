# Dependency Map

- Generated: 2026-03-03T05:09:38.384Z
- Nodes: 110
- Edges: 208

## Layer Edges

| Edge | Count |
|---|---:|
| combat->combat | 5 |
| combat->core | 10 |
| combat->data | 2 |
| combat->engine | 5 |
| combat->other | 1 |
| combat->systems | 4 |
| combat->utils | 6 |
| core->combat | 6 |
| core->core | 51 |
| core->data | 2 |
| core->engine | 5 |
| core->other | 1 |
| core->systems | 5 |
| core->ui | 37 |
| core->utils | 7 |
| data->data | 10 |
| data->engine | 2 |
| data->other | 2 |
| data->utils | 3 |
| engine->data | 1 |
| systems->core | 2 |
| systems->data | 2 |
| systems->systems | 3 |
| systems->utils | 1 |
| ui->combat | 2 |
| ui->core | 4 |
| ui->data | 1 |
| ui->engine | 1 |
| ui->other | 5 |
| ui->systems | 1 |
| ui->ui | 6 |
| ui->utils | 12 |
| utils->core | 1 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/core/bindings/module_registry.js | 56 |
| game/combat/damage_system.js | 8 |
| game/core/game_state_core_methods.js | 8 |
| data/game_data.js | 7 |
| game/core/event_bindings.js | 7 |
| game/core/event_bus.js | 6 |
| game/combat/death_handler.js | 5 |
| game/core/deps_factory.js | 5 |
| game/core/game_state.js | 5 |
| data/events_data.js | 4 |
| data/items.js | 4 |
| game/combat/combat_lifecycle.js | 4 |
| game/core/event_subscribers.js | 4 |
| game/core/main.js | 4 |
| game/ui/hud/hud_update_ui.js | 4 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/core/state_actions.js | 10 |
| data/game_data.js | 8 |
| game/utils/log_utils.js | 8 |
| game/core/deps_factory.js | 7 |
| game/utils/description_utils.js | 7 |
| game/core/event_bus.js | 6 |
| game/core/global_bridge.js | 6 |
| game/utils/logger.js | 6 |
| engine/audio.js | 5 |
| game/core/error_codes.js | 5 |
| game/core/game_state.js | 5 |
| game/systems/run_rules.js | 5 |
| game/core/error_reporter.js | 4 |
| game/data/constants.js | 4 |
| game/data/triggers.js | 4 |

> Full graph is available in `docs/metrics/dependency_map.json`.

