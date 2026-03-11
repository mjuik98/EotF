import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import { ENEMY_TURN_BUFFS, TURN_START_DEBUFFS } from '../../../combat/turn_manager_helpers.js';
import { normalizeInfiniteStack, isInfiniteStackBuff } from './infinite_stack_buffs.js';
import {
  decrementStackedBuff,
  moveHandToGraveyard,
  reducePlayerSilenceGauge,
  resetPlayerTimeRiftGauge,
  resetTurnCardCostState,
  setCombatPlayerTurn,
  setPlayerEchoChain,
} from './turn_state_mutators.js';

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
    decrementStackedBuff(gs.player.buffs, buffId);
  });

  const activeRegionId = resolveActiveRegionId(gs);
  const shouldReduceSilence = activeRegionId === 1 || gs.player.class === 'hunter';
  if (shouldReduceSilence && gs.player.silenceGauge > 0) {
    reducePlayerSilenceGauge(gs, 1);
  }

  if (activeRegionId === 5) {
    resetPlayerTimeRiftGauge(gs);
  }

  gs.triggerItems?.('turn_end');
  if ((gs.player.echoChain || 0) > 0) {
    gs.triggerItems?.('chain_break', { chain: gs.player.echoChain });
  }

  moveHandToGraveyard(gs);
  setPlayerEchoChain(gs, 0);
  resetTurnCardCostState(gs);
  setCombatPlayerTurn(gs, false);

  return { skippableCards };
}
