import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('codex ui entry renderers structure', () => {
  it('keeps card shell and set rendering delegated to focused helper modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/codex/presentation/browser/codex_ui_entry_renderers.js'),
      'utf8',
    );

    expect(source).toContain('codex_ui_card_shell.js');
    expect(source).toContain('codex_ui_set_view_helpers.js');
  });
});
