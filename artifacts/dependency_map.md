# Dependency Map

- Generated: 2026-03-27T16:49:45.721Z
- Nodes: 1250
- Edges: 1620

## Layer Edges

| Edge | Count |
|---|---:|
| core->core | 190 |
| core->feature | 26 |
| core->legacy | 7 |
| core->other | 1 |
| core->shared | 6 |
| core->utils | 2 |
| data->data | 20 |
| data->other | 2 |
| data->shared | 1 |
| data->utils | 4 |
| engine->data | 1 |
| engine->engine | 2 |
| feature->core | 16 |
| feature->data | 13 |
| feature->feature | 1039 |
| feature->legacy | 1 |
| feature->other | 1 |
| feature->platform | 3 |
| feature->shared | 26 |
| legacy->core | 5 |
| legacy->feature | 8 |
| legacy->legacy | 80 |
| legacy->shared | 12 |
| legacy->utils | 3 |
| platform->core | 4 |
| platform->data | 1 |
| platform->engine | 5 |
| platform->feature | 15 |
| platform->legacy | 2 |
| platform->other | 1 |
| platform->platform | 20 |
| platform->shared | 3 |
| platform->utils | 2 |
| shared->core | 4 |
| shared->data | 5 |
| shared->feature | 2 |
| shared->legacy | 2 |
| shared->shared | 76 |
| shared->utils | 3 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 5 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| data/events_data.js | 9 |
| game/features/run/application/run_rule_outcome.js | 9 |
| game/shared/save/save_system.js | 9 |
| game/core/bindings/build_module_registry_group_registrars.js | 8 |
| game/core/deps_factory.js | 8 |
| game/features/combat/platform/browser/public_combat_core_browser_modules.js | 8 |
| game/features/combat/ports/public_surface.js | 8 |
| game/features/title/ports/runtime/public_title_runtime_surface.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/features/codex/presentation/browser/codex_ui_runtime.js | 7 |
| game/features/combat/application/death_flow_enemy_runtime.js | 7 |
| game/features/combat/application/play_card_service.js | 7 |
| game/features/combat/presentation/browser/combat_relic_rail_ui.js | 7 |
| game/features/combat/presentation/browser/combat_ui.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/core/bindings/module_registry_scopes.js | 17 |
| game/features/ui/ports/public_tooltip_support_capabilities.js | 16 |
| game/features/meta_progression/public.js | 15 |
| game/features/combat/ports/combat_logging.js | 12 |
| game/features/run/ports/public_rule_capabilities.js | 12 |
| data/game_data.js | 11 |
| game/features/combat/ports/presentation/public_combat_browser_support_capabilities.js | 11 |
| game/features/combat/ports/presentation/public_combat_card_support_capabilities.js | 11 |
| game/shared/runtime/public.js | 11 |
| game/features/combat/presentation/browser/combat_copy.js | 10 |
| game/shared/state/player_state_commands.js | 10 |
| game/core/deps_factory.js | 9 |
| game/core/error_reporter.js | 8 |
| game/core/event_bus.js | 8 |
| game/features/run/ports/public_data_runtime_capabilities.js | 8 |

> Full graph is available in `artifacts/dependency_map.json`.

