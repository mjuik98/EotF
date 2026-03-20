import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('codex_ui_helpers file structure', () => {
  it('splits codex state and filter logic into focused helper modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/codex/presentation/browser/codex_ui_helpers.js'),
      'utf8',
    );

    expect(source).toContain("./codex_ui_state_helpers.js");
    expect(source).toContain("./codex_ui_filter_helpers.js");
  });
});
