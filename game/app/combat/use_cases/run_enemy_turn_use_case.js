import { TurnManager } from '../../../combat/turn_manager.js';
import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import { syncGuardianPreservedShield } from '../../../state/commands/combat_runtime_commands.js';

function getCombatRegionId(gs) {
  return resolveActiveRegionId(gs);
}

export async function runEnemyTurnUseCase({
  gs,
  data,
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
} = {}) {
  cleanupTooltips?.();
  if (shouldAbortTurn(gs)) return;

  const tickEvents = TurnManager.processEnemyStatusTicks(gs);
  playStatusTickEffects?.(tickEvents);
  renderCombatEnemies?.();

  for (let index = 0; index < gs.combat.enemies.length; index += 1) {
    if (shouldAbortTurn(gs)) return;
    const enemy = gs.combat.enemies[index];
    if (enemy.hp <= 0) continue;

    if (!(await waitForCombat(gs, 800))) return;

    if (TurnManager.processEnemyStun(enemy)) {
      onEnemyStunned?.(enemy, index);
      renderCombatEnemies?.();
      continue;
    }

    const action = TurnManager.getEnemyAction(enemy, gs.combat.turn);

    if (action.type === 'phase_shift' || action.effect === 'phase_shift') {
      TurnManager.handleBossPhaseShiftLogic(gs, enemy);
      showBossPhaseShift?.(enemy, index);
    } else if (action.dmg > 0) {
      const hitResults = TurnManager.processEnemyAttack(gs, enemy, index, action);
      for (const hit of hitResults) {
        if (await playEnemyAttackHit?.(index, hit, action)) break;
      }
    }

    const effectResult = TurnManager.handleEnemyEffect(action.effect, gs, enemy, {
      regionId: getCombatRegionId(gs),
      data,
    });
    if (effectResult?.uiAction) dispatchUiAction?.(effectResult);

    TurnManager.decayEnemyWeaken(enemy);
    renderCombatEnemies?.();
  }

  if (!(await waitForCombat(gs, 600))) return;
  if (shouldAbortTurn(gs)) return;

  const statusResult = TurnManager.processPlayerStatusTicks(gs, {
    shuffleArrayFn: shuffleArray,
  });
  if (!statusResult.alive) return;
  statusResult.actions.forEach((uiAction) => dispatchUiAction?.({ uiAction }));
  if (shouldAbortTurn(gs)) return;

  syncGuardianPreservedShield(gs);
  beforeStartPlayerTurn?.();
  TurnManager.startPlayerTurnLogic(gs);
  syncCombatEnergy?.();
  onTurnStart?.(gs);

  const classMech = classMechanics?.[gs.player.class];
  if (classMech && typeof classMech.onTurnStart === 'function') {
    classMech.onTurnStart(gs);
  }

  onPlayerTurnStarted?.();
}
