export function createOutboxMetrics() {
  return {
    directWrites: 0,
    initialFailures: 0,
    queuedWrites: 0,
    coalescedWrites: 0,
    retryFailures: 0,
    retrySuccesses: 0,
    lastSuccessAt: 0,
    lastFailureAt: 0,
  };
}

export function summarizeOutboxMetrics(metrics, outbox = []) {
  let nextRetryAt = 0;
  for (const entry of outbox) {
    if (nextRetryAt === 0 || entry.nextAttemptAt < nextRetryAt) {
      nextRetryAt = entry.nextAttemptAt;
    }
  }

  return {
    ...metrics,
    queueDepth: outbox.length,
    nextRetryAt,
  };
}
