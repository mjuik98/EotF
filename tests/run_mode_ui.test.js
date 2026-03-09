import { describe, expect, it, vi } from 'vitest';
import { bindRunModePanelEvents } from '../game/ui/run/run_mode_ui_bindings.js';

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
});
