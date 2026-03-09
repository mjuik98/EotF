export function bindSettingsDomEvents(ui, doc) {
  if (!doc || ui._boundDoc === doc) return;
  ui._boundDoc = doc;

  doc.querySelectorAll('.settings-tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ui.setTab(btn.dataset.tab, ui._getLiveDeps(doc));
    });
  });

  const bindVolume = (type) => {
    const slider = doc.getElementById(`settings-vol-${type}-slider`);
    slider?.addEventListener('input', (event) => {
      ui.applyVolume(type, event?.target?.value, ui._getLiveDeps(doc));
    });
    const icon = doc.getElementById(`settings-vol-${type}-icon`);
    icon?.addEventListener('click', () => {
      ui.muteToggle(type, ui._getLiveDeps(doc));
    });
  };
  bindVolume('master');
  bindVolume('sfx');
  bindVolume('ambient');

  const bindVisualToggle = (key) => {
    const checkbox = doc.getElementById(`settings-visual-${key}`);
    checkbox?.addEventListener('change', (event) => {
      ui.applyVisual(key, Boolean(event?.target?.checked), ui._getLiveDeps(doc));
    });
  };
  bindVisualToggle('particles');
  bindVisualToggle('screenShake');
  bindVisualToggle('hitStop');
  bindVisualToggle('reducedMotion');

  doc.querySelectorAll('.settings-font-btn[data-font-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ui.applyAccessibility('fontSize', btn.dataset.fontSize, ui._getLiveDeps(doc));
    });
  });

  const highContrast = doc.getElementById('settings-access-highContrast');
  highContrast?.addEventListener('change', (event) => {
    ui.applyAccessibility('highContrast', Boolean(event?.target?.checked), ui._getLiveDeps(doc));
  });

  const tooltipDwell = doc.getElementById('settings-access-tooltipDwell');
  tooltipDwell?.addEventListener('change', (event) => {
    ui.applyAccessibility('tooltipDwell', Boolean(event?.target?.checked), ui._getLiveDeps(doc));
  });

  doc.querySelectorAll('.settings-keybind-btn[data-keybind]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ui.startRebind(btn.dataset.keybind, ui._getLiveDeps(doc));
    });
  });

  doc.querySelector('.settings-reset-btn')?.addEventListener('click', () => {
    ui.resetToDefaults(ui._getLiveDeps(doc));
  });
  doc.querySelector('.settings-close-btn')?.addEventListener('click', () => {
    ui.closeSettings(ui._getLiveDeps(doc));
  });
}
