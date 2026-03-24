import { describe, expect, it, vi } from 'vitest';

import { RunModeUI } from '../game/features/run/presentation/browser/run_mode_ui.js';
import {
  buildCurseOptionEntries,
  renderOptionGrid,
} from '../game/features/run/presentation/browser/run_mode_ui_render.js';

function createNode() {
  return {
    type: '',
    className: '',
    dataset: {},
    disabled: false,
    innerHTML: '',
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    classList: {
      remove: vi.fn(),
      add: vi.fn(),
    },
  };
}

describe('run mode curse unlock gating', () => {
  it('renders locked-visible curses as disabled options', () => {
    const created = [];
    const doc = {
      createElement: vi.fn(() => {
        const node = createNode();
        created.push(node);
        return node;
      }),
    };
    const container = { innerHTML: '', appendChild: vi.fn() };

    renderOptionGrid(container, [
      { id: 'blood_moon', name: '핏빛 월식', desc: '...', visibility: 'locked-visible', unlockHint: '첫 승리 필요' },
    ], 'none', 'curse', doc);

    expect(created[0].disabled).toBe(true);
    expect(created[0].innerHTML).toContain('첫 승리 필요');
  });

  it('builds curse entries with visibility and unlock hints from progression rules', () => {
    const entries = buildCurseOptionEntries({
      meta: {
        contentUnlocks: {
          curses: {},
          relics: {},
          cards: { shared: {} },
        },
      },
      runRules: {
        curses: {
          none: { id: 'none', name: '없음', desc: '기본', icon: '-' },
          blood_moon: { id: 'blood_moon', name: '핏빛 월식', desc: '강화된 적', icon: '🌒' },
        },
      },
    });

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'blood_moon', visibility: 'locked-visible', unlockHint: '첫 승리 필요' }),
    ]));
  });

  it('refuses to select a locked curse and leaves the config unchanged', () => {
    const gs = {
      meta: {
        runConfig: { curse: 'none', ascension: 0, endless: false, disabledInscriptions: [] },
        contentUnlocks: {
          curses: {},
          relics: {},
          cards: { shared: {} },
        },
      },
    };
    const doc = {
      querySelector: vi.fn(() => null),
    };
    const runRules = {
      ensureMeta: vi.fn(),
      curses: {
        none: { id: 'none', name: '없음', desc: '기본' },
        blood_moon: { id: 'blood_moon', name: '핏빛 월식', desc: '강화된 적' },
      },
    };
    const deps = {
      gs,
      runRules,
      doc,
      saveMeta: vi.fn(),
      notice: vi.fn(),
    };

    RunModeUI.selectCurse('blood_moon', deps);

    expect(gs.meta.runConfig.curse).toBe('none');
    expect(deps.notice).toHaveBeenCalledWith('첫 승리 필요');
  });
});
