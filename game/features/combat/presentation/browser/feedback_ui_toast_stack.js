const toastQueue = [];
const activeToasts = [];

function markToastExiting(el) {
  el?.classList?.add?.('stack-toast--exit');
}

function clearRemovalTimers(record) {
  if (record?.removeTimer) clearTimeout(record.removeTimer);
  if (record?.removeDelayTimer) clearTimeout(record.removeDelayTimer);
  record.removeTimer = null;
  record.removeDelayTimer = null;
}

function updateToastCount(el, count) {
  const countEl = el?._toastCountEl;
  if (!countEl) return;
  countEl.textContent = `x${count}`;
  countEl.style.display = count > 1 ? 'inline-flex' : 'none';
}

function canMergeToastRecord(record, incoming, nowMs) {
  if (!record || !incoming || record.key !== incoming.key) return false;
  if (record.isExiting) return false;
  const mergeWindowMs = Number(record.mergeWindowMs) || Number(incoming.mergeWindowMs) || 0;
  if (!mergeWindowMs) return false;
  return nowMs - Number(record.createdAt || 0) <= mergeWindowMs;
}

function mergeToastRecord(record, incoming, nowMs) {
  record.mergedCount = Number(record.mergedCount || 1) + Number(incoming.mergedCount || 1);
  record.durationMs = Math.max(Number(record.durationMs) || 0, Number(incoming.durationMs) || 0);
  record.createdAt = nowMs;
  updateToastCount(record?.el, record.mergedCount);
  record.onMerge?.(record, record.mergedCount);
}

export function buildStackedToastClassName(variantClass) {
  return ['stack-toast', variantClass].filter(Boolean).join(' ');
}

export function createStackedToastQueue({
  getDoc,
  getNow = () => Date.now(),
  baseBottom = 220,
  stackGap = 12,
  fallbackHeight = 100,
  maxVisibleToasts = 4,
} = {}) {
  function layoutToastStack() {
    let bottom = baseBottom;
    for (const entry of activeToasts) {
      if (!entry?.el?.isConnected) continue;
      const measured = entry.el.offsetHeight || entry.height || fallbackHeight;
      entry.height = measured;
      entry.el.style.bottom = `${bottom}px`;
      bottom += measured + stackGap;
    }
  }

  function removeStackedToast(entry) {
    clearRemovalTimers(entry);
    const index = activeToasts.indexOf(entry);
    if (index >= 0) {
      activeToasts.splice(index, 1);
    }
    entry?.el?.remove?.();
    layoutToastStack();
    drainToastQueue();
  }

  function scheduleToastRemoval(entry) {
    if (!entry || entry.isExiting) return;
    clearRemovalTimers(entry);
    entry.removeTimer = setTimeout(() => {
      entry.isExiting = true;
      entry.onBeforeRemove?.(entry.el, entry);
      entry.removeDelayTimer = setTimeout(() => removeStackedToast(entry), Number(entry.removeDelayMs) || 0);
    }, Math.max(0, Number(entry.durationMs) || 0));
  }

  function findMergeTarget(config) {
    const nowMs = getNow();
    for (const entry of activeToasts) {
      if (canMergeToastRecord(entry, config, nowMs)) return { record: entry, nowMs };
    }
    for (const pending of toastQueue) {
      if (canMergeToastRecord(pending, config, nowMs)) return { record: pending, nowMs };
    }
    return null;
  }

  function drainToastQueue() {
    while (toastQueue.length && activeToasts.length < maxVisibleToasts) {
      const next = toastQueue.shift();
      if (!next || typeof next.createEl !== 'function') continue;
      const doc = getDoc(next.deps);
      if (!doc?.body) continue;

      const el = next.createEl(doc, next);
      if (!el) continue;

      if (!el.style.position) el.style.position = 'fixed';
      if (!el.style.right) el.style.right = '260px';
      if (!el.style.zIndex) el.style.zIndex = '9500';
      el.style.bottom = `${baseBottom}px`;

      doc.body.appendChild(el);
      const entry = {
        ...next,
        el,
        height: next.height || el.offsetHeight || fallbackHeight,
        isExiting: false,
      };
      updateToastCount(el, entry.mergedCount || 1);
      activeToasts.push(entry);
      layoutToastStack();
      scheduleToastRemoval(entry);
    }
  }

  function enqueue(config) {
    const normalized = {
      ...config,
      createdAt: config?.createdAt || getNow(),
      mergedCount: Number(config?.mergedCount || 1),
    };
    const mergeTarget = findMergeTarget(normalized);
    if (mergeTarget) {
      mergeToastRecord(mergeTarget.record, normalized, mergeTarget.nowMs);
      if (activeToasts.includes(mergeTarget.record)) {
        scheduleToastRemoval(mergeTarget.record);
      }
      return;
    }

    toastQueue.push(normalized);
    drainToastQueue();
  }

  return {
    enqueue,
    markToastExiting,
  };
}
