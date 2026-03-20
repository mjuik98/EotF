import { DATA } from '../../../../data/game_data.js';
import { LogUtils } from '../../../utils/log_utils.js';
import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import { ENEMY_TURN_BUFFS } from './turn_manager_helpers.js';
import { normalizeInfiniteStack, isInfiniteStackBuff } from './infinite_stack_buffs.js';
import {
  decrementStackedBuff,
  drawFromRandomPlayerPool,
} from './turn_state_mutators.js';

export function startPlayerTurnPolicy(gs, commands = {}) {
  const consumePlayerBuffState = commands.consumePlayerBuffState
    || ((state, buffId) => decrementStackedBuff(state?.player?.buffs, buffId));
  const drawCardsState = commands.drawCardsState
    || ((state, count, options) => state?.drawCards?.(count, options));
  const beginPlayerTurnState = commands.beginPlayerTurnState
    || (() => null);
  const exhaustRandomPlayerCardState = commands.exhaustRandomPlayerCardState
    || ((state, pools, pickIndex) => drawFromRandomPlayerPool(state, pools, pickIndex));
  const reducePlayerTurnEnergyState = commands.reducePlayerTurnEnergyState
    || (() => 0);
  const reducePlayerTurnMaxEchoState = commands.reducePlayerTurnMaxEchoState
    || (() => 0);

  ENEMY_TURN_BUFFS.forEach((buffId) => {
    const buff = gs.player.buffs?.[buffId];
    normalizeInfiniteStack(buffId, buff);
    if (isInfiniteStackBuff(buffId, buff)) return;
    consumePlayerBuffState(gs, buffId);
  });

  const isStunned = (gs.player.buffs?.stunned?.stacks || 0) > 0;
  beginPlayerTurnState(gs, { isStunned });
  if (isStunned) {
    gs.addLog?.(LogUtils.formatSystem('기절 상태: 에너지 충전 실패'), 'damage');
  }

  let drawCount = 5;

  const activeRegionId = resolveActiveRegionId(gs);
  if (activeRegionId === 5) drawCount = 6;

  if (activeRegionId === 2) {
    const pools = [
      { key: 'deck', cards: gs.player.deck },
      { key: 'hand', cards: gs.player.hand },
      { key: 'graveyard', cards: gs.player.graveyard },
    ].filter((pool) => Array.isArray(pool.cards) && pool.cards.length > 0);

    const totalCards = pools.reduce((sum, pool) => sum + pool.cards.length, 0);
    if (totalCards > 0) {
      let pick = Math.floor(Math.random() * totalCards);
      let pickedPool = null;

      for (const pool of pools) {
        if (pick < pool.cards.length) {
          pickedPool = pool;
          break;
        }
        pick -= pool.cards.length;
      }

      if (pickedPool) {
        const { cardId: targetCardId } = exhaustRandomPlayerCardState(gs, pools, pick);
        if (targetCardId) {
          const cardName = DATA?.cards?.[targetCardId]?.name || targetCardId;
          gs.addLog?.(LogUtils.formatSystem(`지역 효과: ${cardName} 카드가 소멸되었습니다.`), 'damage');
        }
      }
    }
  } else if (activeRegionId === 3) {
    if (!isStunned) {
      reducePlayerTurnEnergyState(gs, 1);
      gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
    }
  } else if (activeRegionId === 4) {
    reducePlayerTurnMaxEchoState(gs, 5);
    gs.addLog?.(LogUtils.formatStatChange('플레이어', '최대 에코', -5, false), 'damage');
  }

  gs.triggerItems?.('turn_start');
  drawCardsState(gs, drawCount, { skipRift: true });

  return { isStunned };
}
