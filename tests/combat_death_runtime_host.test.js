import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createCombatDeathRuntimeHost,
  resolveCombatDeathRuntimeContext,
} from '../game/features/combat/platform/browser/death_runtime_host.js';

describe('combat death runtime host', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  it('prefers injected runtime deps and derives browser context from injected doc and win', () => {
    const doc = { id: 'doc' };
    const win = {
      id: 'win',
      document: doc,
      AudioEngine: { id: 'win-audio' },
      CombatUI: { cleanupAllTooltips: vi.fn() },
      HudUpdateUI: { id: 'win-hud' },
      ParticleSystem: { id: 'win-particles' },
      ScreenShake: { id: 'win-shake' },
      TooltipUI: { id: 'win-tooltip' },
      openCodex: vi.fn(),
      renderCombatEnemies: vi.fn(),
      renderHand: vi.fn(),
      restartFromEnding: vi.fn(),
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
      selectFragment: vi.fn(),
      showCombatSummary: vi.fn(),
      showRewardScreen: vi.fn(),
      switchScreen: vi.fn(),
      updateChainUI: vi.fn(),
      updateUI: vi.fn(),
    };
    doc.defaultView = win;

    const injectedAudioEngine = { id: 'deps-audio' };
    const cleanupAllTooltips = vi.fn();
    const selectFragment = vi.fn();
    const runtimeHost = createCombatDeathRuntimeHost({
      audioEngine: injectedAudioEngine,
      cleanupAllTooltips,
      doc,
      finalizeRunOutcome: vi.fn(),
      hudUpdateUI: { id: 'deps-hud' },
      openEndingCodex: vi.fn(),
      particleSystem: { id: 'deps-particles' },
      renderCombatEnemies: vi.fn(),
      renderHand: vi.fn(),
      restartEndingFlow: vi.fn(),
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
      screenShake: { id: 'deps-shake' },
      selectFragment,
      showCombatSummary: vi.fn(),
      showRewardScreen: vi.fn(),
      switchScreen: vi.fn(),
      tooltipUI: { id: 'deps-tooltip' },
      updateChainUI: vi.fn(),
      updateUI: vi.fn(),
      win,
    });

    expect(resolveCombatDeathRuntimeContext({ doc })).toEqual({ doc, win });
    expect(runtimeHost.doc).toBe(doc);
    expect(runtimeHost.win).toBe(win);
    expect(runtimeHost.audioEngine).toBe(injectedAudioEngine);
    expect(runtimeHost.cleanupAllTooltips).toBe(cleanupAllTooltips);
    expect(runtimeHost.hudUpdateUI).toEqual({ id: 'deps-hud' });
    expect(runtimeHost.particleSystem).toEqual({ id: 'deps-particles' });
    expect(runtimeHost.screenShake).toEqual({ id: 'deps-shake' });
    expect(runtimeHost.selectFragment).toBe(selectFragment);
    expect(runtimeHost.tooltipUI).toEqual({ id: 'deps-tooltip' });
  });

  it('falls back to global browser runtime and combat death hooks when injections are absent', () => {
    const cleanupAllTooltips = vi.fn();
    const globalDoc = { id: 'global-doc' };
    const globalWin = {
      id: 'global-win',
      document: globalDoc,
      AudioEngine: { id: 'global-audio' },
      CombatUI: { cleanupAllTooltips },
      HudUpdateUI: { id: 'global-hud' },
      ParticleSystem: { id: 'global-particles' },
      ScreenShake: { id: 'global-shake' },
      TooltipUI: { id: 'global-tooltip' },
      openCodex: vi.fn(),
      renderCombatEnemies: vi.fn(),
      renderHand: vi.fn(),
      restartFromEnding: vi.fn(),
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
      selectFragment: vi.fn(),
      showCombatSummary: vi.fn(),
      showRewardScreen: vi.fn(),
      switchScreen: vi.fn(),
      updateChainUI: vi.fn(),
      updateUI: vi.fn(),
    };
    globalDoc.defaultView = globalWin;
    globalThis.window = globalWin;
    globalThis.document = globalDoc;

    expect(resolveCombatDeathRuntimeContext()).toEqual({
      doc: globalDoc,
      win: globalWin,
    });

    const runtimeHost = createCombatDeathRuntimeHost();

    expect(runtimeHost.audioEngine).toBe(globalWin.AudioEngine);
    expect(runtimeHost.cleanupAllTooltips).toBe(cleanupAllTooltips);
    expect(runtimeHost.hudUpdateUI).toBe(globalWin.HudUpdateUI);
    expect(runtimeHost.particleSystem).toBe(globalWin.ParticleSystem);
    expect(runtimeHost.screenShake).toBe(globalWin.ScreenShake);
    expect(runtimeHost.selectFragment).toBe(globalWin.selectFragment);
    expect(runtimeHost.tooltipUI).toBe(globalWin.TooltipUI);
    expect(runtimeHost.updateUI).toBe(globalWin.updateUI);
  });
});
