import {
  buildDeathEndingActions,
  cleanupEnemyDeathTooltips,
  lockCombatEndInputs,
  runPlayerDeathSequence,
  scheduleCombatEndFlow,
  scheduleEnemyRemoval,
} from '../../../combat/death_handler_runtime.js';
import { showDeathOutcomeScreen } from '../../../combat/death_handler_outcome.js';
import { spawnScaledEnemyForRegion } from '../../../combat/death_handler_spawn.js';

function resolveDoc(deps = {}) {
  return deps.doc || deps.win?.document || document;
}

function resolveWin(deps = {}) {
  return deps.win || deps.doc?.defaultView || window;
}

function getAliveCombatEnemies(gs) {
  return gs.combat.enemies.filter(function isAlive(enemy) {
    return enemy.hp > 0;
  });
}

export function spawnCombatEnemy(gs, deps = {}) {
  const win = resolveWin(deps);
  const hudUpdateUI = deps.hudUpdateUI || win.HudUpdateUI;

  return spawnScaledEnemyForRegion(gs, {
    getRegionData: deps.getRegionData,
    renderCombatEnemies: deps.renderCombatEnemies || win.renderCombatEnemies,
    enableActionButtons: hudUpdateUI?.enableActionButtons?.bind?.(hudUpdateUI),
    doc: resolveDoc(deps),
    win,
  });
}

export function createEnemyDeathRuntimePort(gs, deps = {}) {
  const doc = resolveDoc(deps);
  const win = resolveWin(deps);
  const cleanupTooltips = deps.cleanupAllTooltips || win.CombatUI?.cleanupAllTooltips;

  return {
    doc,
    win,
    runtimePort: {
      cleanupTooltips: () => cleanupEnemyDeathTooltips(cleanupTooltips, doc, win),
      lockCombatEndInputs: () => lockCombatEndInputs(doc),
      queueCombatEnd: () => scheduleCombatEndFlow({
        deps,
        endCombat: (endCombatDeps) => gs.endCombat(endCombatDeps),
        schedule: setTimeout,
        win,
      }),
      removeDeadEnemies: () => deps.replaceCombatEnemies?.(gs, getAliveCombatEnemies(gs)),
      renderCombatEnemies: deps.renderCombatEnemies || win.renderCombatEnemies,
      scheduleEnemyRemoval: (enemyIdx, onRemove) => {
        const cardEl = doc.getElementById(`enemy_${enemyIdx}`);
        scheduleEnemyRemoval(cardEl, setTimeout, onRemove);
      },
      syncSelectedTarget: () => deps.syncSelectedTarget?.(gs),
      updateUi: deps.updateUI || win.updateUI,
    },
  };
}

export function runCombatPlayerDeathSequence(gs, deps = {}) {
  const doc = resolveDoc(deps);
  const win = resolveWin(deps);
  const combatOverlay = doc.getElementById('combatOverlay');
  const screenShake = deps.screenShake || win.ScreenShake;
  const particleSystem = deps.particleSystem || win.ParticleSystem;

  runPlayerDeathSequence({
    combatOverlay,
    deathQuotes: deps.deathQuotes,
    doc,
    particleSystem,
    schedule: setTimeout,
    screenShake,
    showDeathScreen: () => gs.showDeathScreen(deps),
    win,
  });
}

export function showCombatDeathOutcome(gs, deps = {}) {
  const win = resolveWin(deps);
  showDeathOutcomeScreen(gs, deps, win);
}

export function createDeathEndingActionPorts(deps = {}) {
  return buildDeathEndingActions(deps, resolveWin(deps));
}

export function resolveDeathRuntimeContext(deps = {}) {
  return {
    doc: resolveDoc(deps),
    win: resolveWin(deps),
  };
}
