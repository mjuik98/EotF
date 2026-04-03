import { describe, expect, it, vi } from 'vitest';

import { buildUiHelpPauseContract } from '../game/features/ui/ports/contracts/build_ui_help_pause_contract.js';
import { buildUiShellContractBuilders } from '../game/features/ui/ports/contracts/build_ui_shell_contracts.js';

describe('ui_shell_contract_builders', () => {
  it('builds help-pause deps through the extracted contract helper', () => {
    const canonicalGs = {
      currentScreen: 'game',
      player: { hp: 80 },
    };
    const saveRun = vi.fn();

    const deps = buildUiHelpPauseContract({
      buildBaseDeps: vi.fn((scope) => ({ gs: canonicalGs, scope })),
      getRefs: () => ({
        AudioEngine: { playEvent: vi.fn() },
        openCodex: vi.fn(),
        featureRefs: {
          core: {
            GS: canonicalGs,
            SaveSystem: { saveRun },
          },
          combat: {
            playCard: vi.fn(),
          },
        },
      }),
      getSyncVolumeUIFallback: vi.fn(() => vi.fn()),
    });

    deps.saveRun();

    expect(deps.gs).toBe(canonicalGs);
    expect(deps.scope).toBe('run');
    expect(saveRun).toHaveBeenCalledWith({
      gs: canonicalGs,
      isGameStarted: expect.any(Function),
    });
  });

  it('prefers run base deps gs when building help-pause save actions', () => {
    const saveRun = vi.fn();
    const scopedGs = { currentScreen: 'game' };
    const builders = buildUiShellContractBuilders({
      buildBaseDeps: vi.fn(() => ({ gs: scopedGs, token: 'run-base' })),
      getRefs: () => ({
        GS: { stale: true },
        SaveSystem: { saveRun },
      }),
      getRaf: vi.fn(() => vi.fn()),
      getSyncVolumeUIFallback: vi.fn(() => vi.fn()),
    });

    const deps = builders.helpPause();
    deps.saveRun();

    expect(deps.gs).toBe(scopedGs);
    expect(saveRun).toHaveBeenCalledWith({
      gs: scopedGs,
      isGameStarted: expect.any(Function),
    });
  });

  it('falls back to canonical core feature refs before stale top-level gs aliases', () => {
    const saveRun = vi.fn();
    const scopedGs = { currentScreen: 'game' };
    const builders = buildUiShellContractBuilders({
      buildBaseDeps: vi.fn(() => ({ token: 'run-base' })),
      getRefs: () => ({
        GS: { stale: true },
        featureRefs: {
          core: {
            GS: scopedGs,
          },
        },
        SaveSystem: { saveRun },
      }),
      getRaf: vi.fn(() => vi.fn()),
      getSyncVolumeUIFallback: vi.fn(() => vi.fn()),
    });

    const deps = builders.helpPause();
    deps.saveRun();

    expect(saveRun).toHaveBeenCalledWith({
      gs: scopedGs,
      isGameStarted: expect.any(Function),
    });
  });

  it('overrides stale run deps gs with the canonical core gs for help-pause save flows', () => {
    const saveRun = vi.fn();
    const staleRunGs = { currentScreen: 'game' };
    const canonicalGs = {
      currentScreen: 'game',
      player: { hp: 80 },
    };
    const builders = buildUiShellContractBuilders({
      buildBaseDeps: vi.fn(() => ({ gs: staleRunGs, token: 'run-base' })),
      getRefs: () => ({
        featureRefs: {
          core: {
            GS: canonicalGs,
          },
        },
        SaveSystem: { saveRun },
      }),
      getRaf: vi.fn(() => vi.fn()),
      getSyncVolumeUIFallback: vi.fn(() => vi.fn()),
    });

    const deps = builders.helpPause();
    deps.saveRun({ gs: deps.gs });

    expect(deps.gs).toBe(canonicalGs);
    expect(saveRun).toHaveBeenCalledWith({
      gs: canonicalGs,
      isGameStarted: expect.any(Function),
    });
  });

  it('uses the canonical core save system when the top-level alias is stale', () => {
    const staleSaveRun = vi.fn();
    const canonicalSaveRun = vi.fn();
    const canonicalGs = {
      currentScreen: 'game',
      player: { hp: 80 },
    };
    const builders = buildUiShellContractBuilders({
      buildBaseDeps: vi.fn(() => ({ gs: canonicalGs, token: 'run-base' })),
      getRefs: () => ({
        SaveSystem: { saveRun: staleSaveRun },
        featureRefs: {
          core: {
            GS: canonicalGs,
            SaveSystem: { saveRun: canonicalSaveRun },
          },
        },
      }),
      getRaf: vi.fn(() => vi.fn()),
      getSyncVolumeUIFallback: vi.fn(() => vi.fn()),
    });

    const deps = builders.helpPause();
    deps.saveRun({ gs: deps.gs });

    expect(canonicalSaveRun).toHaveBeenCalledWith({
      gs: canonicalGs,
      isGameStarted: expect.any(Function),
    });
    expect(staleSaveRun).not.toHaveBeenCalled();
  });

  it('returns to title through current help-pause deps instead of a stale injected binding', () => {
    const staleReturnToTitle = vi.fn();
    const canonicalSaveRun = vi.fn();
    const reload = vi.fn();
    const canonicalGs = {
      currentScreen: 'game',
      player: { hp: 80 },
    };
    const builders = buildUiShellContractBuilders({
      buildBaseDeps: vi.fn(() => ({
        gs: canonicalGs,
        token: 'run-base',
        win: { location: { reload } },
      })),
      getRefs: () => ({
        _gameStarted: () => true,
        returnToTitleFromPause: staleReturnToTitle,
        featureRefs: {
          core: {
            GS: canonicalGs,
            SaveSystem: { saveRun: canonicalSaveRun },
          },
        },
      }),
      getRaf: vi.fn(() => vi.fn()),
      getSyncVolumeUIFallback: vi.fn(() => vi.fn()),
    });

    const deps = builders.helpPause();
    const result = deps.returnToTitleFromPause();

    expect(result).toBe(true);
    expect(canonicalSaveRun).toHaveBeenCalledWith({
      gs: canonicalGs,
      isGameStarted: expect.any(Function),
    });
    expect(staleReturnToTitle).not.toHaveBeenCalled();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('routes class-select audio errors through an injected logger', () => {
    const logger = {
      warn: vi.fn(),
    };
    const builders = buildUiShellContractBuilders({
      buildBaseDeps: vi.fn(() => ({ logger })),
      getRefs: () => ({
        AudioEngine: {
          playEvent: vi.fn(() => {
            throw new Error('audio-failed');
          }),
        },
      }),
      getRaf: vi.fn(() => vi.fn()),
      getSyncVolumeUIFallback: vi.fn(() => vi.fn()),
    });

    const deps = builders.classSelect();
    deps.playClassSelect('mage');

    expect(logger.warn).toHaveBeenCalledWith('Audio error:', expect.any(Error));
  });
});
