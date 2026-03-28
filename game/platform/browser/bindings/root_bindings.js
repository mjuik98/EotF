import { SettingsManager } from '../settings/settings_manager.js';
import { registerFrontdoorBindings } from '../../../features/frontdoor/ports/runtime/public_frontdoor_runtime_surface.js';
import { registerRunEntryBindings } from '../../../features/run/ports/runtime/public_run_runtime_surface.js';
import { isEscapeKey, isVisibleModal } from './root_binding_helpers.js';

function getBindingDoc(deps = {}) {
  if (deps.doc) return deps.doc;
  return typeof document !== 'undefined' ? document : null;
}

function getHelpPauseBindingTarget(doc, deps = {}) {
  return doc?.defaultView || deps.win || doc || null;
}

function resolveHelpPauseUI(doc, deps = {}) {
  const win = doc?.defaultView || deps.win || null;
  if (typeof win?.HelpPauseUI?.togglePause === 'function') {
    return win.HelpPauseUI;
  }
  return deps.helpPauseUI || null;
}

function getLiveRunDeps(doc, deps = {}) {
  const win = doc?.defaultView || deps.win || null;
  if (typeof win?.GAME?.getRunDeps === 'function') {
    return win.GAME.getRunDeps() || {};
  }
  return deps.getRunDeps?.() || {};
}

function swallowEscapeEvent(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}

function closeLiveEscapeSurface(event, doc, id, onClose) {
  const element = doc?.getElementById?.(id) || null;
  if (!isVisibleModal(element, doc)) return false;
  swallowEscapeEvent(event);
  onClose?.(element);
  return true;
}

function isLiveRunScreen(doc, deps = {}) {
  const gs = deps.gs || deps.State || deps.state || null;
  if (
    gs?.currentScreen === 'game'
    || gs?.currentScreen === 'combat'
    || gs?.currentScreen === 'reward'
    || gs?.combat?.active === true
  ) {
    return true;
  }

  if (isVisibleModal(doc?.getElementById?.('nodeCardOverlay') || null, doc)) return true;
  return Boolean(doc?.getElementById?.('combatOverlay')?.classList?.contains?.('active'));
}

function handleLiveEscapeHotkey(event, { doc, deps = {}, ui = null } = {}) {
  if (!doc || !ui) return false;

  if (closeLiveEscapeSurface(event, doc, 'fullMapOverlay', (overlay) => {
    if (typeof overlay._closeFullMap === 'function') overlay._closeFullMap();
    else overlay.remove();
  })) return true;

  if (closeLiveEscapeSurface(event, doc, 'battleChronicleOverlay', () => {
    deps.closeBattleChronicle?.();
  })) return true;

  if (closeLiveEscapeSurface(event, doc, 'returnTitleConfirm', () => {
    doc.getElementById('returnTitleConfirm')?.remove();
  })) return true;

  if (closeLiveEscapeSurface(event, doc, 'abandonConfirm', () => {
    doc.getElementById('abandonConfirm')?.remove();
  })) return true;

  const helpMenu = doc.getElementById('helpMenu');
  if (helpMenu && helpMenu.style.display !== 'none') {
    swallowEscapeEvent(event);
    ui.toggleHelp?.(deps);
    return true;
  }

  if (closeLiveEscapeSurface(event, doc, 'deckViewModal', () => {
    deps.closeDeckView?.();
  })) return true;

  if (closeLiveEscapeSurface(event, doc, 'codexModal', () => {
    deps.closeCodex?.();
  })) return true;

  if (closeLiveEscapeSurface(event, doc, 'runSettingsModal', () => {
    deps.closeRunSettings?.();
  })) return true;

  if (closeLiveEscapeSurface(event, doc, 'settingsModal', () => {
    deps.closeSettings?.();
  })) return true;

  const pauseMenu = doc.getElementById('pauseMenu');
  if (isVisibleModal(pauseMenu, doc)) {
    swallowEscapeEvent(event);
    ui.togglePause?.(deps);
    return true;
  }

  if (isLiveRunScreen(doc, deps) && !ui.isHelpOpen?.()) {
    swallowEscapeEvent(event);
    ui.togglePause?.(deps);
    return true;
  }

  return (deps.gs || deps.State || deps.state || null)?.currentScreen === 'title';
}

