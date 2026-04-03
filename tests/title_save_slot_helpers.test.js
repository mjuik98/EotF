import { describe, expect, it, vi } from 'vitest';

import {
  clearSavePreview,
  populateSaveTooltip,
  renderTitleRecoveryPanel,
  refreshTitleSaveState,
} from '../game/features/title/presentation/browser/title_save_slot_helpers.js';

function makeElement(id) {
  return {
    id,
    style: {},
    textContent: '',
    innerHTML: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createDoc() {
  const elements = {
    sttClass: makeElement('sttClass'),
    sttFloor: makeElement('sttFloor'),
    sttAscension: makeElement('sttAscension'),
    sttHp: makeElement('sttHp'),
    sttGold: makeElement('sttGold'),
    titleContinueMeta: makeElement('titleContinueMeta'),
    sttDeckPills: makeElement('sttDeckPills'),
    sttRelics: makeElement('sttRelics'),
    titleRecoveryPanel: makeElement('titleRecoveryPanel'),
    titleRecoveryRetryBtn: makeElement('titleRecoveryRetryBtn'),
  };

  return {
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

describe('title save slot helpers', () => {
  it('clears the continue preview fields', () => {
    const doc = createDoc();
    doc.elements.sttClass.textContent = '마법사';
    doc.elements.sttDeckPills.innerHTML = 'filled';

    clearSavePreview(doc);

    expect(doc.elements.sttClass.textContent).toBe('-');
    expect(doc.elements.titleContinueMeta.textContent).toBe('');
    expect(doc.elements.sttDeckPills.innerHTML).toBe('');
  });

  it('populates save preview details from the stored run preview', () => {
    const doc = createDoc();
    const preview = {
      player: {
        class: 'mage',
        hp: 28,
        maxHp: 40,
        gold: 123,
        deck: [{}, {}, {}],
        hand: [{}, {}],
        items: [{ icon: '✦', name: '유물' }],
      },
      currentFloor: 4,
      currentRegion: 2,
      saveState: 'queued',
      meta: { runConfig: { ascension: 4 } },
    };

    const hasSave = populateSaveTooltip(
      doc,
      { readRunPreview: vi.fn(() => preview) },
      { meta: { runConfig: { ascension: 0 } } },
      1,
      preview,
    );

    expect(hasSave).toBe(true);
    expect(doc.elements.sttClass.textContent).toBe('마법사');
    expect(doc.elements.titleContinueMeta.textContent).toContain('복구 대기');
    expect(doc.elements.sttDeckPills.innerHTML).toContain('덱 3장');
    expect(doc.elements.sttRelics.innerHTML).toContain('✦');
  });

  it('renders recovery panel copy and binds the retry action', () => {
    const doc = createDoc();
    const saveSystem = {
      getOutboxMetrics: vi.fn(() => ({
        queueDepth: 2,
        nextRetryAt: new Date('2026-01-01T00:00:05Z').getTime(),
        retryFailures: 1,
        lastFailureAt: new Date('2025-12-31T23:59:57Z').getTime(),
      })),
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    renderTitleRecoveryPanel(doc, saveSystem, {});

    expect(doc.elements.titleRecoveryPanel.innerHTML).toContain('복구 대기 저장');
    expect(doc.elements.titleRecoveryPanel.innerHTML).toContain('2건');
    expect(doc.elements.titleRecoveryRetryBtn.addEventListener).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('does not mutate live run state when title refresh cannot build a stored preview', () => {
    const doc = {
      ...createDoc(),
      getElementById: vi.fn((id) => ({
        titleRunSection: makeElement('titleRunSection'),
        titleContinueWrap: makeElement('titleContinueWrap'),
        titleMenuDivider: makeElement('titleMenuDivider'),
        mainContinueBtn: { disabled: false, style: {} },
        titleSaveSlotBar: makeElement('titleSaveSlotBar'),
        titleSaveExportBtn: makeElement('titleSaveExportBtn'),
        titleSaveImportBtn: makeElement('titleSaveImportBtn'),
        titleSaveDeleteBtn: makeElement('titleSaveDeleteBtn'),
        titleSaveImportInput: makeElement('titleSaveImportInput'),
        titleRecoveryPanel: makeElement('titleRecoveryPanel'),
        titleRecoveryRetryBtn: makeElement('titleRecoveryRetryBtn'),
        sttClass: makeElement('sttClass'),
        sttFloor: makeElement('sttFloor'),
        sttAscension: makeElement('sttAscension'),
        sttHp: makeElement('sttHp'),
        sttGold: makeElement('sttGold'),
        titleContinueMeta: makeElement('titleContinueMeta'),
        sttDeckPills: makeElement('sttDeckPills'),
        sttRelics: makeElement('sttRelics'),
        titleRecentRuns: makeElement('titleRecentRuns'),
        titleArchivePanel: makeElement('titleArchivePanel'),
        titleArchiveSummary: makeElement('titleArchiveSummary'),
        titleArchiveToggleBtn: makeElement('titleArchiveToggleBtn'),
      }[id] || null)),
    };
    const gs = {
      player: { hp: 80 },
      meta: { activeSaveSlot: 1, runConfig: { ascension: 0 } },
    };
    const saveSystem = {
      flushOutbox: vi.fn(),
      selectSlot: vi.fn(),
      getSelectedSlot: vi.fn(() => 1),
      getSlotSummaries: vi.fn(() => [{ slot: 1, hasSave: true, preview: null, meta: null }]),
      hasSave: vi.fn(() => true),
      readRunPreview: vi.fn(() => null),
      readMetaPreview: vi.fn(() => null),
      loadRun: vi.fn(() => true),
      getOutboxMetrics: vi.fn(() => ({ queueDepth: 0 })),
    };

    const hasSave = refreshTitleSaveState(doc, saveSystem, gs, { data: { classes: {}, achievements: [] } });

    expect(hasSave).toBe(false);
    expect(saveSystem.loadRun).not.toHaveBeenCalled();
    expect(gs.player.hp).toBe(80);
  });
});
