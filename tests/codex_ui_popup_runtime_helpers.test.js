import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/codex/presentation/browser/codex_ui_popup.js', () => ({
  closeCodexPopup: vi.fn(),
  ensureCodexPopupOverlay: vi.fn(),
  openCodexPopup: vi.fn(),
  setCodexPopupTheme: vi.fn(),
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

describe('codex_ui_popup_runtime_helpers', () => {
  let popup;
  let controller;
  let helpers;

  beforeEach(async () => {
    vi.clearAllMocks();
    popup = await import('../game/features/codex/presentation/browser/codex_ui_popup.js');
    controller = await import('../game/features/codex/presentation/browser/codex_ui_controller.js');
    helpers = await import('../game/features/codex/presentation/browser/codex_ui_popup_runtime_helpers.js');
  });

  it('closes popup state and clears navigation', () => {
    const state = {};
    const doc = {};

    helpers.closeCodexDetailPopup(state, doc);

    expect(popup.closeCodexPopup).toHaveBeenCalledWith(doc);
    expect(controller.clearCodexPopupNavigation).toHaveBeenCalledWith(state);
  });

  it('mounts popup html, theme, close button, and navigation bindings', () => {
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
    const state = {};

    helpers.mountPopup(state, doc, {
      theme: { bg1: '#1', bg2: '#2', border: '#3', glow: '#4' },
      html: '<content />',
    }, vi.fn());

    expect(popup.ensureCodexPopupOverlay).toHaveBeenCalledTimes(1);
    expect(popup.setCodexPopupTheme).toHaveBeenCalledWith(doc, '#1', '#2', '#3', '#4');
    expect(box.innerHTML).toBe('<content />');
    expect(controller.setCodexPopupNavigation).toHaveBeenCalledTimes(1);
    expect(popup.openCodexPopup).toHaveBeenCalledWith(doc);

    close.listeners.click();
    prev.listeners.click();
    next.listeners.click();

    expect(popup.closeCodexPopup).toHaveBeenCalledWith(doc);
    expect(controller.navigateCodexPopup).toHaveBeenCalledWith(state, -1);
    expect(controller.navigateCodexPopup).toHaveBeenCalledWith(state, 1);
  });
});
