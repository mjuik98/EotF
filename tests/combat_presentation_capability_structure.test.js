import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const GROUP_FILES = [
  'game/features/combat/ports/presentation/public_combat_card_presentation_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_feedback_presentation_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_screen_presentation_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_status_presentation_capabilities.js',
];

describe('combat presentation capability structure', () => {
  it('keeps the combat presentation capability surface as a thin grouped index', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_presentation_capabilities.js'),
      'utf8',
    );

    for (const file of GROUP_FILES) {
      const rel = `./presentation/${path.basename(file)}`;
      expect(source).toContain(rel);
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }

    expect(source).not.toContain('../presentation/browser/');
  });
});
