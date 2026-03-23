# Dependency Map

- Generated: 2026-03-23T10:19:22.134Z
- Nodes: 1304
- Edges: 1440

## Layer Edges

| Edge | Count |
|---|---:|
| core->core | 167 |
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
| domain->domain | 15 |
| domain->feature | 1 |
| domain->shared | 1 |
| domain->utils | 3 |
| engine->data | 1 |
| engine->engine | 2 |
| feature->core | 23 |
| feature->data | 37 |
| feature->domain | 39 |
| feature->feature | 762 |
| feature->legacy | 1 |
| feature->other | 7 |
| feature->platform | 3 |
| feature->shared | 51 |
| feature->utils | 30 |
| legacy->core | 6 |
| legacy->domain | 1 |
| legacy->feature | 8 |
| legacy->legacy | 77 |
| legacy->shared | 12 |
| legacy->utils | 3 |
| platform->core | 5 |
| platform->data | 1 |
| platform->domain | 1 |
| platform->engine | 5 |
| platform->feature | 15 |
| platform->legacy | 2 |
| platform->other | 1 |
| platform->platform | 16 |
| platform->shared | 2 |
| platform->utils | 4 |
| shared->core | 5 |
| shared->data | 2 |
| shared->feature | 3 |
| shared->legacy | 1 |
| shared->shared | 46 |
| shared->utils | 2 |
| utils->core | 1 |
| utils->data | 2 |
| utils->utils | 2 |

## Top Outgoing Dependencies

| File | Out Degree |
|---|---:|
| game/features/combat/platform/browser/combat_browser_modules.js | 13 |
| game/features/combat/application/death_flow_actions.js | 12 |
| game/features/title/platform/browser/create_character_select_runtime_bindings.js | 12 |
| game/features/combat/ports/public_application_capabilities.js | 11 |
| game/features/event/ports/public_application_capabilities.js | 9 |
| data/events_data.js | 8 |
| game/core/bindings/build_module_registry_group_registrars.js | 8 |
| game/features/combat/ports/public_surface.js | 8 |
| game/features/run/application/run_rules.js | 8 |
| game/features/title/platform/browser/create_character_select_mount_runtime.js | 8 |
| game/features/title/ports/runtime/public_title_runtime_surface.js | 8 |
| game/platform/browser/composition/build_core_engine_modules.js | 8 |
| data/game_data.js | 7 |
| game/features/codex/presentation/browser/codex_ui_runtime.js | 7 |
| game/features/combat/application/combat_lifecycle_facade.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/domain/audio/audio_event_helpers.js | 29 |
| game/core/bindings/module_registry_scopes.js | 17 |
| data/game_data.js | 14 |
| game/features/combat/presentation/browser/combat_copy.js | 12 |
| game/utils/log_utils.js | 12 |
| game/shared/runtime/public.js | 11 |
| game/core/store/state_actions.js | 10 |
| game/shared/state/player_state_commands.js | 10 |
| game/utils/logger.js | 10 |
| game/core/deps_factory.js | 9 |
| data/status_effects_data.js | 8 |
| data/status_key_data.js | 8 |
| game/core/event_bus.js | 8 |
| game/features/run/ports/public_rule_capabilities.js | 8 |
| game/features/ui/presentation/browser/help_pause_ui_helpers.js | 8 |

> Full graph is available in `artifacts/dependency_map.json`.

