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

describe('combat public surface scope', () => {
  it('keeps the combat public surface focused on grouped capabilities and narrow top-level contracts', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_surface.js'),
      'utf8',
    );

    expect(extractNamedExports(source)).toEqual([
      'CombatPublicSurface',
      'SetBonusSystem',
      'buildCombatFlowContractPublicBuilders',
      'createCombatApplicationCapabilities',
      'createCombatBindingCapabilities',
      'createCombatCompatCapabilities',
      'createCombatContractCapabilities',
      'createCombatModuleCapabilities',
      'createCombatRuntimeCapabilities',
    ]);
  });
});
