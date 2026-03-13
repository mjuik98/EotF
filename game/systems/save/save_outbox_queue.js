export const OUTBOX_RETRY_BASE_MS = 1000;
export const OUTBOX_RETRY_MAX_MS = 30000;

export function cloneSnapshot(data) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
}

function retryDelayMs(attempts) {
  const exp = Math.max(0, (Number(attempts) || 1) - 1);
  return Math.min(OUTBOX_RETRY_BASE_MS * (2 ** exp), OUTBOX_RETRY_MAX_MS);
}

export function clearOutboxTimer(system) {
  if (system._outboxTimer) {
    clearTimeout(system._outboxTimer);
    system._outboxTimer = null;
    system._outboxTimerAt = 0;
  }
}

export function scheduleOutboxFlush(system, flushFn, delayMs = OUTBOX_RETRY_BASE_MS) {
  const safeDelay = Math.max(0, Number(delayMs) || 0);
  const targetTs = Date.now() + safeDelay;

  if (system._outboxTimer && system._outboxTimerAt <= targetTs) {
    return;
  }

  clearOutboxTimer(system);
  system._outboxTimerAt = targetTs;
  system._outboxTimer = setTimeout(() => {
    system._outboxTimer = null;
    system._outboxTimerAt = 0;
    flushFn();
  }, safeDelay);
}

export function upsertOutboxEntry(system, key, payload) {
  const idx = system._outbox.findIndex((entry) => entry.key === key);
  const nextData = cloneSnapshot(payload);

  if (idx >= 0) {
    system._outboxMetrics.coalescedWrites += 1;
    system._outbox[idx].data = nextData;
    system._outbox[idx].nextAttemptAt = Date.now();
    return;
  }

  system._outboxMetrics.queuedWrites += 1;
  system._outbox.push({
    key,
    data: nextData,
    attempts: 0,
    nextAttemptAt: Date.now(),
  });
}

export function dropOutboxKey(system, key) {
  system._outbox = system._outbox.filter((entry) => entry.key !== key);
  if (!system._outbox.length) {
    clearOutboxTimer(system);
  }
}

export function persistWithOutbox(system, key, payload, { save, logWarn }) {
  const snapshot = cloneSnapshot(payload);
  const ok = save(key, snapshot);
  if (ok) {
    system._outboxMetrics.directWrites += 1;
    system._outboxMetrics.lastSuccessAt = Date.now();
    return true;
  }

  system._outboxMetrics.initialFailures += 1;
  system._outboxMetrics.lastFailureAt = Date.now();
  upsertOutboxEntry(system, key, snapshot);
  scheduleOutboxFlush(system, () => system.flushOutbox(), system.OUTBOX_RETRY_BASE_MS);
  logWarn?.(`[SaveSystem] Save failed for "${key}". Queued for retry.`);
  return false;
}

export function flushOutboxQueue(system, { save }) {
  if (!system._outbox.length) return 0;
  if (system._isFlushingOutbox) return system._outbox.length;

  system._isFlushingOutbox = true;
  try {
    const now = Date.now();
    let nextDelay = null;
    const pending = [];

    for (const entry of system._outbox) {
      if (entry.nextAttemptAt > now) {
        const waitMs = entry.nextAttemptAt - now;
        nextDelay = nextDelay === null ? waitMs : Math.min(nextDelay, waitMs);
        pending.push(entry);
        continue;
      }

      const ok = save(entry.key, entry.data);
      if (ok) {
        system._outboxMetrics.retrySuccesses += 1;
        system._outboxMetrics.lastSuccessAt = now;
        continue;
      }

      system._outboxMetrics.retryFailures += 1;
      system._outboxMetrics.lastFailureAt = now;
      entry.attempts += 1;
      const waitMs = retryDelayMs(entry.attempts);
      entry.nextAttemptAt = now + waitMs;
      nextDelay = nextDelay === null ? waitMs : Math.min(nextDelay, waitMs);
      pending.push(entry);
    }

    system._outbox = pending;
    if (pending.length > 0) {
      scheduleOutboxFlush(
        system,
        () => system.flushOutbox(),
        nextDelay === null ? system.OUTBOX_RETRY_BASE_MS : nextDelay,
      );
    } else {
      clearOutboxTimer(system);
    }
    return pending.length;
  } finally {
    system._isFlushingOutbox = false;
  }
}
