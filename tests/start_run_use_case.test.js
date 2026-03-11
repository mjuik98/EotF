import { describe, expect, it, vi } from 'vitest';
import { createStartRunUseCase } from '../game/app/run/use_cases/start_run_use_case.js';

describe('start_run_use_case', () => {
  it('orchestrates run initialization through injected state commands', () => {
    const runStateCommands = {
      resetRunConfig: vi.fn(),
      applyRunStartLoadout: vi.fn(),
      resetRuntimeState: vi.fn(),
    };
    const startRun = createStartRunUseCase({ runStateCommands });
    const gs = {
      meta: { worldMemory: { savedMerchant: 1 } },
      player: { deck: ['strike', 'defend'] },
      runConfig: { ascension: 2 },
      markDirty: vi.fn(),
    };
    const audioEngine = { init: vi.fn(), resume: vi.fn() };
    const runRules = { ensureMeta: vi.fn(), applyRunStart: vi.fn() };
    const shuffleArray = vi.fn();
    const applyStartBonuses = vi.fn();
    const enterRun = vi.fn();
    const updateUI = vi.fn();

    const result = startRun({
      gs,
      selectedClass: 'swordsman',
      classMeta: { stats: { HP: 80 } },
      data: { startDecks: { swordsman: ['strike', 'defend'] } },
      runRules,
      audioEngine,
      shuffleArray,
      applyStartBonuses,
      enterRun,
      updateUI,
    });

    expect(audioEngine.init).toHaveBeenCalledTimes(1);
    expect(audioEngine.resume).toHaveBeenCalledTimes(1);
    expect(runRules.ensureMeta).toHaveBeenCalledWith(gs.meta);
    expect(runStateCommands.resetRunConfig).toHaveBeenCalledWith(gs);
    expect(runStateCommands.applyRunStartLoadout).toHaveBeenCalledWith(
      gs,
      'swordsman',
      { stats: { HP: 80 } },
      { startDecks: { swordsman: ['strike', 'defend'] } },
    );
    expect(applyStartBonuses).toHaveBeenCalled();
    expect(runRules.applyRunStart).toHaveBeenCalledWith(gs);
    expect(shuffleArray).toHaveBeenCalledWith(gs.player.deck);
    expect(runStateCommands.resetRuntimeState).toHaveBeenCalledWith(gs, { savedMerchant: 1 });
    expect(enterRun).toHaveBeenCalledTimes(1);
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
    expect(result).toEqual(expect.objectContaining({
      classId: 'swordsman',
      runConfig: gs.runConfig,
      worldMemory: gs.meta.worldMemory,
    }));
  });
});
