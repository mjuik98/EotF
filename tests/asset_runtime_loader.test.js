import { describe, expect, it } from 'vitest';

import {
  preloadAssetDomain,
  resolveTitleAssetUrl,
} from '../game/features/title/platform/browser/title_asset_runtime.js';

function createAsyncImageLoader(log) {
  return () => ({
    set src(value) {
      log.push(value);
      queueMicrotask(() => {
        this.onload?.();
      });
    },
    onload: null,
    onerror: null,
  });
}

describe('title_asset_runtime', () => {
  it('prefers explicit manifest urls and falls back to asset preview urls', () => {
    const data = {
      assetManifest: {
        characters: {
          mage: { src: '/assets/classes/mage.png' },
          guardian: { kind: 'emoji' },
        },
      },
      assetPreview: {
        resolveUrl: (domain, id) => `data:${domain}.${id}`,
      },
    };

    expect(resolveTitleAssetUrl(data, 'characters', 'mage')).toBe('/assets/classes/mage.png');
    expect(resolveTitleAssetUrl(data, 'characters', 'guardian')).toBe('data:characters.guardian');
  });

  it('preloads each asset url once per domain batch', async () => {
    const requests = [];
    const data = {
      assetManifest: {
        characters: {
          mage: { src: '/assets/classes/mage.png' },
          guardian: { kind: 'emoji' },
          rogue: { kind: 'emoji' },
        },
      },
      assetPreview: {
        resolveUrl: (domain, id) => `data:${domain}.${id}`,
      },
    };

    const firstReport = await preloadAssetDomain(data, 'characters', {
      createImage: createAsyncImageLoader(requests),
    });
    const secondReport = await preloadAssetDomain(data, 'characters', {
      createImage: createAsyncImageLoader(requests),
    });

    expect(firstReport.loaded).toBe(3);
    expect(secondReport.loaded).toBe(3);
    expect(requests).toEqual([
      '/assets/classes/mage.png',
      'data:characters.guardian',
      'data:characters.rogue',
    ]);
  });
});
