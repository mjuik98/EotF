import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('claim_reward_use_case file structure', () => {
  it('delegates reward-claim branching into focused handler modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/reward/application/claim_reward_use_case.js'),
      'utf8',
    );

    expect(source).toContain("./claim_reward_handlers.js");
  });
});
