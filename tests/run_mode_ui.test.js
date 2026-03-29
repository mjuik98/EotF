import { describe, expect, it, vi } from 'vitest';
import { bindRunModePanelEvents } from '../game/features/run/public.js';
import { buildRunSettingsShellMarkup } from '../game/features/run/platform/browser/ensure_run_settings_shell.js';
import { ensureRunModeUiStyle } from '../game/features/run/presentation/browser/run_mode_ui_style.js';

function createElement() {
  return {
    dataset: {},
    addEventListener: vi.fn(),
    classList: {
      remove: vi.fn(),
      add: vi.fn(),
    },
  };
}

describe('RunModeUI bindings', () => {
  it('bindRunModePanelEvents wires a panel only once', () => {
    const panel = createElement();
    const closeBtn = createElement();
    const body = { dataset: {} };
    const doc = {
      body,
      getElementById: vi.fn((id) => {
        if (id === 'runModePanel') return panel;
        if (id === 'closeRunSettingsBtn') return closeBtn;
        return null;
      }),
      addEventListener: vi.fn(),
    };
    const ui = {
      closeSettings: vi.fn(),
      closePresetDialog: vi.fn(),
      confirmPresetSave: vi.fn(),
      toggleInscription: vi.fn(),
      shiftAscension: vi.fn(),
      toggleEndlessMode: vi.fn(),
      selectCurse: vi.fn(),
      selectPresetSlot: vi.fn(),
      savePreset: vi.fn(),
      loadPreset: vi.fn(),
      deletePreset: vi.fn(),
      _presetDialog: null,
    };

    bindRunModePanelEvents(ui, { doc });
    bindRunModePanelEvents(ui, { doc });

    expect(panel.addEventListener).toHaveBeenCalledTimes(2);
    expect(closeBtn.addEventListener).toHaveBeenCalledTimes(1);
    expect(doc.addEventListener).toHaveBeenCalledTimes(1);
    expect(body.dataset.runRulesEscBound).toBe('true');
    expect(panel.dataset.bound).toBe('true');
    expect(closeBtn.dataset.bound).toBe('true');
  });

  it('ensureRunModeUiStyle injects the feature stylesheet once without a root-absolute css href', () => {
    const byId = new Map();
    const doc = {
      head: {
        children: [],
        appendChild(child) {
          if (child?.id) byId.set(child.id, child);
          this.children.push(child);
          return child;
        },
      },
      createElement: vi.fn(() => ({ id: '', rel: '', href: '' })),
      getElementById: vi.fn((id) => byId.get(id) || null),
    };

    ensureRunModeUiStyle(doc);
    ensureRunModeUiStyle(doc);

    expect(doc.head.children).toHaveLength(1);
    expect(doc.head.children[0].id).toBe('run-mode-ui-style');
    expect(doc.head.children[0].rel).toBe('stylesheet');
    expect(doc.head.children[0].href).toContain('run-rules-redesign.css');
    expect(doc.head.children[0].href).not.toBe('/css/run-rules-redesign.css');
  });

  it('buildRunSettingsShellMarkup marks the dismiss icon as a shared close button', () => {
    const markup = buildRunSettingsShellMarkup();

    expect(markup).toContain('id="closeRunSettingsBtn"');
    expect(markup).toContain('gm-close-btn');
    expect(markup).toContain('gm-close-btn-icon');
  });
});
