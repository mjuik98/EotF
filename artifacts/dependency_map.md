# Dependency Map

- Generated: 2026-04-06T04:12:51.028Z
- Nodes: 1390
- Edges: 1758

## Layer Edges

| Edge | Count |
|---|---:|
| core->core | 196 |
| core->feature | 26 |
| core->legacy | 6 |
| core->other | 1 |
| core->shared | 4 |
| core->utils | 2 |
| data->data | 29 |
| data->other | 2 |
| data->shared | 2 |
| data->utils | 4 |
| engine->data | 1 |
| engine->engine | 2 |
| feature->core | 17 |
| feature->data | 11 |
| feature->feature | 1106 |
| feature->legacy | 1 |
| feature->other | 2 |
| feature->platform | 15 |
| feature->shared | 42 |
| feature->utils | 2 |
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
| platform->platform | 29 |
| platform->shared | 3 |
| platform->utils | 2 |
| shared->core | 3 |
| shared->data | 3 |
| shared->feature | 2 |
| shared->legacy | 1 |
| shared->shared | 102 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 5 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| data/game_data.js | 10 |
| data/events_data.js | 9 |
| game/features/run/application/run_rule_outcome.js | 9 |
| game/core/bindings/build_module_registry_group_registrars.js | 8 |
| game/core/deps_factory.js | 8 |
| game/features/codex/presentation/browser/codex_ui_runtime.js | 8 |
| game/features/combat/application/combat_lifecycle_facade.js | 8 |
| game/features/combat/platform/browser/public_combat_core_browser_modules.js | 8 |
| game/features/combat/ports/public_surface.js | 8 |
| game/features/title/ports/runtime/public_title_runtime_surface.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| game/features/combat/application/damage_system_facade.js | 7 |
| game/features/combat/application/death_flow_enemy_runtime.js | 7 |
| game/features/combat/application/play_card_service.js | 7 |
| game/features/combat/domain/enemy_turn_domain.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/core/bindings/module_registry_scopes.js | 17 |
| game/features/combat/ports/combat_logging.js | 13 |
| game/features/combat/ports/presentation/public_combat_browser_support_capabilities.js | 11 |
| game/features/combat/ports/presentation/public_combat_card_support_capabilities.js | 11 |
| game/platform/browser/dom/public.js | 11 |
| game/shared/runtime/public.js | 11 |
| game/features/combat/presentation/browser/combat_copy.js | 10 |
| game/shared/state/player_state_commands.js | 10 |
| game/core/deps_factory.js | 9 |
| data/game_data.js | 8 |
| game/core/error_reporter.js | 8 |
| game/core/event_bus.js | 8 |
| game/features/combat/ports/public_tooltip_support_capabilities.js | 8 |
| game/features/meta_progression/ports/public_unlock_capabilities.js | 8 |
| game/features/run/ports/public_data_runtime_capabilities.js | 8 |

> Full graph is available in `artifacts/dependency_map.json`.

