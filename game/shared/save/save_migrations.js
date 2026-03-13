export const RUN_SAVE_VERSION = 2;
export const META_SAVE_VERSION = 2;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function migrateRunSave(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const save = { ...raw };
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

  const meta = { ...raw };
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
