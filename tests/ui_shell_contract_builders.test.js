import { describe, expect, it, vi } from 'vitest';

import { buildUiShellContractBuilders } from '../game/features/ui/ports/contracts/build_ui_shell_contracts.js';

describe('ui_shell_contract_builders', () => {
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
});
