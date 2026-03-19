import { reducedMotion } from './run_mode_ui_helpers.js';
import {
  refreshInscriptionPanel,
  renderInscriptionOverview,
} from './run_mode_ui_inscriptions_render.js';
import {
  renderDifficultyPanel,
  renderHiddenEnding,
  renderSummaryBar,
} from './run_mode_ui_summary_render.js';
import {
  renderPresetDialog,
  renderPresets,
  syncModalMood,
} from './run_mode_ui_presets_render.js';

export {
  renderDifficultyPanel,
  renderHiddenEnding,
  renderPresetDialog,
  renderPresets,
  refreshInscriptionPanel,
  renderInscriptionOverview,
  renderSummaryBar,
  syncModalMood,
};

export function flash(el) {
  if (!el || reducedMotion({ doc: el?.ownerDocument })) return;
  el.classList.remove('rm-select-flash');
  void el.offsetWidth;
  el.classList.add('rm-select-flash');
}

export function curseFlash(el, modalEl) {
  if (!el || reducedMotion({ doc: el?.ownerDocument || modalEl?.ownerDocument })) return;
  el.classList.remove('rm-curse-flash');
  void el.offsetWidth;
  el.classList.add('rm-curse-flash');

  if (modalEl) {
    modalEl.classList.remove('rm-curse-shake');
    void modalEl.offsetWidth;
    modalEl.classList.add('rm-curse-shake');
    setTimeout(() => modalEl.classList.remove('rm-curse-shake'), 500);
  }

  const doc = el?.ownerDocument || modalEl?.ownerDocument || null;
  const ripple = doc?.createElement?.('div');
  if (!ripple) return;
  ripple.className = 'rm-curse-ripple';
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

export function renderOptionGrid(container, items, selected, type, doc) {
  if (!container) return;

  const isCurse = type === 'curse';
  container.innerHTML = '';

  for (const opt of items) {
    const isSelected = opt.id === selected;
    const isNone = opt.id === 'none';

    const card = doc.createElement('button');
    card.type = 'button';
    card.className = `rm-opt option-modifier${isCurse ? ' curse' : ''}${isSelected ? ' selected' : ''}${isNone ? ' none-opt' : ''}`;
    card.dataset.id = opt.id;
    card.dataset.action = 'select-curse';
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    card.setAttribute('tabindex', isSelected ? '0' : '-1');
    card.setAttribute('aria-label', `${opt.name}: ${opt.desc || ''}`);

    card.innerHTML = `
      <div class="rm-opt-check">✓</div>
      <div class="rm-opt-icon">${opt.icon || '*'}</div>
      <div class="rm-opt-name">${opt.name}${opt.isNew ? '<span class="rm-new-badge">NEW</span>' : ''}</div>
      <div class="rm-opt-desc">${opt.desc || ''}</div>
    `;

    container.appendChild(card);
  }
}

export function renderPanel(ui, doc, cfg, meta, runRules, gs, data) {
  const panel = doc.getElementById('runModePanel');
  if (!panel) return;

  renderDifficultyPanel(panel, cfg, meta, runRules, gs);
  renderPresets(ui, doc, cfg, meta, runRules);
  renderOptionGrid(doc.getElementById('rmCurseGrid'), Object.values(runRules.curses || {}), cfg.curse, 'curse', doc);
  renderInscriptionOverview(doc, meta, cfg, data);
  renderHiddenEnding(meta, cfg, doc);
  renderSummaryBar(doc, cfg, meta, runRules, gs, data);
}
