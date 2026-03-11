# Dependency Map

- Generated: 2026-03-11T17:57:21.654Z
- Nodes: 585
- Edges: 907

## Layer Edges

| Edge | Count |
|---|---:|
| app->app | 15 |
| app->combat | 1 |
| app->core | 4 |
| app->data | 2 |
| app->domain | 7 |
| app->feature | 1 |
| app->other | 1 |
| app->state | 2 |
| app->systems | 11 |
| combat->combat | 11 |
| combat->core | 9 |
| combat->data | 6 |
| combat->domain | 7 |
| combat->feature | 4 |
| combat->legacy | 1 |
| combat->other | 1 |
| combat->state | 2 |
| combat->systems | 6 |
| combat->utils | 7 |
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
| feature->app | 8 |
| feature->core | 6 |
| feature->domain | 6 |
| feature->feature | 15 |
| feature->presentation | 1 |
| feature->systems | 2 |
| feature->ui | 6 |
| feature->utils | 2 |
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
| presentation->app | 1 |
| presentation->domain | 1 |
| presentation->feature | 4 |
| presentation->presentation | 1 |
| presentation->ui | 5 |
| presentation->utils | 1 |
| state->domain | 1 |
| systems->app | 3 |
| systems->core | 2 |
| systems->data | 6 |
| systems->domain | 1 |
| systems->feature | 1 |
| systems->other | 1 |
| systems->platform | 1 |
| systems->state | 1 |
| systems->systems | 11 |
| systems->utils | 1 |
| ui->app | 23 |
| ui->combat | 2 |
| ui->core | 8 |
| ui->data | 37 |
| ui->domain | 20 |
| ui->engine | 1 |
| ui->feature | 2 |
| ui->other | 5 |
| ui->presentation | 1 |
| ui->ui | 231 |
| ui->utils | 24 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/ui/title/character_select_ui.js | 12 |
| game/combat/death_handler.js | 11 |
| data/events_data.js | 9 |
| game/combat/turn_manager.js | 9 |
| game/systems/run_rules.js | 9 |
| game/platform/browser/composition/build_combat_core_modules.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/combat/combat_lifecycle.js | 7 |
| game/platform/browser/composition/build_run_map_modules.js | 7 |
| game/systems/event_manager.js | 7 |
| game/ui/combat/combat_ui.js | 7 |
| game/ui/combat/status_tooltip_builder.js | 7 |
| game/ui/hud/hud_update_ui.js | 7 |
| game/ui/screens/reward_ui_runtime.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 34 |
| game/core/state_actions.js | 21 |
| data/game_data.js | 15 |
| game/systems/codex_records_system.js | 11 |
| game/utils/log_utils.js | 11 |
| game/utils/logger.js | 10 |
| data/rarity_meta.js | 9 |
| game/app/shared/use_cases/runtime_state_use_case.js | 9 |
| game/core/event_bus.js | 9 |
| data/status_effects_data.js | 8 |
| data/status_key_data.js | 8 |
| game/core/deps_factory.js | 8 |
| game/data/constants.js | 8 |
| game/domain/run/region_service.js | 8 |
| game/utils/runtime_deps.js | 8 |

> Full graph is available in `docs/metrics/dependency_map.json`.

