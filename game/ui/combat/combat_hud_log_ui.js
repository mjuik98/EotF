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

export function updateCombatLog(doc, logEntries) {
  if (!doc) return false;

  const logContainer = doc.getElementById('combatLog');
  if (!logContainer) return false;

  const recentLogs = getRecentLogs(logEntries);
  if (recentLogs.length === 0) {
    if (logContainer.children.length > 0) logContainer.textContent = '';
    return true;
  }

  const { existingById, existingMsgs } = collectExistingEntries(logContainer);
  pruneMissingEntries(existingById, recentLogs);
  const logsAdded = appendMissingEntries(doc, logContainer, recentLogs, existingById, existingMsgs);
  trimOverflow(logContainer);

  if (logsAdded) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  return true;
}
