import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('feature internal transitional surfaces', () => {
  it('keeps selected transitional files as thin re-exports to canonical owners', () => {
    const expectations = {
      'game/features/combat/app/combat_actions.js': /export\s+\{\s*createCombatActions\s*\}\s+from\s+'\.\.\/platform\/browser\/create_combat_actions\.js';/,
      'game/features/ui/app/ui_actions.js': /export\s+\{\s*createUiActions\s*\}\s+from\s+'\.\.\/platform\/browser\/ui_actions\.js';/,
      'game/features/ui/app/legacy_query_groups.js': /export\s+\{\s*buildLegacyGameApiRuntimeHudQueryGroups,\s*buildLegacyWindowUiQueryGroups,\s*createLegacyHudRuntimeQueryBindings,?\s*\}\s+from\s+'\.\.\/platform\/browser\/ui_legacy_query_groups\.js';/,
    };

    for (const [file, expectedPattern] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(source).toMatch(expectedPattern);
    }
  });
});
