import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('browser effects compat re-exports', () => {
  it('keeps ui browser effect shims as thin platform re-exports', () => {
    const customCursorSource = fs.readFileSync(
      path.join(process.cwd(), 'game/ui/common/custom_cursor.js'),
      'utf8',
    ).trim();
    const buttonFeedbackSource = fs.readFileSync(
      path.join(process.cwd(), 'game/ui/feedback/button_feedback.js'),
      'utf8',
    ).trim();

    expect(customCursorSource).toBe(
      "export { CustomCursor } from '../../platform/browser/effects/custom_cursor.js';",
    );
    expect(buttonFeedbackSource).toBe(
      "export { ButtonFeedback } from '../../platform/browser/effects/button_feedback.js';",
    );
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
