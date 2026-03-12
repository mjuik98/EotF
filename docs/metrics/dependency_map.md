# Dependency Map

- Generated: 2026-03-12T13:18:43.785Z
- Nodes: 712
- Edges: 1074

## Layer Edges

| Edge | Count |
|---|---:|
| app->app | 15 |
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
| combat->domain | 2 |
| combat->feature | 8 |
| combat->legacy | 1 |
| combat->other | 1 |
| combat->shared | 5 |
| combat->state | 1 |
| combat->systems | 4 |
| combat->utils | 6 |
| core->combat | 3 |
| core->core | 128 |
| core->domain | 4 |
| core->feature | 23 |
| core->legacy | 6 |
| core->other | 1 |
| core->shared | 1 |
| core->systems | 1 |
| core->utils | 2 |
| data->data | 17 |
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
| feature->combat | 6 |
| feature->core | 6 |
| feature->data | 9 |
| feature->domain | 17 |
| feature->feature | 123 |
| feature->other | 2 |
| feature->presentation | 3 |
| feature->shared | 10 |
| feature->state | 1 |
| feature->systems | 4 |
| feature->ui | 66 |
| feature->utils | 9 |
| legacy->core | 4 |
| legacy->domain | 1 |
| legacy->feature | 7 |
| legacy->legacy | 57 |
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
| presentation->app | 2 |
| presentation->domain | 3 |
| presentation->feature | 3 |
| presentation->presentation | 4 |
| presentation->ui | 9 |
| presentation->utils | 1 |
| shared->shared | 2 |
| systems->core | 2 |
| systems->data | 5 |
| systems->feature | 3 |
| systems->platform | 1 |
| systems->state | 1 |
| systems->systems | 11 |
| systems->utils | 1 |
| ui->app | 6 |
| ui->core | 5 |
| ui->data | 27 |
| ui->domain | 14 |
| ui->engine | 1 |
| ui->feature | 24 |
| ui->other | 4 |
| ui->presentation | 3 |
| ui->shared | 1 |
| ui->ui | 197 |
| ui->utils | 19 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/features/combat/platform/browser/combat_browser_modules.js | 15 |
| game/features/title/platform/browser/create_character_select_runtime_bindings.js | 12 |
| game/features/combat/application/death_flow_actions.js | 11 |
| game/features/run/platform/browser/run_browser_modules.js | 11 |
| game/systems/run_rules.js | 9 |
| data/events_data.js | 8 |
| game/features/event/app/event_choice_flow_actions.js | 8 |
| game/features/title/public.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/core/deps/contracts/core_contract_builders.js | 7 |
| game/features/title/platform/browser/create_character_select_mount_runtime.js | 7 |
| game/ui/combat/combat_ui.js | 7 |
| game/ui/combat/status_tooltip_builder.js | 7 |
| game/ui/hud/hud_update_ui.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 35 |
| data/game_data.js | 14 |
| game/shared/state/public.js | 13 |
| game/utils/log_utils.js | 12 |
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
| game/ui/screens/help_pause_ui_helpers.js | 8 |

> Full graph is available in `docs/metrics/dependency_map.json`.

