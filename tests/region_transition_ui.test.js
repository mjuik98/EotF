import { describe, expect, it, vi } from 'vitest';
import { RegionTransitionUI } from '../game/ui/map/region_transition_ui.js';

function createMockElement() {
  return {
    style: {},
    children: [],
    textContent: '',
    innerHTML: '',
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    addEventListener: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockDoc() {
  const body = createMockElement();
  return {
    body,
    createElement: vi.fn(() => createMockElement()),
  };
}

function createDeps(targetRegionId) {
  const gs = {
    currentRegion: 1,
    currentFloor: 4,
    regionRoute: {},
  };

  return {
    gs,
    targetRegionId,
    doc: createMockDoc(),
    mazeSystem: { close: vi.fn() },
    getRegionData: vi.fn(() => ({
      name: 'Test Region',
      rule: 'Test Rule',
      ruleDesc: 'Test Desc',
      quote: '',
      accent: '#ffffff',
    })),
    getBaseRegionIndex: vi.fn((idx) => idx),
    audioEngine: {
      startAmbient: vi.fn(),
      playBossPhase: vi.fn(),
    },
    particleSystem: { burstEffect: vi.fn() },
    screenShake: { shake: vi.fn() },
    generateMap: vi.fn(),
    updateUI: vi.fn(),
    showRunFragment: vi.fn(),
  };
}

describe('RegionTransitionUI target region parsing', () => {
  it('does not force route to region 0 when targetRegionId is null', () => {
    const deps = createDeps(null);

    RegionTransitionUI.advanceToNextRegion(deps);

    expect(deps.gs.currentRegion).toBe(2);
    expect(deps.gs.currentFloor).toBe(0);
    expect(deps.gs.regionRoute['2']).toBeUndefined();
  });

  it('stores explicit target region when targetRegionId is provided', () => {
    const deps = createDeps(6);

    RegionTransitionUI.advanceToNextRegion(deps);

    expect(deps.gs.currentRegion).toBe(2);
    expect(deps.gs.regionRoute['2']).toBe(6);
  });
});

