import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/codex/presentation/browser/codex_ui_helpers.js', () => ({
  applyCodexFilter: vi.fn((entries) => entries),
  buildCodexProgress: vi.fn(() => ({ enemies: 1 })),
  buildCodexRewardRoadmap: vi.fn(() => []),
  buildRecentCodexDiscoveries: vi.fn(() => []),
  ensureCodexState: vi.fn(() => ({
    enemies: new Set(),
    cards: new Set(),
    items: new Set(),
  })),
  getBaseCodexCards: vi.fn((data) => Object.values(data.cards || {})),
  getCodexDoc: vi.fn((deps) => deps.doc),
  getCodexFilterDefinitions: vi.fn(() => ({ enemies: [], cards: [], items: [], inscriptions: [] })),
  getCodexRecord: vi.fn(() => null),
  getEnemyTypeClass: vi.fn(() => 'enemy'),
  highlightCodexDescription: vi.fn((value) => value),
  isSeenCodexCard: vi.fn(() => true),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_render.js', () => ({
  createCodexCardEntry: vi.fn(),
  createCodexEnemyCard: vi.fn(),
  createCodexItemCard: vi.fn(),
  renderCodexEmpty: vi.fn(),
  renderCodexFilterBar: vi.fn(),
  renderCodexProgress: vi.fn(),
  renderCodexSection: vi.fn(),
  renderCodexSetView: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_inscriptions.js', () => ({
  renderCodexInscriptions: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_popup.js', () => ({
  buildCardPopupPayload: vi.fn(),
  buildCodexNavBlock: vi.fn(() => '<nav/>'),
  buildCodexQuoteBlock: vi.fn(() => '<quote/>'),
  buildEnemyPopupPayload: vi.fn(),
  buildItemPopupPayload: vi.fn(),
  closeCodexPopup: vi.fn(),
  ensureCodexPopupOverlay: vi.fn(),
  openCodexPopup: vi.fn(),
  setCodexPopupTheme: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_structure.js', () => ({
  injectCodexModalStructure: vi.fn(),
  setCodexTabState: vi.fn(),
}));

vi.mock('../game/features/codex/platform/browser/ensure_codex_modal_shell.js', () => ({
  ensureCodexModalShell: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_controller.js', () => ({
  clearCodexPopupNavigation: vi.fn(),
  closeCodexModal: vi.fn(),
  navigateCodexPopup: vi.fn(),
  resetCodexUiState: vi.fn(),
  setCodexPopupNavigation: vi.fn(),
  showCodexModal: vi.fn(),
  transitionCodexTab: vi.fn(),
}));

vi.mock('../game/features/codex/integration/ui_support_capabilities.js', () => ({
  keyboardEventMatchesCode: vi.fn((event, code) => event.code === code),
}));

import * as runtime from '../game/features/codex/presentation/browser/codex_ui_runtime.js';
import * as render from '../game/features/codex/presentation/browser/codex_ui_render.js';
import * as structure from '../game/features/codex/presentation/browser/codex_ui_structure.js';
import * as controller from '../game/features/codex/presentation/browser/codex_ui_controller.js';
import * as inscriptions from '../game/features/codex/presentation/browser/codex_ui_inscriptions.js';
import * as codexShell from '../game/features/codex/platform/browser/ensure_codex_modal_shell.js';

describe('codex_ui_runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the codex modal and wires initial render callbacks', () => {
    const state = { tab: 'enemies', deps: null };
    const content = { textContent: '' };
    const search = { focus: vi.fn() };
    const doc = {
      getElementById: vi.fn((id) => ({
        codexContent: content,
        cxSearch: search,
      }[id] || null)),
    };
    const ui = {
      renderCodexContent: vi.fn(),
      closeCodex: vi.fn(),
      setCodexTab: vi.fn(),
    };
    const deps = {
      doc,
      gs: {},
      data: {},
    };

    runtime.openCodexRuntime(state, ui, deps);

    expect(controller.resetCodexUiState).toHaveBeenCalledWith(state, deps);
    expect(codexShell.ensureCodexModalShell).toHaveBeenCalledWith(doc);
    expect(controller.showCodexModal).toHaveBeenCalledWith(doc);
    expect(structure.injectCodexModalStructure).toHaveBeenCalledTimes(1);
    expect(search.focus).toHaveBeenCalledTimes(1);
    expect(render.renderCodexProgress).toHaveBeenCalledTimes(1);
    expect(structure.setCodexTabState).toHaveBeenCalledWith(doc, 'enemies');
    expect(render.renderCodexFilterBar).toHaveBeenCalledTimes(1);
    expect(ui.renderCodexContent).toHaveBeenCalledWith(deps);
  });

  it('renders the inscriptions tab through the shared runtime dispatcher', () => {
    const state = { tab: 'inscriptions', deps: null, popupList: [], popupIndex: 0 };
    const content = { textContent: 'stale' };
    const doc = {
      getElementById: vi.fn((id) => (id === 'codexContent' ? content : null)),
    };
    const ui = {
      setCodexTab: vi.fn(),
      renderCodexContent: vi.fn(),
      closeCodex: vi.fn(),
    };
    const deps = {
      doc,
      gs: {},
      data: {
        enemies: {},
        cards: {},
        items: {},
        inscriptions: {
          alpha: { id: 'alpha' },
        },
      },
    };

    runtime.renderCodexContentRuntime(state, ui, deps);

    expect(content.textContent).toBe('');
    expect(inscriptions.renderCodexInscriptions).toHaveBeenCalledWith(
      doc,
      content,
      [{ id: 'alpha' }],
      deps.gs,
    );
    expect(render.renderCodexProgress).toHaveBeenCalledTimes(1);
  });

  it('routes popup arrow keys through popup navigation only while the popup is open', () => {
    const listeners = new Map();
    const popup = {
      classList: {
        contains: vi.fn((className) => className === 'open'),
      },
    };
    const doc = {
      addEventListener: vi.fn((type, handler) => listeners.set(type, handler)),
      getElementById: vi.fn((id) => (id === 'cxDetailPopup' ? popup : null)),
    };
    const ui = {
      renderCodexContent: vi.fn(),
      closeCodex: vi.fn(),
      setCodexTab: vi.fn(),
    };
    const deps = { doc, gs: {}, data: {} };
    const state = { tab: 'enemies', deps: null };

    runtime.openCodexRuntime(state, ui, deps);

    listeners.get('keydown')?.({ code: 'ArrowRight' });
    listeners.get('keydown')?.({ code: 'ArrowLeft' });

    expect(controller.navigateCodexPopup).toHaveBeenNthCalledWith(1, state, 1);
    expect(controller.navigateCodexPopup).toHaveBeenNthCalledWith(2, state, -1);
  });
});
