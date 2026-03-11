export function buildLegacyGameAPISettingsBindings(_modules, fns) {
  return {
    openSettings: fns.openSettings,
    closeSettings: fns.closeSettings,
    setSettingsTab: fns.setSettingsTab,
    resetSettings: fns.resetSettings,
    applySettingVolume: fns.applySettingVolume,
    applySettingVisual: fns.applySettingVisual,
    applySettingAccessibility: fns.applySettingAccessibility,
    startSettingsRebind: fns.startSettingsRebind,
    toggleSettingMute: fns.toggleSettingMute,
  };
}
