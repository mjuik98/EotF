import { CARDS } from './cards.js';
import { CLASS_METADATA } from './class_metadata.js';
import { ENEMIES } from './enemies.js';
import { ITEMS } from './items.js';
import { STATUS_KR } from './status_effects_data.js';

function buildEmojiEntry(key, value, extra = {}) {
  return Object.freeze({
    key,
    kind: 'emoji',
    value,
    ...extra,
  });
}

function freezeEntries(entries) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(entries).map(([key, value]) => [key, Object.freeze({ ...value })]),
    ),
  );
}

const CHARACTER_ASSET_MANIFEST = freezeEntries(
  Object.fromEntries(
    Object.entries(CLASS_METADATA).map(([classId, meta]) => [
      classId,
      buildEmojiEntry(`characters.${classId}`, meta.emoji, {
        color: meta.color,
        accent: meta.accent,
        particle: meta.particle,
      }),
    ]),
  ),
);

const CARD_ASSET_MANIFEST = freezeEntries(
  Object.fromEntries(
    Object.entries(CARDS).map(([cardId, card]) => [
      cardId,
      buildEmojiEntry(`cards.${cardId}`, card.icon || '?', {
        rarity: card.rarity || 'unknown',
        type: card.type || 'unknown',
      }),
    ]),
  ),
);

const ENEMY_ASSET_MANIFEST = freezeEntries(
  Object.fromEntries(
    Object.entries(ENEMIES).map(([enemyId, enemy]) => [
      enemyId,
      buildEmojiEntry(`enemies.${enemyId}`, enemy.icon || '?', {
        region: enemy.region ?? null,
        boss: Boolean(enemy.isBoss || enemy.isMiniBoss || enemy.isElite),
      }),
    ]),
  ),
);

const ITEM_ASSET_MANIFEST = freezeEntries(
  Object.fromEntries(
    Object.entries(ITEMS).map(([itemId, item]) => [
      itemId,
      buildEmojiEntry(`items.${itemId}`, item.icon || '?', {
        rarity: item.rarity || 'unknown',
        setId: item.setId || null,
      }),
    ]),
  ),
);

const STATUS_EFFECT_ASSET_MANIFEST = freezeEntries(
  Object.fromEntries(
    Object.entries(STATUS_KR).map(([statusId, status]) => [
      statusId,
      buildEmojiEntry(`statusEffects.${statusId}`, status.icon || '?', {
        buff: Boolean(status.buff),
      }),
    ]),
  ),
);

const FX_ASSET_MANIFEST = freezeEntries(
  Object.fromEntries(
    Array.from(
      new Set(
        Object.values(CLASS_METADATA)
          .map((meta) => meta.particle)
          .filter(Boolean),
      ),
    ).map((particleId) => [
      particleId,
      Object.freeze({
        key: `fx.${particleId}`,
        kind: 'particle',
        value: particleId,
      }),
    ]),
  ),
);

export const ASSET_MANIFEST = Object.freeze({
  characters: CHARACTER_ASSET_MANIFEST,
  cards: CARD_ASSET_MANIFEST,
  enemies: ENEMY_ASSET_MANIFEST,
  items: ITEM_ASSET_MANIFEST,
  statusEffects: STATUS_EFFECT_ASSET_MANIFEST,
  fx: FX_ASSET_MANIFEST,
});

export function summarizeAssetManifest(manifest = ASSET_MANIFEST) {
  const domains = Object.fromEntries(
    Object.entries(manifest).map(([domainId, entries]) => [
      domainId,
      { count: Object.keys(entries || {}).length },
    ]),
  );

  const totalEntries = Object.values(domains).reduce((sum, domain) => sum + Number(domain.count || 0), 0);

  return {
    totalEntries,
    domains,
  };
}

export const ASSET_SUMMARY = Object.freeze(summarizeAssetManifest());
