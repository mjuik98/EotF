import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const APP_COMPAT_FILES = [
  'game/app/event/use_cases/build_event_view_model.js',
  'game/app/event/use_cases/create_event_shop_use_case.js',
  'game/app/event/use_cases/create_rest_event_use_case.js',
  'game/app/event/use_cases/discard_event_card_use_case.js',
  'game/app/event/use_cases/finish_event_flow_use_case.js',
  'game/app/event/use_cases/item_shop_use_case.js',
  'game/app/event/use_cases/resolve_event_choice_use_case.js',
  'game/app/event/use_cases/resolve_event_session_use_case.js',
  'game/app/event/use_cases/show_event_session_use_case.js',
  'game/app/reward/use_cases/build_reward_options_use_case.js',
  'game/app/reward/use_cases/claim_reward_use_case.js',
];

describe('app use-case compat boundaries', () => {
  it('keeps migrated app use-case files as thin re-export facades', () => {
    for (const file of APP_COMPAT_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toMatch(/^export\s+\{/);
      expect(source).not.toMatch(/^\s*import\s/m);
      expect(source).not.toMatch(/\bfunction\b/);
    }
  });
});
