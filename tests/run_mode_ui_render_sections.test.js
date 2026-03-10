import { describe, expect, it, vi } from 'vitest';
import {
  renderDifficultyPanel,
  renderHiddenEnding,
  renderSummaryBar,
} from '../game/ui/run/run_mode_ui_summary_render.js';
import {
  renderPresetDialog,
  renderPresets,
  syncModalMood,
} from '../game/ui/run/run_mode_ui_presets_render.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    remove: (...tokens) => tokens.forEach((token) => set.delete(token)),
    contains: (token) => set.has(token),
    toggle: (token, force) => {
      if (force === undefined) {
        if (set.has(token)) set.delete(token);
        else set.add(token);
        return;
      }
      if (force) set.add(token);
      else set.delete(token);
    },
  };
}

function createNode() {
  const listeners = {};
  return {
    id: '',
    className: '',
    innerHTML: '',
    style: {},
    dataset: {},
    children: [],
    classList: createClassList(),
    closest: vi.fn(() => null),
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    remove: vi.fn(),
    listeners,
  };
}

describe('run_mode_ui_render sections', () => {
  it('renders the difficulty panel shell with locked ascension and reward preview', () => {
    const panel = createNode();

    renderDifficultyPanel(
      panel,
      { ascension: 0, endless: false, curse: 'tax' },
      { maxAscension: 5, unlocks: { ascension: false, endless: true } },
      {
        getDifficultyScore: vi.fn(() => 15),
        getRewardMultiplier: vi.fn(() => 1.45),
      },
      {},
    );

    expect(panel.innerHTML).toContain('승천 단계');
    expect(panel.innerHTML).toContain('챕터 2 클리어 시 해금');
    expect(panel.innerHTML).toContain('보상 x1.45');
    expect(panel.innerHTML).toContain('id="rmPresetZone"');
    expect(panel.innerHTML).toContain('id="rmCurseGrid"');
  });

  it('renders summary and hidden-ending banners for inscriptionless runs', () => {
    const summaryZone = createNode();
    const hiddenZone = createNode();
    const doc = {
      getElementById: vi.fn((id) => ({
        rmSummaryBarZone: summaryZone,
        rmHiddenEndingZone: hiddenZone,
      }[id] || null)),
    };
    const cfg = {
      ascension: 2,
      endless: true,
      curse: 'tax',
      disabledInscriptions: ['alpha'],
    };
    const meta = {
      inscriptions: { alpha: 1 },
    };
    const runRules = {
      curses: {
        tax: { id: 'tax', icon: '!', name: '세금' },
      },
      getDifficultyScore: vi.fn(() => 20),
      getRewardMultiplier: vi.fn(() => 1.3),
    };

    renderSummaryBar(doc, cfg, meta, runRules, {}, { synergies: {} });
    renderHiddenEnding(meta, cfg, doc);

    expect(summaryZone.innerHTML).toContain('A2');
    expect(summaryZone.innerHTML).toContain('무한 모드');
    expect(summaryZone.innerHTML).toContain('각인 없이 시작');
    expect(summaryZone.innerHTML).toContain('보상 x1.3');
    expect(hiddenZone.innerHTML).toContain('히든 엔딩 조건 충족');

    renderHiddenEnding(meta, { ...cfg, disabledInscriptions: [] }, doc);
    expect(hiddenZone.innerHTML).toBe('');
  });

  it('renders preset slot copy for selected empty and filled slots', () => {
    const zone = createNode();
    const doc = {
      getElementById: vi.fn((id) => (id === 'rmPresetZone' ? zone : null)),
    };
    const meta = {
      inscriptions: { alpha: 1, beta: 1 },
      runConfigPresets: [
        null,
        {
          name: '세팅 A',
          config: {
            ascension: 3,
            endless: true,
            curse: 'tax',
            disabledInscriptions: ['beta'],
          },
        },
        null,
        null,
      ],
    };
    const runRules = {
      curses: {
        tax: { name: '세금' },
      },
    };

    renderPresets({ _selectedPresetSlot: 0 }, doc, {}, meta, runRules);
    expect(zone.innerHTML).toContain('빈 슬롯');
    expect(zone.innerHTML).toContain('이 슬롯을 선택한 뒤 현재 설정을 저장할 수 있습니다.');

    renderPresets({ _selectedPresetSlot: 1 }, doc, {}, meta, runRules);
    expect(zone.innerHTML).toContain('세팅 A');
    expect(zone.innerHTML).toContain('A3');
    expect(zone.innerHTML).toContain('/ 무한');
    expect(zone.innerHTML).toContain('/ 세금');
    expect(zone.innerHTML).toContain('/ 각인 1');
  });

  it('renders preset dialog wiring and syncs curse modal mood', () => {
    const existing = createNode();
    const input = {
      focus: vi.fn(),
      select: vi.fn(),
    };
    const modal = createNode();
    const panel = createNode();
    const body = {
      children: [],
      classList: createClassList(),
      appendChild(node) {
        this.children.push(node);
        return node;
      },
    };
    const doc = {
      body,
      createElement: vi.fn(() => createNode()),
      getElementById: vi.fn((id) => ({
        rmPresetDialog: existing,
        rmPresetNameInput: input,
        runSettingsModal: modal,
      }[id] || null)),
      querySelector: vi.fn((selector) => {
        if (selector === '#runSettingsModal .run-settings-panel') return panel;
        return null;
      }),
    };
    const ui = {
      _presetDialog: { open: true, slot: 2, name: '기본 <세팅>' },
      closePresetDialog: vi.fn(),
      confirmPresetSave: vi.fn(),
    };
    const deps = { doc, token: 'deps' };

    renderPresetDialog(ui, doc, deps);
    const overlay = body.children[0];
    const click = overlay.listeners.click;

    expect(existing.remove).toHaveBeenCalledTimes(1);
    expect(overlay.innerHTML).toContain('슬롯 3');
    expect(overlay.innerHTML).toContain('기본 &lt;세팅&gt;');
    expect(input.focus).toHaveBeenCalledTimes(1);
    expect(input.select).toHaveBeenCalledTimes(1);

    click({
      target: {
        closest: () => ({ dataset: { action: 'cancel-preset-save' } }),
      },
    });
    click({
      target: {
        closest: () => ({ dataset: { action: 'confirm-preset-save' } }),
      },
    });
    click({
      target: overlay,
    });

    expect(ui.closePresetDialog).toHaveBeenCalledTimes(2);
    expect(ui.closePresetDialog).toHaveBeenCalledWith(deps);
    expect(ui.confirmPresetSave).toHaveBeenCalledWith(deps);

    syncModalMood(doc, { curse: 'tax' });
    expect(body.classList.contains('run-rules-curse-active')).toBe(true);
    expect(modal.classList.contains('cursed')).toBe(true);
    expect(panel.classList.contains('cursed')).toBe(true);
  });
});
