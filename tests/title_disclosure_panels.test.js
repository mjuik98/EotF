import { describe, expect, it, vi } from 'vitest';

import {
  bindTitleDisclosurePanels,
  resetTitleDisclosurePanelStateForTests,
} from '../game/features/title/presentation/browser/title_disclosure_panels.js';

function makeElement(id) {
  return {
    id,
    hidden: false,
    textContent: '',
    style: {},
    dataset: {},
    setAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createDoc() {
  const elements = {
    titleArchiveToggleBtn: makeElement('titleArchiveToggleBtn'),
    titleRunArchive: makeElement('titleRunArchive'),
    titleSaveManageToggleBtn: makeElement('titleSaveManageToggleBtn'),
    titleSaveActionPanel: makeElement('titleSaveActionPanel'),
  };

  return {
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

describe('title disclosure panels', () => {
  it('keeps archive and save-management details collapsed by default and toggles them open', () => {
    resetTitleDisclosurePanelStateForTests();
    const doc = createDoc();

    bindTitleDisclosurePanels(doc);

    expect(doc.elements.titleRunArchive.hidden).toBe(true);
    expect(doc.elements.titleArchiveToggleBtn.textContent).toBe('기록 펼치기');
    expect(doc.elements.titleSaveActionPanel.hidden).toBe(true);
    expect(doc.elements.titleSaveManageToggleBtn.textContent).toBe('관리 열기');

    const archiveHandler = doc.elements.titleArchiveToggleBtn.addEventListener.mock.calls.at(-1)?.[1];
    archiveHandler?.();

    expect(doc.elements.titleRunArchive.hidden).toBe(false);
    expect(doc.elements.titleArchiveToggleBtn.textContent).toBe('기록 접기');

    const saveHandler = doc.elements.titleSaveManageToggleBtn.addEventListener.mock.calls.at(-1)?.[1];
    saveHandler?.();

    expect(doc.elements.titleSaveActionPanel.hidden).toBe(false);
    expect(doc.elements.titleSaveManageToggleBtn.textContent).toBe('관리 접기');
  });

  it('supports dom elements whose dataset property is getter-only', () => {
    resetTitleDisclosurePanelStateForTests();
    const archiveDataset = {};
    const archivePanelDataset = {};
    const doc = createDoc();

    Object.defineProperty(doc.elements.titleArchiveToggleBtn, 'dataset', {
      configurable: true,
      get: () => archiveDataset,
    });
    Object.defineProperty(doc.elements.titleRunArchive, 'dataset', {
      configurable: true,
      get: () => archivePanelDataset,
    });

    expect(() => bindTitleDisclosurePanels(doc)).not.toThrow();
    expect(archiveDataset.expanded).toBe('false');
    expect(archivePanelDataset.expanded).toBe('false');
  });
});
