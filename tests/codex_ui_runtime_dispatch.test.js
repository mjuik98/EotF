import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/codex/presentation/browser/codex_ui_content_runtime.js', () => ({
  renderCardsCodexTab: vi.fn(),
  renderEnemyCodexTab: vi.fn(),
  renderItemsCodexTab: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_inscriptions.js', () => ({
  renderCodexInscriptions: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_runtime_helpers.js', () => ({
  applyCodexRuntimeFilter: vi.fn(),
  createCodexRuntimeCardEntry: vi.fn(),
  createCodexRuntimeEnemyCard: vi.fn(),
  createCodexRuntimeItemCard: vi.fn(),
  renderCodexRuntimeEmpty: vi.fn(),
  renderCodexRuntimeFilterBar: vi.fn(),
  renderCodexRuntimeProgress: vi.fn(),
  renderCodexRuntimeSection: vi.fn(),
  renderCodexRuntimeSetView: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_structure.js', () => ({
  setCodexTabState: vi.fn(),
}));

describe('codex_ui_runtime_dispatch', () => {
  let dispatch;
  let contentRuntime;
  let inscriptions;
  let runtimeHelpers;
  let structure;

  beforeEach(async () => {
    vi.clearAllMocks();
    dispatch = await import('../game/features/codex/presentation/browser/codex_ui_runtime_dispatch.js');
    contentRuntime = await import('../game/features/codex/presentation/browser/codex_ui_content_runtime.js');
    inscriptions = await import('../game/features/codex/presentation/browser/codex_ui_inscriptions.js');
    runtimeHelpers = await import('../game/features/codex/presentation/browser/codex_ui_runtime_helpers.js');
    structure = await import('../game/features/codex/presentation/browser/codex_ui_structure.js');
  });

  it('creates codex modal callbacks that mutate state and call facade actions', () => {
    const state = { search: '', sort: 'default', deps: { audioEngine: { playEvent: vi.fn(), playClick: vi.fn() } } };
    const ui = { renderCodexContent: vi.fn(), closeCodex: vi.fn(), setCodexTab: vi.fn() };
    const callbacks = dispatch.createCodexModalCallbacks(state, ui);

    callbacks.onSearchChange('Wolf');
    callbacks.onSortChange('name');
    callbacks.onClose();
    callbacks.onTabSelect('cards');

    expect(state.search).toBe('wolf');
    expect(state.sort).toBe('name');
    expect(ui.renderCodexContent).toHaveBeenCalledTimes(2);
    expect(ui.closeCodex).toHaveBeenCalledWith(state.deps);
    expect(ui.setCodexTab).toHaveBeenCalledWith('cards', state.deps);
    expect(state.deps.audioEngine.playEvent).toHaveBeenCalledWith('ui', 'click');
    expect(state.deps.audioEngine.playClick).not.toHaveBeenCalled();
  });

  it('dispatches tab content rendering and tab transition callbacks', () => {
    const content = { textContent: 'stale' };
    const doc = {
      getElementById: vi.fn((id) => (id === 'codexContent' ? content : null)),
    };
    const deps = {
      gs: {},
      data: {
        enemies: { wolf: { id: 'wolf' } },
        cards: {},
        items: {},
        inscriptions: { alpha: { id: 'alpha' } },
      },
    };
    const ui = { renderCodexContent: vi.fn(), setCodexTab: vi.fn() };

    expect(dispatch.renderCodexTabContent({ tab: 'enemies' }, ui, doc, deps, {}, vi.fn())).toBe(true);
    expect(contentRuntime.renderEnemyCodexTab).toHaveBeenCalledTimes(1);

    dispatch.renderCodexTabContent({ tab: 'inscriptions' }, ui, doc, deps, {}, vi.fn());
    expect(inscriptions.renderCodexInscriptions).toHaveBeenCalledWith(doc, content, [{ id: 'alpha' }], deps.gs);
    expect(runtimeHelpers.renderCodexRuntimeProgress).toHaveBeenCalledTimes(2);

    const transitionCodexTab = vi.fn();
    const state = {};
    dispatch.applyCodexTabTransition(state, ui, doc, { data: {}, tab: 'items', _force: true }, transitionCodexTab);
    expect(transitionCodexTab).toHaveBeenCalledWith(doc, state, 'items', expect.objectContaining({
      force: true,
      onBeforeRender: expect.any(Function),
      onRender: expect.any(Function),
    }));

    const options = transitionCodexTab.mock.calls[0][3];
    options.onBeforeRender('items');
    options.onRender();
    expect(structure.setCodexTabState).toHaveBeenCalledWith(doc, 'items');
    expect(runtimeHelpers.renderCodexRuntimeFilterBar).toHaveBeenCalledTimes(1);
    expect(ui.renderCodexContent).toHaveBeenCalledWith({ data: {}, tab: 'items', _force: true });
  });
});
