import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/combat/presentation/browser/status_tooltip_builder.js', () => ({
  StatusTooltipUI: {
    hide: vi.fn(),
  },
}));

vi.mock('../game/features/combat/presentation/browser/combat_intent_ui.js', () => ({
  cleanupEnemyIntentTooltip: vi.fn(),
}));

import { StatusTooltipUI } from '../game/features/combat/public.js';
import { cleanupEnemyIntentTooltip } from '../game/features/combat/public.js';
import {
  buildCombatEnemyHandlers,
  cleanupCombatTooltips,
  needsCombatEnemyFullRender,
  renderCombatEnemyList,
} from '../game/features/combat/public.js';

function createZone(existingCount = 0) {
  return {
    textContent: 'stale',
    appended: [],
    querySelectorAll: vi.fn(() => Array.from({ length: existingCount }, () => ({ className: 'enemy-card' }))),
    appendChild(node) {
      this.appended.push(node);
      return node;
    },
  };
}

describe('combat_ui_runtime_helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cleans up combat tooltip surfaces and maps handlers from the facade', () => {
    const tooltipEl = {
      classList: {
        remove: vi.fn(),
      },
    };
    const doc = {
      getElementById: vi.fn((id) => (id === 'enemyStatusTooltip' ? tooltipEl : null)),
    };

    cleanupCombatTooltips({ doc, marker: true });

    expect(StatusTooltipUI.hide).toHaveBeenCalledWith({ doc });
    expect(tooltipEl.classList.remove).toHaveBeenCalledWith('visible');
    expect(cleanupEnemyIntentTooltip).toHaveBeenCalledWith({ doc, marker: true });

    const ui = {
      showEnemyStatusTooltip: vi.fn(),
      hideEnemyStatusTooltip: vi.fn(),
      showIntentTooltip: vi.fn(),
      hideIntentTooltip: vi.fn(),
    };
    expect(buildCombatEnemyHandlers(ui)).toEqual({
      onShowStatusTooltip: ui.showEnemyStatusTooltip,
      onHideStatusTooltip: ui.hideEnemyStatusTooltip,
      onShowIntentTooltip: ui.showIntentTooltip,
      onHideIntentTooltip: ui.hideIntentTooltip,
    });
  });

  it('uses full render when counts differ and incremental update otherwise', () => {
    const doc = {};
    const buildEnemyViewModel = vi.fn(({ enemy, index }) => ({ enemy, index, previewText: '6 dmg' }));
    const createEnemyCardView = vi.fn((viewModel) => ({ viewModel }));
    const updateEnemyCardView = vi.fn();
    const syncCombatEnemyFloatingTooltips = vi.fn();
    const ui = {
      cleanupAllTooltips: vi.fn(),
    };
    const gs = {
      combat: {
        enemies: [
          { id: 'a', ai: vi.fn() },
          { id: 'b', ai: vi.fn() },
        ],
        playerTurn: true,
      },
    };

    const fullZone = createZone(0);
    expect(needsCombatEnemyFullRender(fullZone, gs.combat.enemies, false)).toBe(true);

    renderCombatEnemyList({
      createEnemyCardView,
      data: { cards: { strike: {} } },
      deps: {},
      doc,
      buildEnemyViewModel,
      gs,
      handlers: {},
      syncCombatEnemyFloatingTooltips,
      ui,
      updateEnemyCardView,
      zone: fullZone,
    });

    expect(ui.cleanupAllTooltips).toHaveBeenCalledTimes(1);
    expect(fullZone.textContent).toBe('');
    expect(createEnemyCardView).toHaveBeenCalledTimes(2);
    expect(fullZone.appended).toHaveLength(2);
    expect(syncCombatEnemyFloatingTooltips).toHaveBeenCalledWith(doc);

    const incrementalZone = createZone(2);
    buildEnemyViewModel.mockClear();
    updateEnemyCardView.mockClear();
    gs.combat.playerTurn = false;

    expect(needsCombatEnemyFullRender(incrementalZone, gs.combat.enemies, false)).toBe(false);

    renderCombatEnemyList({
      createEnemyCardView,
      data: { cards: { strike: {} } },
      deps: {},
      doc,
      buildEnemyViewModel,
      gs,
      handlers: {},
      syncCombatEnemyFloatingTooltips,
      ui,
      updateEnemyCardView,
      zone: incrementalZone,
    });

    expect(updateEnemyCardView).toHaveBeenCalledTimes(2);
    expect(updateEnemyCardView.mock.calls[0][0].previewText).toBe('');
  });
});
