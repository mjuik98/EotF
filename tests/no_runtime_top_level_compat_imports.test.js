import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { ROOT, readText, toPosix, walkJsFiles } from './helpers/guardrail_fs.js';

const GAME_ROOT = path.join(ROOT, 'game');
const FORBIDDEN_ROOTS = ['game/app/', 'game/combat/', 'game/ui/'];
const IMPORT_RE = /(?:import|export)\s[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g;

function collectRelativeImports(source) {
  const imports = [];
  let match;
  while ((match = IMPORT_RE.exec(source))) {
    const specifier = match[1];
    if (specifier.startsWith('.')) imports.push(specifier);
  }
  return imports;
}

describe('runtime source avoids top-level compat imports', () => {
  it('keeps non-compat game source off game/app, game/combat, and game/ui roots', () => {
    const sourceFiles = walkJsFiles(GAME_ROOT)
      .map((filePath) => toPosix(path.relative(ROOT, filePath)))
      .filter((filePath) => !FORBIDDEN_ROOTS.some((root) => filePath.startsWith(root)));

    const violations = [];

    for (const filePath of sourceFiles) {
      const absPath = path.join(ROOT, filePath);
      const source = readText(filePath);
      const imports = collectRelativeImports(source);

      for (const specifier of imports) {
        const resolvedPath = toPosix(path.relative(
          ROOT,
          path.resolve(path.dirname(absPath), specifier),
        ));

        if (FORBIDDEN_ROOTS.some((root) => resolvedPath.startsWith(root))) {
          violations.push(`${filePath} -> ${resolvedPath}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
