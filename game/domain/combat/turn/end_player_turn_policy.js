import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import { ENEMY_TURN_BUFFS, TURN_START_DEBUFFS } from '../../../combat/turn_manager_helpers.js';
import { normalizeInfiniteStack, isInfiniteStackBuff } from './infinite_stack_buffs.js';

export function endPlayerTurnPolicy(gs, data, { canPlayFn } = {}) {
  if (!gs?.combat?.active || !gs.combat.playerTurn) return null;

  let skippableCards = 0;
  if (gs.player.hand.length > 0 && canPlayFn) {
    const playable = gs.player.hand.filter((id) => {
      const card = data?.cards?.[id];
      if (!card) return false;
      return canPlayFn(id, card, gs.player);
    });
    skippableCards = playable.length;
    if (skippableCards > 0) {
      gs.addLog?.(`💡 사용 가능한 카드 ${skippableCards}장을 남기고 턴 종료`, 'system');
    }
  }

  Object.keys(gs.player.buffs).forEach((buffId) => {
    const buff = gs.player.buffs[buffId];
    if (!buff || typeof buff !== 'object') return;
    normalizeInfiniteStack(buffId, buff);
    if (TURN_START_DEBUFFS.has(buffId)) return;
    if (ENEMY_TURN_BUFFS.has(buffId)) return;
    if (buffId === 'resonance') return;
    if (buff.nextEnergy) return;
    if (buff.echoRegen) gs.addEcho(buff.echoRegen);
    if (isInfiniteStackBuff(buffId, buff)) return;
    if (!Number.isFinite(buff.stacks)) return;
    buff.stacks--;
    if (buff.stacks <= 0) delete gs.player.buffs[buffId];
  });

  const activeRegionId = resolveActiveRegionId(gs);
  const shouldReduceSilence = activeRegionId === 1 || gs.player.class === 'hunter';
  if (shouldReduceSilence && gs.player.silenceGauge > 0) {
    gs.player.silenceGauge = Math.max(0, gs.player.silenceGauge - 1);
  }

  if (activeRegionId === 5) {
    gs.player.timeRiftGauge = 0;
  }

  gs.triggerItems?.('turn_end');
  if ((gs.player.echoChain || 0) > 0) {
    gs.triggerItems?.('chain_break', { chain: gs.player.echoChain });
  }

  gs.player.graveyard.push(...gs.player.hand);
  gs.player.hand = [];
  gs.player.echoChain = 0;
  gs.player.costDiscount = 0;
  gs.player._nextCardDiscount = 0;
  gs.player.zeroCost = false;
  gs.player._freeCardUses = 0;
  gs.combat.playerTurn = false;

  return { skippableCards };
}
