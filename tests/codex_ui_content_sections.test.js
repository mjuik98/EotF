import { describe, expect, it, vi } from 'vitest';

import {
  CARD_CODEX_SECTIONS,
  ENEMY_CODEX_SECTIONS,
  renderCodexCategorizedSections,
} from '../game/ui/screens/codex_ui_content_sections.js';

describe('codex_ui_content_sections', () => {
  it('keeps enemy and card section predicates stable', () => {
    expect(ENEMY_CODEX_SECTIONS).toHaveLength(4);
    expect(CARD_CODEX_SECTIONS).toHaveLength(3);
    expect(ENEMY_CODEX_SECTIONS[1].filter({ isElite: true, isBoss: false })).toBe(true);
    expect(CARD_CODEX_SECTIONS[2].filter({ type: 'power' })).toBe(true);
  });

  it('renders categorized sections and falls back to empty when nothing survives filtering', () => {
    const renderSection = vi.fn();
    const renderEmpty = vi.fn();
    const applyFilter = vi.fn((_, entries) => entries.filter((entry) => entry.keep !== false));
    const buildEntry = vi.fn();
    const state = {};
    const doc = {};
    const content = {};

    renderCodexCategorizedSections(state, doc, content, [
      { id: 'a', kind: 'one', keep: true },
      { id: 'b', kind: 'two', keep: false },
    ], {}, {
      sections: [
        { title: 'One', icon: '1', filter: (entry) => entry.kind === 'one' },
        { title: 'Two', icon: '2', filter: (entry) => entry.kind === 'two' },
      ],
      category: 'demo',
      applyFilter,
      renderSection,
      renderEmpty,
      buildEntry,
    });

    expect(renderSection).toHaveBeenCalledTimes(1);
    expect(renderSection).toHaveBeenCalledWith(
      state,
      doc,
      content,
      'One',
      '1',
      [{ id: 'a', kind: 'one', keep: true }],
      expect.any(Function),
      [{ id: 'a', kind: 'one', keep: true }],
    );

    renderSection.mockClear();
    renderCodexCategorizedSections(state, doc, content, [], {}, {
      sections: [{ title: 'One', icon: '1', filter: () => true }],
      category: 'demo',
      applyFilter,
      renderSection,
      renderEmpty,
      buildEntry,
    });
    expect(renderEmpty).toHaveBeenCalledWith(content);
  });
});
