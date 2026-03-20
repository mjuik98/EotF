import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('hud_panel_runtime_helpers file structure', () => {
  it('delegates item, modifier, and action button responsibilities to focused modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/presentation/browser/hud_panel_runtime_helpers.js'),
      'utf8',
    );

    expect(source).toContain("./hud_panel_item_runtime_helpers.js");
    expect(source).toContain("./hud_panel_modifier_runtime_helpers.js");
    expect(source).toContain("./hud_panel_action_runtime_helpers.js");
  });
});
