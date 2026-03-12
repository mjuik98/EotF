# Dependency Map

- Generated: 2026-03-12T00:28:49.082Z
- Nodes: 598
- Edges: 921

## Layer Edges

| Edge | Count |
|---|---:|
| app->app | 15 |
| app->core | 4 |
| app->data | 2 |
| app->domain | 8 |
| app->feature | 9 |
| app->other | 1 |
| app->state | 2 |
| app->systems | 5 |
| combat->combat | 11 |
| combat->core | 8 |
| combat->data | 5 |
| combat->domain | 4 |
| combat->feature | 6 |
| combat->legacy | 1 |
| combat->other | 1 |
| combat->state | 2 |
| combat->systems | 6 |
| combat->utils | 6 |
| core->combat | 3 |
| core->core | 131 |
| core->domain | 4 |
| core->feature | 21 |
| core->legacy | 4 |
| core->other | 1 |
| core->systems | 1 |
| core->utils | 2 |
| data->data | 17 |
| data->engine | 1 |
| data->other | 2 |
| data->systems | 2 |
| data->utils | 4 |
| domain->combat | 3 |
| domain->core | 1 |
| domain->data | 4 |
| domain->domain | 8 |
| domain->systems | 1 |
| domain->ui | 1 |
| domain->utils | 2 |
| engine->data | 1 |
| engine->engine | 2 |
| feature->app | 11 |
| feature->core | 6 |
| feature->data | 1 |
| feature->domain | 11 |
| feature->feature | 23 |
| feature->other | 1 |
| feature->presentation | 2 |
| feature->systems | 2 |
| feature->ui | 5 |
| feature->utils | 4 |
| legacy->app | 2 |
| legacy->core | 3 |
| legacy->domain | 1 |
| legacy->feature | 3 |
| legacy->legacy | 51 |
| legacy->utils | 3 |
| platform->combat | 1 |
| platform->core | 4 |
| platform->data | 1 |
| platform->domain | 1 |
| platform->engine | 5 |
| platform->feature | 3 |
| platform->legacy | 2 |
| platform->other | 1 |
| platform->platform | 17 |
| platform->presentation | 3 |
| platform->systems | 3 |
| platform->ui | 38 |
| platform->utils | 4 |
| presentation->app | 3 |
| presentation->domain | 3 |
| presentation->feature | 4 |
| presentation->presentation | 4 |
| presentation->ui | 13 |
| presentation->utils | 2 |
| state->domain | 1 |
| systems->core | 2 |
| systems->data | 5 |
| systems->feature | 3 |
| systems->platform | 1 |
| systems->state | 1 |
| systems->systems | 11 |
| systems->utils | 1 |
| ui->app | 21 |
| ui->combat | 1 |
| ui->core | 8 |
| ui->data | 37 |
| ui->domain | 17 |
| ui->engine | 1 |
| ui->feature | 3 |
| ui->other | 5 |
| ui->presentation | 3 |
| ui->ui | 219 |
| ui->utils | 23 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/ui/title/character_select_ui.js | 12 |
| game/combat/death_handler.js | 11 |
| data/events_data.js | 9 |
| game/systems/run_rules.js | 9 |
| game/platform/browser/composition/build_combat_core_modules.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/combat/combat_lifecycle.js | 7 |
| game/platform/browser/composition/build_run_map_modules.js | 7 |
| game/ui/combat/combat_ui.js | 7 |
| game/ui/combat/status_tooltip_builder.js | 7 |
| game/ui/hud/hud_update_ui.js | 7 |
| game/ui/screens/reward_ui_runtime.js | 7 |
| game/ui/title/character_select_mount_runtime.js | 7 |
| game/app/combat/use_cases/run_enemy_turn_use_case.js | 6 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 34 |
| game/core/state_actions.js | 20 |
| data/game_data.js | 14 |
| game/utils/log_utils.js | 12 |
| game/systems/codex_records_system.js | 11 |
| game/utils/logger.js | 10 |
| data/rarity_meta.js | 9 |
| game/app/shared/use_cases/runtime_state_use_case.js | 9 |
| game/core/event_bus.js | 9 |
| data/status_effects_data.js | 8 |
| data/status_key_data.js | 8 |
| game/core/deps_factory.js | 8 |
| game/data/constants.js | 8 |
| game/utils/runtime_deps.js | 8 |
| game/domain/run/region_service.js | 7 |

> Full graph is available in `docs/metrics/dependency_map.json`.

