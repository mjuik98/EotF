import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/codex/presentation/browser/codex_ui_helpers.js', () => ({
  applyCodexFilter: vi.fn((entries) => entries.filter((entry) => entry.keep !== false)),
  buildCodexProgress: vi.fn(() => ({ enemies: 2 })),
  buildCodexRewardRoadmap: vi.fn(() => []),
  buildRecentCodexDiscoveries: vi.fn(() => []),
  ensureCodexState: vi.fn(() => ({
    enemies: new Set(['seen-enemy']),
    cards: new Set(['seen-card']),
    items: new Set(['seen-item']),
  })),
  getCodexFilterDefinitions: vi.fn(() => ({ enemies: ['elite'] })),
  getCodexRecord: vi.fn(() => ({ firstSeen: 'today' })),
  getEnemyTypeClass: vi.fn(() => 'enemy-class'),
  isSeenCodexCard: vi.fn((codex, id) => codex.cards.has(id)),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_render.js', () => ({
  createCodexCardEntry: vi.fn((doc, entry, index, options) => ({ doc, entry, index, options })),
  createCodexEnemyCard: vi.fn((doc, enemy, index, options) => ({ doc, enemy, index, options })),
  createCodexItemCard: vi.fn((doc, item, index, options) => ({ doc, item, index, options })),
  renderCodexEmpty: vi.fn(),
  renderCodexFilterBar: vi.fn(),
  renderCodexProgress: vi.fn(),
  renderCodexSection: vi.fn(),
  renderCodexSetView: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_popup_runtime.js', () => ({
  openCardCodexPopup: vi.fn(),
  openEnemyCodexPopup: vi.fn(),
  openItemCodexPopup: vi.fn(),
}));

describe('codex_ui_runtime_helpers', () => {
  let helpers;
  let render;
  let popupRuntime;
  let helperModule;

  beforeEach(async () => {
    vi.clearAllMocks();
    helpers = await import('../game/features/codex/presentation/browser/codex_ui_runtime_helpers.js');
    render = await import('../game/features/codex/presentation/browser/codex_ui_render.js');
    popupRuntime = await import('../game/features/codex/presentation/browser/codex_ui_popup_runtime.js');
    helperModule = await import('../game/features/codex/presentation/browser/codex_ui_helpers.js');
  });

  it('renders progress and filter callbacks through shared helpers', () => {
    const ui = { setCodexTab: vi.fn(), renderCodexContent: vi.fn() };
    const state = { tab: 'enemies', deps: { gs: { meta: {} }, data: {} }, filter: 'all', showUnknown: false };
    const doc = {};
    helperModule.buildCodexRewardRoadmap.mockReturnValueOnce([{
      contentLabel: '큐레이터의 등불',
      remaining: 7,
    }]);
    helperModule.buildRecentCodexDiscoveries.mockReturnValueOnce([{
      categoryLabel: '카드',
      label: '타격',
      firstSeen: '2026-03-26',
    }]);

    helpers.renderCodexRuntimeProgress(state, ui, doc, {}, {});
    helpers.renderCodexRuntimeFilterBar(state, ui, doc, {});

    expect(render.renderCodexProgress).toHaveBeenCalledTimes(1);
    expect(render.renderCodexFilterBar).toHaveBeenCalledTimes(1);
    expect(helperModule.buildCodexRewardRoadmap).toHaveBeenCalledWith({}, { limit: 3 });
    expect(helperModule.buildRecentCodexDiscoveries).toHaveBeenCalledWith({}, { data: {}, limit: 4 });
    expect(render.renderCodexProgress.mock.calls[0][1].rewardRoadmap[0]).toEqual(expect.objectContaining({
      remaining: 7,
    }));
    expect(render.renderCodexProgress.mock.calls[0][1].recentDiscoveries[0]).toEqual(expect.objectContaining({
      categoryLabel: '카드',
    }));

    const options = render.renderCodexFilterBar.mock.calls[0][1];
    options.onFilterChange('elite');
    expect(state.filter).toBe('elite');
    expect(ui.renderCodexContent).toHaveBeenCalledWith(state.deps);
  });

  it('builds entry callbacks that reopen popup navigation through filtered lists', () => {
    const state = { deps: { gs: {}, data: {} } };
    const doc = {};

    const enemyCard = helpers.createCodexRuntimeEnemyCard(state, { id: 'wolf' }, 0, [{ id: 'seen-enemy' }, { id: 'hidden-enemy' }], doc);
    enemyCard.options.onOpen({ id: 'wolf' });
    expect(popupRuntime.openEnemyCodexPopup).toHaveBeenCalledWith(state, { id: 'wolf' }, [{ id: 'seen-enemy' }]);

    const cardEntry = helpers.createCodexRuntimeCardEntry(state, { id: 'seen-card' }, 0, [{ id: 'seen-card' }, { id: 'hidden-card' }], doc);
    cardEntry.options.onOpen({ id: 'seen-card' });
    expect(popupRuntime.openCardCodexPopup).toHaveBeenCalledWith(state, { id: 'seen-card' }, [{ id: 'seen-card' }]);
  });
});
