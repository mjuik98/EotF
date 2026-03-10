import { describe, expect, it, vi } from 'vitest';
import { CharacterSelectUI } from '../game/ui/title/character_select_ui.js';

describe('character select ui facade', () => {
  it('delegates runtime entry points when mounted', () => {
    const previousRuntime = CharacterSelectUI._runtime;
    const onEnter = vi.fn();
    const showPendingSummaries = vi.fn();

    CharacterSelectUI._runtime = { onEnter, showPendingSummaries };

    CharacterSelectUI.onEnter();
    CharacterSelectUI.showPendingSummaries();

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(showPendingSummaries).toHaveBeenCalledTimes(1);

    CharacterSelectUI._runtime = previousRuntime;
  });

  it('no-ops runtime entry points when not mounted', () => {
    const previousRuntime = CharacterSelectUI._runtime;
    CharacterSelectUI._runtime = null;

    expect(() => CharacterSelectUI.onEnter()).not.toThrow();
    expect(() => CharacterSelectUI.showPendingSummaries()).not.toThrow();

    CharacterSelectUI._runtime = previousRuntime;
  });
});
