import { getDoc } from './run_mode_ui_helpers.js';

export function bindRunModePanelEvents(ui, deps = {}) {
  const doc = getDoc(deps);
  const panel = doc.getElementById('runModePanel');
  if (!panel || panel.dataset.bound === 'true') return;

  panel.dataset.bound = 'true';

  panel.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === 'shift-asc') {
      ui.shiftAscension(Number(target.dataset.delta) || 0, deps);
      return;
    }
    if (action === 'toggle-endless') {
      ui.toggleEndlessMode(deps);
      return;
    }
    if (action === 'select-curse') {
      ui.selectCurse(id, deps);
      return;
    }
    if (action === 'toggle-inscription') {
      ui.toggleInscription(id, deps);
      return;
    }
    if (action === 'select-preset-slot') {
      ui.selectPresetSlot(Number(target.dataset.slot), deps);
      return;
    }
    if (action === 'save-preset') {
      ui.savePreset(Number(target.dataset.slot), deps);
      return;
    }
    if (action === 'confirm-preset-save') {
      ui.confirmPresetSave(deps);
      return;
    }
    if (action === 'cancel-preset-save') {
      ui.closePresetDialog(deps);
      return;
    }
    if (action === 'load-preset') {
      ui.loadPreset(Number(target.dataset.slot), deps);
      return;
    }
    if (action === 'delete-preset') {
      ui.deletePreset(Number(target.dataset.slot), deps);
      return;
    }
    if (action === 'apply-daily-challenge') {
      ui.applyDailyChallenge(deps);
    }
  });

  panel.addEventListener('keydown', (event) => {
    const inscPill = event.target.closest('.rm-insc-pill');
    if (inscPill && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      ui.toggleInscription(inscPill.dataset.id, deps);
      return;
    }

    const card = event.target.closest('.rm-opt');
    if (!card) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.click();
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = card.nextElementSibling;
      if (next) next.focus();
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = card.previousElementSibling;
      if (prev) prev.focus();
    }

    if (event.key === 'Escape' && ui._presetDialog?.open) {
      event.preventDefault();
      ui.closePresetDialog(deps);
    }
  });

  if (doc.body?.dataset?.runRulesEscBound !== 'true') {
    if (doc.body?.dataset) doc.body.dataset.runRulesEscBound = 'true';

    doc.addEventListener('keydown', (event) => {
      const modal = doc.getElementById('runSettingsModal');
      if (modal?.style.display === 'none') return;

      if (event.key === 'Escape') {
        event.preventDefault();
        if (ui._presetDialog?.open) {
          ui.closePresetDialog(deps);
          return;
        }
        ui.closeSettings(deps);
        return;
      }
      if (event.key === 'Enter' && event.target?.id === 'rmPresetNameInput') {
        event.preventDefault();
        ui.confirmPresetSave(deps);
      }
    });
  }

  const closeBtn = doc.getElementById('closeRunSettingsBtn');
  if (closeBtn && closeBtn.dataset.bound !== 'true') {
    closeBtn.dataset.bound = 'true';
    closeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      ui.closeSettings(deps);
    });
  }
}
