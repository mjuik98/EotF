import { DATA } from '../../../../data/game_data.js';
import { LogUtils } from '../../../utils/log_utils.js';
import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import { ENEMY_TURN_BUFFS } from '../../../combat/turn_manager_helpers.js';
import { normalizeInfiniteStack, isInfiniteStackBuff } from './infinite_stack_buffs.js';

export function startPlayerTurnPolicy(gs) {
  ENEMY_TURN_BUFFS.forEach((buffId) => {
    const buff = gs.player.buffs?.[buffId];
    normalizeInfiniteStack(buffId, buff);
    if (isInfiniteStackBuff(buffId, buff)) return;
    if (!buff || !Number.isFinite(buff.stacks)) return;
    buff.stacks--;
    if (buff.stacks <= 0) delete gs.player.buffs[buffId];
  });

  gs.combat.turn++;
  gs.combat.playerTurn = true;

  const isStunned = (gs.player.buffs?.stunned?.stacks || 0) > 0;
  if (isStunned) {
    gs.player.energy = 0;
    gs.addLog?.(LogUtils.formatSystem('기절 상태: 에너지 충전 실패'), 'damage');
  } else {
    gs.player.energy = gs.player.maxEnergy;
  }

  gs.player.shield = 0;
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
        const [targetCardId] = pickedPool.cards.splice(pick, 1);
        if (targetCardId) {
          gs.player.exhausted.push(targetCardId);
          if (pickedPool.key === 'hand') gs.markDirty?.('hand');
          const cardName = DATA?.cards?.[targetCardId]?.name || targetCardId;
          gs.addLog?.(LogUtils.formatSystem(`지역 효과: ${cardName} 카드가 소멸되었습니다.`), 'damage');
        }
      }
    }
  } else if (activeRegionId === 3) {
    if (!isStunned) {
      gs.player.energy = Math.max(0, gs.player.energy - 1);
      gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
    }
  } else if (activeRegionId === 4) {
    gs.player.maxEcho = Math.max(50, (gs.player.maxEcho || 100) - 5);
    gs.player.echo = Math.min(gs.player.echo, gs.player.maxEcho);
    gs.addLog?.(LogUtils.formatStatChange('플레이어', '최대 에코', -5, false), 'damage');
  }

  gs.triggerItems?.('turn_start');
  gs.drawCards(drawCount, { skipRift: true });

  return { isStunned };
}
