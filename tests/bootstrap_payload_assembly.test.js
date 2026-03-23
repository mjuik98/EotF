import { describe, expect, it, vi } from 'vitest';

import { buildGameBootPayload } from '../game/core/bootstrap/build_game_boot_payload.js';
import { buildRuntimeSubscriberPayload } from '../game/core/bootstrap/build_runtime_subscriber_payload.js';
import { buildCharacterSelectMountPayload } from '../game/features/title/platform/browser/build_character_select_mount_payload.js';

describe('bootstrap payload assembly', () => {
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

  it('builds a title feature-owned mount payload for the character select screen', () => {
    const saveDeps = { token: 'save-deps' };
    const gs = { id: 'gs' };
    const audioEngine = { id: 'audio' };
    const saveSystem = { saveMeta: vi.fn() };
    const deps = {
      getGameBootDeps: vi.fn(() => ({ data: { cards: 'cards-data' } })),
      getSaveSystemDeps: vi.fn(() => saveDeps),
    };
    const fns = {
      startGame: vi.fn(),
      backToTitle: vi.fn(),
    };
    const doc = { id: 'doc' };

    const payload = buildCharacterSelectMountPayload({ gs, audioEngine, saveSystem, deps, fns, doc });

    expect(payload).toEqual(expect.objectContaining({
      doc,
      gs,
      audioEngine,
      data: { cards: 'cards-data' },
      onConfirm: expect.any(Function),
      onBack: expect.any(Function),
      onStart: expect.any(Function),
    }));

    payload.onProgressConsumed();
    expect(deps.getGameBootDeps).toHaveBeenCalledTimes(1);
    expect(deps.getSaveSystemDeps).toHaveBeenCalledTimes(1);
    expect(saveSystem.saveMeta).toHaveBeenCalledWith(saveDeps);
  });

  it('builds subscriber refs and combines feature action maps', () => {
    const modules = {
      HudUpdateUI: { id: 'hud' },
      CombatHudUI: { id: 'combat-hud' },
      FeedbackUI: { id: 'feedback' },
      CombatUI: { id: 'combat' },
      StatusEffectsUI: { id: 'status' },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
      ScreenShake: { id: 'shake' },
      HitStop: { id: 'hit-stop' },
    };
    modules.featureScopes = {
      core: {
        AudioEngine: modules.AudioEngine,
        ParticleSystem: modules.ParticleSystem,
        ScreenShake: modules.ScreenShake,
        HitStop: modules.HitStop,
      },
      combat: {
        HudUpdateUI: modules.HudUpdateUI,
        CombatHudUI: modules.CombatHudUI,
        FeedbackUI: modules.FeedbackUI,
        CombatUI: modules.CombatUI,
        StatusEffectsUI: modules.StatusEffectsUI,
      },
    };
    const fns = {
      renderHand: vi.fn(),
      renderCombatCards: vi.fn(),
      updateEchoSkillBtn: vi.fn(),
      updateNoiseWidget: vi.fn(),
      updateStatusDisplay: vi.fn(),
      showCardPlayEffect: vi.fn(),
      showDmgPopup: vi.fn(),
      renderCombatEnemies: vi.fn(),
      updateUI: vi.fn(),
      showTurnBanner: vi.fn(),
      updateCombatLog: vi.fn(),
    };
    const doc = { body: {} };
    const win = { innerWidth: 1280 };

    const payload = buildRuntimeSubscriberPayload({ modules, fns, doc, win });

    expect(payload.HudUpdateUI).toBe(modules.HudUpdateUI);
    expect(payload.CombatUI).toBe(modules.CombatUI);
    expect(payload.doc).toBe(doc);
    expect(payload.win).toBe(win);

    payload.actions.renderHand();
    payload.actions.updateUI();
    payload.actions.updateCombatLog();

    expect(fns.renderHand).toHaveBeenCalledTimes(1);
    expect(fns.updateUI).toHaveBeenCalledTimes(1);
    expect(fns.updateCombatLog).toHaveBeenCalledTimes(1);
  });
});
