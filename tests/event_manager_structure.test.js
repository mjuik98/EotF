import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('event manager structure', () => {
  it('keeps the compat event manager as a thin re-export to the canonical application facade', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/event/compat/event_manager.js'),
      'utf8',
    ).trim();

    expect(source).toBe("export { EventManager } from '../application/event_manager_facade.js';");
  });
});
