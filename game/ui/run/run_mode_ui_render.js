import {
  calcDiffScore,
  ensureRunConfig,
  escapeAttr,
  getActiveInscriptionCount,
  getActiveSynergies,
  getDiffLevel,
  getDoc,
  getEarnedInscriptionCount,
  getInscriptionEffectText,
  getMeta,
  getPresetSlots,
  reducedMotion,
} from './run_mode_ui_helpers.js';

export function renderSummaryBar(doc, cfg, meta, runRules, gs, data) {
  const zone = doc.getElementById('rmSummaryBarZone');
  if (!zone) return;

  const tags = [];
  const curse = runRules?.curses?.[cfg?.curse || 'none'];
  const score = calcDiffScore(runRules, gs);
  const reward = typeof runRules?.getRewardMultiplier === 'function'
    ? runRules.getRewardMultiplier(gs)
    : +(1 + score * 0.015).toFixed(2);
  const activeSyn = getActiveSynergies(meta, cfg, data);
  const earned = Object.entries(meta?.inscriptions || {}).filter(([, value]) => Number(value) > 0);
  const allOff = earned.length > 0 && earned.every(([key]) => (cfg?.disabledInscriptions || []).includes(key));

  tags.push({ tone: 'neutral', text: `A${cfg?.ascension || 0}` });
  if (cfg?.endless) tags.push({ tone: 'echo', text: '무한 모드' });
  if (curse && curse.id !== 'none') tags.push({ tone: 'danger', text: `${curse.icon || ''} ${curse.name}`.trim() });
  if (getActiveInscriptionCount(meta, cfg) > 0) tags.push({ tone: 'echo', text: `활성 각인 ${getActiveInscriptionCount(meta, cfg)}` });
  if (activeSyn.length > 0) tags.push({ tone: 'purple', text: `시너지 ${activeSyn.length}` });
  if (allOff) tags.push({ tone: 'secret', text: '각인 없이 시작' });

  zone.innerHTML = `
    <div class="rm-summary-bar${cfg?.curse && cfg.curse !== 'none' ? ' cursed' : ''}">
      <div class="rm-summary-title">현재 구성</div>
      <div class="rm-summary-tags">
        ${tags.map((tag) => `<span class="rm-summary-tag ${tag.tone}">${tag.text}</span>`).join('')}
      </div>
      <div class="rm-summary-reward-wrap">
        <span class="rm-summary-tag gold reward">보상 x${reward}</span>
      </div>
    </div>
  `;
}

export function renderPresets(ui, doc, cfg, meta, runRules) {
  const zone = doc.getElementById('rmPresetZone');
  if (!zone) return;

  const slots = getPresetSlots(meta);
  const selectedSlot = Math.max(0, Math.min(3, Number(ui._selectedPresetSlot) || 0));
  const selectedPreset = slots[selectedSlot]?.preset || null;
  zone.innerHTML = `
    <div class="rm-presets-wrap">
      <div class="rm-preset-bar">
        <div class="rm-preset-bar-label">프리셋</div>
        <div class="rm-preset-slot-group" role="tablist" aria-label="프리셋 슬롯">
          ${slots.map(({ index, preset }) => `
            <button
              type="button"
              class="rm-preset-slot-btn${index === selectedSlot ? ' active' : ''}${preset ? '' : ' empty'}"
              data-action="select-preset-slot"
              data-slot="${index}"
              role="tab"
              aria-selected="${index === selectedSlot ? 'true' : 'false'}"
              aria-label="${preset ? `프리셋 ${index + 1} 불러오기: ${preset.name || `프리셋 ${index + 1}`}` : `비어 있는 프리셋 슬롯 ${index + 1}`}"
            >${index + 1}</button>
          `).join('')}
        </div>
        <button type="button" class="rm-preset-save-btn" data-action="save-preset" data-slot="${selectedSlot}">
          + 현재 설정 저장
        </button>
      </div>
      <div class="rm-preset-inline-meta">${selectedPreset ? `
          <span class="rm-preset-inline-slot">슬롯 ${selectedSlot + 1}</span>
          <span class="rm-preset-inline-name">${selectedPreset.name || `프리셋 ${selectedSlot + 1}`}</span>
          <span class="rm-preset-inline-desc">
            A${selectedPreset.config?.ascension || 0}
            / ${selectedPreset.config?.endless ? '무한' : '일반'}
            / ${runRules?.curses?.[selectedPreset.config?.curse]?.name || '저주 없음'}
            / 각인 ${Array.isArray(selectedPreset.config?.disabledInscriptions)
              ? Math.max(0, getEarnedInscriptionCount(meta) - selectedPreset.config.disabledInscriptions.length)
              : getActiveInscriptionCount(meta, selectedPreset.config || {})}
          </span>
        ` : `
          <span class="rm-preset-inline-slot empty">슬롯 ${selectedSlot + 1}</span>
          <span class="rm-preset-inline-name empty">빈 슬롯</span>
          <span class="rm-preset-inline-desc empty">이 슬롯을 선택한 뒤 현재 설정을 저장할 수 있습니다.</span>
        `}
      </div>
    </div>
  `;
}

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

