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
    expect(source).toContain("from './deps/deps_factory_caches.js'");
    expect(source).toContain("from './deps/deps_factory_public_runtime.js'");
    expect(source).toContain('createDepsFactoryCaches');
    expect(source).toContain('createDepsFactoryPublicRuntime');
    expect(source).toContain('publicDepAccessorExports');
    expect(source).toContain('syncPublicGlobalHooks');
    expect(source).not.toContain('let contractCatalog = null;');
    expect(source).not.toContain('let publicDepAccessors = null;');
    expect(source).not.toContain('export function getHudUpdateDeps() {');
    expect(source).not.toContain('export function getGameBootDeps() {');
    expect(source).not.toContain('return getPublicDepAccessors().getHudUpdateDeps();');
    expect(source).not.toContain('return getPublicDepAccessors().getGameBootDeps();');
    expect(source).not.toContain('syncGlobalDepsFactoryHooks({');
    expect(source).not.toContain('createPublicDepAccessorExportBindings(');
  });
});
