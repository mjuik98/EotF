import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/screens/ending_screen_helpers.js', () => ({
  applyEndingRank: vi.fn(),
  appendEndingFragmentChoices: vi.fn(),
  buildEndingPayload: vi.fn(() => ({
    score: 45,
    rank: { glyph: 'C', color: '#9b8ab8', glow: 'rgba(155,138,184,.35)', title: 'survivor', label: 'SURVIVOR' },
  })),
  buildEndingScreenDOM: vi.fn(() => ({ id: 'endingScreen' })),
  decorateEndingPayloadForOutcome: vi.fn((payload) => payload),
  docOf: vi.fn((deps) => deps.doc),
  ensureEndingScreenStyle: vi.fn(),
  findRankIndexByGlyph: vi.fn(() => 0),
  getEndingRanks: vi.fn(() => [
    { glyph: 'C', color: '#9b8ab8', glow: 'rgba(155,138,184,.35)', title: 'survivor', label: 'SURVIVOR' },
    { glyph: 'B', color: '#4af3cc', glow: 'rgba(74,243,204,.45)', title: 'expert', label: 'EXPERT' },
  ]),
  populateEndingMeta: vi.fn(),
  winOf: vi.fn((deps) => deps.win),
}));

vi.mock('../game/ui/screens/ending_screen_fx.js', () => ({
  burstEndingWisps: vi.fn(),
  initEndingFx: vi.fn(() => ({ wisps: [] })),
}));

describe('ending_screen_runtime_helpers', () => {
  it('prepares a session by cleaning up, injecting markup, and booting fx', async () => {
    const helpers = await import('../game/ui/screens/ending_screen_runtime_helpers.js');
    const endingHelpers = await import('../game/ui/screens/ending_screen_helpers.js');
    const endingFx = await import('../game/ui/screens/ending_screen_fx.js');
    const doc = {
      body: {
        appendChild: vi.fn(),
      },
    };
    const hooks = { cleanup: vi.fn() };

    const result = helpers.prepareEndingScreenSession('victory', {
      doc,
      win: {},
      gs: {},
      data: {},
    }, hooks);

    expect(hooks.cleanup).toHaveBeenCalledWith({ doc, win: {} });
    expect(endingHelpers.ensureEndingScreenStyle).toHaveBeenCalledWith(doc);
    expect(doc.body.appendChild).toHaveBeenCalledWith({ id: 'endingScreen' });
    expect(endingHelpers.populateEndingMeta).toHaveBeenCalled();
    expect(endingHelpers.appendEndingFragmentChoices).toHaveBeenCalled();
    expect(endingHelpers.applyEndingRank).toHaveBeenCalled();
    expect(endingFx.initEndingFx).toHaveBeenCalled();
    expect(result.session.payload).toMatchObject({ score: 45 });
  });

  it('binds sigil cycling and restart flow through runtime callbacks', async () => {
    const helpers = await import('../game/ui/screens/ending_screen_runtime_helpers.js');
    const endingHelpers = await import('../game/ui/screens/ending_screen_helpers.js');
    const endingFx = await import('../game/ui/screens/ending_screen_fx.js');

    let sigilHandler = null;
    let restartHandler = null;
    const sigil = {
      addEventListener: vi.fn((type, fn) => {
        if (type === 'click') sigilHandler = fn;
      }),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({ left: 10, top: 20, width: 30, height: 40 })),
    };
    const restartButton = {
      addEventListener: vi.fn((type, fn) => {
        if (type === 'click') restartHandler = fn;
      }),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({ left: 100, top: 50, width: 120, height: 40 })),
    };
    const doc = {
      getElementById(id) {
        if (id === 'sigilWrap') return sigil;
        if (id === 'btnR') return restartButton;
        return null;
      },
    };
    const timers = [];
    const win = {
      setTimeout: vi.fn((fn, delay) => {
        timers.push(delay);
        return delay;
      }),
    };
    const session = { cleanups: [], timers: [] };
    const restartFromEnding = vi.fn();
    const playResonanceBurst = vi.fn();

    helpers.bindEndingSigilCycle(doc, { win }, { rank: { glyph: 'C' }, score: 45 }, session, []);
    sigilHandler();

    expect(endingHelpers.applyEndingRank).toHaveBeenLastCalledWith(doc, expect.objectContaining({ glyph: 'B' }), 45);
    expect(endingFx.burstEndingWisps).toHaveBeenCalledWith([], 25, 40, 12);

    helpers.bindEndingRestartButton(doc, {
      win,
      audioEngine: { playResonanceBurst },
      restartFromEnding,
    }, session, [], { cleanup: vi.fn() });
    restartHandler();

    expect(playResonanceBurst).toHaveBeenCalled();
    expect(timers).toEqual(expect.arrayContaining([0, 70, 140, 210, 280, 420]));
    expect(session.cleanups).toHaveLength(2);
  });
});
