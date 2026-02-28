# Dependency Map

- Generated: 2026-02-28T11:01:42.922Z
- Nodes: 100
- Edges: 217

## Layer Edges

| Edge | Count |
|---|---:|
| combat->combat | 5 |
| combat->core | 10 |
| combat->data | 2 |
| combat->engine | 7 |
| combat->other | 1 |
| combat->systems | 4 |
| combat->utils | 6 |
| core->combat | 6 |
| core->core | 43 |
| core->data | 2 |
| core->engine | 5 |
| core->other | 1 |
| core->systems | 5 |
| core->ui | 37 |
| core->utils | 7 |
| data->data | 9 |
| data->engine | 2 |
| data->other | 2 |
| data->utils | 3 |
| engine->data | 1 |
| systems->core | 2 |
| systems->data | 2 |
| systems->systems | 2 |
| systems->utils | 1 |
| ui->combat | 2 |
| ui->core | 14 |
| ui->data | 6 |
| ui->engine | 6 |
| ui->other | 5 |
| ui->systems | 1 |
| ui->ui | 2 |
| ui->utils | 12 |
| utils->core | 1 |
| utils->utils | 3 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/core/main.js | 59 |
| game/core/game_state_core_methods.js | 9 |
| game/combat/damage_system.js | 8 |
| data/game_data.js | 6 |
| game/core/event_bindings.js | 6 |
| game/ui/screens/event_ui.js | 6 |
| game/combat/death_handler.js | 5 |
| game/combat/player_methods.js | 5 |
| game/core/event_bus.js | 5 |
| game/core/game_state.js | 5 |
| game/ui/combat/combat_start_ui.js | 5 |
| data/events_data.js | 4 |
| data/items.js | 4 |
| game/combat/combat_lifecycle.js | 4 |
| game/core/event_subscribers.js | 4 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/core/game_state.js | 15 |
| data/game_data.js | 13 |
| engine/audio.js | 11 |
| game/core/state_actions.js | 10 |
| game/utils/description_utils.js | 10 |
| game/utils/log_utils.js | 8 |
| game/core/deps_factory.js | 7 |
| game/core/event_bus.js | 6 |
| game/core/global_bridge.js | 6 |
| game/utils/logger.js | 6 |
| game/core/error_codes.js | 5 |
| game/systems/run_rules.js | 5 |
| engine/particles.js | 4 |
| game/core/error_reporter.js | 4 |
| game/data/constants.js | 4 |

> Full graph is available in `docs/metrics/dependency_map.json`.

