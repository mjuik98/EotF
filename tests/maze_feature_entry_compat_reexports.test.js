import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('maze feature helper compat reexports', () => {
  it('keeps moved maze helper entrypoints as thin feature-local reexports', () => {
    const renderSource = fs.readFileSync(path.join(process.cwd(), 'game/ui/map/maze_system_render_ui.js'), 'utf8');
    const runtimeSource = fs.readFileSync(path.join(process.cwd(), 'game/ui/map/maze_system_runtime_ui.js'), 'utf8');

    expect(renderSource).toBe("export * from '../../features/run/presentation/browser/maze_system_render_ui.js';\n");
    expect(runtimeSource).toBe("export * from '../../features/run/presentation/browser/maze_system_runtime_ui.js';\n");
  });
});
