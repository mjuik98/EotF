import { describe, expect, it } from 'vitest';

import {
  META_SAVE_VERSION,
  RUN_SAVE_VERSION,
  migrateMetaSave,
  migrateRunSave,
} from '../game/shared/save/save_migrations.js';

describe('save_migrations', () => {
  it('upgrades legacy run saves to the latest normalized shape', () => {
    const legacy = {
      version: 1,
      player: {
        hp: 20,
      },
      visitedNodes: '1-1',
    };

    const migrated = migrateRunSave(legacy);

    expect(migrated.version).toBe(RUN_SAVE_VERSION);
    expect(migrated.player.upgradedCards).toEqual([]);
    expect(migrated.player._cascadeCards).toEqual([]);
    expect(migrated.visitedNodes).toEqual([]);
    expect(legacy.player.upgradedCards).toBeUndefined();
  });

  it('upgrades legacy meta saves without mutating the original payload', () => {
    const legacy = {
      version: 1,
      codex: {
        enemies: 'wolf',
        cards: undefined,
      },
    };

    const migrated = migrateMetaSave(legacy);

    expect(migrated.version).toBe(META_SAVE_VERSION);
    expect(migrated.codex.enemies).toEqual([]);
    expect(migrated.codex.cards).toEqual([]);
    expect(migrated.codex.items).toEqual([]);
    expect(legacy.codex.items).toBeUndefined();
  });
});
