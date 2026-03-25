import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('feedback ui toasts structure', () => {
  it('keeps toast stack state and toast view builders in focused helper modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/presentation/browser/feedback_ui_toasts.js'),
      'utf8',
    );

    expect(source).toContain('feedback_ui_toast_stack.js');
    expect(source).toContain('feedback_ui_toast_views.js');
  });

  it('keeps item toast keyword colors aligned with readable comparison surfaces', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'css/styles.css'),
      'utf8',
    );

    expect(source).toContain('.toast-sub .kw-dmg');
    expect(source).toContain('.toast-sub .kw-energy');
    expect(source).toContain('.toast-sub .kw-echo');
    expect(source).toContain('.toast-sub .kw-exhaust.kw-block');
  });
});
