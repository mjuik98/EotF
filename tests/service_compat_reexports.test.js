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
  [
    'game/app/system/screen_service.js',
    [
      'export {',
      '  setScreenService,',
      '  showGameplayScreenService,',
      '  showScreenService,',
      "} from '../../core/system/screen_service.js';",
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
      "} from '../../features/event/public.js';",
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
      "} from '../../features/event/public.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/combat/card_draw_service.js',
    [
      'export {',
      '  drawCardsService,',
      '  executePlayerDrawService,',
      "} from '../../features/combat/public.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/combat/play_card_service.js',
    [
      "export { playCardService } from '../../features/combat/public.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/combat/end_turn_service.js',
    [
      "export { endPlayerTurnService } from '../../features/combat/public.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/event/resolve_event_choice_service.js',
    [
      "export { resolveEventChoiceService } from '../../features/event/public.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/event/rest_service.js',
    [
      "export { createRestEventService } from '../../features/event/public.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/event/shop_service.js',
    [
      "export { createShopEventService } from '../../features/event/public.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/codex/use_cases/codex_card_reference_use_case.js',
    [
      "export { createCodexCardReferenceUseCase, getCodexCardUpgradeId, isCodexCardUpgradeVariant, resolveCodexCardReferenceId } from '../../../shared/codex/codex_card_reference_use_case.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/codex/use_cases/codex_record_state_use_case.js',
    [
      "export { registerCardDiscovered, registerEnemyKill, registerItemFound } from '../../../shared/codex/codex_record_state_use_case.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/shared/state_commands/run_state_commands.js',
    [
      'export {',
      '  applyRunStartLoadout,',
      '  createRunStartPlayer,',
      '  createRunStateCommands,',
      '  resetRunConfig,',
      '  resetRuntimeState,',
      "} from '../../../shared/state/run_state_commands.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/shared/state_commands/map_state_commands.js',
    [
      'export {',
      '  applyNodeTraversalState,',
      '  resolveNodeByRef,',
      '  updateNextFloorAccessibility,',
      "} from '../../../shared/state/map_state_commands.js';",
      '',
    ].join('\n'),
  ],
  [
    'game/app/shared/use_cases/class_progression_data_use_case.js',
    [
      'export {',
      '  CLASS_MASTERY_LEVEL_XP,',
      '  getClassMasteryRoadmap,',
      '  MAX_CLASS_MASTERY_LEVEL,',
      "} from '../../../shared/progression/class_progression_data_use_case.js';",
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
