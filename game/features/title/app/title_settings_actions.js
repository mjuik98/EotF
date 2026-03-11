import { setVolume } from './title_action_helpers.js';

export function createTitleSettingsActions(context) {
  const { doc, modules, ports, saveVolumes } = context;

  return {
    openRunSettings() {
      context.playClick();
      modules.RunModeUI?.openSettings?.(ports.getRunModeDeps());
    },

    closeRunSettings() {
      modules.RunModeUI?.closeSettings?.(ports.getRunModeDeps());
    },

    refreshRunModePanel() {
      modules.RunModeUI?.refresh?.(ports.getRunModeDeps());
      modules.RunModeUI?.refreshInscriptions?.(ports.getRunModeDeps());
    },

    shiftAscension(delta) {
      modules.RunModeUI?.shiftAscension?.(delta, ports.getRunModeDeps());
      modules.RunModeUI?.refreshInscriptions?.(ports.getRunModeDeps());
    },

    toggleEndlessMode() {
      modules.RunModeUI?.toggleEndlessMode?.(ports.getRunModeDeps());
    },

    cycleRunCurse() {
      modules.RunModeUI?.cycleCurse?.(ports.getRunModeDeps());
    },

    selectRunCurse(id) {
      modules.RunModeUI?.selectCurse?.(id, ports.getRunModeDeps());
    },

    selectFragment(effect) {
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

    openSettings() {
      modules.SettingsUI?.openSettings?.(ports.getSettingsDeps());
    },

    closeSettings() {
      modules.SettingsUI?.closeSettings?.(ports.getSettingsDeps());
    },

    setSettingsTab(tab) {
      modules.SettingsUI?.setTab?.(tab, ports.getSettingsDeps());
    },

    resetSettings() {
      modules.SettingsUI?.resetToDefaults?.(ports.getSettingsDeps());
    },

    applySettingVolume(type, value) {
      modules.SettingsUI?.applyVolume?.(type, value, ports.getSettingsDeps());
    },

    applySettingVisual(key, value) {
      modules.SettingsUI?.applyVisual?.(key, value, ports.getSettingsDeps());
    },

    applySettingAccessibility(key, value) {
      modules.SettingsUI?.applyAccessibility?.(key, value, ports.getSettingsDeps());
    },

    startSettingsRebind(action) {
      modules.SettingsUI?.startRebind?.(action, ports.getSettingsDeps());
    },

    toggleSettingMute(type) {
      modules.SettingsUI?.muteToggle?.(type, ports.getSettingsDeps());
    },
  };
}
