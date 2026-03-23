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
      "} from '../../features/ui/ports/public_application_capabilities.js';",
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

  it('removes event and shared runtime compat wrappers once tests move to canonical services', () => {
    const removedFiles = [
      'game/app/system/screen_service.js',
      'game/app/event/resolve_event_choice_service.js',
      'game/app/event/rest_service.js',
      'game/app/event/shop_service.js',
      'game/app/codex/use_cases/codex_card_reference_use_case.js',
      'game/app/codex/use_cases/codex_record_state_use_case.js',
      'game/app/shared/selectors/runtime_state_selectors.js',
      'game/app/shared/state_commands/run_state_commands.js',
      'game/app/shared/state_commands/map_state_commands.js',
      'game/app/shared/use_cases/class_progression_data_use_case.js',
      'game/app/combat/card_draw_service.js',
      'game/app/combat/play_card_service.js',
      'game/app/combat/end_turn_service.js',
      'game/app/event/event_service.js',
      'game/app/event/event_session_store.js',
      'game/app/shared/use_cases/runtime_state_use_case.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
