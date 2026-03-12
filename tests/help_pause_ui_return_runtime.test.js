import { describe, expect, it, vi } from 'vitest';

import { confirmReturnToTitleRuntime } from '../game/ui/screens/help_pause_ui_return_runtime.js';

describe('help_pause_ui_return_runtime', () => {
  it('prefers the injected returnToTitleFromPause helper', () => {
    const returnToTitleFromPause = vi.fn();
    const saveRun = vi.fn();
    const reload = vi.fn();

    const result = confirmReturnToTitleRuntime({
      returnToTitleFromPause,
      saveRun,
      reload,
      gs: { currentScreen: 'game' },
    });

    expect(result).toBe(true);
    expect(returnToTitleFromPause).toHaveBeenCalledTimes(1);
    expect(saveRun).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('falls back to save and reload when the helper is unavailable', () => {
    const saveRun = vi.fn();
    const reload = vi.fn();
    const deps = {
      gs: { currentScreen: 'game' },
      saveRun,
      reload,
    };

    const result = confirmReturnToTitleRuntime(deps);

    expect(result).toBe(true);
    expect(saveRun).toHaveBeenCalledWith({ gs: deps.gs });
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
