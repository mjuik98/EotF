# Dependency Map

- Generated: 2026-03-13T09:02:48.527Z
- Nodes: 1100
- Edges: 1187

## Layer Edges

| Edge | Count |
|---|---:|
| core->core | 131 |
| core->domain | 4 |
| core->feature | 22 |
| core->legacy | 6 |
| core->other | 1 |
| core->shared | 4 |
| core->utils | 2 |
| data->data | 17 |
| data->other | 2 |
| data->systems | 2 |
| data->utils | 4 |
| domain->data | 6 |
| domain->domain | 16 |
| domain->feature | 1 |
| domain->shared | 1 |
| domain->utils | 3 |
| engine->data | 1 |
| engine->engine | 2 |
| feature->core | 11 |
| feature->data | 38 |
| feature->domain | 39 |
| feature->feature | 609 |
| feature->legacy | 1 |
| feature->other | 6 |
| feature->platform | 3 |
| feature->shared | 42 |
| feature->state | 2 |
| feature->utils | 30 |
| legacy->core | 4 |
| legacy->domain | 1 |
| legacy->feature | 8 |
| legacy->legacy | 59 |
| legacy->shared | 14 |
| legacy->utils | 3 |
| platform->core | 5 |
| platform->data | 1 |
| platform->domain | 1 |
| platform->engine | 5 |
| platform->feature | 16 |
| platform->legacy | 2 |
| platform->other | 1 |
| platform->platform | 19 |
| platform->shared | 2 |
| platform->utils | 4 |
| shared->core | 3 |
| shared->data | 2 |
| shared->feature | 3 |
| shared->shared | 22 |
| shared->utils | 2 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/features/combat/platform/browser/combat_browser_modules.js | 15 |
| game/features/event/public.js | 15 |
| game/features/combat/public.js | 13 |
| game/features/title/platform/browser/create_character_select_runtime_bindings.js | 12 |
| game/features/combat/application/death_flow_actions.js | 11 |
| game/features/run/platform/browser/run_browser_modules.js | 11 |
| data/events_data.js | 8 |
| game/features/event/app/event_choice_flow_actions.js | 8 |
| game/features/run/application/run_rules.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/features/combat/presentation/browser/combat_ui.js | 7 |
| game/features/combat/presentation/browser/hud_update_ui.js | 7 |
| game/features/combat/presentation/browser/status_tooltip_builder.js | 7 |
| game/features/reward/public.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 30 |
| data/game_data.js | 14 |
| game/shared/state/public.js | 14 |
| game/utils/log_utils.js | 12 |
| game/shared/runtime/public.js | 11 |
| game/features/run/public.js | 10 |
| game/utils/logger.js | 10 |
| data/status_effects_data.js | 8 |
| data/status_key_data.js | 8 |
| game/core/deps_factory.js | 8 |
| game/core/event_bus.js | 8 |
| game/features/ui/presentation/browser/help_pause_ui_helpers.js | 8 |
| game/shared/codex/codex_record_state_use_case.js | 8 |
| game/domain/run/region_service.js | 7 |
| game/features/event/app/event_manager_actions.js | 7 |

> Full graph is available in `docs/metrics/dependency_map.json`.

