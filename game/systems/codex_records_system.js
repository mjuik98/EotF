function _toSet(value) {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  return new Set();
}

function _toPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
}

function _toNonNegativeInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function _toPositiveStep(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

function _toDayStamp(value = Date.now()) {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function _normalizeEnemyRecord(records, id, firstSeen) {
  const key = String(id || '');
  if (!key) return null;
  const cur = records.enemies[key];
  const next = _toPlainObject(cur);
  next.encounters = _toNonNegativeInt(next.encounters, 0);
  next.kills = _toNonNegativeInt(next.kills, 0);
  if (!next.firstSeen) next.firstSeen = firstSeen;
  records.enemies[key] = next;
  return next;
}

function _normalizeCardRecord(records, id, firstSeen) {
  const key = String(id || '');
  if (!key) return null;
  const cur = records.cards[key];
  const next = _toPlainObject(cur);
  next.used = _toNonNegativeInt(next.used, 0);
  if (!next.firstSeen) next.firstSeen = firstSeen;
  records.cards[key] = next;
  return next;
}

function _normalizeItemRecord(records, id, firstSeen) {
  const key = String(id || '');
  if (!key) return null;
  const cur = records.items[key];
  const next = _toPlainObject(cur);
  next.found = _toNonNegativeInt(next.found, 0);
  if (!next.firstSeen) next.firstSeen = firstSeen;
  records.items[key] = next;
  return next;
}

export function ensureCodexState(gs) {
  if (!gs || typeof gs !== 'object') {
    return { enemies: new Set(), cards: new Set(), items: new Set() };
  }
  if (!gs.meta || typeof gs.meta !== 'object') gs.meta = {};
  if (!gs.meta.codex || typeof gs.meta.codex !== 'object' || Array.isArray(gs.meta.codex)) {
    gs.meta.codex = {};
  }
  const codex = gs.meta.codex;
  codex.enemies = _toSet(codex.enemies);
  codex.cards = _toSet(codex.cards);
  codex.items = _toSet(codex.items);
  return codex;
}

export function ensureCodexRecords(gs) {
  if (!gs || typeof gs !== 'object') {
    return { enemies: {}, cards: {}, items: {} };
  }
  if (!gs.meta || typeof gs.meta !== 'object') gs.meta = {};
  const records = gs.meta.codexRecords;
  if (!records || typeof records !== 'object' || Array.isArray(records)) {
    gs.meta.codexRecords = { enemies: {}, cards: {}, items: {} };
  } else {
    records.enemies = _toPlainObject(records.enemies);
    records.cards = _toPlainObject(records.cards);
    records.items = _toPlainObject(records.items);
  }
  return gs.meta.codexRecords;
}

export function registerEnemyEncounter(gs, enemyId, count = 1, options = {}) {
  const key = String(enemyId || '');
  if (!key) return null;

  const codex = ensureCodexState(gs);
  codex.enemies.add(key);

  const records = ensureCodexRecords(gs);
  const firstSeen = _toDayStamp(options.date);
  const entry = _normalizeEnemyRecord(records, key, firstSeen);
  if (!entry) return null;
  entry.encounters += _toPositiveStep(count, 1);
  return entry;
}

export function registerEnemyKill(gs, enemyId, count = 1, options = {}) {
  const key = String(enemyId || '');
  if (!key) return null;

  const codex = ensureCodexState(gs);
  codex.enemies.add(key);

  const records = ensureCodexRecords(gs);
  const firstSeen = _toDayStamp(options.date);
  const entry = _normalizeEnemyRecord(records, key, firstSeen);
  if (!entry) return null;
  entry.kills += _toPositiveStep(count, 1);
  if (entry.encounters < entry.kills) entry.encounters = entry.kills;
  return entry;
}

export function registerCardDiscovered(gs, cardId, options = {}) {
  const key = String(cardId || '');
  if (!key) return null;

  const codex = ensureCodexState(gs);
  codex.cards.add(key);

  const records = ensureCodexRecords(gs);
  const firstSeen = _toDayStamp(options.date);
  return _normalizeCardRecord(records, key, firstSeen);
}

export function registerCardUsed(gs, cardId, count = 1, options = {}) {
  const entry = registerCardDiscovered(gs, cardId, options);
  if (!entry) return null;
  entry.used += _toPositiveStep(count, 1);
  return entry;
}

export function registerItemFound(gs, itemId, count = 1, options = {}) {
  const key = String(itemId || '');
  if (!key) return null;

  const codex = ensureCodexState(gs);
  codex.items.add(key);

  const records = ensureCodexRecords(gs);
  const firstSeen = _toDayStamp(options.date);
  const entry = _normalizeItemRecord(records, key, firstSeen);
  if (!entry) return null;
  entry.found += _toPositiveStep(count, 1);
  return entry;
}
