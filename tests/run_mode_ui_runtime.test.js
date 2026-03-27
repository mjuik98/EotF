import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  ensureRunSettingsShell: vi.fn(),
}));

vi.mock('../game/features/run/platform/browser/ensure_run_settings_shell.js', () => ({
  ensureRunSettingsShell: hoisted.ensureRunSettingsShell,
}));

import {
  applyDailyChallengeRuntime,
  buildDailyRunChallenge,
  closeRunSettingsModal,
  confirmPresetSaveRuntime,
  openRunSettingsModal,
  savePresetRuntime,
  selectPresetSlotRuntime,
} from '../game/features/run/presentation/browser/run_mode_ui_runtime.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => set.add(name)),
    remove: (...names) => names.forEach((name) => set.delete(name)),
    contains: (name) => set.has(name),
  };
}

describe('run_mode_ui_runtime', () => {
  it('ensures the run settings shell before opening the modal', () => {
    const modal = {
      style: { display: 'none' },
      classList: createClassList(['fade-out']),
    };
    const layout = {
      dataset: { open: 'true' },
      style: { display: 'block' },
    };
    const panel = { classList: createClassList(['run-settings-with-inscription-layout']) };
    const doc = {
      getElementById: vi.fn((id) => {
        if (id === 'runSettingsModal') return modal;
        if (id === 'inscriptionLayout') return layout;
        return null;
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '#runSettingsModal .run-settings-panel') return panel;
        return null;
      }),
    };
    const ui = {
      refresh: vi.fn(),
      refreshInscriptions: vi.fn(),
    };
    const deps = { doc };

    const result = openRunSettingsModal(ui, deps);

    expect(result).toBe(true);
    expect(hoisted.ensureRunSettingsShell).toHaveBeenCalledWith(doc);
    expect(modal.style.display).toBe('flex');
    expect(modal.classList.contains('fade-out')).toBe(false);
    expect(modal.classList.contains('fade-in')).toBe(true);
    expect(layout.dataset.open).toBe('false');
    expect(layout.style.display).toBe('none');
    expect(ui.refresh).toHaveBeenCalledWith(deps);
    expect(ui.refreshInscriptions).toHaveBeenCalledWith(deps);
  });

  it('selects an empty preset slot and refreshes instead of loading', () => {
    const ui = {
      _selectedPresetSlot: 0,
      loadPreset: vi.fn(),
      refresh: vi.fn(),
    };
    const deps = {
      gs: {
        meta: {
          runConfigPresets: [null, null, null, null],
        },
      },
    };

    selectPresetSlotRuntime(ui, 2, deps);

    expect(ui._selectedPresetSlot).toBe(2);
    expect(ui.loadPreset).not.toHaveBeenCalled();
    expect(ui.refresh).toHaveBeenCalledWith(deps);
  });

  it('saves the current config into the selected preset slot', () => {
    const ui = {
      _presetDialog: { open: true, slot: 1, name: '기본 프리셋' },
      refresh: vi.fn(),
    };
    const deps = {
      gs: {
        meta: {
          maxAscension: 5,
          unlocks: { endless: true },
          runConfig: {
            ascension: 3,
            endless: true,
            curse: 'tax',
            disabledInscriptions: ['alpha'],
          },
          runConfigPresets: [null, null, null, null],
        },
      },
      runRules: {
        ensureMeta: vi.fn(),
      },
      doc: {
        getElementById: vi.fn((id) => {
          if (id === 'rmPresetNameInput') return { value: '저장된 프리셋' };
          return null;
        }),
      },
      saveMeta: vi.fn(),
      notice: vi.fn(),
    };

    const result = confirmPresetSaveRuntime(ui, deps);

    expect(result).toBe(true);
    expect(deps.gs.meta.runConfigPresets[1]).toEqual({
      id: 'preset-2',
      name: '저장된 프리셋',
      config: {
        ascension: 3,
        endless: true,
        curse: 'tax',
        disabledInscriptions: ['alpha'],
      },
    });
    expect(ui._presetDialog).toBe(null);
    expect(ui.refresh).toHaveBeenCalledWith(deps);
    expect(deps.saveMeta).toHaveBeenCalledTimes(1);
    expect(deps.notice).toHaveBeenCalledWith('프리셋을 저장했습니다.');
  });

  it('opens preset save dialog in overwrite mode for filled slots', () => {
    const body = {
      appendChild: vi.fn((node) => node),
    };
    const ui = {};
    const deps = {
      gs: {
        meta: {
          maxAscension: 5,
          unlocks: { endless: true },
          runConfig: {
            ascension: 2,
            endless: false,
            curse: 'none',
            disabledInscriptions: [],
          },
          runConfigPresets: [
            {
              id: 'preset-1',
              name: '세팅 A',
              config: {
                ascension: 3,
                endless: true,
                curse: 'tax',
                disabledInscriptions: ['alpha'],
              },
            },
            null,
            null,
            null,
          ],
        },
      },
      runRules: {
        ensureMeta: vi.fn(),
      },
      doc: {
        body,
        createElement: vi.fn(() => ({
          id: '',
          className: '',
          innerHTML: '',
          addEventListener: vi.fn(),
        })),
        getElementById: vi.fn((id) => {
          if (id === 'rmPresetDialog') return null;
          if (id === 'rmPresetNameInput') return null;
          return null;
        }),
      },
    };

    const result = savePresetRuntime(ui, 0, deps);

    expect(result).toBe(true);
    expect(ui._presetDialog).toMatchObject({
      open: true,
      slot: 0,
      name: '세팅 A',
      existingName: '세팅 A',
      overwrite: true,
    });
  });

  it('applies the daily challenge configuration and persists the result', () => {
    const ui = {
      refresh: vi.fn(),
    };
    const deps = {
      gs: {
        meta: {
          maxAscension: 5,
          unlocks: { ascension: true, endless: true },
          runConfig: {
            ascension: 0,
            endless: false,
            curse: 'none',
            disabledInscriptions: [],
          },
          contentUnlocks: {
            curses: {
              blood_moon: { unlocked: true },
            },
          },
        },
      },
      runRules: {
        ensureMeta: vi.fn(),
        curses: {
          none: { id: 'none', name: '없음' },
          blood_moon: { id: 'blood_moon', name: '핏빛 월식' },
        },
      },
      saveMeta: vi.fn(),
      notice: vi.fn(),
      now: new Date('2026-03-28T12:00:00Z'),
    };

    const result = applyDailyChallengeRuntime(ui, deps);

    expect(result).toBe(true);
    expect(deps.gs.meta.runConfig).toMatchObject({
      ascension: 4,
      endless: true,
      curse: 'blood_moon',
    });
    expect(ui.refresh).toHaveBeenCalledWith(deps);
    expect(deps.saveMeta).toHaveBeenCalledTimes(1);
    expect(deps.notice).toHaveBeenCalledWith('일일 도전 구성을 적용했습니다.');
  });

  it('builds a deterministic daily challenge from the current date and unlocks', () => {
    const challenge = buildDailyRunChallenge({
      meta: {
        maxAscension: 5,
        unlocks: { ascension: true, endless: true },
        contentUnlocks: {
          curses: {
            blood_moon: { unlocked: true },
            silence: { unlocked: true },
          },
        },
      },
      runRules: {
        curses: {
          none: { id: 'none', name: '없음' },
          blood_moon: { id: 'blood_moon', name: '핏빛 월식' },
          silence: { id: 'silence', name: '침묵 서약' },
        },
      },
      now: new Date('2026-03-28T12:00:00Z'),
    });

    expect(challenge).toMatchObject({
      label: '일일 도전',
      dateLabel: '2026-03-28',
      config: {
        ascension: 4,
        endless: true,
        curse: 'blood_moon',
      },
    });
    expect(challenge.summary).toContain('A4');
    expect(challenge.summary).toContain('핏빛 월식');
    expect(challenge.tags).toContain('무한');
  });

  it('closes run settings modal and hides the inscription layout', () => {
    const modal = {
      style: { display: 'flex' },
      classList: createClassList(['fade-in', 'cursed']),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const layout = {
      dataset: { open: 'true' },
      style: { display: 'block' },
    };
    const panel = { classList: createClassList(['cursed', 'run-settings-with-inscription-layout']) };
    const doc = {
      body: { classList: createClassList(['run-rules-curse-active']) },
      getElementById: vi.fn((id) => {
        if (id === 'runSettingsModal') return modal;
        if (id === 'inscriptionLayout') return layout;
        return null;
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '#runSettingsModal .run-settings-panel') return panel;
        return null;
      }),
    };
    const ui = {
      closePresetDialog: vi.fn(),
    };

    const result = closeRunSettingsModal(ui, { doc });

    expect(result).toBe(true);
    expect(ui.closePresetDialog).toHaveBeenCalledTimes(1);
    expect(layout.dataset.open).toBe('false');
    expect(layout.style.display).toBe('none');
    expect(modal.classList.contains('fade-in')).toBe(false);
    expect(modal.classList.contains('fade-out')).toBe(true);
  });
});
