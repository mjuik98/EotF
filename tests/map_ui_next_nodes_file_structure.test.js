import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('map_ui_next_nodes file structure', () => {
  it('delegates overlay-specific helpers into a focused helper module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/run/presentation/browser/map_ui_next_nodes.js'),
      'utf8',
    );

    expect(source).toContain("./map_ui_next_nodes_overlay_helpers.js");
  });
});
