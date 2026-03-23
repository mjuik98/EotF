import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('browser effects compat re-exports', () => {
  it('removes ui browser effect shims once callers import platform-owned effects directly', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'game/ui/common/custom_cursor.js'))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), 'game/ui/feedback/button_feedback.js'))).toBe(false);
  });

  it('routes the core runtime bridge through platform-owned browser effects', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/platform/browser/composition/build_core_runtime_bridge_modules.js'),
      'utf8',
    );

    expect(source).toContain("from '../effects/custom_cursor.js'");
    expect(source).not.toContain("from '../../../ui/common/custom_cursor.js'");
  });
});
