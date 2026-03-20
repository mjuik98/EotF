import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat public_surface file structure', () => {
  it('keeps compat capability creation in a dedicated port module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_surface.js'),
      'utf8',
    );

    expect(source).toContain("./public_compat_capabilities.js");
  });
});
