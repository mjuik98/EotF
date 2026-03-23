import {
  ensureRunConfig,
  getActiveSynergies,
  getDoc,
  getInscriptionEffectText,
  getMeta,
} from './run_mode_ui_helpers.js';
import { renderHiddenEnding } from './run_mode_ui_summary_render.js';
import {
  createUiSurfaceStateController,
} from '../../ports/presentation_shared_state_capabilities.js';

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
          <div id="inscriptionSummary" class="rm-insc-summary" data-action="toggle-inscription-layout" style="cursor:pointer">획득 ${earned.length}개 · 활성 <span class="ac">${activeCount}</span>개 · <span class="rm-insc-summary-hint">클릭으로 상세 설정</span></div>
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

export function refreshInscriptionPanel(ui, deps = {}) {
  const { gs } = deps;
  const data = deps.data || null;
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
  const layoutSurface = createUiSurfaceStateController({ element: layout });

  const runConfig = ensureRunConfig(meta);
  if (!runConfig) return;

  const insc = meta.inscriptions || {};
  const earnedInsc = Object.entries(insc).filter(([, value]) => Number(value) > 0);

  if (earnedInsc.length === 0) {
    const previewZone = doc.getElementById('rmInscriptionZone');
    if (previewZone) previewZone.innerHTML = '';
    layout.style.display = 'none';
    layoutSurface.setOpen(false);
    settingsPanel?.classList.remove('run-settings-with-inscription-layout');
    return;
  }

  const disabledSet = new Set(runConfig.disabledInscriptions || []);
  const activeCount = earnedInsc.filter(([key]) => !disabledSet.has(key)).length;
  const allDisabled = activeCount === 0;

  const isOpen = layoutSurface.isOpen();
  layout.style.display = isOpen ? 'block' : 'none';
  if (isOpen) settingsPanel?.classList.add('run-settings-with-inscription-layout');
  else settingsPanel?.classList.remove('run-settings-with-inscription-layout');

  summaryEl.textContent = `획득 ${earnedInsc.length}개 · 활성 ${activeCount}개`;
  summaryEl.onclick = () => {
    const nowOpen = !layoutSurface.isOpen();
    layoutSurface.setOpen(nowOpen);
    layout.style.display = nowOpen ? 'block' : 'none';
    if (nowOpen) settingsPanel?.classList.add('run-settings-with-inscription-layout');
    else settingsPanel?.classList.remove('run-settings-with-inscription-layout');
  };

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
