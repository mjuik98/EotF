import { Actions } from '../../core/state_actions.js';
import { resolveActiveRegionId } from '../../domain/run/region_service.js';

export function drawCardsService({
  count = 1,
  gs,
  options = {},
  deps = {},
}) {
  const result = gs.dispatch(Actions.CARD_DRAW, { count });

  if (options.skipRift) return result;

  const attempts = Math.max(0, Number(result?.attempts || 0));
  if (attempts <= 0) return result;

  const combatRegionId = resolveActiveRegionId(gs, {
    getRegionData: deps.getRegionData,
  });
  if (combatRegionId === 5 && gs.combat?.active && typeof gs.addTimeRift === 'function') {
    gs.addTimeRift(attempts, '시간의 균열', deps.runtimeDeps || {});
  }

  return result;
}

export function executePlayerDrawService({
  gs,
  modifyEnergy,
  drawCards,
  playHit,
  updateUI,
}) {
  if (!gs.combat?.active || !gs.combat?.playerTurn) return false;

  const maxHand = Math.max(1, 8 - Math.max(0, Number(gs.player._handCapMinus || 0)));
  if (gs.player.hand.length >= maxHand) {
    gs.addLog?.(`⚠️ 손패가 가득 찼습니다 (최대 ${maxHand}장)`, 'damage');
    playHit?.();
    updateUI?.();
    return false;
  }

  if (gs.player.energy < 1) {
    gs.addLog?.('⚠️ 에너지 부족! (카드 드로우: 1 에너지)', 'damage');
    playHit?.();
    updateUI?.();
    return false;
  }

  modifyEnergy(-1, gs);
  drawCards(1, gs);
  return true;
}
