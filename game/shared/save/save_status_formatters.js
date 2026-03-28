export function formatRetryTiming(nextRetryAt) {
  const retryAt = Number(nextRetryAt || 0);
  if (!retryAt) return '';

  const diffMs = retryAt - Date.now();
  if (diffMs <= 0) return '곧 재시도';
  return `${Math.max(1, Math.ceil(diffMs / 1000))}초 후 재시도`;
}

export function formatElapsedTiming(timestamp) {
  const value = Number(timestamp || 0);
  if (!value) return '';

  const diffMs = Math.max(0, Date.now() - value);
  const diffSeconds = Math.max(1, Math.floor(diffMs / 1000));
  if (diffSeconds < 60) return `${diffSeconds}초 전`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${Math.floor(diffHours / 24)}일 전`;
}

export function buildSaveRecoveryMeta(metrics = {}) {
  const parts = [];
  const retryFailures = Number(metrics?.retryFailures || 0);
  if (retryFailures > 0) parts.push(`재시도 실패 ${retryFailures}회`);

  const lastFailureLabel = formatElapsedTiming(metrics?.lastFailureAt);
  if (lastFailureLabel) parts.push(`마지막 실패 ${lastFailureLabel}`);

  const retryTiming = formatRetryTiming(metrics?.nextRetryAt);
  if (retryTiming) parts.push(retryTiming);

  return parts.join(' · ');
}

export function buildSaveQueueSuffix(status = {}) {
  const queueDepth = Number(status?.queueDepth || 0);
  if (queueDepth <= 0) return '';

  const parts = [`대기 ${queueDepth}건`];
  const retryFailures = Number(status?.retryFailures || 0);
  if (retryFailures > 0) parts.push(`재시도 실패 ${retryFailures}회`);

  const retryTiming = formatRetryTiming(status?.nextRetryAt);
  if (retryTiming) {
    parts.push(
      retryTiming === '곧 재시도'
        ? retryTiming
        : `다음 재시도 ${retryTiming.replace(/ 재시도$/, '')}`,
    );
  }

  return parts.join(' · ');
}
