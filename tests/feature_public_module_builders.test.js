import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createCombatModuleCapabilities: vi.fn(() => ({
    core: { CombatUI: { id: 'combat-public' } },
    cards: { CardUI: { id: 'combat-card-public' } },
    hud: { HudUpdateUI: { id: 'combat-hud-public' } },
  })),
  createRunModuleCapabilities: vi.fn(() => ({
    map: { MapUI: { id: 'run-public' } },
    flow: { RunModeUI: { id: 'run-flow-public' } },
  })),
  createTitleModuleCapabilities: vi.fn(() => ({
    canvas: { TitleCanvasUI: { id: 'title-canvas-public' } },
    flow: { CharacterSelectUI: { id: 'title-public' } },
  })),
}));

vi.mock('../game/features/title/ports/public_module_capabilities.js', () => ({
  createTitleModuleCapabilities: hoisted.createTitleModuleCapabilities,
}));

vi.mock('../game/features/run/ports/public_module_capabilities.js', () => ({
  createRunModuleCapabilities: hoisted.createRunModuleCapabilities,
}));

vi.mock('../game/features/combat/ports/public_module_capabilities.js', () => ({
  createCombatModuleCapabilities: hoisted.createCombatModuleCapabilities,
}));

import { buildTitleCanvasModules } from '../game/platform/browser/composition/build_title_canvas_modules.js';
import { buildTitleFlowModules } from '../game/platform/browser/composition/build_title_flow_modules.js';
import { buildRunMapModules } from '../game/platform/browser/composition/build_run_map_modules.js';
import { buildRunFlowModules } from '../game/platform/browser/composition/build_run_flow_modules.js';
import { buildCombatCoreModules } from '../game/platform/browser/composition/build_combat_core_modules.js';
import { buildCombatCardModules } from '../game/platform/browser/composition/build_combat_card_modules.js';
import { buildCombatHudModules } from '../game/platform/browser/composition/build_combat_hud_modules.js';

describe('feature public module builders', () => {
  it('delegates title canvas composition to the title module-capability port', () => {
    expect(buildTitleCanvasModules()).toEqual({ TitleCanvasUI: { id: 'title-canvas-public' } });
    expect(hoisted.createTitleModuleCapabilities).toHaveBeenCalledTimes(1);
  });

  it('delegates title flow composition to the title module-capability port', () => {
    expect(buildTitleFlowModules()).toEqual({ CharacterSelectUI: { id: 'title-public' } });
    expect(hoisted.createTitleModuleCapabilities).toHaveBeenCalledTimes(2);
  });

  it('delegates run map composition to the run module-capability port', () => {
    expect(buildRunMapModules()).toEqual({ MapUI: { id: 'run-public' } });
    expect(hoisted.createRunModuleCapabilities).toHaveBeenCalledTimes(1);
  });

  it('delegates run flow composition to the run module-capability port', () => {
    expect(buildRunFlowModules()).toEqual({ RunModeUI: { id: 'run-flow-public' } });
    expect(hoisted.createRunModuleCapabilities).toHaveBeenCalledTimes(2);
  });

  it('delegates combat core composition to the combat module-capability port', () => {
    expect(buildCombatCoreModules()).toEqual({ CombatUI: { id: 'combat-public' } });
    expect(hoisted.createCombatModuleCapabilities).toHaveBeenCalledTimes(1);
  });

  it('delegates combat card composition to the combat module-capability port', () => {
    expect(buildCombatCardModules()).toEqual({ CardUI: { id: 'combat-card-public' } });
    expect(hoisted.createCombatModuleCapabilities).toHaveBeenCalledTimes(2);
  });

  it('delegates combat hud composition to the combat module-capability port', () => {
    expect(buildCombatHudModules()).toEqual({ HudUpdateUI: { id: 'combat-hud-public' } });
    expect(hoisted.createCombatModuleCapabilities).toHaveBeenCalledTimes(3);
  });
});
