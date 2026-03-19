# Dependency Map

- Generated: 2026-03-19T17:24:58.571Z
- Nodes: 1237
- Edges: 1299

## Layer Edges

| Edge | Count |
|---|---:|
| core->core | 152 |
| core->domain | 3 |
| core->feature | 26 |
| core->legacy | 7 |
| core->other | 1 |
| core->shared | 5 |
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
| feature->core | 17 |
| feature->data | 38 |
| feature->domain | 39 |
| feature->feature | 662 |
| feature->legacy | 4 |
| feature->other | 6 |
| feature->platform | 3 |
| feature->shared | 41 |
| feature->state | 2 |
| feature->utils | 30 |
| legacy->core | 6 |
| legacy->domain | 1 |
| legacy->feature | 8 |
| legacy->legacy | 69 |
| legacy->shared | 12 |
| legacy->utils | 3 |
| platform->core | 5 |
| platform->data | 1 |
| platform->domain | 1 |
| platform->engine | 5 |
| platform->feature | 16 |
| platform->legacy | 2 |
| platform->other | 1 |
| platform->platform | 22 |
| platform->shared | 2 |
| platform->utils | 4 |
| shared->core | 4 |
| shared->data | 2 |
| shared->feature | 3 |
| shared->shared | 33 |
| shared->utils | 2 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/features/combat/ports/public_surface.js | 14 |
| game/features/combat/platform/browser/combat_browser_modules.js | 13 |
| game/features/combat/application/death_flow_actions.js | 12 |
| game/features/title/platform/browser/create_character_select_runtime_bindings.js | 12 |
| game/features/event/ports/public_application_capabilities.js | 9 |
| data/events_data.js | 8 |
| game/features/event/application/workflows/event_choice_flow.js | 8 |
| game/features/run/application/run_rules.js | 8 |
| game/features/run/ports/public_surface.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/features/combat/compat/combat_lifecycle.js | 7 |
| game/features/combat/presentation/browser/combat_ui.js | 7 |
| game/features/combat/presentation/browser/hud_update_ui.js | 7 |
| game/features/combat/presentation/browser/status_tooltip_builder.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 29 |
| data/game_data.js | 14 |
| game/utils/log_utils.js | 12 |
| game/shared/runtime/public.js | 11 |
| game/core/store/state_actions.js | 10 |
| game/utils/logger.js | 10 |
| game/core/bindings/module_registry_scopes.js | 9 |
| game/core/deps_factory.js | 9 |
| game/shared/state/player_state_commands.js | 9 |
| data/status_effects_data.js | 8 |
| data/status_key_data.js | 8 |
| game/core/event_bus.js | 8 |
| game/features/run/ports/public_rule_capabilities.js | 8 |
| game/features/ui/presentation/browser/help_pause_ui_helpers.js | 8 |
| game/shared/codex/codex_record_state_use_case.js | 8 |

> Full graph is available in `docs/metrics/dependency_map.json`.

