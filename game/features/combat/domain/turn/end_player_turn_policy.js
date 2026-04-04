import {
  isEnemyTurnBuff,
  isInfiniteStackBuff,
  isTurnStartDebuff,
  normalizeInfiniteStack,
} from './infinite_stack_buffs.js';
import {
  decrementStackedBuff,
} from './turn_state_mutators.js';

export function endPlayerTurnPolicy(gs, data, options = {}) {
  const { canPlayFn } = options;
  const consumePlayerBuffState = options.consumePlayerBuffState
    || ((state, buffId) => decrementStackedBuff(state?.player?.buffs, buffId));
  const reducePlayerTurnSilenceGaugeState = options.reducePlayerTurnSilenceGaugeState
    || (() => 0);
  const resetPlayerTurnTimeRiftState = options.resetPlayerTurnTimeRiftState
    || (() => 0);
  const finalizePlayerTurnEndState = options.finalizePlayerTurnEndState
    || (() => null);
  const resolveCombatRegionId = options.resolveActiveRegionId
    || ((state, deps = {}) => {
      const activeRegionId = Number(state?._activeRegionId);
      if (Number.isFinite(activeRegionId)) return Math.max(0, Math.floor(activeRegionId));
      const currentRegion = Math.max(0, Math.floor(Number(state?.currentRegion) || 0));
      if (typeof deps.getRegionData === 'function') {
        const regionId = Number(deps.getRegionData(currentRegion, state)?.id);
        if (Number.isFinite(regionId)) return Math.max(0, Math.floor(regionId));
      }
      return currentRegion;
    });

  if (!gs?.combat?.active || !gs.combat.playerTurn) return null;

  const player = gs.player;
  let skippableCards = 0;
  if (player.hand.length > 0 && canPlayFn) {
    const playable = player.hand.filter((id) => {
      const card = data?.cards?.[id];
      if (!card) return false;
      return canPlayFn(id, card, player);
    });
    skippableCards = playable.length;
    if (skippableCards > 0) {
      gs.addLog?.(`💡 사용 가능한 카드 ${skippableCards}장을 남기고 턴 종료`, 'system');
    }
  }

  Object.keys(player.buffs).forEach((buffId) => {
    const buff = player.buffs[buffId];
    if (!buff || typeof buff !== 'object') return;
    normalizeInfiniteStack(buffId, buff);
    if (isTurnStartDebuff(buffId)) return;
    if (isEnemyTurnBuff(buffId)) return;
    if (buffId === 'resonance') return;
    if (buff.nextEnergy) return;
    if (buff.echoRegen) gs.addEcho(buff.echoRegen);
    if (isInfiniteStackBuff(buffId, buff)) return;
    consumePlayerBuffState(gs, buffId);
  });

  const activeRegionId = resolveCombatRegionId(gs);
  const shouldReduceSilence = activeRegionId === 1 || player.class === 'hunter';
  if (shouldReduceSilence && player.silenceGauge > 0) {
    reducePlayerTurnSilenceGaugeState(gs, 1);
  }

  if (activeRegionId === 5) {
    resetPlayerTurnTimeRiftState(gs);
  }

  gs.triggerItems?.('turn_end');
  if ((player.echoChain || 0) > 0) {
    gs.triggerItems?.('chain_break', { chain: player.echoChain });
  }

  finalizePlayerTurnEndState(gs);

  return { skippableCards };
}
