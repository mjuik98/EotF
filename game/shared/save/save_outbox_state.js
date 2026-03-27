import { cloneSnapshot, isOutboxEntryExpired } from './save_outbox_queue.js';

function normalizeTimestamp(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeOutboxEntry(entry, { now }) {
  const createdAt = normalizeTimestamp(entry?.createdAt, now);
  return {
    key: entry.key,
    data: cloneSnapshot(entry.data),
    attempts: Math.max(0, Math.floor(Number(entry.attempts) || 0)),
    createdAt,
    updatedAt: normalizeTimestamp(entry.updatedAt, createdAt),
    nextAttemptAt: normalizeTimestamp(entry.nextAttemptAt, now),
  };
}

export function normalizeOutboxEntries(raw, { now = Date.now } = {}) {
  if (!Array.isArray(raw)) return [];
  const currentTime = Number(now());

  return raw.flatMap((entry) => {
    if (!entry || typeof entry.key !== 'string' || !Object.prototype.hasOwnProperty.call(entry, 'data')) {
      return [];
    }
    return [normalizeOutboxEntry(entry, { now: currentTime })];
  });
}

export function pruneExpiredOutboxEntries(outbox, { isExpired = isOutboxEntryExpired } = {}) {
  const entries = Array.isArray(outbox) ? outbox : [];
  const nextEntries = entries.filter((entry) => !isExpired(entry));
  return {
    changed: nextEntries.length !== entries.length,
    entries: nextEntries,
  };
}

export function createOutboxPersistedSnapshot(outbox, { now = Date.now } = {}) {
  const currentTime = Number(now());
  return (Array.isArray(outbox) ? outbox : []).map((entry) => normalizeOutboxEntry(entry, { now: currentTime }));
}

export function computeNextOutboxFlushDelay(outbox, { now = Date.now } = {}) {
  const entries = Array.isArray(outbox) ? outbox : [];
  if (!entries.length) return null;

  const currentTime = Number(now());
  const nextAttemptAt = entries.reduce((soonest, entry) => (
    Math.min(soonest, Number.isFinite(entry.nextAttemptAt) ? entry.nextAttemptAt : currentTime)
  ), Number.POSITIVE_INFINITY);

  return Math.max(0, nextAttemptAt - currentTime);
}
