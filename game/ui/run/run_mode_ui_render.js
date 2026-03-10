import {
  ensureRunConfig,
  getActiveSynergies,
  getDoc,
  getInscriptionEffectText,
  getMeta,
  reducedMotion,
} from './run_mode_ui_helpers.js';
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
  renderSummaryBar,
  syncModalMood,
};

export function renderInscriptionOverview(doc, meta, cfg, data) {
  const zone = doc.getElementById('rmInscriptionZone');
  if (!zone || !data?.inscriptions) return;

  const earned = Object.entries(meta?.inscriptions || {}).filter(([, value]) => Number(value) > 0);
  if (!earned.length) {
    zone.innerHTML = '';
    return;
  }

  const disabled = new Set(cfg?.disabledInscriptions || []);
  const activeCount = earned.filter(([id]) => !disabled.has(id)).length;
  const activeSyn = getActiveSynergies(meta, cfg, data);
  const allOff = activeCount === 0;

  zone.innerHTML = `
    <div class="rm-insc-section${allOff ? ' secret-glow' : ''}">
      <div class="rm-insc-header">
        <div class="rm-insc-title">🔮 보유 각인</div>
        <div class="rm-insc-controls">
          <div id="inscriptionSummary" class="rm-insc-summary">획득 ${earned.length}개 · 활성 <span class="ac">${activeCount}</span>개 · <span class="rm-insc-summary-hint">클릭으로 비활성화</span></div>
        </div>
      </div>
      <div class="rm-insc-grid">
        ${earned.map(([id, rawLevel]) => {
          const def = data.inscriptions[id];
          if (!def) return '';
          const lvl = Math.min(Math.max(1, Number(rawLevel) || 1), def.maxLevel || 1);
          const isOff = disabled.has(id);
          const levelsHtml = (def.levels || []).map((level, idx) => `
            <div class="rm-tt-level ${idx === lvl - 1 ? 'cur' : ''}">
              <span class="rm-tt-lv">Lv.${idx + 1}</span>${level?.desc || ''}
            </div>
          `).join('');
          return `
            <div class="rm-insc-pill rm-tt-host ${isOff ? 'off' : ''}" tabindex="0" role="checkbox" aria-checked="${isOff ? 'false' : 'true'}" data-action="toggle-inscription" data-id="${id}">
              <div class="rm-tt-box">
                <div class="rm-tt-name">${def.icon || ''} ${def.name}</div>
                <div class="rm-tt-levels">${levelsHtml}</div>
              </div>
              <div class="rm-insc-icon">${def.icon || '✦'}</div>
              <div class="rm-insc-info">
                <div class="rm-insc-name">${def.name}</div>
                <div class="rm-insc-effect">${isOff ? '비활성' : getInscriptionEffectText(def, lvl)}</div>
              </div>
              <div class="rm-insc-level">Lv.${lvl}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="rm-synergy-zone${activeSyn.length > 0 ? ' open' : ''}">
        <div class="rm-synergy-label">⚡ 활성 시너지</div>
        <div class="rm-synergy-chips">
          ${activeSyn.length > 0
            ? activeSyn.map(({ syn }) => `
                <span class="rm-synergy-chip">
                  <span class="rm-chip-i">${syn.icon || '✦'}</span>${syn.name}
                  ${syn.desc ? `<span class="rm-chip-desc">${syn.desc}</span>` : ''}
                </span>
              `).join('')
            : '<span class="rm-synergy-empty">활성 시너지가 없습니다.</span>'}
        </div>
      </div>
    </div>
  `;
}

export function flash(el) {
  if (!el || reducedMotion()) return;
  el.classList.remove('rm-select-flash');
  void el.offsetWidth;
  el.classList.add('rm-select-flash');
}

export function curseFlash(el, modalEl) {
  if (!el || reducedMotion()) return;
  el.classList.remove('rm-curse-flash');
  void el.offsetWidth;
  el.classList.add('rm-curse-flash');

  if (modalEl) {
    modalEl.classList.remove('rm-curse-shake');
    void modalEl.offsetWidth;
    modalEl.classList.add('rm-curse-shake');
    setTimeout(() => modalEl.classList.remove('rm-curse-shake'), 500);
  }

  const ripple = document.createElement('div');
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

export function refreshInscriptionPanel(ui, deps = {}) {
  const { gs } = deps;
  const data = deps.data || globalThis.DATA;
  const meta = getMeta(gs);
  if (!meta || !data?.inscriptions) return;

  const doc = getDoc(deps);
  const settingsPanel = doc.querySelector('#runSettingsModal .run-settings-panel');
  const summaryEl = doc.getElementById('inscriptionSummary');
  const layout = doc.getElementById('inscriptionLayout');
  const container = doc.getElementById('inscriptionToggles');
  const synergiesWrap = doc.getElementById('inscriptionSynergies');
  const toggleAllBtn = doc.getElementById('toggleAllInscriptionsBtn');

  if (!summaryEl || !layout || !container || !synergiesWrap || !toggleAllBtn) return;

  const runConfig = ensureRunConfig(meta);
  if (!runConfig) return;

  const insc = meta.inscriptions || {};
  const earnedInsc = Object.entries(insc).filter(([, v]) => Number(v) > 0);

  if (earnedInsc.length === 0) {
    const previewZone = doc.getElementById('rmInscriptionZone');
    if (previewZone) previewZone.innerHTML = '';
    layout.style.display = 'none';
    layout.dataset.open = 'false';
    settingsPanel?.classList.remove('run-settings-with-inscription-layout');
    return;
  }

  const disabledSet = new Set(runConfig.disabledInscriptions || []);
  const activeCount = earnedInsc.filter(([key]) => !disabledSet.has(key)).length;
  const allDisabled = activeCount === 0;
  settingsPanel?.classList.remove('run-settings-with-inscription-layout');

  summaryEl.textContent = `획득 ${earnedInsc.length}개 · 활성 ${activeCount}개`;
  layout.dataset.open = 'false';
  layout.style.display = 'none';

  toggleAllBtn.textContent = allDisabled ? '각인 모두 활성화' : '각인 없이 시작';
  toggleAllBtn.onclick = () => {
    if (allDisabled) runConfig.disabledInscriptions = [];
    else runConfig.disabledInscriptions = earnedInsc.map(([key]) => key);
    ui.refreshInscriptions(deps);
    renderHiddenEnding(meta, runConfig, doc);
    deps.saveMeta?.();
  };

  container.innerHTML = '';
  for (const [key, val] of earnedInsc) {
    const def = data.inscriptions[key];
    if (!def) continue;
    const lvl = Math.min(Math.max(1, Number(val) || 1), def.maxLevel || 1);
    const levelDef = def.levels?.[lvl - 1];
    const isOff = disabledSet.has(key);

    const pill = doc.createElement('div');
    pill.className = `inscription-pill${isOff ? '' : ' active'}`;
    pill.setAttribute('tabindex', '0');
    pill.setAttribute('role', 'checkbox');
    pill.setAttribute('aria-checked', isOff ? 'false' : 'true');
    pill.innerHTML = `
      <span class="inscription-label">${def.icon || ''} ${def.name}</span>
      <span class="inscription-level">Lv.${lvl}${levelDef?.desc ? ' · ' + levelDef.desc : ''}</span>
    `;

    const toggle = () => {
      ui.toggleInscription(key, deps);
      renderHiddenEnding(meta, runConfig, doc);
    };

    pill.onclick = toggle;
    pill.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });

    container.appendChild(pill);
  }

  synergiesWrap.innerHTML = '';
  const activeSyn = getActiveSynergies(meta, runConfig, data);
  if (activeSyn.length > 0) {
    const title = doc.createElement('span');
    title.className = 'synergy-title';
    title.textContent = '시너지:';
    synergiesWrap.appendChild(title);

    for (const { syn } of activeSyn) {
      const badge = doc.createElement('span');
      badge.className = 'synergy-badge';
      badge.textContent = `${syn.icon || ''} ${syn.name}`;
      badge.title = syn.desc || '';
      synergiesWrap.appendChild(badge);
    }
  } else {
    const empty = doc.createElement('span');
    empty.className = 'run-mode-desc';
    empty.style.cssText = 'font-size:11px;opacity:0.45;padding:6px 0';
    empty.textContent = '활성 시너지 없음';
    synergiesWrap.appendChild(empty);
  }

  renderInscriptionOverview(doc, meta, runConfig, data);
}
