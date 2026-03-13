import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import { drawCardsState } from '../state/card_state_commands.js';

export function drawCardsService({
  count = 1,
  gs,
  options = {},
  deps = {},
}) {
  const result = drawCardsState(gs, count);
  const combat = gs.combat;

  if (options.skipRift) return result;

  const attempts = Math.max(0, Number(result?.attempts || 0));
  if (attempts <= 0) return result;

  const combatRegionId = resolveActiveRegionId(gs, {
    getRegionData: deps.getRegionData,
  });
  if (combatRegionId === 5 && combat?.active && typeof gs.addTimeRift === 'function') {
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
  const combat = gs.combat;
  const player = gs.player;
  if (!combat?.active || !combat?.playerTurn) return false;

  const maxHand = Math.max(1, 8 - Math.max(0, Number(player._handCapMinus || 0)));
  if (player.hand.length >= maxHand) {
    gs.addLog?.(`⚠️ 손패가 가득 찼습니다 (최대 ${maxHand}장)`, 'damage');
    playHit?.();
    updateUI?.();
    return false;
  }

  if (player.energy < 1) {
    gs.addLog?.('⚠️ 에너지 부족! (카드 드로우: 1 에너지)', 'damage');
    playHit?.();
    updateUI?.();
    return false;
  }

  modifyEnergy(-1, gs);
  drawCards(1, gs);
  return true;
}
