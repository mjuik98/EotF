import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('quality workflow scripts', () => {
  it('separates quick local verification from the full quality gate', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts['quality:fast']).toBe('npm run lint && npm test');
    expect(packageJson.scripts['quality:full']).toContain('npm run test:coverage');
    expect(packageJson.scripts['quality:full']).toContain('npm run build');
    expect(packageJson.scripts['quality:full']).toContain('npm run smoke:character-select');
    expect(packageJson.scripts.quality).toBe('npm run quality:full');
  });

  it('documents the fast and full verification commands in the README', () => {
    const readme = fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf8');

    expect(readme).toContain('npm run quality:fast');
    expect(readme).toContain('npm run quality:full');
  });
});
