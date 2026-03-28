import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/ui/ports/public_help_pause_ui.js', () => ({
  HelpPauseUI: { id: 'help-pause-ui' },
}));

describe('screen_overlay_browser_modules', () => {
  it('returns the eager HelpPauseUI module for immediate hotkey binding', async () => {
    const { buildScreenOverlayBrowserModules } = await import('../game/features/ui/platform/browser/screen_overlay_browser_modules.js');

    expect(buildScreenOverlayBrowserModules()).toMatchObject({
      HelpPauseUI: { id: 'help-pause-ui' },
    });
  });
});
