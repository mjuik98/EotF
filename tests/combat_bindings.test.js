import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  baseCardDeps: vi.fn(() => ({ token: 'base-card-deps' })),
  getCardTargetDeps: vi.fn(() => ({ token: 'card-target-deps' })),
  getCombatTurnBaseDeps: vi.fn(() => ({ token: 'combat-turn-base-deps' })),
  getFeedbackDeps: vi.fn(() => ({ token: 'feedback-deps' })),
}));

import * as Deps from '../game/core/deps_factory.js';
import { createCombatBindings } from '../game/core/bindings/combat_bindings.js';

function createModules() {
  return {
    GAME: {
      getCombatDeps: vi.fn(() => ({ token: 'combat-deps' })),
      getHudDeps: vi.fn(() => ({ token: 'hud-deps' })),
    },
    GS: { token: 'gs' },
    RandomUtils: { shuffleArray: vi.fn((items) => [...items].reverse()) },
    CombatStartUI: { startCombat: vi.fn() },
    CombatTurnUI: {
      endPlayerTurn: vi.fn(),
      enemyTurn: vi.fn(),
      processEnemyStatusTicks: vi.fn(),
      handleBossPhaseShift: vi.fn(),
      handleEnemyEffect: vi.fn(),
    },
    CombatHudUI: {
      toggleHudPin: vi.fn(),
      showEchoSkillTooltip: vi.fn(),
      hideEchoSkillTooltip: vi.fn(),
      showTurnBanner: vi.fn(),
      updateCombatLog: vi.fn(),
      updateEchoSkillBtn: vi.fn(),
      toggleBattleChronicle: vi.fn(),
      openBattleChronicle: vi.fn(),
      closeBattleChronicle: vi.fn(),
    },
    CombatUI: {
      showIntentTooltip: vi.fn(),
      hideIntentTooltip: vi.fn(),
      renderCombatEnemies: vi.fn(),
      updateEnemyHpUI: vi.fn(),
    },
    CardUI: {
      renderCombatCards: vi.fn(),
      updateHandFanEffect: vi.fn(),
      renderHand: vi.fn(),
      getCardTypeClass: vi.fn(() => 'attack'),
      getCardTypeLabelClass: vi.fn(() => 'label-attack'),
    },
    EchoSkillUI: { useEchoSkill: vi.fn() },
    CombatActionsUI: { drawCard: vi.fn() },
    CardTargetUI: {
      handleDragStart: vi.fn(),
      handleDragEnd: vi.fn(),
      handleDropOnEnemy: vi.fn(),
      selectTarget: vi.fn(),
    },
    FeedbackUI: {
      showCombatSummary: vi.fn(),
      showDmgPopup: vi.fn(),
      showEdgeDamage: vi.fn(),
      showEchoBurstOverlay: vi.fn(),
      showCardPlayEffect: vi.fn(),
      showItemToast: vi.fn(),
      showLegendaryAcquire: vi.fn(),
      showChainAnnounce: vi.fn(),
      showWorldMemoryNotice: vi.fn(),
      _flushNoticeQueue: vi.fn(),
    },
  };
}

describe('createCombatBindings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes combat and feedback actions through feature ports', () => {
    const modules = createModules();
    const fns = {
      _refreshCombatInfoPanel: vi.fn(),
      _resetCombatInfoPanel: vi.fn(),
      renderCombatCards: vi.fn(),
      renderCombatEnemies: vi.fn(),
      showEchoBurstOverlay: vi.fn(),
      showTurnBanner: vi.fn(),
      showWorldMemoryNotice: vi.fn(),
      updateChainUI: vi.fn(),
      updateClassSpecialUI: vi.fn(),
      updateCombatLog: vi.fn(),
      updateNoiseWidget: vi.fn(),
      updateUI: vi.fn(),
    };

    createCombatBindings(modules, fns);

    fns.startCombat(true);
    fns.endPlayerTurn();
    fns.showEchoSkillTooltip({ type: 'mouseenter' });
    fns.renderCombatEnemies(true);
    fns.drawCard();
    fns.handleCardDragStart({ type: 'dragstart' }, 'strike', 0);
    fns.showItemToast({ id: 'relic' }, { sticky: true });

    expect(modules.CombatStartUI.startCombat).toHaveBeenCalledWith(true, expect.objectContaining({
      token: 'combat-deps',
      renderCombatCards: fns.renderCombatCards,
      renderCombatEnemies: fns.renderCombatEnemies,
      showWorldMemoryNotice: fns.showWorldMemoryNotice,
      shuffleArray: expect.any(Function),
    }));
    expect(modules.CombatTurnUI.endPlayerTurn).toHaveBeenCalledWith({ token: 'combat-turn-base-deps' });
    expect(modules.CombatHudUI.showEchoSkillTooltip).toHaveBeenCalledWith({ type: 'mouseenter' }, { token: 'hud-deps' });
    expect(modules.CombatUI.renderCombatEnemies).toHaveBeenCalledWith(expect.objectContaining({
      token: 'combat-deps',
      forceFullRender: true,
      selectTargetHandlerName: 'selectTarget',
    }));
    expect(modules.CombatActionsUI.drawCard).toHaveBeenCalledWith({ token: 'combat-deps', gs: modules.GS });
    expect(modules.CardTargetUI.handleDragStart).toHaveBeenCalledWith({ type: 'dragstart' }, 'strike', 0, { token: 'card-target-deps' });
    expect(modules.FeedbackUI.showItemToast).toHaveBeenCalledWith({ id: 'relic' }, { token: 'feedback-deps' }, { sticky: true });
    expect(Deps.getCombatTurnBaseDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getCardTargetDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getFeedbackDeps).toHaveBeenCalledTimes(1);
  });
});
