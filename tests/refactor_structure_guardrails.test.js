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
  });

  it('delegates combat damage runtime helpers into focused helper modules', () => {
    const source = read('game/features/combat/application/damage_system_runtime_helpers.js');

    expect(source).toContain("./damage_runtime_context.js");
    expect(source).toContain("../domain/damage_value_domain.js");
    expect(source).toContain("./enemy_damage_resolution.js");
    expect(source).toContain("./combat_damage_side_effects.js");
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
});
