import {
  buildDeathEndingActions,
  cleanupEnemyDeathTooltips,
  lockCombatEndInputs,
  runPlayerDeathSequence,
  scheduleCombatEndFlow,
  scheduleEnemyRemoval,
} from './death_runtime_helpers.js';
import {
  createCombatDeathRuntimeHost,
  resolveCombatDeathRuntimeContext,
} from './browser/death_runtime_host.js';
import { showDeathOutcomeScreen } from './death_outcome_helpers.js';
import { spawnScaledEnemyForRegion } from './death_spawn_runtime.js';

export { createCombatDeathRuntimeHost } from './browser/death_runtime_host.js';

function getAliveCombatEnemies(gs) {
  return gs.combat.enemies.filter(function isAlive(enemy) {
    return enemy.hp > 0;
  });
}

export function spawnCombatEnemy(gs, deps = {}) {
  const runtimeHost = createCombatDeathRuntimeHost(deps);
  const { doc, win } = runtimeHost;

  return spawnScaledEnemyForRegion(gs, {
    getRegionData: deps.getRegionData,
    renderCombatEnemies: runtimeHost.renderCombatEnemies,
    enableActionButtons: runtimeHost.hudUpdateUI?.enableActionButtons?.bind?.(runtimeHost.hudUpdateUI),
    doc,
    win,
  });
}

export function createEnemyDeathRuntimePort(gs, deps = {}) {
  const runtimeHost = createCombatDeathRuntimeHost(deps);
  const { doc, win } = runtimeHost;

  return {
    doc,
    win,
    runtimePort: {
      cleanupTooltips: () => cleanupEnemyDeathTooltips(runtimeHost.cleanupAllTooltips, doc, win),
      lockCombatEndInputs: () => lockCombatEndInputs(doc),
      queueCombatEnd: () => {
        if (typeof deps.endCombat !== 'function') return;
        scheduleCombatEndFlow({
          deps,
          endCombat: deps.endCombat,
          schedule: setTimeout,
          win,
        });
      },
      removeDeadEnemies: () => deps.replaceCombatEnemies?.(gs, getAliveCombatEnemies(gs)),
      renderCombatEnemies: runtimeHost.renderCombatEnemies,
      scheduleEnemyRemoval: (enemyIdx, onRemove) => {
        const cardEl = doc.getElementById(`enemy_${enemyIdx}`);
        scheduleEnemyRemoval(cardEl, setTimeout, onRemove);
      },
      syncSelectedTarget: () => deps.syncSelectedTarget?.(gs),
      updateUi: runtimeHost.updateUI,
    },
  };
}

export function runCombatPlayerDeathSequence(gs, deps = {}) {
  const runtimeHost = createCombatDeathRuntimeHost(deps);
  const { doc, win } = runtimeHost;
  const combatOverlay = doc.getElementById('combatOverlay');

  runPlayerDeathSequence({
    combatOverlay,
    deathQuotes: deps.deathQuotes,
    doc,
    particleSystem: runtimeHost.particleSystem,
    schedule: setTimeout,
    screenShake: runtimeHost.screenShake,
    showDeathScreen: deps.showDeathScreen,
    win,
  });
}

export function showCombatDeathOutcome(gs, deps = {}) {
  const { win } = resolveCombatDeathRuntimeContext(deps);
  showDeathOutcomeScreen(gs, deps, win);
}

export function createDeathEndingActionPorts(deps = {}) {
  const { win } = resolveCombatDeathRuntimeContext(deps);
  return buildDeathEndingActions(deps, win);
}

export function resolveDeathRuntimeContext(deps = {}) {
  return resolveCombatDeathRuntimeContext(deps);
}
