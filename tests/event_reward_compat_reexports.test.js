import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('event/reward compat reexports', () => {
  it('removes event and reward transitional shims once tests use feature-owned surfaces directly', () => {
    const removedFiles = [
      'game/ui/screens/event_ui.js',
      'game/ui/screens/event_ui_card_discard.js',
      'game/ui/screens/event_ui_dom.js',
      'game/ui/screens/event_ui_flow.js',
      'game/ui/screens/event_ui_helpers.js',
      'game/ui/screens/event_ui_item_shop.js',
      'game/ui/screens/event_ui_particles.js',
      'game/ui/screens/event_ui_rest_site.js',
      'game/ui/screens/event_ui_runtime_helpers.js',
      'game/ui/screens/event_ui_shop.js',
      'game/ui/screens/reward_ui.js',
      'game/ui/screens/reward_ui_helpers.js',
      'game/ui/screens/reward_ui_option_renderers.js',
      'game/ui/screens/reward_ui_options.js',
      'game/ui/screens/reward_ui_render.js',
      'game/ui/screens/reward_ui_runtime.js',
      'game/ui/screens/reward_ui_screen_runtime.js',
      'game/presentation/screens/event_choice_resolution_presenter.js',
      'game/presentation/screens/event_rest_site_presenter.js',
      'game/presentation/screens/event_runtime_shell_presenter.js',
      'game/presentation/screens/event_shop_presenter.js',
      'game/presentation/screens/event_ui.js',
      'game/presentation/screens/event_ui_facade_runtime.js',
      'game/presentation/screens/event_ui_runtime_helpers.js',
      'game/presentation/screens/reward_ui.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
