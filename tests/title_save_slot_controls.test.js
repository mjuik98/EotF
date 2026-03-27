import { describe, expect, it, vi } from 'vitest';

import { GameBootUI } from '../game/features/title/ports/public_game_boot_presentation_capabilities.js';

function makeElement() {
  return {
    id: '',
    style: {},
    textContent: '',
    innerHTML: '',
    files: [],
    value: '',
    classList: { contains: vi.fn(() => true), add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    click: vi.fn(),
    closest: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    querySelector: vi.fn(() => null),
  };
}

function createMockDocument() {
  const elements = {
    titleRecentRuns: { ...makeElement(), id: 'titleRecentRuns' },
    titleRunArchive: { ...makeElement(), id: 'titleRunArchive' },
    titleRecoveryPanel: { ...makeElement(), id: 'titleRecoveryPanel' },
    titleRecoveryRetryBtn: { ...makeElement(), id: 'titleRecoveryRetryBtn' },
    titleContinueWrap: { ...makeElement(), id: 'titleContinueWrap' },
    titleMenuDivider: { ...makeElement(), id: 'titleMenuDivider' },
    mainContinueBtn: { ...makeElement(), id: 'mainContinueBtn' },
    sttClass: { ...makeElement(), id: 'sttClass' },
    sttFloor: { ...makeElement(), id: 'sttFloor' },
    sttAscension: { ...makeElement(), id: 'sttAscension' },
    sttHp: { ...makeElement(), id: 'sttHp' },
    sttGold: { ...makeElement(), id: 'sttGold' },
    titleContinueMeta: { ...makeElement(), id: 'titleContinueMeta' },
    sttDeckPills: { ...makeElement(), id: 'sttDeckPills' },
    sttRelics: { ...makeElement(), id: 'sttRelics' },
    titleSaveSlotBar: { ...makeElement(), id: 'titleSaveSlotBar' },
    titleSaveExportBtn: { ...makeElement(), id: 'titleSaveExportBtn' },
    titleSaveImportBtn: { ...makeElement(), id: 'titleSaveImportBtn' },
    titleSaveDeleteBtn: { ...makeElement(), id: 'titleSaveDeleteBtn' },
    titleSaveImportInput: { ...makeElement(), id: 'titleSaveImportInput' },
  };

  return {
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

describe('title save slot controls', () => {
  it('renders save slots from the selected preview and binds export/import/delete controls', async () => {
    const doc = createMockDocument();
    const gs = { meta: { runCount: 1, totalKills: 0, bestChain: 0 } };
    const saveSystem = {
      getSelectedSlot: vi.fn(() => 2),
      getSlotSummaries: vi.fn(() => [
        { slot: 1, hasSave: true, preview: { player: { class: 'swordsman', hp: 80, maxHp: 80, gold: 10, deck: ['strike'], hand: [], items: [] }, currentFloor: 2, currentRegion: 0 } },
        { slot: 2, hasSave: true, preview: { player: { class: 'mage', hp: 55, maxHp: 60, gold: 40, deck: ['bolt'], hand: [], items: [] }, currentFloor: 4, currentRegion: 1, meta: { runConfig: { ascension: 2 }, recentRuns: [] } } },
        { slot: 3, hasSave: false, preview: null },
      ]),
      readMetaPreview: vi.fn(() => ({ runCount: 4, totalKills: 12, bestChain: 5, recentRuns: [] })),
      flushOutbox: vi.fn(() => 0),
      hasSave: vi.fn(() => true),
      readRunPreview: vi.fn(() => ({ player: { class: 'mage', hp: 55, maxHp: 60, gold: 40, deck: ['bolt'], hand: [], items: [] }, currentFloor: 4, currentRegion: 1, meta: { runConfig: { ascension: 2 } } })),
      exportBundle: vi.fn(() => ({ schemaVersion: 1, slot: 2, run: { player: { class: 'mage' } }, meta: { runCount: 4 } })),
      importBundle: vi.fn(),
      clearSave: vi.fn(),
      showSaveStatus: vi.fn(),
      selectSlot: vi.fn(),
    };
    const downloadText = vi.fn();
    const readImportText = vi.fn(async () => JSON.stringify({ schemaVersion: 1, slot: 2, run: { player: { class: 'guardian', hp: 88, maxHp: 99, gold: 17, deck: [], hand: [], items: [] }, currentFloor: 5, currentRegion: 2 }, meta: { runCount: 8 } }));

    GameBootUI.refreshTitleSaveState({
      doc,
      gs,
      saveSystem,
      downloadText,
      readImportText,
    });

    expect(doc.elements.titleSaveSlotBar.innerHTML).toContain('슬롯 1');
    expect(doc.elements.titleSaveSlotBar.innerHTML).toContain('슬롯 2');
    expect(doc.elements.titleSaveSlotBar.innerHTML).toContain('active');
    expect(doc.elements.sttClass.textContent).toBe('마법사');

    const exportHandler = doc.elements.titleSaveExportBtn.addEventListener.mock.calls.at(-1)?.[1];
    exportHandler?.();
    expect(downloadText).toHaveBeenCalledWith(
      'echo-of-the-fallen-slot-2.json',
      expect.stringContaining('"schemaVersion": 1'),
      expect.any(Object),
    );

    doc.elements.titleSaveImportInput.files = [{
      text: vi.fn(async () => JSON.stringify({ schemaVersion: 1, slot: 2, run: { player: { class: 'guardian', hp: 88, maxHp: 99, gold: 17, deck: [], hand: [], items: [] }, currentFloor: 5, currentRegion: 2 }, meta: { runCount: 8 } })),
    }];
    const importHandler = doc.elements.titleSaveImportInput.addEventListener.mock.calls.at(-1)?.[1];
    await importHandler?.({ target: doc.elements.titleSaveImportInput });
    expect(saveSystem.importBundle).toHaveBeenCalledWith(
      expect.objectContaining({ schemaVersion: 1, meta: expect.objectContaining({ runCount: 8 }) }),
      expect.objectContaining({ slot: 2 }),
    );

    const deleteHandler = doc.elements.titleSaveDeleteBtn.addEventListener.mock.calls.at(-1)?.[1];
    deleteHandler?.();
    expect(saveSystem.clearSave).toHaveBeenCalledWith({ slot: 2 });
  });
});
