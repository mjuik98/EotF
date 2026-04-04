import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('title compat port re-exports', () => {
  it('keeps legacy title and reward policy ports as thin aliases to canonical title capabilities', () => {
    const expectations = {
      'game/features/title/ports/class_progression_ports.js':
        "export { ClassProgressionSystem } from './public_progression_capabilities.js';",
      'game/features/title/ports/ending_ui_ports.js': [
        'export {',
        '  resolveEndingActions,',
        '  restartHiddenEndingOverlay,',
        '  scheduleEndingRestartAction,',
        '  restartFromEndingAction,',
        '  selectMetaFragmentAction,',
        "} from './public_ending_application_capabilities.js';",
      ].join('\n'),
      'game/features/title/ports/help_pause_ui_ports.js': [
        'export {',
        '  buildTitleHelpPauseActions,',
        '  confirmPauseReturnToTitle,',
        '  confirmHelpPauseAbandonRun,',
        '  createTitlePauseMenuActions,',
        "} from './public_help_pause_application_capabilities.js';",
      ].join('\n'),
      'game/features/reward/ports/reward_option_policy_ports.js': [
        "export { CONSTANTS } from '../../../data/constants.js';",
        "export { ClassProgressionSystem } from '../../title/ports/public_progression_capabilities.js';",
        "export { isContentAvailable } from '../../meta_progression/public.js';",
      ].join('\n'),
    };

    for (const [file, expected] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toBe(expected);
    }
  });
});
