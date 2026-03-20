import {
  ensureCodexState as ensureSharedCodexState,
  getCardUpgradeId as getCodexCardUpgradeId,
  isCardUpgradeVariant as isCodexCardUpgradeVariant,
  resolveCodexCardId as resolveCodexCardReferenceId,
} from '../../../../shared/codex/codex_record_state_use_case.js';

export { ensureSharedCodexState as ensureCodexState };

const DEFAULT_SETS = {};

export function getCodexDoc(deps) {
  return deps?.doc || document;
}

export function getCodexRecord(gs, category, id) {
  const key = category === 'cards' ? resolveCodexCardReferenceId(id) : id;
  return gs?.meta?.codexRecords?.[category]?.[key] || null;
}

export function getBaseCodexCards(data) {
  return Object.values(data?.cards || {}).filter((card) => !isCodexCardUpgradeVariant(card?.id));
}

export function isSeenCodexCard(codex, cardId) {
  return codex.cards.has(resolveCodexCardReferenceId(cardId));
}

export function getCodexCardUpgradeEntry(data, cardId) {
  const upgradedId = getCodexCardUpgradeId(cardId);
  if (!upgradedId) return null;
  return data?.cards?.[upgradedId] || null;
}

export function getCodexSets(data) {
  return data?.itemSets || DEFAULT_SETS;
}

export function buildCodexProgress(gs, data) {
  const codex = ensureSharedCodexState(gs);
  const enemies = Object.values(data?.enemies || {});
  const cards = getBaseCodexCards(data);
  const items = Object.values(data?.items || {});
  const inscriptions = Object.values(data?.inscriptions || {});

  const seenEnemies = enemies.filter((entry) => codex.enemies.has(entry.id)).length;
  const seenCards = cards.filter((entry) => codex.cards.has(entry.id)).length;
  const seenItems = items.filter((entry) => codex.items.has(entry.id)).length;
  const seenInscriptions = inscriptions.filter((entry) => Number(gs?.meta?.inscriptions?.[entry.id] || 0) > 0).length;

  const total = enemies.length + cards.length + items.length + inscriptions.length;
  const seen = seenEnemies + seenCards + seenItems + seenInscriptions;
  const percent = total > 0 ? Math.round((seen / total) * 100) : 0;
  const circumference = 2 * Math.PI * 29;
  const offset = circumference - ((circumference * percent) / 100);

  return {
    enemies: { seen: seenEnemies, total: enemies.length },
    cards: { seen: seenCards, total: cards.length },
    items: { seen: seenItems, total: items.length },
    inscriptions: { seen: seenInscriptions, total: inscriptions.length },
    total,
    seen,
    percent,
    circumference,
    offset,
  };
}
