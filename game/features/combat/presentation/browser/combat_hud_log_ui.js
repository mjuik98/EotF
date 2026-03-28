import { selectRecentCombatFeedEntries } from './combat_recent_feed_selector.js';

const MAX_COMBAT_LOGS = 30;

function getRecentLogs(logEntries) {
  if (!Array.isArray(logEntries) || logEntries.length === 0) return [];
  return logEntries.slice(-MAX_COMBAT_LOGS);
}

function collectExistingEntries(logContainer) {
  const existingById = new Map();
  const existingMsgs = new Set();

  Array.from(logContainer.children).forEach((child) => {
    const id = child.dataset?.logId;
    if (id) existingById.set(id, child);
    if (child.textContent) existingMsgs.add(child.textContent);
  });

  return { existingById, existingMsgs };
}

function pruneMissingEntries(existingById, recentLogs) {
  const validIds = new Set(recentLogs.map((entry) => entry.id).filter(Boolean));
  for (const [id, element] of existingById.entries()) {
    if (validIds.has(id)) continue;
    element.remove();
    existingById.delete(id);
  }
}

function syncExistingEntry(existing, entry) {
  if (existing.textContent === entry.msg) return;
  existing.textContent = entry.msg;
  existing.className = `log-entry ${entry.type || ''}`.trim();
  existing.style.animation = 'none';
}

function createLogNode(doc, entry) {
  const node = doc.createElement('div');
  node.className = `log-entry ${entry.type || ''}`.trim();
  node.textContent = entry.msg;
  if (entry.id) node.dataset.logId = entry.id;
  return node;
}

function appendMissingEntries(doc, logContainer, recentLogs, existingById, existingMsgs) {
  let logsAdded = false;

  recentLogs.forEach((entry) => {
    if (entry.id) {
      const existing = existingById.get(entry.id);
      if (existing) {
        syncExistingEntry(existing, entry);
        return;
      }
    } else if (existingMsgs.has(entry.msg)) {
      return;
    }

    logContainer.appendChild(createLogNode(doc, entry));
    if (!entry.id) existingMsgs.add(entry.msg);
    logsAdded = true;
  });

  return logsAdded;
}

function trimOverflow(logContainer) {
  while (logContainer.children.length > MAX_COMBAT_LOGS) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

function clearStyleProperty(node, property) {
  if (!node?.style) return;
  if (typeof node.style.removeProperty === 'function') {
    node.style.removeProperty(property);
    return;
  }
  node.style[property] = '';
}

function setStyleProperty(node, property, value) {
  if (!node?.style) return;
  node.style[property] = value;
}

function applyRecentFeedLayout(feed, layout) {
  if (!feed?.style) return;

  if (feed?.dataset) {
    if (!feed.dataset.defaultFeedTitle && typeof feed.dataset.feedTitle === 'string') {
      feed.dataset.defaultFeedTitle = feed.dataset.feedTitle;
    }
    feed.dataset.feedTitle = layout === 'compact'
      ? ''
      : (feed.dataset.defaultFeedTitle || feed.dataset.feedTitle || '');
  }

  ['right', 'top', 'width', 'maxWidth', 'maxHeight', 'alignItems'].forEach((property) => {
    clearStyleProperty(feed, property);
  });

  Array.from(feed.children || []).forEach((child) => {
    ['width', 'fontSize', 'lineHeight', 'padding', 'borderRadius', 'whiteSpace', 'overflow', 'textOverflow', 'backgroundColor'].forEach((property) => {
      clearStyleProperty(child, property);
    });
  });

  if (layout !== 'compact') return;

  setStyleProperty(feed, 'right', '18px');
  setStyleProperty(feed, 'top', 'clamp(300px, 34vh, 440px)');
  setStyleProperty(feed, 'width', 'min(260px, 18vw)');
  setStyleProperty(feed, 'maxWidth', 'calc(100vw - 36px)');
  setStyleProperty(feed, 'maxHeight', '72px');
  setStyleProperty(feed, 'alignItems', 'flex-end');

  Array.from(feed.children || []).forEach((child) => {
    setStyleProperty(child, 'width', '100%');
    setStyleProperty(child, 'fontSize', '12px');
    setStyleProperty(child, 'lineHeight', '1.35');
    setStyleProperty(child, 'padding', '7px 11px');
    setStyleProperty(child, 'borderRadius', '999px');
    setStyleProperty(child, 'whiteSpace', 'nowrap');
    setStyleProperty(child, 'overflow', 'hidden');
    setStyleProperty(child, 'textOverflow', 'ellipsis');
    setStyleProperty(child, 'backgroundColor', 'rgba(7, 10, 20, 0.82)');
  });
}

function syncLogSurface(doc, logContainer, entries, { scrollOnAdd = false, limitOverflow = false } = {}) {
  if (!logContainer) return false;

  if (!Array.isArray(entries) || entries.length === 0) {
    if (logContainer.children.length > 0) logContainer.textContent = '';
    return true;
  }

  const { existingById, existingMsgs } = collectExistingEntries(logContainer);
  pruneMissingEntries(existingById, entries);
  const logsAdded = appendMissingEntries(doc, logContainer, entries, existingById, existingMsgs);

  if (limitOverflow) trimOverflow(logContainer);
  if (scrollOnAdd && logsAdded) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  return true;
}

export function updateCombatLog(doc, logEntries) {
  if (!doc) return false;

  const logContainer = doc.getElementById('combatLog');
  const recentLogs = getRecentLogs(logEntries);
  const recentCombatFeed = doc.getElementById('recentCombatFeed');
  const recentFeedEntries = selectRecentCombatFeedEntries(logEntries);
  const viewportWidth = Number(doc?.defaultView?.innerWidth || 0);
  const recentFeedLayout = viewportWidth > 0 && viewportWidth <= 1180
    ? 'stacked'
    : (viewportWidth > 0 && viewportWidth <= 1400 ? 'tight' : 'compact');
  if (recentCombatFeed?.dataset) {
    recentCombatFeed.dataset.layout = recentFeedLayout;
  }
  const visibleRecentFeedEntries = recentFeedEntries.slice(
    -(recentFeedLayout === 'compact' ? 1 : 2),
  );

  const fullLogUpdated = syncLogSurface(doc, logContainer, recentLogs, {
    scrollOnAdd: true,
    limitOverflow: true,
  });
  const recentFeedUpdated = syncLogSurface(doc, recentCombatFeed, visibleRecentFeedEntries);
  applyRecentFeedLayout(recentCombatFeed, recentFeedLayout);

  return fullLogUpdated || recentFeedUpdated;
}
