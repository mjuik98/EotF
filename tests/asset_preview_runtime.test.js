import { describe, expect, it } from 'vitest';

import {
  resolveAssetPreviewEntry,
  resolveAssetPreviewUrl,
} from '../data/asset_preview_runtime.js';

describe('asset_preview_runtime', () => {
  it('resolves canonical asset manifest entries by domain and id', () => {
    expect(resolveAssetPreviewEntry('characters', 'swordsman')).toEqual(expect.objectContaining({
      key: 'characters.swordsman',
      kind: 'emoji',
      value: expect.any(String),
    }));
    expect(resolveAssetPreviewEntry('cards', 'strike')).toEqual(expect.objectContaining({
      key: 'cards.strike',
      kind: 'emoji',
    }));
    expect(resolveAssetPreviewEntry('characters', 'missing')).toBeNull();
  });

  it('builds stable svg data urls for asset previews', () => {
    const url = resolveAssetPreviewUrl('characters', 'mage');

    expect(url.startsWith('data:image/svg+xml;charset=UTF-8,')).toBe(true);
    expect(resolveAssetPreviewUrl('characters', 'mage')).toBe(url);

    const svg = decodeURIComponent(url.slice(url.indexOf(',') + 1));
    expect(svg).toContain('<svg');
    expect(svg).toContain('mage');
  });
});
