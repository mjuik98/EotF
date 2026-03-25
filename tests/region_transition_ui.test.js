import { describe, expect, it, vi } from 'vitest';
import { RegionTransitionUI } from '../game/features/run/public.js';

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
  const win = {
    innerHeight: 720,
    innerWidth: 1280,
    setTimeout: vi.fn((fn) => fn()),
  };
  const gs = {
    currentRegion: 1,
    currentFloor: 4,
    regionRoute: {},
  };

  return {
    gs,
    targetRegionId,
    doc: createMockDoc(),
    win,
    mazeSystem: { close: vi.fn() },
    getRegionData: vi.fn(() => ({
      name: 'Test Region',
      rule: 'Test Rule',
      ruleDesc: 'Test Desc',
      quote: '',
      accent: '#ffffff',
    })),
    getBaseRegionIndex: vi.fn((idx) => idx),
    descriptionUtils: { highlight: vi.fn((text) => `hl:${text}`) },
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
    expect(deps.particleSystem.burstEffect).toHaveBeenCalledWith(640, 360);
    const overlay = deps.doc.body.children[0];
    const desc = overlay.children[3];
    expect(desc.innerHTML).toContain('Test Desc');
  });

  it('stores explicit target region when targetRegionId is provided', () => {
    const deps = createDeps(6);

    RegionTransitionUI.advanceToNextRegion(deps);

    expect(deps.gs.currentRegion).toBe(2);
    expect(deps.gs.regionRoute['2']).toBe(6);
  });

  it('records clear time for the completed region', () => {
    const deps = createDeps(null);
    deps.gs.stats = {
      regionClearTimes: {},
      _regionStartTs: 1000,
    };
    vi.spyOn(Date, 'now').mockReturnValue(4600);

    RegionTransitionUI.advanceToNextRegion(deps);

    expect(deps.gs.stats.regionClearTimes[1]).toBe(3600);
    expect(deps.gs.stats._regionStartTs).toBe(4600);
  });

  it('escapes raw markup and still highlights region descriptions without injected description utils', () => {
    const deps = createDeps(null);
    delete deps.descriptionUtils;
    deps.getRegionData.mockReturnValueOnce({
      name: 'Test Region',
      rule: 'Test Rule',
      ruleDesc: '<img src=x onerror=alert(1)> 피해 14 [지역 규칙]',
      quote: '',
      accent: '#ffffff',
    });

    RegionTransitionUI.advanceToNextRegion(deps);

    const overlay = deps.doc.body.children[0];
    const desc = overlay.children[3];
    expect(desc.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(desc.innerHTML).toContain('kw-dmg');
    expect(desc.innerHTML).toContain('kw-special kw-block');
  });
});