export const RootBindings = {
  boot(deps) {
    const doc = getBindingDoc(deps);
    this.loadVolumes(deps.audioEngine);
    deps.settingsUI?.applyOnBoot?.({
      doc,
      ScreenShake: deps.ScreenShake,
      HitStop: deps.HitStop,
      ParticleSystem: deps.ParticleSystem,
    });
    this.syncVolumeUI(deps.audioEngine, { doc });
    this.initEventHandlers(deps);
    this.initHelpPauseUI(deps);
    const gameBootDeps = deps.getGameBootDeps();
    deps.gameBootUI?.bootGame?.(gameBootDeps);
    deps.gameBootUI?.refreshTitleSaveState?.(gameBootDeps);
  },

  loadVolumes(audioEngine) {
    const data = SettingsManager.load();
    if (!audioEngine) return;
    if (Number.isFinite(data?.volumes?.master)) audioEngine.setVolume(data.volumes.master);
    if (Number.isFinite(data?.volumes?.sfx)) audioEngine.setSfxVolume(data.volumes.sfx);
    if (Number.isFinite(data?.volumes?.ambient)) audioEngine.setAmbientVolume(data.volumes.ambient);
  },

  saveVolumes(audioEngine) {
    if (!audioEngine) return;
    const volumes = audioEngine.getVolumes();
    SettingsManager.set('volumes.master', volumes.master);
    SettingsManager.set('volumes.sfx', volumes.sfx);
    SettingsManager.set('volumes.ambient', volumes.ambient);
  },

  syncVolumeUI(audioEngine, deps = {}) {
    if (!audioEngine) return;
    const volumes = audioEngine.getVolumes();
    const master = Math.round(volumes.master * 100);
    const sfx = Math.round(volumes.sfx * 100);
    const ambient = Math.round(volumes.ambient * 100);
    const doc = getBindingDoc(deps);
    if (!doc?.querySelectorAll) return;

    doc.querySelectorAll('#settings-vol-master-val, #volMasterSliderVal').forEach((el) => { el.textContent = `${master}%`; });
    doc.querySelectorAll('#settings-vol-sfx-val, #volSfxSliderVal').forEach((el) => { el.textContent = `${sfx}%`; });
    doc.querySelectorAll('#settings-vol-ambient-val, #volAmbientSliderVal').forEach((el) => { el.textContent = `${ambient}%`; });
    doc.querySelectorAll('#settings-vol-master-slider, #volMasterSlider').forEach((el) => { el.value = master; el.style.setProperty('--fill-percent', `${master}%`); });
    doc.querySelectorAll('#settings-vol-sfx-slider, #volSfxSlider').forEach((el) => { el.value = sfx; el.style.setProperty('--fill-percent', `${sfx}%`); });
    doc.querySelectorAll('#settings-vol-ambient-slider, #volAmbientSlider').forEach((el) => { el.value = ambient; el.style.setProperty('--fill-percent', `${ambient}%`); });
    doc.querySelectorAll('#settings-vol-master-icon').forEach((el) => { el.textContent = master === 0 ? '🔇' : master < 40 ? '🔈' : master < 70 ? '🔉' : '🔊'; });
    doc.querySelectorAll('#settings-vol-sfx-icon').forEach((el) => { el.textContent = sfx === 0 ? '🔇' : sfx < 40 ? '🔈' : sfx < 70 ? '🔉' : '🔊'; });
    doc.querySelectorAll('#settings-vol-ambient-icon').forEach((el) => { el.textContent = ambient === 0 ? '🔇' : ambient < 40 ? '🔈' : ambient < 70 ? '🔉' : '🔊'; });
  },

  initEventHandlers(deps) {
    const doc = getBindingDoc(deps);
    const actions = deps.actions || {};

    registerFrontdoorBindings({
      actions,
      audio: deps.audioEngine,
      doc,
      getIsTitleScreen: () => deps.gs?.currentScreen === 'title',
      isEscapeKey,
      isVisibleModal: (element) => isVisibleModal(element, doc),
    });

    registerRunEntryBindings({
      actions,
      audio: deps.audioEngine,
      doc,
      feedbackUI: deps.FeedbackUI,
      mazeSystem: deps.MazeSystem,
    });
  },

  initHelpPauseUI(deps) {
    const doc = getBindingDoc(deps);
    const target = getHelpPauseBindingTarget(doc, deps);
    const helpPauseUI = resolveHelpPauseUI(doc, deps);
    if (!helpPauseUI || !doc || !target?.addEventListener) return;
    const helpPauseDeps = deps.getHelpPauseDeps();
    const liveHelpPauseDeps = {
      ...helpPauseDeps,
      doc,
      win: doc.defaultView || deps.win || null,
      getDeps: deps.getHelpPauseDeps,
    };
    helpPauseUI.showMobileWarning?.(liveHelpPauseDeps);
    if (target.__rootHelpPauseHotkeysBound) return;
    target.__rootHelpPauseHotkeysBound = true;
    target.addEventListener('keydown', (event) => {
      const liveHelpPauseUI = resolveHelpPauseUI(doc, deps) || helpPauseUI;
      const resolvedHelpPauseDeps = {
        ...(deps.getHelpPauseDeps?.() || {}),
        ...getLiveRunDeps(doc, deps),
        doc,
        win: doc.defaultView || deps.win || null,
      };
      if (isEscapeKey(event)) {
        const escapeHandled = handleLiveEscapeHotkey(event, {
          deps: resolvedHelpPauseDeps,
          doc,
          ui: doc?.defaultView?.HelpPauseUI || liveHelpPauseUI,
        });
        if (escapeHandled) return;
      }
      liveHelpPauseUI.handleGlobalHotkey?.(event, {
        deps: resolvedHelpPauseDeps,
        doc,
        ui: liveHelpPauseUI,
      });
    }, true);
  },
};
