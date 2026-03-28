import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('legacy growth guard', () => {
  it('does not allow platform legacy file count to grow past the current baseline', () => {
    const root = path.join(process.cwd(), 'game/platform/legacy');
    const files = fs.readdirSync(root, { recursive: true })
      .filter((entry) => String(entry).endsWith('.js'));

    expect(files.length).toBeLessThanOrEqual(72);
  });
});
