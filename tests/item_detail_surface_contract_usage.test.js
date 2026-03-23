import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('item detail surface contract usage', () => {
  it('routes combat, stage, and class-select detail surfaces through the shared managed helper', () => {
    const combatSource = readFileSync(
      path.join(process.cwd(), 'game/features/combat/presentation/browser/combat_relic_rail_ui.js'),
      'utf8',
    );
    const stagePanelsSource = readFileSync(
      path.join(process.cwd(), 'game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js'),
      'utf8',
    );
    const stageSurfaceSource = readFileSync(
      path.join(process.cwd(), 'game/features/run/presentation/browser/map_ui_next_nodes_relic_detail_surface.js'),
      'utf8',
    );
    const classSource = readFileSync(
      path.join(process.cwd(), 'game/features/title/platform/browser/class_select_buttons_ui.js'),
      'utf8',
    );

    expect(combatSource).toContain('createManagedItemDetailSurface');
    expect(stagePanelsSource).toContain('map_ui_next_nodes_relic_detail_surface.js');
    expect(stageSurfaceSource).toContain('createManagedItemDetailSurface');
    expect(classSource).toContain('createManagedItemDetailSurface');
    expect(stageSurfaceSource).not.toContain('globalThis.setTimeout');
    expect(stageSurfaceSource).not.toContain('globalThis.clearTimeout');
  });
});
