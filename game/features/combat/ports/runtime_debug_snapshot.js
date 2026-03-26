import {
  getEnemyAnchor,
  getViewportSummary,
  isVisibleElement,
  readTextContent,
  toFiniteNumber,
} from '../../ui/ports/public_runtime_debug_support_capabilities.js';

function collectEnemyState(enemies = []) {
  return enemies.map((enemy, index) => ({
    index,
    id: enemy?.id || enemy?.key || enemy?.name || `enemy-${index}`,
    hp: toFiniteNumber(enemy?.hp),
    maxHp: toFiniteNumber(enemy?.maxHp),
    alive: toFiniteNumber(enemy?.hp) > 0,
    intent: enemy?.nextAction || enemy?.intent || null,
    statusKeys: Object.keys(enemy?.status || enemy?.statuses || {}),
  }));
}

function collectCombatResourceSummary(gs) {
  const player = gs?.player || {};
  return {
    handCount: Array.isArray(player.hand) ? player.hand.length : 0,
    drawPileCount: Array.isArray(player.drawPile) ? player.drawPile.length : 0,
    graveyardCount: Array.isArray(player.graveyard) ? player.graveyard.length : 0,
    energy: toFiniteNumber(player.energy),
    maxEnergy: toFiniteNumber(player.maxEnergy),
  };
}

function collectCombatUiSummary(doc, view) {
  const handCards = typeof doc?.querySelectorAll === 'function'
    ? Array.from(doc.querySelectorAll('#combatHandCards .card'))
    : [];
  const endTurnButton = typeof doc?.querySelector === 'function'
    ? doc.querySelector('.action-btn-end')
    : null;
  const hoverClone = typeof doc?.querySelector === 'function'
    ? doc.querySelector('#handCardCloneLayer .card-clone-visible')
    : null;
  const keywordPanel = hoverClone?.querySelector?.('.card-clone-keyword-panel') || null;
  const keywordTitle = keywordPanel?.querySelector?.('.card-clone-keyword-body-title') || null;
  const mechanicTrigger = hoverClone?.querySelector?.('.card-hover-mechanic-trigger') || null;

  return {
    handCardCount: handCards.length,
    energyLabel: readTextContent(doc?.getElementById?.('combatEnergyText')),
    turnLabel: readTextContent(doc?.getElementById?.('turnIndicator')),
    endTurnDisabled: !!endTurnButton?.disabled,
    endTurnVisible: isVisibleElement(endTurnButton, view),
    hoverCloneVisible: !!hoverClone,
    hoverKeywordPanelOpen: hoverClone?.dataset?.keywordPanelOpen === 'true',
    hoverKeywordPlacement: hoverClone?.dataset?.keywordPlacement || null,
    hoverKeywordTitle: readTextContent(keywordTitle),
    hoverMechanicLabel: readTextContent(mechanicTrigger),
  };
}

export function collectCombatRuntimeDebugSnapshot({ modules, doc, win }) {
  const gs = modules?.featureScopes?.core?.GS || modules?.GS || {};
  const view = win || doc?.defaultView || null;
  const viewport = getViewportSummary(doc, view, gs);
  const enemies = Array.isArray(gs?.combat?.enemies) ? gs.combat.enemies : [];
  const enemyStates = collectEnemyState(enemies).map((enemy) => ({
    ...enemy,
    anchor: getEnemyAnchor(enemy.index, enemies.length, viewport),
    targetable: enemy.alive,
  }));
  const targetableEnemyIndexes = enemyStates
    .filter((enemy) => enemy.targetable)
    .map((enemy) => enemy.index);
  const selectedTarget = toFiniteNumber(gs?._selectedTarget, -1);
  const uiSummary = collectCombatUiSummary(doc, view);

  return {
    combat: {
      active: !!gs?.combat?.active,
      playerTurn: !!gs?.combat?.playerTurn,
      turn: toFiniteNumber(gs?.combat?.turn),
      selectedTarget,
      selectedEnemyId: enemyStates.find((enemy) => enemy.index === selectedTarget)?.id || null,
      layout: {
        viewport,
        playerAnchor: {
          x: Math.round(viewport.width / 2),
          y: Math.round(viewport.height * 0.78),
        },
      },
      aliveEnemyCount: targetableEnemyIndexes.length,
      targetableEnemyIndexes,
      enemies: enemyStates,
      logSize: Array.isArray(gs?.combat?.log) ? gs.combat.log.length : 0,
      resources: collectCombatResourceSummary(gs),
      ui: uiSummary,
      surface: uiSummary,
    },
  };
}
