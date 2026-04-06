import { describe, expect, it } from 'vitest';

import { buildCharacterSelectChars } from '../game/features/title/domain/character_select_catalog_queries.js';
import { CHARACTER_SELECT_CHARS } from '../game/features/title/application/character_select_catalog_queries.js';

describe('character_select_catalog_queries', () => {
  it('builds a stable, id-sorted catalog from injected metadata and relic data', () => {
    const catalog = buildCharacterSelectChars({
      classMetadata: {
        guardian: { id: 2, class: 'guardian', name: 'Guardian', particle: 'shield', startRelic: 'bulwark' },
        berserker: { id: 1, class: 'berserker', name: 'Berserker', particle: 'fire', startRelic: 'rage_heart' },
      },
      items: {
        bulwark: { icon: 'B', name: 'Bulwark', desc: 'Hold.', passive: 'Block' },
        rage_heart: { icon: 'R', name: 'Rage Heart', desc: 'Burn.', passive: 'Crit' },
      },
    });

    expect(catalog.map((entry) => entry.class)).toEqual(['berserker', 'guardian']);
    expect(catalog[0]).toEqual(expect.objectContaining({
      particle: 'rage',
      startRelicId: 'rage_heart',
      startRelic: expect.objectContaining({ name: 'Rage Heart' }),
    }));
    expect(catalog[1]).toEqual(expect.objectContaining({
      particle: 'aegis',
      startRelicId: 'bulwark',
      startRelic: expect.objectContaining({ passive: 'Block' }),
    }));
  });

  it('keeps the data-backed application catalog aligned with the current runtime dataset', () => {
    expect(Array.isArray(CHARACTER_SELECT_CHARS)).toBe(true);
    expect(CHARACTER_SELECT_CHARS.length).toBeGreaterThan(0);
    expect(CHARACTER_SELECT_CHARS[0]).toEqual(expect.objectContaining({
      class: expect.any(String),
      startRelic: expect.objectContaining({
        icon: expect.any(String),
        name: expect.any(String),
      }),
    }));
  });
});
