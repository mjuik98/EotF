# Dependency Map

- Generated: 2026-03-23T16:40:35.161Z
- Nodes: 1151
- Edges: 1443

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
| feature->data | 10 |
| feature->domain | 16 |
| feature->feature | 867 |
| feature->legacy | 1 |
| feature->other | 1 |
| feature->platform | 3 |
| feature->shared | 33 |
| feature->utils | 2 |
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
| game/features/combat/presentation/browser/combat_ui.js | 7 |
| game/features/combat/presentation/browser/hud_update_ui.js | 7 |
| game/features/run/ports/public_surface.js | 7 |
| game/features/title/platform/browser/character_select_runtime_flow_bindings.js | 7 |
| game/features/title/platform/browser/create_character_select_mount_runtime.js | 7 |

## Top Incoming Dependencies

| File | In Degree |
|---|---:|
| game/core/bindings/module_registry_scopes.js | 17 |
| game/features/combat/presentation/browser/combat_copy.js | 12 |
| data/game_data.js | 11 |
| game/shared/runtime/public.js | 11 |
| game/core/store/state_actions.js | 10 |
| game/shared/state/player_state_commands.js | 10 |
| game/core/deps_factory.js | 9 |
| game/core/event_bus.js | 8 |
| game/features/combat/ports/presentation/public_combat_card_support_capabilities.js | 8 |
| game/features/run/ports/public_rule_capabilities.js | 8 |
| game/features/ui/ports/public_audio_presentation_capabilities.js | 8 |
| game/features/ui/presentation/browser/help_pause_ui_helpers.js | 8 |
| game/utils/log_utils.js | 8 |
| game/domain/audio/audio_event_helpers.js | 7 |
| game/features/combat/ports/presentation/public_combat_status_support_capabilities.js | 7 |

> Full graph is available in `artifacts/dependency_map.json`.

