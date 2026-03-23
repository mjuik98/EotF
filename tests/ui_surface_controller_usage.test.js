import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('ui surface controller usage', () => {
  it('reuses the shared controller in clone, map relic, and run-settings surfaces', () => {
    const cloneSource = readFileSync(
      path.join(process.cwd(), 'game/features/combat/presentation/browser/card_clone_ui.js'),
      'utf8',
    );
    const mapPanelsSource = readFileSync(
      path.join(process.cwd(), 'game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js'),
      'utf8',
    );
    const mapSurfaceSource = readFileSync(
      path.join(process.cwd(), 'game/features/run/presentation/browser/map_ui_next_nodes_relic_detail_surface.js'),
      'utf8',
    );
    const runModeSource = readFileSync(
      path.join(process.cwd(), 'game/features/run/presentation/browser/run_mode_ui_inscriptions_render.js'),
      'utf8',
    );

    expect(cloneSource).toContain('createUiSurfaceStateController');
    expect(mapPanelsSource).toContain('map_ui_next_nodes_relic_detail_surface.js');
    expect(mapSurfaceSource).toContain('createUiSurfaceStateController');
    expect(runModeSource).toContain('createUiSurfaceStateController');
  });
});
