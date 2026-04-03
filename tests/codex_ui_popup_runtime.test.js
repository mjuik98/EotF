import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/codex/presentation/browser/codex_ui_helpers.js', () => ({
  getCodexDoc: vi.fn((deps) => deps.doc),
  highlightCodexDescription: vi.fn((value) => `<hl>${value}</hl>`),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_popup.js', () => ({
  closeCodexPopup: vi.fn(),
  ensureCodexPopupOverlay: vi.fn(),
  openCodexPopup: vi.fn(),
  setCodexPopupTheme: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_popup_payloads.js', () => ({
  buildCardPopupPayload: vi.fn(() => ({ theme: { bg1: '#1', bg2: '#2', border: '#3', glow: '#4' }, html: '<card />' })),
  buildEnemyPopupPayload: vi.fn(() => ({ theme: { bg1: '#a', bg2: '#b', border: '#c', glow: '#d' }, html: '<enemy />' })),
  buildItemPopupPayload: vi.fn(() => ({ theme: { bg1: '#x', bg2: '#y', border: '#z', glow: '#w' }, html: '<item />' })),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_popup_blocks.js', () => ({
  buildCodexNavBlock: vi.fn(() => '<nav />'),
  buildCodexQuoteBlock: vi.fn(() => '<quote />'),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_controller.js', () => ({
  clearCodexPopupNavigation: vi.fn(),
  navigateCodexPopup: vi.fn(),
  setCodexPopupNavigation: vi.fn(),
}));

function makeNode() {
  const listeners = {};
  return {
    innerHTML: '',
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    listeners,
  };
}

describe('codex_ui_popup_runtime', () => {
  let popup;
  let popupPayloads;
  let popupBlocks;
  let controller;
  let runtime;

  beforeEach(async () => {
    vi.clearAllMocks();
    popup = await import('../game/features/codex/presentation/browser/codex_ui_popup.js');
    popupPayloads = await import('../game/features/codex/presentation/browser/codex_ui_popup_payloads.js');
    popupBlocks = await import('../game/features/codex/presentation/browser/codex_ui_popup_blocks.js');
    controller = await import('../game/features/codex/presentation/browser/codex_ui_controller.js');
    runtime = await import('../game/features/codex/presentation/browser/codex_ui_popup_runtime.js');
  });

  it('opens the enemy popup, mounts markup, and wires close/nav handlers', async () => {
    const box = makeNode();
    const close = makeNode();
    const prev = makeNode();
    const next = makeNode();
    const doc = {
      getElementById: vi.fn((id) => ({
        cxPopupBox: box,
        cxPopupClose: close,
        cxNavPrev: prev,
        cxNavNext: next,
      }[id] || null)),
    };
    const state = {
      deps: { doc, gs: { run: true } },
      popupList: [{ id: 'wolf' }, { id: 'slime' }],
      popupIndex: 1,
    };
    const enemy = { id: 'wolf', quote: 'growl' };

    await runtime.openEnemyCodexPopup(state, enemy, state.popupList);

    expect(controller.setCodexPopupNavigation).toHaveBeenCalledWith(state, enemy, state.popupList, expect.any(Function));
    expect(popupBlocks.buildCodexQuoteBlock).toHaveBeenCalledWith('growl');
    expect(popupBlocks.buildCodexNavBlock).toHaveBeenCalledWith(state.popupList, state.popupIndex);
    expect(popupPayloads.buildEnemyPopupPayload).toHaveBeenCalledWith(enemy, expect.objectContaining({
      gs: state.deps.gs,
      safeHtml: expect.any(Function),
      quoteHtml: '<quote />',
      navHtml: '<nav />',
    }));
    expect(popup.setCodexPopupTheme).toHaveBeenCalledWith(doc, '#a', '#b', '#c', '#d');
    expect(box.innerHTML).toBe('<enemy />');
    expect(popup.openCodexPopup).toHaveBeenCalledWith(doc);

    close.listeners.click();
    prev.listeners.click();
    next.listeners.click();

    expect(popup.closeCodexPopup).toHaveBeenCalledWith(doc);
    expect(controller.clearCodexPopupNavigation).toHaveBeenCalledWith(state);
    expect(controller.navigateCodexPopup).toHaveBeenCalledWith(state, -1);
    expect(controller.navigateCodexPopup).toHaveBeenCalledWith(state, 1);
  });

  it('opens card and item popups with gs/data context and exposes direct close helper', async () => {
    const box = makeNode();
    const close = makeNode();
    const doc = {
      getElementById: vi.fn((id) => ({
        cxPopupBox: box,
        cxPopupClose: close,
      }[id] || null)),
    };
    const state = {
      deps: { doc, gs: { meta: true }, data: { cards: {}, items: {} } },
      popupList: [],
      popupIndex: 0,
    };

    await runtime.openCardCodexPopup(state, { id: 'strike', quote: 'slash' });
    expect(popupPayloads.buildCardPopupPayload).toHaveBeenCalledWith(
      { id: 'strike', quote: 'slash' },
      expect.objectContaining({
        gs: state.deps.gs,
        data: state.deps.data,
      }),
    );

    await runtime.openItemCodexPopup(state, { id: 'relic', quote: 'shine' });
    expect(popupPayloads.buildItemPopupPayload).toHaveBeenCalledWith(
      { id: 'relic', quote: 'shine' },
      expect.objectContaining({
        gs: state.deps.gs,
        data: state.deps.data,
      }),
    );

    runtime.closeCodexDetailPopup(state, doc);
    expect(popup.closeCodexPopup).toHaveBeenCalledWith(doc);
    expect(controller.clearCodexPopupNavigation).toHaveBeenCalledWith(state);
  });
});
