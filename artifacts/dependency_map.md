# Dependency Map

- Generated: 2026-03-26T07:15:36.898Z
- Nodes: 1174
- Edges: 1539

## Layer Edges

| Edge | Count |
|---|---:|
| core->core | 170 |
| core->feature | 26 |
| core->legacy | 7 |
| core->other | 1 |
| core->shared | 6 |
| core->utils | 2 |
| data->data | 20 |
| data->other | 2 |
| data->utils | 4 |
| engine->data | 1 |
| engine->engine | 2 |
| feature->core | 18 |
| feature->data | 13 |
| feature->feature | 988 |
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
| platform->platform | 17 |
| platform->shared | 3 |
| platform->utils | 2 |
| shared->core | 4 |
| shared->data | 5 |
| shared->feature | 3 |
| shared->legacy | 2 |
| shared->shared | 68 |
| shared->utils | 3 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 3 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| data/events_data.js | 8 |
| game/core/bindings/build_module_registry_group_registrars.js | 8 |
| game/features/combat/application/death_flow_enemy_runtime.js | 8 |
| game/features/combat/platform/browser/public_combat_core_browser_modules.js | 8 |
| game/features/combat/ports/public_surface.js | 8 |
| game/features/title/ports/runtime/public_title_runtime_surface.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/features/codex/presentation/browser/codex_ui_runtime.js | 7 |
| game/features/combat/application/combat_lifecycle_facade.js | 7 |
| game/features/combat/application/play_card_service.js | 7 |
| game/features/combat/presentation/browser/combat_relic_rail_ui.js | 7 |
| game/features/combat/presentation/browser/combat_ui.js | 7 |
| game/features/combat/presentation/browser/hud_update_ui.js | 7 |
| game/features/run/application/run_rule_outcome.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/features/ui/ports/public_shared_support_capabilities.js | 29 |
| game/core/bindings/module_registry_scopes.js | 17 |
| game/features/ui/ports/public_feature_support_capabilities.js | 16 |
| game/features/run/ports/public_rule_capabilities.js | 13 |
| data/game_data.js | 11 |
| game/features/combat/ports/presentation/public_combat_browser_support_capabilities.js | 11 |
| game/features/combat/ports/presentation/public_combat_card_support_capabilities.js | 11 |
| game/features/meta_progression/public.js | 11 |
| game/shared/runtime/public.js | 11 |
| game/features/combat/presentation/browser/combat_copy.js | 10 |
| game/shared/state/player_state_commands.js | 10 |
| game/core/deps_factory.js | 9 |
| game/core/event_bus.js | 8 |
| game/core/store/state_actions.js | 8 |
| game/features/combat/ports/combat_logging.js | 8 |

> Full graph is available in `artifacts/dependency_map.json`.

