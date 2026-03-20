import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('event ui particles file structure', () => {
  it('delegates rest-site particle runtime into focused helper modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/event/presentation/browser/event_ui_particles.js'),
      'utf8',
    );

    expect(source).toContain("./event_ui_particle_model.js");
    expect(source).toContain("./event_ui_particle_bounds.js");
  });
});
