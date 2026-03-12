# Dependency Map

- Generated: 2026-03-12T07:28:45.410Z
- Nodes: 649
- Edges: 1024

## Layer Edges

| Edge | Count |
|---|---:|
| app->app | 12 |
| app->core | 1 |
| app->data | 2 |
| app->domain | 8 |
| app->feature | 9 |
| app->other | 1 |
| app->shared | 6 |
| app->state | 1 |
| app->systems | 5 |
| combat->combat | 7 |
| combat->core | 1 |
| combat->data | 4 |
| combat->domain | 3 |
| combat->feature | 7 |
| combat->legacy | 1 |
| combat->other | 1 |
| combat->shared | 4 |
| combat->state | 1 |
| combat->systems | 4 |
| combat->utils | 6 |
| core->combat | 3 |
| core->core | 133 |
| core->domain | 4 |
| core->feature | 19 |
| core->legacy | 4 |
| core->other | 1 |
| core->shared | 1 |
| core->systems | 1 |
| core->utils | 2 |
| data->data | 17 |
| data->engine | 1 |
| data->other | 2 |
| data->systems | 2 |
| data->utils | 4 |
| domain->combat | 3 |
| domain->data | 4 |
| domain->domain | 8 |
| domain->shared | 1 |
| domain->systems | 1 |
| domain->ui | 1 |
| domain->utils | 2 |
| engine->data | 1 |
| engine->engine | 2 |
| feature->app | 19 |
| feature->combat | 5 |
| feature->core | 6 |
| feature->data | 2 |
| feature->domain | 14 |
| feature->feature | 76 |
| feature->other | 1 |
| feature->presentation | 3 |
| feature->shared | 9 |
| feature->state | 1 |
| feature->systems | 4 |
| feature->ui | 37 |
| feature->utils | 5 |
| legacy->core | 1 |
| legacy->domain | 1 |
| legacy->feature | 7 |
| legacy->legacy | 52 |
| legacy->shared | 14 |
| legacy->utils | 3 |
| platform->combat | 1 |
| platform->core | 4 |
| platform->data | 1 |
| platform->domain | 1 |
| platform->engine | 5 |
| platform->feature | 13 |
| platform->legacy | 2 |
| platform->other | 1 |
| platform->platform | 10 |
| platform->presentation | 2 |
| platform->systems | 3 |
| platform->ui | 8 |
| platform->utils | 4 |
| presentation->app | 3 |
| presentation->domain | 3 |
| presentation->feature | 4 |
| presentation->presentation | 4 |
| presentation->ui | 13 |
| presentation->utils | 2 |
| shared->state | 1 |
| state->domain | 1 |
| systems->core | 2 |
| systems->data | 5 |
| systems->feature | 3 |
| systems->platform | 1 |
| systems->state | 1 |
| systems->systems | 11 |
| systems->utils | 1 |
| ui->app | 15 |
| ui->combat | 1 |
| ui->core | 7 |
| ui->data | 37 |
| ui->domain | 16 |
| ui->engine | 1 |
| ui->feature | 9 |
| ui->other | 5 |
| ui->presentation | 3 |
| ui->shared | 2 |
| ui->ui | 230 |
| ui->utils | 22 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/features/combat/public.js | 26 |
| game/features/run/public.js | 23 |
| game/features/title/public.js | 12 |
| game/ui/title/character_select_ui.js | 12 |
| game/features/combat/application/death_flow_actions.js | 11 |
| data/events_data.js | 9 |
| game/systems/run_rules.js | 9 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/features/event/app/event_choice_flow_actions.js | 7 |
| game/ui/combat/combat_ui.js | 7 |
| game/ui/combat/status_tooltip_builder.js | 7 |
| game/ui/hud/hud_update_ui.js | 7 |
| game/ui/title/character_select_mount_runtime.js | 7 |
| game/app/combat/use_cases/run_enemy_turn_use_case.js | 6 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 35 |
| data/game_data.js | 14 |
| game/shared/state/public.js | 13 |
| game/utils/log_utils.js | 12 |
| game/features/combat/public.js | 11 |
| game/shared/runtime/public.js | 11 |
| game/systems/codex_records_system.js | 11 |
| game/utils/logger.js | 10 |
| data/rarity_meta.js | 9 |
| game/shared/state/runtime_flow_controls.js | 9 |
| data/status_effects_data.js | 8 |
| data/status_key_data.js | 8 |
| game/core/deps_factory.js | 8 |
| game/core/event_bus.js | 8 |
| game/data/constants.js | 8 |

> Full graph is available in `docs/metrics/dependency_map.json`.

