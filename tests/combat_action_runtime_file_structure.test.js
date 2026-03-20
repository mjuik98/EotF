import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat action runtime file structure', () => {
  it('delegates combat action assembly into focused browser helper modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/platform/browser/create_combat_actions.js'),
      'utf8',
    );

    expect(source).toContain("./build_combat_turn_action_group.js");
    expect(source).toContain("./build_combat_ui_action_group.js");
    expect(source).toContain("./build_combat_player_action_group.js");
    expect(source).toContain("./build_combat_feedback_action_group.js");
  });
});
