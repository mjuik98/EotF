import { describe, expect, it, vi } from 'vitest';

import { buildGameBootPayload } from '../game/core/bootstrap/build_game_boot_payload.js';

describe('buildGameBootPayload', () => {
  it('builds boot payload from run deps and feature action maps', () => {
    const modules = {
      GAME: { getRunDeps: vi.fn(() => ({ token: 'run-deps' })) },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
      HelpPauseUI: { id: 'help-pause' },
      GameBootUI: { id: 'game-boot' },
      SettingsUI: { id: 'settings' },
    };
    modules.featureScopes = {
      core: {
        GAME: modules.GAME,
        AudioEngine: modules.AudioEngine,
        ParticleSystem: modules.ParticleSystem,
      },
      title: {
        HelpPauseUI: modules.HelpPauseUI,
        GameBootUI: modules.GameBootUI,
        SettingsUI: modules.SettingsUI,
      },
    };
    const deps = {
      getGameBootDeps: vi.fn(() => ({ token: 'game-boot-deps' })),
      getHelpPauseDeps: vi.fn(() => ({ token: 'help-pause-deps' })),
    };
    const fns = {
      showCharacterSelect: vi.fn(),
      continueRun: vi.fn(),
      openRunSettings: vi.fn(),
      openCodexFromTitle: vi.fn(),
      quitGame: vi.fn(),
      selectClass: vi.fn(),
      startGame: vi.fn(),
      backToTitle: vi.fn(),
      closeRunSettings: vi.fn(),
      shiftAscension: vi.fn(),
      toggleEndlessMode: vi.fn(),
      cycleRunCurse: vi.fn(),
      setMasterVolume: vi.fn(),
      setSfxVolume: vi.fn(),
      setAmbientVolume: vi.fn(),
      openSettings: vi.fn(),
      closeSettings: vi.fn(),
      showFullMap: vi.fn(),
      showEchoSkillTooltip: vi.fn(),
      hideEchoSkillTooltip: vi.fn(),
      drawCard: vi.fn(),
      endPlayerTurn: vi.fn(),
      useEchoSkill: vi.fn(),
      toggleBattleChronicle: vi.fn(),
      closeBattleChronicle: vi.fn(),
      showSkipConfirm: vi.fn(),
      skipReward: vi.fn(),
      hideSkipConfirm: vi.fn(),
      setDeckFilter: vi.fn(),
      closeDeckView: vi.fn(),
      setCodexTab: vi.fn(),
      closeCodex: vi.fn(),
    };

    const payload = buildGameBootPayload({ modules, deps, fns });

    expect(payload.token).toBe('run-deps');
    expect(payload.audioEngine).toBe(modules.AudioEngine);
    expect(payload.gameBootUI).toBe(modules.GameBootUI);
    expect(payload.getGameBootDeps()).toEqual({ token: 'game-boot-deps' });
    expect(payload.getHelpPauseDeps()).toEqual({ token: 'help-pause-deps' });

    payload.actions.startGame();
    payload.actions.setMasterVolume(75);
    payload.actions.drawCard();
    payload.actions.closeCodex();

    expect(fns.startGame).toHaveBeenCalledTimes(1);
    expect(fns.setMasterVolume).toHaveBeenCalledWith(75);
    expect(fns.drawCard).toHaveBeenCalledTimes(1);
    expect(fns.closeCodex).toHaveBeenCalledTimes(1);
  });
});
