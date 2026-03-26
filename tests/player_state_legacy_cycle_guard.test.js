import { describe, expect, it } from 'vitest';

import { readText } from './helpers/guardrail_fs.js';

describe('player state legacy cycle guard', () => {
  it('keeps the legacy fallback module independent from shared player-state command imports', () => {
    const source = readText('game/platform/legacy/state/legacy_player_state_command_fallback.js');

    expect(source).not.toContain("../../../shared/state/player_state_commands.js");
    expect(source).toContain("../core_support/public_core_support_capabilities.js");
    expect(source).toContain('./legacy_player_state_command_mutations.js');
  });
});
