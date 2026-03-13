# Dependency Map

- Generated: 2026-03-13T01:15:39.784Z
- Nodes: 983
- Edges: 1103

## Layer Edges

| Edge | Count |
|---|---:|
| app->systems | 1 |
| combat->combat | 8 |
| combat->core | 1 |
| combat->data | 4 |
| combat->domain | 2 |
| combat->feature | 8 |
| combat->other | 1 |
| combat->shared | 5 |
| combat->state | 1 |
| combat->systems | 4 |
| combat->utils | 6 |
| core->combat | 3 |
| core->core | 126 |
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
| feature->combat | 6 |
| feature->core | 11 |
| feature->data | 33 |
| feature->domain | 35 |
| feature->feature | 494 |
| feature->other | 5 |
| feature->platform | 3 |
| feature->presentation | 3 |
| feature->shared | 25 |
| feature->state | 2 |
| feature->systems | 5 |
| feature->utils | 25 |
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
| platform->feature | 15 |
| platform->legacy | 2 |
| platform->other | 1 |
| platform->platform | 17 |
| platform->systems | 3 |
| platform->ui | 1 |
| platform->utils | 4 |
| presentation->domain | 1 |
| presentation->ui | 6 |
| presentation->utils | 1 |
| shared->core | 1 |
| shared->shared | 3 |
| systems->core | 2 |
| systems->data | 4 |
| systems->feature | 3 |
| systems->platform | 1 |
| systems->state | 1 |
| systems->systems | 13 |
| systems->utils | 1 |
| ui->app | 1 |
| ui->data | 1 |
| ui->domain | 1 |
| ui->feature | 8 |
| ui->ui | 7 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/features/combat/platform/browser/combat_browser_modules.js | 15 |
| game/features/event/public.js | 15 |
| game/features/title/platform/browser/create_character_select_runtime_bindings.js | 12 |
| game/features/combat/application/death_flow_actions.js | 11 |
| game/features/run/platform/browser/run_browser_modules.js | 11 |
| game/systems/run_rules.js | 9 |
| data/events_data.js | 8 |
| game/core/deps/contracts/core_contract_builders.js | 8 |
| game/features/event/app/event_choice_flow_actions.js | 8 |
| game/features/title/public.js | 8 |
| game/features/ui/public.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/features/combat/presentation/browser/combat_ui.js | 7 |
| game/features/combat/presentation/browser/hud_update_ui.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 30 |
| data/game_data.js | 14 |
| game/shared/state/public.js | 14 |
| game/utils/log_utils.js | 12 |
| game/shared/runtime/public.js | 11 |
| game/utils/logger.js | 10 |
| data/status_effects_data.js | 8 |
| data/status_key_data.js | 8 |
| game/core/deps_factory.js | 8 |
| game/core/event_bus.js | 8 |
| game/features/ui/presentation/browser/help_pause_ui_helpers.js | 8 |
| game/features/ui/public.js | 8 |
| game/systems/codex_records_system.js | 8 |
| game/domain/run/region_service.js | 7 |
| game/utils/description_utils.js | 7 |

> Full graph is available in `docs/metrics/dependency_map.json`.

