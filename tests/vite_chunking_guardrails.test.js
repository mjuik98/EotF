import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('vite chunking guardrails', () => {
  it('splits gameplay-heavy browser code into focused feature chunks instead of one ui-gameplay bucket', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'vite.config.js'), 'utf8');

    expect(source).toContain("return 'ui-combat';");
    expect(source).toContain("return 'ui-reward';");
    expect(source).toContain("return 'ui-event';");
  });
});
