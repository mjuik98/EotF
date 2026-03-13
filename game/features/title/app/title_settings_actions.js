import { setVolume } from './title_action_helpers.js';
import { ensureRunFlowBrowserModules } from '../../run/platform/browser/ensure_run_flow_browser_modules.js';
import { ensureSettingsBrowserModules } from '../../ui/platform/browser/ensure_settings_browser_modules.js';

export function createTitleSettingsActions(context) {
  const { doc, modules, ports, saveVolumes } = context;

  async function ensureRunModeUI() {
    const { RunModeUI } = await ensureRunFlowBrowserModules(modules);
    return RunModeUI;
  }

  async function ensureSettingsUI() {
    const { SettingsUI } = await ensureSettingsBrowserModules(modules);
    return SettingsUI;
  }

  return {
    async openRunSettings() {
      context.playClick();
      const runModeUI = await ensureRunModeUI();
      runModeUI?.openSettings?.(ports.getRunModeDeps());
    },

    closeRunSettings() {
      modules.RunModeUI?.closeSettings?.(ports.getRunModeDeps());
    },

    refreshRunModePanel() {
      if (!modules.RunModeUI) return;
      modules.RunModeUI?.refresh?.(ports.getRunModeDeps());
      modules.RunModeUI?.refreshInscriptions?.(ports.getRunModeDeps());
    },

    async shiftAscension(delta) {
      const runModeUI = await ensureRunModeUI();
      runModeUI?.shiftAscension?.(delta, ports.getRunModeDeps());
      runModeUI?.refreshInscriptions?.(ports.getRunModeDeps());
    },

    async toggleEndlessMode() {
      const runModeUI = await ensureRunModeUI();
      runModeUI?.toggleEndlessMode?.(ports.getRunModeDeps());
    },

    async cycleRunCurse() {
      const runModeUI = await ensureRunModeUI();
      runModeUI?.cycleCurse?.(ports.getRunModeDeps());
    },

    async selectRunCurse(id) {
      const runModeUI = await ensureRunModeUI();
      runModeUI?.selectCurse?.(id, ports.getRunModeDeps());
    },

    selectFragment(effect) {
      modules.MetaProgressionUI?.selectFragment?.(effect, ports.getMetaProgressionDeps());
    },

    selectEndingFragment(effect) {
      if (typeof modules.MetaProgressionUI?.selectEndingFragment === 'function') {
        modules.MetaProgressionUI.selectEndingFragment(effect, ports.getMetaProgressionDeps());
        return;
      }
      modules.MetaProgressionUI?.selectFragment?.(effect, ports.getMetaProgressionDeps());
    },

    advanceToNextRegion(overrideDeps = {}) {
      const baseDeps = ports.getRegionTransitionDeps();
      modules.RegionTransitionUI?.advanceToNextRegion?.({ ...baseDeps, ...overrideDeps });
    },

    setMasterVolume(value) {
      setVolume({
        applyFn: (normalized) => modules.AudioEngine?.setVolume?.(normalized),
        doc,
        saveVolumes,
        selectors: [
          '#settings-vol-master-val, #volMasterSliderVal',
          '#settings-vol-master-slider, #volMasterSlider',
        ],
        value,
      });
    },

    setSfxVolume(value) {
      setVolume({
        applyFn: (normalized) => modules.AudioEngine?.setSfxVolume?.(normalized),
        doc,
        saveVolumes,
        selectors: [
          '#settings-vol-sfx-val, #volSfxSliderVal',
          '#settings-vol-sfx-slider, #volSfxSlider',
        ],
        value,
      });
    },

    setAmbientVolume(value) {
      setVolume({
        applyFn: (normalized) => modules.AudioEngine?.setAmbientVolume?.(normalized),
        doc,
        saveVolumes,
        selectors: [
          '#settings-vol-ambient-val, #volAmbientSliderVal',
          '#settings-vol-ambient-slider, #volAmbientSlider',
        ],
        value,
      });
    },

    async openSettings() {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.openSettings?.(ports.getSettingsDeps());
    },

    closeSettings() {
      modules.SettingsUI?.closeSettings?.(ports.getSettingsDeps());
    },

    async setSettingsTab(tab) {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.setTab?.(tab, ports.getSettingsDeps());
    },

    async resetSettings() {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.resetToDefaults?.(ports.getSettingsDeps());
    },

    async applySettingVolume(type, value) {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.applyVolume?.(type, value, ports.getSettingsDeps());
    },

    async applySettingVisual(key, value) {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.applyVisual?.(key, value, ports.getSettingsDeps());
    },

    async applySettingAccessibility(key, value) {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.applyAccessibility?.(key, value, ports.getSettingsDeps());
    },

    async startSettingsRebind(action) {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.startRebind?.(action, ports.getSettingsDeps());
    },

    async toggleSettingMute(type) {
      const settingsUI = await ensureSettingsUI();
      settingsUI?.muteToggle?.(type, ports.getSettingsDeps());
    },
  };
}
