import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('deps factory structure', () => {
  it('delegates contract, accessor, and global hook responsibilities to focused helper modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/core/deps_factory.js'),
      'utf8',
    );

    expect(source).toContain("from './deps/deps_factory_contract_catalog.js'");
    expect(source).toContain("from './deps/deps_factory_accessors.js'");
    expect(source).toContain("from './deps/deps_factory_global_bridge.js'");
  });
});
