import { SettingsManager } from '../../../core/settings_manager.js';
import { registerTitleBindings } from '../../../features/title/ports/runtime/public_title_runtime_surface.js';
import { registerRunEntryBindings } from '../../../features/run/ports/runtime/public_run_runtime_surface.js';
import { isEscapeKey, isVisibleModal } from './root_binding_helpers.js';

export const RootBindings = {
  boot(deps) {
    const fallbackDoc = typeof document !== 'undefined' ? document : null;
    this.loadVolumes(deps.audioEngine);
    deps.settingsUI?.applyOnBoot?.({
      doc: fallbackDoc,
      ScreenShake: deps.ScreenShake,
      HitStop: deps.HitStop,
      ParticleSystem: deps.ParticleSystem,
    });
    this.syncVolumeUI(deps.audioEngine);
    this.initEventHandlers(deps);
    this.initHelpPauseUI(deps);
    deps.gameBootUI?.bootGame?.(deps.getGameBootDeps());
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

  syncVolumeUI(audioEngine) {
    if (!audioEngine) return;
    const volumes = audioEngine.getVolumes();
    const master = Math.round(volumes.master * 100);
    const sfx = Math.round(volumes.sfx * 100);
    const ambient = Math.round(volumes.ambient * 100);
    const doc = typeof document !== 'undefined' ? document : null;
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
    const fallbackDoc = typeof document !== 'undefined' ? document : null;
    const doc = deps.doc || fallbackDoc;
    const actions = deps.actions || {};

    registerTitleBindings({
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
    if (!deps.helpPauseUI) return;
    const helpPauseDeps = deps.getHelpPauseDeps();
    deps.helpPauseUI.showMobileWarning?.(helpPauseDeps);
    deps.helpPauseUI.bindGlobalHotkeys?.(helpPauseDeps);
  },
};
