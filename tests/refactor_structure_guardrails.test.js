import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

describe('refactor structure guardrails', () => {
  it('keeps the legacy global bridge as a thin assembly over helper modules', () => {
    const source = read('game/platform/legacy/global_bridge_runtime.js');

    expect(source).toContain("./legacy_game_root_state.js");
    expect(source).toContain("./legacy_module_registry.js");
    expect(source).toContain("./legacy_root_deps.js");
    expect(source).toContain("./legacy_api_caller.js");
  });

  it('isolates module-registry flat compat behind a helper', () => {
    const source = read('game/core/bindings/module_registry.js');

    expect(source).toContain("./create_module_registry_flat_compat.js");
    expect(source).toContain("./create_module_registry_feature_scopes.js");
    expect(source).toContain("./create_module_registry_runtime_state.js");
    expect(source).toContain('const featureScopes = createModuleRegistryFeatureScopes(groups);');
    expect(source).toContain('const legacyModules = createModuleRegistryFlatCompat(featureScopes);');
    expect(source).not.toContain('...legacyModules');
    expect(source).toContain('legacyModules,');
    expect(source).not.toContain('featureScopes: Object.freeze({');
    expect(source).not.toContain('_gameStarted: false');
    expect(source).not.toContain('_canvasRefs: null');
  });

  it('keeps binding deps/runtime assembly on scoped module registry readers instead of legacy compat flattening', () => {
    const depsRefsSource = read('game/core/bootstrap/build_binding_deps_refs.js');
    const runtimePortsSource = read('game/core/bootstrap/build_binding_runtime_ports.js');

    expect(depsRefsSource).toContain("../bindings/module_registry_scopes.js");
    expect(runtimePortsSource).toContain("../bindings/module_registry_scopes.js");
    expect(depsRefsSource).not.toContain('resolveModuleRegistryLegacyCompat');
    expect(runtimePortsSource).not.toContain('resolveModuleRegistryLegacyCompat');
  });

  it('routes legacy bootstrap assembly through explicit module-registry compat payloads', () => {
    const globalsSource = read('game/core/bootstrap/build_legacy_surface_global_groups.js');
    const engineGlobalsSource = read('game/core/bootstrap/legacy_surface_engine_globals.js');
    const systemGlobalsSource = read('game/core/bootstrap/legacy_surface_system_globals.js');
    const uiGlobalsSource = read('game/core/bootstrap/legacy_surface_ui_globals.js');
    const initArgsSource = read('game/platform/legacy/build_legacy_bridge_init_args.js');
    const apiRegistrySource = read('game/platform/legacy/game_api_registry.js');
    const moduleRegistrySource = read('game/platform/legacy/game_module_registry.js');
    const executorSource = read('game/core/bootstrap/execute_legacy_surface_registration.js');

    expect(globalsSource).toContain("./legacy_surface_engine_globals.js");
    expect(globalsSource).toContain("./legacy_surface_system_globals.js");
    expect(globalsSource).toContain("./legacy_surface_ui_globals.js");
    expect(engineGlobalsSource).toContain("./resolve_legacy_surface_module_refs.js");
    expect(systemGlobalsSource).toContain("./resolve_legacy_surface_module_refs.js");
    expect(uiGlobalsSource).toContain("./resolve_legacy_surface_module_refs.js");
    expect(initArgsSource).toContain('modules?.legacyModules || modules || {}');
    expect(apiRegistrySource).toContain("./resolve_legacy_module_bag.js");
    expect(moduleRegistrySource).toContain("./resolve_legacy_module_bag.js");
    expect(executorSource).toContain('../bindings/resolve_module_registry_legacy_compat.js');
  });

  it('delegates combat damage runtime helpers into focused helper modules', () => {
    const source = read('game/features/combat/application/damage_system_runtime_helpers.js');

    expect(source).toContain("./damage_runtime_context.js");
    expect(source).toContain("../domain/damage_value_domain.js");
    expect(source).toContain("./enemy_damage_resolution.js");
    expect(source).toContain("./combat_damage_side_effects.js");
  });

  it('keeps core combat event subscribers as orchestration over feature-owned runtime handlers', () => {
    const source = read('game/core/event_subscribers_combat_events.js');
    const runtimePortsSource = read('game/core/bootstrap/create_runtime_subscriber_ports.js');

    expect(runtimePortsSource).toContain("../../features/combat/ports/public_runtime_capabilities.js");
    expect(source).not.toContain('ctx.ui.CombatUI');
    expect(source).not.toContain("getElementById?.('hudOverlay')");
    expect(source).not.toContain('createElement?.(');
  });

  it('delegates set bonus trigger orchestration into grouped rule modules', () => {
    const source = read('game/shared/progression/set_bonus_trigger_effects.js');

    expect(source).toContain("./set_bonus_trigger_session_state.js");
    expect(source).toContain("./set_bonus_damage_rules.js");
    expect(source).toContain("./set_bonus_survival_rules.js");
    expect(source).toContain("./set_bonus_resource_rules.js");
  });

  it('delegates echo ripple rendering into focused browser effect helpers', () => {
    const source = read('game/platform/browser/effects/echo_ripple_transition.js');

    expect(source).toContain("./echo_ripple_runtime_context.js");
    expect(source).toContain("./echo_ripple_particles.js");
    expect(source).toContain("./echo_ripple_renderer.js");
  });

  it('delegates run-mode inscription rendering into focused browser helpers', () => {
    const source = read('game/features/run/presentation/browser/run_mode_ui_render.js');

    expect(source).toContain("./run_mode_ui_inscriptions_render.js");
  });

  it('delegates combat item tooltip state and DOM construction into focused helpers', () => {
    const source = read('game/features/combat/presentation/browser/tooltip_item_render_ui.js');

    expect(source).toContain("./tooltip_item_state.js");
    expect(source).toContain("./tooltip_item_element.js");
  });
});
