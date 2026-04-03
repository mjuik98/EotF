import { describe, expect, it, vi } from 'vitest';

import {
  renderTitleRecentRuns,
  renderTitleRunArchive,
} from '../game/features/title/presentation/browser/title_run_archive_helpers.js';

function makeElement(id) {
  return {
    id,
    style: {},
    innerHTML: '',
    textContent: '',
  };
}

function createDoc() {
  const elements = {
    titleRecentRuns: makeElement('titleRecentRuns'),
    titleArchiveDisclosure: makeElement('titleArchiveDisclosure'),
    titleArchiveSummary: makeElement('titleArchiveSummary'),
    titleRunArchive: makeElement('titleRunArchive'),
  };

  return {
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

describe('title run archive helpers', () => {
  it('renders the recent run chips from the latest runs', () => {
    const doc = createDoc();
    const gs = {
      meta: {
        recentRuns: [
          { outcome: 'defeat', classId: 'guardian', ascension: 1, floor: 4, clearTimeMs: 120000 },
          { outcome: 'victory', classId: 'mage', ascension: 4, floor: 7, clearTimeMs: 580000, milestones: ['상위 승천'] },
        ],
      },
    };

    renderTitleRecentRuns(doc, gs);

    expect(doc.elements.titleRecentRuns.innerHTML).toContain('최근 귀환');
    expect(doc.elements.titleRecentRuns.innerHTML).toContain('마법사');
    expect(doc.elements.titleRecentRuns.innerHTML).toContain('승리');
    expect(doc.elements.titleRecentRuns.innerHTML).toContain('09:40');
  });

  it('renders archive summary badges and rows for recent runs', () => {
    const doc = createDoc();
    const gs = {
      meta: {
        analytics: {
          totals: {
            runs: 4,
            victories: 2,
            defeats: 2,
            abandons: 0,
            kills: 31,
            floors: 24,
          },
          classes: {
            mage: { runs: 2, victories: 1, kills: 17, floors: 13, bestFloor: 8 },
          },
        },
        progress: { victories: 1, failures: 1, cursedVictories: 0 },
        achievements: { states: {} },
        recentRuns: [
          { runNumber: 4, outcome: 'victory', classId: 'mage', ascension: 4, kills: 17, floor: 8, clearTimeMs: 580000, unlockCount: 2, achievementCount: 1 },
          { runNumber: 3, outcome: 'defeat', classId: 'guardian', ascension: 1, kills: 6, floor: 4, clearTimeMs: 220000, unlockCount: 0, achievementCount: 0 },
        ],
      },
    };

    renderTitleRunArchive(doc, gs);

    expect(doc.elements.titleArchiveDisclosure.style.display).toBe('grid');
    expect(doc.elements.titleArchiveSummary.innerHTML).toContain('최근 2런');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('Run 4');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('해금 2');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('전술 분석');
  });
});
