export const RUN_SAVE_VERSION = 2;
export const META_SAVE_VERSION = 2;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toVersion(value) {
  const version = Number(value?.version || 1);
  return Number.isFinite(version) ? version : 1;
}

export function isUnsupportedFutureRunSave(raw) {
  return !!raw && typeof raw === 'object' && toVersion(raw) > RUN_SAVE_VERSION;
}

export function isUnsupportedFutureMetaSave(raw) {
  return !!raw && typeof raw === 'object' && toVersion(raw) > META_SAVE_VERSION;
}

export function migrateRunSave(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (isUnsupportedFutureRunSave(raw)) return null;

  const save = {
    ...raw,
    player: raw.player && typeof raw.player === 'object'
      ? { ...raw.player }
      : raw.player,
  };
  const version = Number(save.version || 1);

  if (version < 2) {
    save.player = save.player || {};
    save.player.upgradedCards = asArray(save.player.upgradedCards);
    save.player._cascadeCards = [];
    save.visitedNodes = asArray(save.visitedNodes);
    save.version = 2;
  }

  save.version = RUN_SAVE_VERSION;
  return save;
}

export function migrateMetaSave(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (isUnsupportedFutureMetaSave(raw)) return null;

  const meta = {
    ...raw,
    codex: raw.codex && typeof raw.codex === 'object'
      ? { ...raw.codex }
      : raw.codex,
  };
  const version = Number(meta.version || 1);

  if (version < 2) {
    meta.codex = meta.codex || {};
    meta.codex.enemies = asArray(meta.codex.enemies);
    meta.codex.cards = asArray(meta.codex.cards);
    meta.codex.items = asArray(meta.codex.items);
    meta.version = 2;
  }

  meta.version = META_SAVE_VERSION;
  return meta;
}
