import { describe, expect, it } from 'vitest';

import {
  deleteRunConfigPreset,
  ensureRunConfigMeta,
  loadRunConfigPreset,
  saveRunConfigPreset,
  selectRunCurse,
  shiftRunAscension,
  toggleRunEndless,
  toggleRunInscription,
} from '../game/features/run/state/run_config_state_commands.js';

function createMeta() {
  return {
    maxAscension: 3,
    unlocks: {
      ascension: true,
      endless: true,
    },
    runConfig: {
      ascension: 1,
      endless: false,
      curse: 'none',
      disabledInscriptions: [],
      blessing: 'remove-me',
    },
    runConfigPresets: [null, null, null, null],
  };
}

describe('run_config_state_commands', () => {
  it('normalizes run config metadata in one place', () => {
    const meta = createMeta();

    const cfg = ensureRunConfigMeta(meta);

    expect(cfg).toBe(meta.runConfig);
    expect('blessing' in cfg).toBe(false);
    expect(cfg.disabledInscriptions).toEqual([]);
  });

  it('updates run config through feature state commands', () => {
    const meta = createMeta();
    const runRules = {
      curses: {
        tax: {},
        silence: {},
      },
    };

    expect(selectRunCurse(meta, runRules, 'silence')).toBe('silence');
    expect(shiftRunAscension(meta, 1)).toBe(2);
    expect(toggleRunEndless(meta)).toBe(true);
    expect(toggleRunInscription(meta, 'fortune')).toEqual(['fortune']);
    expect(toggleRunInscription(meta, 'fortune')).toEqual([]);
    expect(meta.runConfig).toMatchObject({
      ascension: 2,
      endless: true,
      curse: 'silence',
    });
  });

  it('saves, loads, and deletes run config presets through state commands', () => {
    const meta = createMeta();
    meta.runConfig = {
      ascension: 4,
      endless: true,
      curse: 'tax',
      disabledInscriptions: ['alpha', 'alpha'],
    };
    const runRules = { curses: { tax: {} } };

    const preset = saveRunConfigPreset(meta, { slot: 2, name: '테스트 프리셋' });

    expect(preset).toEqual({
      id: 'preset-3',
      name: '테스트 프리셋',
      config: {
        ascension: 4,
        endless: true,
        curse: 'tax',
        disabledInscriptions: ['alpha'],
      },
    });

    meta.unlocks.endless = false;
    meta.runConfig = {
      ascension: 0,
      endless: false,
      curse: 'none',
      disabledInscriptions: [],
    };

    const loaded = loadRunConfigPreset(meta, 2, runRules);

    expect(loaded).toEqual({
      ascension: 3,
      endless: false,
      curse: 'tax',
      disabledInscriptions: ['alpha'],
    });
    expect(deleteRunConfigPreset(meta, 2)).toBe(true);
    expect(meta.runConfigPresets[2]).toBe(null);
  });

  it('falls back to none when loading an unavailable curse preset', () => {
    const meta = createMeta();
    meta.runConfigPresets[0] = {
      id: 'preset-1',
      name: '잠긴 저주',
      config: {
        ascension: 0,
        endless: false,
        curse: 'blood_moon',
        disabledInscriptions: [],
      },
    };

    const loaded = loadRunConfigPreset(meta, 0, { curses: { none: {} } });

    expect(loaded.curse).toBe('none');
  });
});
