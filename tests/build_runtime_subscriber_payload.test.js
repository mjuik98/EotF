import { describe, expect, it, vi } from 'vitest';

import { buildRuntimeSubscriberPayload } from '../game/core/bootstrap/build_runtime_subscriber_payload.js';

describe('buildRuntimeSubscriberPayload', () => {
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
