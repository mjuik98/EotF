import { INFINITE_STACK_BUFF_IDS as INFINITE_STACK_BUFF_IDS_DATA } from '../../../../data/status_key_data.js';

const INFINITE_STACK_BUFF_IDS = new Set(INFINITE_STACK_BUFF_IDS_DATA);

export function isInfiniteStackBuff(buffId, buff) {
  if (!buff || typeof buff !== 'object') return false;
  if (buff.permanent) return true;
  if (Number.isFinite(buff.stacks) && buff.stacks >= 99) return true;
  if (INFINITE_STACK_BUFF_IDS.has(buffId) && Number.isFinite(buff.stacks) && buff.stacks >= 90) {
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
