import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createCombatFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      core: { CombatUI: { id: 'combat-public' } },
      cards: { CardUI: { id: 'combat-card-public' } },
      hud: { HudUpdateUI: { id: 'combat-hud-public' } },
    },
  })),
  createRunFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      map: { MapUI: { id: 'run-public' } },
      flow: { RunModeUI: { id: 'run-flow-public' } },
    },
  })),
  createTitleFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      canvas: { TitleCanvasUI: { id: 'title-canvas-public' } },
      flow: { CharacterSelectUI: { id: 'title-public' } },
    },
  })),
}));

vi.mock('../game/features/title/public.js', () => ({
  createTitleFeatureFacade: hoisted.createTitleFeatureFacade,
}));

vi.mock('../game/features/run/public.js', () => ({
  createRunFeatureFacade: hoisted.createRunFeatureFacade,
}));

vi.mock('../game/features/combat/public.js', () => ({
  createCombatFeatureFacade: hoisted.createCombatFeatureFacade,
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
    expect(hoisted.createTitleFeatureFacade).toHaveBeenCalledTimes(1);
  });

  it('delegates title flow composition to the title public facade', () => {
    expect(buildTitleFlowModules()).toEqual({ CharacterSelectUI: { id: 'title-public' } });
    expect(hoisted.createTitleFeatureFacade).toHaveBeenCalledTimes(2);
  });

  it('delegates run map composition to the run public facade', () => {
    expect(buildRunMapModules()).toEqual({ MapUI: { id: 'run-public' } });
    expect(hoisted.createRunFeatureFacade).toHaveBeenCalledTimes(1);
  });

  it('delegates run flow composition to the run public facade', () => {
    expect(buildRunFlowModules()).toEqual({ RunModeUI: { id: 'run-flow-public' } });
    expect(hoisted.createRunFeatureFacade).toHaveBeenCalledTimes(2);
  });

  it('delegates combat core composition to the combat public facade', () => {
    expect(buildCombatCoreModules()).toEqual({ CombatUI: { id: 'combat-public' } });
    expect(hoisted.createCombatFeatureFacade).toHaveBeenCalledTimes(1);
  });

  it('delegates combat card composition to the combat public facade', () => {
    expect(buildCombatCardModules()).toEqual({ CardUI: { id: 'combat-card-public' } });
    expect(hoisted.createCombatFeatureFacade).toHaveBeenCalledTimes(2);
  });

  it('delegates combat hud composition to the combat public facade', () => {
    expect(buildCombatHudModules()).toEqual({ HudUpdateUI: { id: 'combat-hud-public' } });
    expect(hoisted.createCombatFeatureFacade).toHaveBeenCalledTimes(3);
  });
});
