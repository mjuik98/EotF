const DEFAULT_TTL_MS = 1200;
const MAX_CACHE_SIZE = 500;
const _entries = new Map();

function _prune(now, ttlMs) {
  for (const [key, entry] of _entries.entries()) {
    if (!entry?.pending && now - entry.ts > ttlMs * 2) {
      _entries.delete(key);
    }
  }

  if (_entries.size <= MAX_CACHE_SIZE) return;

  const sorted = [..._entries.entries()]
    .sort((a, b) => (a[1]?.ts || 0) - (b[1]?.ts || 0));
  const overflow = _entries.size - MAX_CACHE_SIZE;
  for (let i = 0; i < overflow; i++) {
    _entries.delete(sorted[i][0]);
  }
}

/**
 * Runs an action only once for a key within a TTL interval.
 * Duplicate attempts while pending or inside the TTL are dropped.
 */
export function runIdempotent(key, action, options = {}) {
  if (typeof key !== 'string' || key.length === 0) {
    return action?.();
  }
  if (typeof action !== 'function') {
    return undefined;
  }

  const ttlMs = Math.max(0, Number(options.ttlMs) || DEFAULT_TTL_MS);
  const now = Date.now();
  _prune(now, ttlMs);

  const prev = _entries.get(key);
  if (prev && (prev.pending || now - prev.ts <= ttlMs)) {
    if (typeof options.onBlocked === 'function') {
      options.onBlocked({ key, pending: !!prev.pending, ageMs: now - prev.ts });
    }
    return options.blockedValue;
  }

  const entry = { ts: now, pending: true };
  _entries.set(key, entry);

  try {
    const out = action();
    if (out && typeof out.then === 'function') {
      return out
        .then((value) => {
          entry.pending = false;
          entry.ts = Date.now();
          return value;
        })
        .catch((err) => {
          _entries.delete(key);
          throw err;
        });
    }

    entry.pending = false;
    entry.ts = Date.now();
    return out;
  } catch (err) {
    _entries.delete(key);
    throw err;
  }
}

export function clearIdempotencyKey(key) {
  if (typeof key !== 'string') return;
  _entries.delete(key);
}

export function clearIdempotencyPrefix(prefix) {
  if (typeof prefix !== 'string' || prefix.length === 0) return;
  for (const key of _entries.keys()) {
    if (key.startsWith(prefix)) _entries.delete(key);
  }
}

export function getIdempotencyEntryCount() {
  return _entries.size;
}
