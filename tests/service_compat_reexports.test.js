import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const EXACT_REEXPORTS = new Map([
  [
    'game/core/system/screen_service.js',
    [
      'export {',
      '  setScreenService,',
      '  showGameplayScreenService,',
      '  showScreenService,',
      "} from '../../features/ui/application/screen_navigation_use_case.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/system/screen_service.js',
    [
      'export {',
      '  setScreenService,',
      '  showGameplayScreenService,',
      '  showScreenService,',
      "} from '../../features/ui/application/screen_navigation_use_case.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/event/event_service.js',
    [
      'export {',
      '  clearCurrentEvent,',
      '  getCurrentEvent,',
      '  resolveEventService,',
      '  setCurrentEvent,',
      '  showEventService,',
      '  triggerRandomEventService,',
      "} from '../../features/event/application/event_service.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/event/event_session_store.js',
    [
      'export {',
      '  clearCurrentEvent,',
      '  getCurrentEvent,',
      '  setCurrentEvent,',
      "} from '../../features/event/state/event_session_store.js';",
      '',
    ].join('\n'),
  ],
]);

describe('service compat reexports', () => {
  it('keeps migrated service files as thin feature-owned facades', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
