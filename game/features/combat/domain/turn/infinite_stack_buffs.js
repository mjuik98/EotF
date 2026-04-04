import {
  ENEMY_TURN_BUFF_KEYS,
  INFINITE_STACK_BUFF_IDS as INFINITE_STACK_BUFF_IDS_DATA,
  TURN_START_DEBUFF_KEYS,
} from '../../../../../data/status_key_data.js';

export function isInfiniteStackBuff(buffId, buff) {
  if (!buff || typeof buff !== 'object') return false;
  if (buff.permanent) return true;
  if (Number.isFinite(buff.stacks) && buff.stacks >= 99) return true;
  if (INFINITE_STACK_BUFF_IDS_DATA.includes(buffId) && Number.isFinite(buff.stacks) && buff.stacks >= 90) {
    return true;
  }
  return false;
}

export function normalizeInfiniteStack(buffId, buff) {
  if (!buff || typeof buff !== 'object') return;
  if (isInfiniteStackBuff(buffId, buff) && Number.isFinite(buff.stacks) && buff.stacks < 99) {
    buff.stacks = 99;
  }
}

export function isEnemyTurnBuff(buffId) {
  return ENEMY_TURN_BUFF_KEYS.includes(buffId);
}

export function forEachEnemyTurnBuff(iteratee) {
  ENEMY_TURN_BUFF_KEYS.forEach(iteratee);
}

export function isTurnStartDebuff(buffId) {
  return TURN_START_DEBUFF_KEYS.includes(buffId);
}
