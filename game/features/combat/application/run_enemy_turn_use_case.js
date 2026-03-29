import {
  startPlayerTurnPolicy,
} from '../domain/turn/start_player_turn_policy.js';
import { resolveActiveRegionId } from '../../run/ports/public_rule_capabilities.js';
import { syncGuardianPreservedShield } from '../ports/public_state_capabilities.js';
import {
  decayEnemyWeaken,
  getEnemyAction,
  handleBossPhaseShift,
  handleEnemyEffect,
  processEnemyAttack,
  processEnemyStatusTicks,
  processEnemyStun,
} from '../domain/enemy_turn_domain.js';
import { processPlayerStatusTicks } from '../domain/player_status_tick_domain.js';
import { beginPlayerTurnUseCase } from './begin_player_turn_use_case.js';

function getCombatRegionId(gs) {
  return resolveActiveRegionId(gs);
}

export async function runEnemyTurnUseCase({
  gs,
  data,
  api,
  shuffleArray,
  classMechanics,
  cleanupTooltips,
  shouldAbortTurn = () => false,
  waitForCombat = async () => true,
  playStatusTickEffects,
  renderCombatEnemies,
  onEnemyStunned,
  showBossPhaseShift,
  playEnemyAttackHit,
  dispatchUiAction,
  beforeStartPlayerTurn,
  syncCombatEnergy,
  onTurnStart,
  onPlayerTurnStarted,
  processEnemyStatusTicksFn,
  processEnemyStunFn,
  getEnemyActionFn,
  handleBossPhaseShiftFn,
  processEnemyAttackFn,
  handleEnemyEffectFn,
  decayEnemyWeakenFn,
  processPlayerStatusTicksFn,
  startPlayerTurn,
} = {}) {
  const resolveEnemyStatusTicks = processEnemyStatusTicksFn || processEnemyStatusTicks;
  const resolveEnemyStun = processEnemyStunFn || processEnemyStun;
  const resolveEnemyAction = getEnemyActionFn || getEnemyAction;
  const resolveBossPhaseShift = handleBossPhaseShiftFn || handleBossPhaseShift;
  const resolveEnemyAttack = processEnemyAttackFn || processEnemyAttack;
  const resolveEnemyEffect = handleEnemyEffectFn || handleEnemyEffect;
  const resolveEnemyWeakenDecay = decayEnemyWeakenFn || decayEnemyWeaken;
  const resolvePlayerStatusTicks = processPlayerStatusTicksFn || processPlayerStatusTicks;
  const startPlayerTurnAction = startPlayerTurn
    || (() => startPlayerTurnPolicy(gs, { resolveActiveRegionId }));

  cleanupTooltips?.();
  if (shouldAbortTurn(gs)) return;

  const tickEvents = resolveEnemyStatusTicks(gs);
  playStatusTickEffects?.(tickEvents);
  renderCombatEnemies?.();

  for (let index = 0; index < gs.combat.enemies.length; index += 1) {
    if (shouldAbortTurn(gs)) return;
    const enemy = gs.combat.enemies[index];
    if (enemy.hp <= 0) continue;

    if (!(await waitForCombat(gs, 800))) return;

    if (resolveEnemyStun(enemy)) {
      onEnemyStunned?.(enemy, index);
      renderCombatEnemies?.();
      continue;
    }

    const action = resolveEnemyAction(enemy, gs.combat.turn, gs);

    if (action.type === 'phase_shift' || action.effect === 'phase_shift') {
      resolveBossPhaseShift(gs, enemy);
      showBossPhaseShift?.(enemy, index);
    } else if (action.dmg > 0) {
      const hitResults = resolveEnemyAttack(gs, enemy, index, action, {
        takeDamage: (amount, source) => {
          if (typeof api?.takeDamage === 'function') {
            return api.takeDamage(amount, gs, source);
          }
          if (typeof api?.applyPlayerDamage === 'function') {
            return api.applyPlayerDamage(amount, gs);
          }
          return gs.takeDamage?.(amount, source);
        },
      });
      for (const hit of hitResults) {
        if (await playEnemyAttackHit?.(index, hit, action)) break;
      }
    }

    const effectResult = resolveEnemyEffect(action.effect, gs, enemy, {
      regionId: getCombatRegionId(gs),
      data,
    });
    if (effectResult?.uiAction) dispatchUiAction?.(effectResult);

    resolveEnemyWeakenDecay(enemy);
    renderCombatEnemies?.();
  }

  if (!(await waitForCombat(gs, 600))) return;
  if (shouldAbortTurn(gs)) return;

  const statusResult = resolvePlayerStatusTicks(gs, {
    shuffleArrayFn: shuffleArray,
  });
  if (!statusResult.alive) return;
  statusResult.actions.forEach((uiAction) => dispatchUiAction?.({ uiAction }));
  if (shouldAbortTurn(gs)) return;

  beginPlayerTurnUseCase({
    gs,
    classMechanics,
    preserveGuardianShield: syncGuardianPreservedShield,
    beforeStartPlayerTurn,
    startPlayerTurn: startPlayerTurnAction,
    syncCombatEnergy,
    onTurnStart,
    presentPlayerTurnReady: onPlayerTurnStarted,
  });
}
