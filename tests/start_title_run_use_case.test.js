import { describe, expect, it, vi } from 'vitest';

import { startTitleRunUseCase } from '../game/app/title/use_cases/start_title_run_use_case.js';

describe('start_title_run_use_case', () => {
  it('hides title panels, runs the prelude, and starts run setup after the intro', () => {
    const hideTitleSubscreens = vi.fn();
    const markPreRunRipplePlayed = vi.fn();
    const startRunSetup = vi.fn();
    const getSelectedClass = vi.fn(() => 'swordsman');
    const playIntroCinematic = vi.fn((_deps, onComplete) => onComplete?.());
    const playPrelude = vi.fn((onComplete) => onComplete?.());

    startTitleRunUseCase({
      getSelectedClass,
      hideTitleSubscreens,
      markPreRunRipplePlayed,
      playIntroCinematic,
      playPrelude,
      startRunSetup,
    });

    expect(hideTitleSubscreens).toHaveBeenCalledTimes(1);
    expect(playPrelude).toHaveBeenCalledTimes(1);
    expect(markPreRunRipplePlayed).toHaveBeenCalledTimes(1);
    expect(playIntroCinematic).toHaveBeenCalledTimes(1);
    expect(playIntroCinematic).toHaveBeenCalledWith(
      { getSelectedClass },
      expect.any(Function),
    );
    expect(startRunSetup).toHaveBeenCalledTimes(1);
  });
});
