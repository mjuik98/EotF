import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildCombatPublicModules: vi.fn(() => ({ CombatUI: { id: 'combat-public' } })),
  buildCombatCardPublicModules: vi.fn(() => ({ CardUI: { id: 'combat-card-public' } })),
  buildCombatHudPublicModules: vi.fn(() => ({ HudUpdateUI: { id: 'combat-hud-public' } })),
  buildRunMapPublicModules: vi.fn(() => ({ MapUI: { id: 'run-public' } })),
  buildRunFlowPublicModules: vi.fn(() => ({ RunModeUI: { id: 'run-flow-public' } })),
  buildTitleCanvasPublicModules: vi.fn(() => ({ TitleCanvasUI: { id: 'title-canvas-public' } })),
  buildTitlePublicModules: vi.fn(() => ({ CharacterSelectUI: { id: 'title-public' } })),
}));

vi.mock('../game/features/title/public.js', () => ({
  buildTitleCanvasPublicModules: hoisted.buildTitleCanvasPublicModules,
  buildTitlePublicModules: hoisted.buildTitlePublicModules,
}));

vi.mock('../game/features/run/modules/public_run_modules.js', () => ({
  buildRunMapPublicModules: hoisted.buildRunMapPublicModules,
  buildRunFlowPublicModules: hoisted.buildRunFlowPublicModules,
}));

vi.mock('../game/features/combat/modules/public_combat_modules.js', () => ({
  buildCombatPublicModules: hoisted.buildCombatPublicModules,
  buildCombatCardPublicModules: hoisted.buildCombatCardPublicModules,
  buildCombatHudPublicModules: hoisted.buildCombatHudPublicModules,
}));

import { buildTitleCanvasModules } from '../game/platform/browser/composition/build_title_canvas_modules.js';
import { buildTitleFlowModules } from '../game/platform/browser/composition/build_title_flow_modules.js';
import { buildRunMapModules } from '../game/platform/browser/composition/build_run_map_modules.js';
import { buildRunFlowModules } from '../game/platform/browser/composition/build_run_flow_modules.js';
import { buildCombatCoreModules } from '../game/platform/browser/composition/build_combat_core_modules.js';
import { buildCombatCardModules } from '../game/platform/browser/composition/build_combat_card_modules.js';
import { buildCombatHudModules } from '../game/platform/browser/composition/build_combat_hud_modules.js';

describe('feature public module builders', () => {
  it('delegates title canvas composition to the title public facade', () => {
    expect(buildTitleCanvasModules()).toEqual({ TitleCanvasUI: { id: 'title-canvas-public' } });
    expect(hoisted.buildTitleCanvasPublicModules).toHaveBeenCalledTimes(1);
  });

  it('delegates title flow composition to the title public facade', () => {
    expect(buildTitleFlowModules()).toEqual({ CharacterSelectUI: { id: 'title-public' } });
    expect(hoisted.buildTitlePublicModules).toHaveBeenCalledTimes(1);
  });

  it('delegates run map composition to the run public facade', () => {
    expect(buildRunMapModules()).toEqual({ MapUI: { id: 'run-public' } });
    expect(hoisted.buildRunMapPublicModules).toHaveBeenCalledTimes(1);
  });

  it('delegates run flow composition to the run public facade', () => {
    expect(buildRunFlowModules()).toEqual({ RunModeUI: { id: 'run-flow-public' } });
    expect(hoisted.buildRunFlowPublicModules).toHaveBeenCalledTimes(1);
  });

  it('delegates combat core composition to the combat public facade', () => {
    expect(buildCombatCoreModules()).toEqual({ CombatUI: { id: 'combat-public' } });
    expect(hoisted.buildCombatPublicModules).toHaveBeenCalledTimes(1);
  });

  it('delegates combat card composition to the combat public facade', () => {
    expect(buildCombatCardModules()).toEqual({ CardUI: { id: 'combat-card-public' } });
    expect(hoisted.buildCombatCardPublicModules).toHaveBeenCalledTimes(1);
  });

  it('delegates combat hud composition to the combat public facade', () => {
    expect(buildCombatHudModules()).toEqual({ HudUpdateUI: { id: 'combat-hud-public' } });
    expect(hoisted.buildCombatHudPublicModules).toHaveBeenCalledTimes(1);
  });
});
