import {
  INFINITE_DURATION_STATUS_KEYS,
  STATUS_EFFECT_VALUE_FIELDS,
  STATUS_EFFECT_VALUE_FALLBACK_FIELDS,
  UNBREAKABLE_WALL_STACK_UNIT,
} from '../../data/status_key_data.js';

const INFINITE_STATUS_KEY_SET = new Set(INFINITE_DURATION_STATUS_KEYS);

export function normalizeStatusKey(statusKey) {
  return String(statusKey || '').replace(/_plus$/i, '');
}

export function getRawStatusStacks(buff) {
  if (Number.isFinite(buff?.stacks)) return Number(buff.stacks);
  if (Number.isFinite(buff)) return Number(buff);
  return null;
}

export function isInfiniteStatusDuration(statusKey, buff, options = {}) {
  const normalizedKey = normalizeStatusKey(statusKey);
  const stacks = getRawStatusStacks(buff);
  const isConfiguredInfinite =
    INFINITE_STATUS_KEY_SET.has(statusKey) || INFINITE_STATUS_KEY_SET.has(normalizedKey);

  if (buff?.permanent === true) return true;
  if (isConfiguredInfinite) return true;
  if (Number.isFinite(stacks) && stacks >= 99) return true;

  return Boolean(
    options.allowDegradedSentinel
      && isConfiguredInfinite
      && Number.isFinite(stacks)
      && stacks >= 90
  );
}

export function resolveStatusEffectValue(statusKey, buff) {
  if (!buff || typeof buff !== 'object') return null;

  const normalizedKey = normalizeStatusKey(statusKey);
  const stacks = getRawStatusStacks(buff);
  if (normalizedKey === 'unbreakable_wall' && Number.isFinite(stacks) && stacks > 0) {
    return Math.max(1, Math.floor(stacks / UNBREAKABLE_WALL_STACK_UNIT));
  }

  const candidates = [];
  const fields = STATUS_EFFECT_VALUE_FIELDS[normalizedKey] || [];
  fields.forEach((field) => candidates.push(buff[field]));
  STATUS_EFFECT_VALUE_FALLBACK_FIELDS.forEach((field) => candidates.push(buff[field]));

  const found = candidates.find((value) => Number.isFinite(value) && Number(value) > 0);
  if (!Number.isFinite(found)) return null;
  return Math.floor(Number(found));
}

export function getStatusDisplayValue(statusKey, buff, options = {}) {
  const stacks = getRawStatusStacks(buff);
  if (!Number.isFinite(stacks) || stacks <= 0) return '';

  const isInfiniteLike = stacks >= 99
    || isInfiniteStatusDuration(statusKey, buff, { allowDegradedSentinel: options.allowDegradedSentinel });
  if (!isInfiniteLike) return String(Math.floor(stacks));

  const normalizedKey = normalizeStatusKey(statusKey);
  const effectValue = resolveStatusEffectValue(statusKey, buff);
  if (normalizedKey === 'unbreakable_wall') {
    return Number.isFinite(effectValue) && effectValue > 0 ? `x${effectValue}` : '';
  }

  return Number.isFinite(effectValue) && effectValue > 0
    ? String(effectValue)
    : '';
}
