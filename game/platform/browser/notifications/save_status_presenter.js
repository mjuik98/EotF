function getDoc(deps = {}) {
  return deps.doc || null;
}

function getPalette(tone = 'info') {
  const palette = {
    error: {
      background: 'rgba(120, 12, 32, 0.96)',
      border: 'rgba(255, 84, 118, 0.42)',
      color: 'rgba(255, 240, 244, 0.96)',
    },
    warn: {
      background: 'rgba(76, 46, 6, 0.96)',
      border: 'rgba(240, 180, 41, 0.42)',
      color: 'rgba(255, 245, 214, 0.96)',
    },
    info: {
      background: 'rgba(6, 50, 44, 0.96)',
      border: 'rgba(0, 255, 204, 0.32)',
      color: 'rgba(225, 255, 248, 0.96)',
    },
  };
  return palette[tone] || palette.info;
}

function formatRetryTiming(nextRetryAt) {
  const retryAt = Number(nextRetryAt || 0);
  if (!retryAt) return '';
  const diffMs = retryAt - Date.now();
  if (diffMs <= 0) return ' · 곧 재시도';
  const seconds = Math.max(1, Math.ceil(diffMs / 1000));
  return ` · 다음 재시도 ${seconds}초 후`;
}

function buildRetryFailureSuffix(status) {
  const retryFailures = Number(status?.retryFailures || 0);
  if (retryFailures <= 0) return '';
  return ` · 재시도 실패 ${retryFailures}회`;
}

function buildQueueSuffix(status) {
  const queueDepth = Number(status?.queueDepth || 0);
  if (queueDepth <= 0) return '';
  return ` 대기 ${queueDepth}건${buildRetryFailureSuffix(status)}${formatRetryTiming(status?.nextRetryAt)}`;
}

function resolvePresentation(status) {
  if (status?.status === 'saved') {
    return {
      text: 'Saved',
      tone: 'info',
      durationMs: 1800,
    };
  }

  if (status?.status === 'queued') {
    return {
      text: `저장을 완료하지 못해 현재 런을 유지합니다.${buildQueueSuffix(status)}`,
      tone: 'warn',
      durationMs: 4000,
    };
  }

  if (status?.status === 'error') {
    return {
      text: `저장에 실패해 현재 런을 유지합니다.${buildQueueSuffix(status)}`,
      tone: 'error',
      durationMs: 4000,
    };
  }

  return null;
}

export function createSaveStatusPresenter() {
  let activeEl = null;
  let activeTimer = null;

  function present(status, deps = {}) {
    const presentation = resolvePresentation(status);
    if (!presentation) return false;

    const doc = getDoc(deps);
    if (!doc?.body) return false;

    const colors = getPalette(presentation.tone);
    const el = activeEl || doc.createElement('div');
    el.textContent = presentation.text;
    el.style.cssText = `position:fixed;bottom:24px;right:24px;background:${colors.background};border:1px solid ${colors.border};color:${colors.color};padding:12px 20px;border-radius:10px;z-index:9999;font-family:'Share Tech Mono',monospace;font-size:12px;letter-spacing:0.04em;box-shadow:0 8px 24px rgba(0,0,0,0.38);`;

    if (!activeEl) {
      doc.body.appendChild(el);
      activeEl = el;
    }

    if (activeTimer) {
      clearTimeout(activeTimer);
    }

    activeTimer = setTimeout(() => {
      activeEl?.remove?.();
      activeEl = null;
      activeTimer = null;
    }, presentation.durationMs);

    return true;
  }

  return {
    present,
  };
}

const defaultSaveStatusPresenter = createSaveStatusPresenter();

export function presentSaveStatus(status, deps = {}) {
  if (typeof deps.presentSaveStatus === 'function' && deps.presentSaveStatus !== presentSaveStatus) {
    return deps.presentSaveStatus(status, deps);
  }
  return defaultSaveStatusPresenter.present(status, deps);
}