export function renderPresetDialog(ui, doc, deps = {}) {
  const existing = doc.getElementById('rmPresetDialog');
  existing?.remove();

  const state = ui._presetDialog;
  if (!state?.open) return;

  const overlay = doc.createElement('div');
  overlay.id = 'rmPresetDialog';
  overlay.className = 'rm-preset-dialog-backdrop';
  overlay.innerHTML = `
    <div class="rm-preset-dialog" role="dialog" aria-modal="true" aria-labelledby="rmPresetDialogTitle">
      <div class="rm-preset-dialog-kicker">프리셋 저장</div>
      <div id="rmPresetDialogTitle" class="rm-preset-dialog-title">이 구성을 저장합니다</div>
      <div class="rm-preset-dialog-desc">슬롯 ${state.slot + 1}에 현재 승천, 모드, 저주, 각인 설정을 저장합니다.</div>
      <input id="rmPresetNameInput" class="rm-preset-input" type="text" maxlength="32" value="${escapeAttr(state.name || '')}" placeholder="프리셋 이름" />
      <div class="rm-preset-dialog-actions">
        <button type="button" class="rm-preset-btn subtle" data-action="cancel-preset-save">취소</button>
        <button type="button" class="rm-preset-btn primary" data-action="confirm-preset-save">저장</button>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (actionTarget) {
      if (actionTarget.dataset.action === 'cancel-preset-save') {
        ui.closePresetDialog(deps);
        return;
      }
      if (actionTarget.dataset.action === 'confirm-preset-save') {
        ui.confirmPresetSave(deps);
        return;
      }
    }
    if (event.target === overlay) ui.closePresetDialog(deps);
  });

  doc.body.appendChild(overlay);
  const input = doc.getElementById('rmPresetNameInput');
  input?.focus();
  input?.select();
}

export function syncModalMood(doc, cfg) {
  const cursed = !!(cfg?.curse && cfg.curse !== 'none');
  doc.body?.classList?.toggle('run-rules-curse-active', cursed);
  doc.getElementById('runSettingsModal')?.classList?.toggle('cursed', cursed);
  doc.querySelector('#runSettingsModal .run-settings-panel')?.classList?.toggle('cursed', cursed);
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

export function renderHiddenEnding(meta, cfg, doc) {
  const zone = doc.getElementById('rmHiddenEndingZone');
  if (!zone) return;

  const insc = meta.inscriptions || {};
  const earned = Object.entries(insc).filter(([, v]) => Number(v) > 0);
  const disabled = new Set(cfg.disabledInscriptions || []);
  const allOff = earned.length > 0 && earned.every(([key]) => disabled.has(key));

  if (!allOff) {
    zone.innerHTML = '';
    return;
  }

  zone.innerHTML = `
    <div class="rm-hidden-banner">
      <div class="rm-hidden-icon">*</div>
      <div class="rm-hidden-body">
        <div class="rm-hidden-title">히든 엔딩 조건 충족</div>
        <div class="rm-hidden-desc">각인을 모두 비활성화한 채 시작하면 숨겨진 결말에 도달할 수 있습니다.</div>
        <div class="rm-hidden-tag">각인 없는 런</div>
      </div>
    </div>
  `;
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

  const maxAsc = Math.max(0, meta.maxAscension || 0);
  const ascUnlocked = !!meta.unlocks?.ascension;
  const endlessUnlocked = !!meta.unlocks?.endless;

  const score = calcDiffScore(runRules, gs);
  const diff = getDiffLevel(score);
  const rewardMultiplier = typeof runRules?.getRewardMultiplier === 'function'
    ? runRules.getRewardMultiplier(gs)
    : +(1 + score * 0.015).toFixed(2);

  const ascColor = cfg.ascension === 0
    ? 'var(--rm-echo, #00ffcc)'
    : `hsl(${Math.round(60 - ((cfg.ascension || 0) / Math.max(1, maxAsc)) * 60)}, 90%, 62%)`;

  panel.innerHTML = `
    <div id="rmPresetZone"></div>

    <div class="rm-top-row">
      <div class="rm-top-card">
        <div class="rm-card-label">승천 단계</div>
        <div class="rm-stepper">
          <button class="rm-step-btn" type="button" data-action="shift-asc" data-delta="-1" ${!ascUnlocked || cfg.ascension <= 0 ? 'disabled' : ''} aria-label="승천 감소">-</button>
          <span class="rm-asc-val" style="color:${ascColor}">A${cfg.ascension}</span>
          <button class="rm-step-btn" type="button" data-action="shift-asc" data-delta="1" ${!ascUnlocked || cfg.ascension >= maxAsc ? 'disabled' : ''} aria-label="승천 증가">+</button>
        </div>
        <div class="rm-sub-text">${cfg.ascension === 0 ? '기본 난이도입니다' : `적 능력치 +${cfg.ascension * 20}%`}</div>
        <div class="rm-lock-badge" style="display:${ascUnlocked ? 'none' : ''}">챕터 2 클리어 시 해금</div>
      </div>

      <div class="rm-top-card">
        <div class="rm-card-label">무한 모드</div>
        <div class="rm-endless-row">
          <button id="endlessToggleBtn" type="button" role="switch" class="rm-toggle${cfg.endless ? ' on' : ''}${!endlessUnlocked ? ' locked' : ''}" data-action="toggle-endless" aria-checked="${cfg.endless}" aria-label="무한 모드 토글" ${!endlessUnlocked ? 'disabled' : ''}></button>
          <span class="rm-toggle-label${cfg.endless ? ' on' : ''}">${cfg.endless ? '켜짐' : '꺼짐'}</span>
        </div>
        <div class="rm-sub-text">보스 처치 후 다음 순환으로 진행</div>
        <div class="rm-lock-badge" style="display:${endlessUnlocked ? 'none' : ''}">메타 진행도로 해금</div>
      </div>

      <div class="rm-top-card">
        <div class="rm-card-label">난이도 점수</div>
        <div class="rm-diff-header">
          <span class="rm-diff-num" style="color:${diff.color};text-shadow:0 0 20px ${diff.color}55">${score}</span>
          <span class="rm-diff-label" style="color:${diff.color}">${diff.label}</span>
        </div>
        <div class="rm-diff-bar-track">
          <div class="rm-diff-bar-fill" style="width:${Math.min(100, score * 1.4)}%;background:linear-gradient(90deg,${diff.color}88,${diff.color})"></div>
        </div>
        <div class="rm-diff-bottom">
          <span class="rm-diff-desc">${diff.desc}</span>
          <span class="rm-diff-reward">보상 x${rewardMultiplier}</span>
        </div>
      </div>
    </div>

    <div class="rm-section-label">저주 선택 <span class="rm-section-hint">난이도 상승</span></div>
    <div id="rmCurseGrid" class="rm-option-grid" role="radiogroup" aria-label="저주 선택"></div>

    <div id="rmInscriptionZone"></div>

    <div id="rmHiddenEndingZone"></div>
    <div id="rmSummaryBarZone"></div>
  `;

  renderPresets(ui, doc, cfg, meta, runRules);
  renderOptionGrid(doc.getElementById('rmCurseGrid'), Object.values(runRules.curses || {}), cfg.curse, 'curse', doc);
  renderInscriptionOverview(doc, meta, cfg, data);
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
