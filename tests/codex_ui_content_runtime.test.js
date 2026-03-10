import { describe, expect, it, vi } from 'vitest';
import {
  renderCardsCodexTab,
  renderEnemyCodexTab,
  renderItemsCodexTab,
} from '../game/ui/screens/codex_ui_content_runtime.js';

describe('codex_ui_content_runtime', () => {
  it('renders enemy sections and falls back to empty state when none match', () => {
    const state = { filter: 'all', search: '' };
    const doc = {};
    const content = {};
    const codex = {};
    const applyFilter = vi.fn((_, entries) => entries);
    const renderSection = vi.fn();
    const renderEmpty = vi.fn();
    const makeEnemyCard = vi.fn();

    renderEnemyCodexTab(state, doc, content, [
      { id: 'enemy_a' },
      { id: 'enemy_b', isElite: true },
    ], codex, {
      applyFilter,
      renderSection,
      renderEmpty,
      makeEnemyCard,
    });

    expect(renderSection).toHaveBeenCalledTimes(2);
    expect(renderSection).toHaveBeenNthCalledWith(
      1,
      state,
      doc,
      content,
      '일반 적',
      '✦',
      [{ id: 'enemy_a' }],
      expect.any(Function),
      [{ id: 'enemy_a' }],
    );
    expect(renderEmpty).not.toHaveBeenCalled();

    renderSection.mockClear();
    renderEnemyCodexTab(state, doc, content, [], codex, {
      applyFilter: vi.fn((_, entries) => entries),
      renderSection,
      renderEmpty,
      makeEnemyCard,
    });
    expect(renderEmpty).toHaveBeenCalledWith(content);
  });

  it('renders card sections from base cards and falls back to empty state', () => {
    const state = { filter: 'all', search: '' };
    const doc = {};
    const content = {};
    const codex = {};
    const applyFilter = vi.fn((_, entries) => entries);
    const renderSection = vi.fn();
    const renderEmpty = vi.fn();
    const makeCardEntry = vi.fn();
    const getBaseCodexCards = vi.fn(() => [
      { id: 'card_a', type: 'ATTACK' },
      { id: 'card_b', type: 'POWER' },
    ]);

    renderCardsCodexTab(state, doc, content, { cards: {} }, codex, {
      applyFilter,
      renderSection,
      renderEmpty,
      makeCardEntry,
      getBaseCodexCards,
    });

    expect(getBaseCodexCards).toHaveBeenCalledWith({ cards: {} });
    expect(renderSection).toHaveBeenCalledTimes(2);

    renderSection.mockClear();
    renderCardsCodexTab(state, doc, content, { cards: {} }, codex, {
      applyFilter: vi.fn(() => []),
      renderSection,
      renderEmpty,
      makeCardEntry,
      getBaseCodexCards,
    });
    expect(renderEmpty).toHaveBeenCalledWith(content);
  });

  it('renders item set view only for default view and falls back to empty state when filtered out', () => {
    const state = { filter: 'all', search: '' };
    const doc = {};
    const content = {};
    const gs = {};
    const codex = {};
    const renderSetView = vi.fn();
    const renderSection = vi.fn();
    const renderEmpty = vi.fn();
    const makeItemCard = vi.fn();

    renderItemsCodexTab(state, doc, content, {
      items: { relic_a: { id: 'relic_a' } },
    }, gs, codex, {
      applyFilter: vi.fn((_, entries) => entries),
      renderEmpty,
      renderSection,
      renderSetView,
      makeItemCard,
    });

    expect(renderSetView).toHaveBeenCalledWith(state, doc, content, { items: { relic_a: { id: 'relic_a' } } }, gs);
    expect(renderSection).toHaveBeenCalledWith(
      state,
      doc,
      content,
      '전체 유물',
      '❖',
      [{ id: 'relic_a' }],
      expect.any(Function),
      [{ id: 'relic_a' }],
    );

    renderSetView.mockClear();
    renderItemsCodexTab({ filter: 'rare', search: 'x' }, doc, content, {
      items: { relic_a: { id: 'relic_a' } },
    }, gs, codex, {
      applyFilter: vi.fn(() => []),
      renderEmpty,
      renderSection: vi.fn(),
      renderSetView,
      makeItemCard,
    });

    expect(renderSetView).not.toHaveBeenCalled();
    expect(renderEmpty).toHaveBeenCalledWith(content);
  });
});
