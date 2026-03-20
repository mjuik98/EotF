import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('feature compat capability structure', () => {
  it('keeps combat compat capabilities bound to canonical application facades', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_compat_capabilities.js'),
      'utf8',
    );

    expect(source).toContain("../application/card_methods_facade.js");
    expect(source).toContain("../application/combat_lifecycle_facade.js");
    expect(source).toContain("../application/combat_methods_facade.js");
    expect(source).toContain("../application/damage_system_facade.js");
    expect(source).toContain("../application/death_handler_facade.js");
    expect(source).toContain("../application/turn_manager_facade.js");
    expect(source).not.toContain("../compat/card_methods.js");
    expect(source).not.toContain("../compat/combat_lifecycle.js");
  });

  it('keeps event compat capabilities bound to the canonical application facade', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/event/ports/public_surface.js'),
      'utf8',
    );

    expect(source).toContain("../application/event_manager_facade.js");
    expect(source).not.toContain("../compat/event_manager.js");
  });
});
