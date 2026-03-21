import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function star(file, target) {
  return [file, `export * from '${target}';\n`];
}

function named(file, exportClause, target) {
  return [file, `export ${exportClause} from '${target}';\n`];
}

const EXACT_REEXPORTS = new Map([
  named('game/ui/screens/event_ui.js', '{ EventUI }', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_card_discard.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_dom.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_flow.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_helpers.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_item_shop.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_particles.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_rest_site.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_runtime_helpers.js', '../../features/event/public.js'),
  star('game/ui/screens/event_ui_shop.js', '../../features/event/public.js'),
  named('game/ui/screens/reward_ui.js', '{ RewardUI }', '../../features/reward/public.js'),
  star('game/ui/screens/reward_ui_helpers.js', '../../features/reward/public.js'),
  star('game/ui/screens/reward_ui_option_renderers.js', '../../features/reward/public.js'),
  star('game/ui/screens/reward_ui_options.js', '../../features/reward/public.js'),
  star('game/ui/screens/reward_ui_render.js', '../../features/reward/public.js'),
  [
    'game/ui/screens/reward_ui_runtime.js',
    [
      'export {',
      '  finishReward,',
      '  REWARD_CLAIM_KEY,',
      '  REWARD_SKIP_KEY,',
      '  skipRewardRuntime,',
      '  takeRewardBlessingRuntime,',
      '  takeRewardCardRuntime,',
      '  takeRewardItemRuntime,',
      '  takeRewardRemoveRuntime,',
      '  takeRewardUpgradeRuntime,',
      "} from '../../features/reward/public.js';",
      '',
    ].join('\n'),
  ],
  named(
    'game/ui/screens/reward_ui_screen_runtime.js',
    '{ showRewardScreenRuntime }',
    '../../features/reward/public.js',
  ),
  star('game/presentation/screens/event_choice_resolution_presenter.js', '../../features/event/public.js'),
  star('game/presentation/screens/event_runtime_shell_presenter.js', '../../features/event/public.js'),
  star('game/presentation/screens/event_rest_site_presenter.js', '../../features/event/public.js'),
  star('game/presentation/screens/event_shop_presenter.js', '../../features/event/public.js'),
  star('game/presentation/screens/event_ui.js', '../../features/event/public.js'),
  star('game/presentation/screens/event_ui_facade_runtime.js', '../../features/event/public.js'),
  star('game/presentation/screens/event_ui_runtime_helpers.js', '../../features/event/public.js'),
  star('game/presentation/screens/reward_ui.js', '../../features/reward/public.js'),
]);

describe('event/reward compat reexports', () => {
  it('keeps event and reward transitional presentation paths as direct canonical reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
