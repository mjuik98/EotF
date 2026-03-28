import { describe, expect, it } from 'vitest';

import { CLASS_METADATA } from '../data/class_metadata.js';
import { DATA } from '../data/game_data.js';

describe('asset_manifest', () => {
  it('exposes stable top-level asset domains through game data', async () => {
    const { ASSET_MANIFEST } = await import('../data/asset_manifest.js');

    expect(Object.keys(ASSET_MANIFEST)).toEqual([
      'characters',
      'cards',
      'enemies',
      'items',
      'statusEffects',
      'fx',
    ]);
    expect(DATA.assetManifest).toBe(ASSET_MANIFEST);
    expect(DATA.assetPreview.resolveEntry('characters', 'mage')).toBe(ASSET_MANIFEST.characters.mage);
    expect(DATA.assetPreview.resolveUrl('characters', 'mage')).toContain('data:image/svg+xml');
  });

  it('builds character asset entries from canonical class metadata', async () => {
    const { ASSET_MANIFEST } = await import('../data/asset_manifest.js');

    expect(ASSET_MANIFEST.characters.swordsman).toEqual({
      key: 'characters.swordsman',
      accent: CLASS_METADATA.swordsman.accent,
      color: CLASS_METADATA.swordsman.color,
      particle: CLASS_METADATA.swordsman.particle,
      value: CLASS_METADATA.swordsman.emoji,
      kind: 'emoji',
    });
    expect(ASSET_MANIFEST.characters.guardian.value).toBe(CLASS_METADATA.guardian.emoji);
  });

  it('summarizes domain counts for playtest and content-pipeline reporting', async () => {
    const { summarizeAssetManifest } = await import('../data/asset_manifest.js');

    const summary = summarizeAssetManifest();

    expect(summary.totalEntries).toBeGreaterThan(0);
    expect(summary.domains.characters.count).toBe(6);
    expect(summary.domains.cards.count).toBeGreaterThan(50);
    expect(summary.domains.items.count).toBeGreaterThan(20);
    expect(DATA.assetSummary).toEqual(summary);
  });
});
