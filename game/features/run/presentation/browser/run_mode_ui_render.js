import { reducedMotion } from './run_mode_ui_helpers.js';
import { highlightRunModeText } from './run_mode_text_highlight.js';
import {
  buildUnlockRoadmap,
  getContentVisibility,
  getUnlockRequirementLabel,
} from '../../../meta_progression/public.js';
import {
  refreshInscriptionPanel,
  renderInscriptionOverview,
} from './run_mode_ui_inscriptions_render.js';
import {
  renderDifficultyPanel,
  renderHiddenEnding,
  renderSummaryBar,
  renderUnlockRoadmap,
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
  renderUnlockRoadmap,
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
    const isLockedVisible = opt.visibility === 'locked-visible';

    const card = doc.createElement('button');
    card.type = 'button';
    card.disabled = isLockedVisible;
    card.className = `rm-opt option-modifier${isCurse ? ' curse' : ''}${isSelected ? ' selected' : ''}${isNone ? ' none-opt' : ''}${isLockedVisible ? ' locked' : ''}`;
    card.dataset.id = opt.id;
    card.dataset.action = 'select-curse';
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-disabled', isLockedVisible ? 'true' : 'false');
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    card.setAttribute('tabindex', isSelected && !isLockedVisible ? '0' : '-1');
    card.setAttribute('aria-label', `${opt.name}: ${opt.desc || ''}${isLockedVisible ? `, ${opt.unlockHint || '해금 필요'}` : ''}`);

    card.innerHTML = `
      <div class="rm-opt-check">✓</div>
      <div class="rm-opt-icon">${opt.icon || '*'}</div>
      <div class="rm-opt-name">${opt.name}${opt.isNew ? '<span class="rm-new-badge">NEW</span>' : ''}</div>
      <div class="rm-opt-desc">${highlightRunModeText(opt.desc || '')}</div>
      ${isLockedVisible ? `<div class="rm-opt-lock">${opt.unlockHint || '해금 필요'}</div>` : ''}
    `;

    container.appendChild(card);
  }
}

export function buildCurseOptionEntries({ meta, runRules } = {}) {
  return Object.values(runRules?.curses || {})
    .map((curse) => {
      if (curse.id === 'none') {
        return {
          ...curse,
          visibility: 'visible',
          unlockHint: '',
        };
      }

      const visibility = getContentVisibility(meta, { type: 'curse', id: curse.id });
      if (visibility === 'hidden') return null;

      return {
        ...curse,
        visibility,
        unlockHint: getUnlockRequirementLabel({ type: 'curse', id: curse.id }),
      };
    })
    .filter(Boolean);
}

export function renderPanel(ui, doc, cfg, meta, runRules, gs, data) {
  const panel = doc.getElementById('runModePanel');
  if (!panel) return;

  renderDifficultyPanel(panel, cfg, meta, runRules, gs);
  renderPresets(ui, doc, cfg, meta, runRules);
  renderOptionGrid(doc.getElementById('rmCurseGrid'), buildCurseOptionEntries({ meta, runRules }), cfg.curse, 'curse', doc);
  renderInscriptionOverview(doc, meta, cfg, data);
  renderUnlockRoadmap(doc, buildUnlockRoadmap(meta, { classId: gs?.player?.class }));
  renderHiddenEnding(meta, cfg, doc);
  renderSummaryBar(doc, cfg, meta, runRules, gs, data);
}
