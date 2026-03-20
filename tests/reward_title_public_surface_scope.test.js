import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function extractNamedExports(source) {
  const names = new Set();

  for (const match of source.matchAll(/export\s+function\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
  for (const match of source.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);

  for (const match of source.matchAll(/export\s*\{([^}]+)\}/gs)) {
    const entries = match[1]
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => entry.split(/\s+as\s+/i)[1] || entry.split(/\s+as\s+/i)[0]);

    entries.forEach((name) => names.add(name.trim()));
  }

  return [...names].sort();
}

describe('reward/title public surface scope', () => {
  it('keeps the reward public surface focused on grouped capabilities and capability creators', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/reward/ports/public_surface.js'),
      'utf8',
    );

    expect(extractNamedExports(source)).toEqual([
      'RewardPublicSurface',
      'createRewardApplicationCapabilities',
      'createRewardContractCapabilities',
      'createRewardModuleCapabilities',
      'createRewardRuntimeCapabilities',
    ]);
  });

  it('keeps the title public surface focused on grouped capabilities and capability creators', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/title/ports/public_surface.js'),
      'utf8',
    );

    expect(extractNamedExports(source)).toEqual([
      'TitlePublicSurface',
      'createTitleBindingCapabilities',
      'createTitleContractCapabilities',
      'createTitleModuleCapabilities',
      'createTitleRuntimeCapabilities',
    ]);
  });
});
