import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('build_screen_primary_modules file structure', () => {
  it('keeps only the shell module aggregator in the primary screen builder', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/platform/browser/composition/build_screen_primary_modules.js'),
      'utf8',
    );

    expect(source).toContain("./build_screen_shell_primary_modules.js");
    expect(source).not.toContain("./build_screen_feature_primary_modules.js");
  });
});
