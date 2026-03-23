import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('maze feature helper compat reexports', () => {
  it('removes moved maze helper compat entrypoints once callers use the run feature public surface', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'game/ui/map/maze_system_render_ui.js'))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), 'game/ui/map/maze_system_runtime_ui.js'))).toBe(false);
  });
});
