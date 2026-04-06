import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('player state command compat structure', () => {
  it('keeps forced legacy fallback enablement centralized in a shared compat bridge', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/shared/state/player_state_command_compat.js'),
      'utf8',
    );

    expect(source).toContain("./player_state_commands.js");
    expect(source).toContain("./player_state_legacy_runtime_bridge.js");
    expect(source).toContain('applyPlayerGoldCompatState');
    expect(source).toContain('applyPlayerHealCompatState');
    expect(source).toContain('applyPlayerMaxEnergyGrowthCompatState');
    expect(source).toContain('applyPlayerMaxHpGrowthCompatState');
    expect(source).not.toContain('../../platform/legacy/state/');
  });
});
