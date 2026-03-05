function _getDoc(deps) {
  return deps?.doc || document;
}

function _getMeta(gs) {
  return gs?.meta || null;
}

function _ensureRunConfig(meta) {
  if (!meta) return null;
  if (!meta.runConfig) {
    meta.runConfig = { ascension: 0, endless: false, blessing: 'none', curse: 'none', disabledInscriptions: [] };
  }
  if (!Array.isArray(meta.runConfig.disabledInscriptions)) {
    meta.runConfig.disabledInscriptions = [];
  }
  return meta.runConfig;
}

function _getInscriptionLevel(meta, runConfig, id) {
  if (!meta?.inscriptions) return 0;
  if (runConfig?.disabledInscriptions?.includes(id)) return 0;
  const val = meta.inscriptions[id];
  if (typeof val === 'boolean') return val ? 1 : 0;
  return Math.max(0, Math.floor(Number(val) || 0));
}

function _getActiveSynergies(meta, runConfig, data) {
  if (!data?.synergies) return [];
  const active = [];
  outer: for (const [id, syn] of Object.entries(data.synergies)) {
    for (const req of id.split('+')) {
      if (_getInscriptionLevel(meta, runConfig, req) < 1) continue outer;
    }
    active.push({ id, syn });
  }
  return active;
}

const DIFF_LEVELS = [
  { max: 0, label: '일반', color: '#778899', desc: '안정적인 여정' },
  { max: 15, label: '도전', color: '#ffcc00', desc: '약간의 긴장감' },
  { max: 30, label: '고난', color: '#ff8800', desc: '전략적 운영 필요' },
  { max: 50, label: '극한', color: '#ff3344', desc: '실수가 치명적' },
  { max: 999, label: '지옥', color: '#cc33ff', desc: '숙련자 전용' },
];

const CONFLICTS = [
  {
    b: 'vigor',
    c: 'frail',
    msg: '활력의 축복과 허약의 저주가 서로 상쇄됩니다.',
    net: '실효: 최대 HP +5',
  },
  {
    b: 'vigor',
    c: 'decay',
    msg: '초반 최대 HP는 늘어나지만 전투 종료마다 감소합니다.',
    net: '실효: 장기전에서 HP 손실 누적',
  },
  {
    b: 'wealth',
    c: 'tax',
    msg: '초기 골드는 늘어나지만 상점 비용도 함께 증가합니다.',
    net: '실효: 초반 구매 유연성 증가, 후반 효율 감소',
  },
  {
    b: 'spark',
    c: 'silence',
    msg: '초반 3턴 에너지 제한으로 잔향 활용 타이밍이 제한됩니다.',
    net: '실효: 초반 전개 템포 감소',
  },
];

function _calcDiffScore(runRules, gs) {
  if (typeof runRules?.getDifficultyScore === 'function') return runRules.getDifficultyScore(gs);
  const cfg = gs?.runConfig || {};
  const asc = runRules?.getAscension?.(gs) || 0;
  let score = asc * 15;
  if (cfg.endless || cfg.endlessMode) score += 10;
  const curseWeight = { tax: 5, fatigue: 10, frail: 8, decay: 10, silence: 8 };
  const blessWeight = { vigor: -5, wealth: -5, spark: -4, forge: -8 };
  score += curseWeight[cfg.curse || 'none'] || 0;
  score += blessWeight[cfg.blessing || 'none'] || 0;
  return Math.max(0, score);
}

function _getDiffLevel(score) {
  return DIFF_LEVELS.find((item) => score <= item.max) || DIFF_LEVELS[DIFF_LEVELS.length - 1];
}

function _getConflict(blessing, curse) {
  return CONFLICTS.find((item) => item.b === blessing && item.c === curse) || null;
}

function _reducedMotion() {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}

function _flash(el) {
  if (!el || _reducedMotion()) return;
  el.classList.remove('rm-select-flash');
  void el.offsetWidth;
  el.classList.add('rm-select-flash');
}

function _curseFlash(el, modalEl) {
  if (!el || _reducedMotion()) return;
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

function _renderConflict(cfg, doc) {
  const zone = doc.getElementById('rmConflictZone');
  if (!zone) return;

  const conflict = _getConflict(cfg.blessing || 'none', cfg.curse || 'none');
  if (!conflict) {
    zone.innerHTML = '';
    return;
  }

  zone.innerHTML = `
    <div class="rm-conflict-banner">
      <div class="rm-conflict-icon">⚠</div>
      <div class="rm-conflict-body">
        <div class="rm-conflict-title">조합 충돌 경고</div>
        <div class="rm-conflict-desc">${conflict.msg}</div>
        <div class="rm-conflict-net">${conflict.net}</div>
      </div>
    </div>
  `;
}

function _renderHiddenEnding(meta, cfg, doc) {
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
      <div class="rm-hidden-icon">✦</div>
      <div class="rm-hidden-body">
        <div class="rm-hidden-title">히든 엔딩 조건 충족</div>
        <div class="rm-hidden-desc">각인을 모두 비활성화한 채 여정을 시작하면 숨겨진 결말에 도달할 수 있습니다.</div>
        <div class="rm-hidden-tag">NO INSCRIPTION RUN</div>
      </div>
    </div>
  `;
}

function _renderOptionGrid(container, items, selected, type, doc) {
  if (!container) return;

  const isCurse = type === 'curse';
  const blessing = type === 'blessing' ? selected : (doc.querySelector('#rmBlessingGrid .rm-opt.selected')?.dataset.id || 'none');
  const curse = type === 'curse' ? selected : (doc.querySelector('#rmCurseGrid .rm-opt.selected')?.dataset.id || 'none');
  const conflict = _getConflict(blessing, curse);

  container.innerHTML = '';

  for (const opt of items) {
    const isSelected = opt.id === selected;
    const isNone = opt.id === 'none';
    const isConflict = conflict && ((type === 'blessing' && opt.id === conflict.b) || (type === 'curse' && opt.id === conflict.c));

    const card = doc.createElement('button');
    card.type = 'button';
    card.className = `rm-opt ${isCurse ? 'curse' : 'blessing'}${isSelected ? ' selected' : ''}${isNone ? ' none-opt' : ''}${isConflict ? ' conflict' : ''}`;
    card.dataset.id = opt.id;
    card.dataset.action = isCurse ? 'select-curse' : 'select-blessing';
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    card.setAttribute('tabindex', isSelected ? '0' : '-1');
    card.setAttribute('aria-label', `${opt.name}: ${opt.desc || ''}`);

    card.innerHTML = `
      <div class="rm-opt-check">✓</div>
      <div class="rm-opt-icon">${opt.icon || '•'}</div>
      <div class="rm-opt-name">${opt.name}${opt.isNew ? '<span class="rm-new-badge">NEW</span>' : ''}</div>
      <div class="rm-opt-desc">${opt.desc || ''}</div>
      ${isConflict ? '<div class="rm-conflict-dot" title="조합 충돌">⚠</div>' : ''}
    `;

    container.appendChild(card);
  }
}

function _bindPanelEvents(deps = {}) {
  const doc = _getDoc(deps);
  const panel = doc.getElementById('runModePanel');
  if (!panel || panel.dataset.bound === 'true') return;

  panel.dataset.bound = 'true';

  panel.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === 'shift-asc') {
      RunModeUI.shiftAscension(Number(target.dataset.delta) || 0, deps);
      return;
    }
    if (action === 'toggle-endless') {
      RunModeUI.toggleEndlessMode(deps);
      return;
    }
    if (action === 'select-blessing') {
      RunModeUI.selectBlessing(id, deps);
      return;
    }
    if (action === 'select-curse') {
      RunModeUI.selectCurse(id, deps);
      return;
    }
  });

  panel.addEventListener('keydown', (event) => {
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
  });
}

function _renderPanel(doc, cfg, meta, runRules, gs) {
  const panel = doc.getElementById('runModePanel');
  if (!panel) return;

  const maxAsc = Math.max(0, meta.maxAscension || 0);
  const ascUnlocked = !!meta.unlocks?.ascension;
  const endlessUnlocked = !!meta.unlocks?.endless;

  const score = _calcDiffScore(runRules, gs);
  const diff = _getDiffLevel(score);
  const rewardMultiplier = typeof runRules?.getRewardMultiplier === 'function'
    ? runRules.getRewardMultiplier(gs)
    : +(1 + score * 0.015).toFixed(2);

  const ascColor = cfg.ascension === 0
    ? 'var(--rm-echo, #00ffcc)'
    : `hsl(${Math.round(60 - ((cfg.ascension || 0) / Math.max(1, maxAsc)) * 60)}, 90%, 62%)`;

  panel.innerHTML = `
    <div class="rm-top-row">
      <div class="rm-top-card">
        <div class="rm-card-label">승천 단계</div>
        <div class="rm-stepper">
          <button class="rm-step-btn" type="button" data-action="shift-asc" data-delta="-1" ${!ascUnlocked || cfg.ascension <= 0 ? 'disabled' : ''} aria-label="승천 감소">−</button>
          <span class="rm-asc-val" style="color:${ascColor}">A${cfg.ascension}</span>
          <button class="rm-step-btn" type="button" data-action="shift-asc" data-delta="1" ${!ascUnlocked || cfg.ascension >= maxAsc ? 'disabled' : ''} aria-label="승천 증가">+</button>
        </div>
        <div class="rm-sub-text">${cfg.ascension === 0 ? '기본 난이도' : `적 능력치 +${cfg.ascension * 20}%`}</div>
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
        <div class="rm-card-label">난이도 지수</div>
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

    <div id="rmConflictZone"></div>

    <div class="rm-section-label">축복 선택 <span class="rm-section-hint">시작 보너스</span></div>
    <div id="rmBlessingGrid" class="rm-option-grid" role="radiogroup" aria-label="축복 선택"></div>

    <div class="rm-section-label">저주 선택 <span class="rm-section-hint">난이도 상승</span></div>
    <div id="rmCurseGrid" class="rm-option-grid" role="radiogroup" aria-label="저주 선택"></div>

    <div class="run-mode-row inscription-row" id="inscriptionRow" style="display:none;">
      <span class="run-mode-label">보유 각인</span>
      <div class="run-inscription-controls">
        <span id="inscriptionSummary" class="run-inscription-summary"></span>
        <button id="toggleInscriptionLayoutBtn" class="run-mode-pill" type="button">각인 상세</button>
      </div>
    </div>

    <div id="rmHiddenEndingZone"></div>
  `;

  _renderConflict(cfg, doc);

  _renderOptionGrid(doc.getElementById('rmBlessingGrid'), Object.values(runRules.blessings || {}), cfg.blessing, 'blessing', doc);
  _renderOptionGrid(doc.getElementById('rmCurseGrid'), Object.values(runRules.curses || {}), cfg.curse, 'curse', doc);
}

export const RunModeUI = {
  refresh(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const doc = _getDoc(deps);
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    _renderPanel(doc, cfg, meta, runRules, gs);
    _bindPanelEvents(deps);

    this.refreshInscriptions(deps);
    _renderHiddenEnding(meta, cfg, doc);
  },

  selectBlessing(id, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);
    cfg.blessing = runRules.blessings[id] ? id : 'none';

    const doc = _getDoc(deps);
    const card = doc.querySelector(`#rmBlessingGrid .rm-opt[data-id="${cfg.blessing}"]`);
    _flash(card);

    this.refresh(deps);
    deps.saveMeta?.();
  },

  selectCurse(id, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);
    cfg.curse = runRules.curses[id] ? id : 'none';

    const doc = _getDoc(deps);
    const card = doc.querySelector(`#rmCurseGrid .rm-opt[data-id="${cfg.curse}"]`);
    const modal = doc.querySelector('#runSettingsModal .run-settings-panel');
    if (cfg.curse !== 'none') _curseFlash(card, modal);
    else _flash(card);

    this.refresh(deps);
    deps.saveMeta?.();
  },

  cycleBlessing(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);
    cfg.blessing = runRules.nextBlessingId(cfg.blessing || 'none');

    this.refresh(deps);
    deps.saveMeta?.();
  },

  cycleCurse(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);
    cfg.curse = runRules.nextCurseId(cfg.curse || 'none');

    this.refresh(deps);
    deps.saveMeta?.();
  },

  shiftAscension(delta, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    if (!meta.unlocks?.ascension) {
      this.refresh(deps);
      return;
    }

    const cur = Number.isFinite(cfg.ascension) ? cfg.ascension : 0;
    const maxAsc = Math.max(0, meta.maxAscension || 0);
    cfg.ascension = Math.max(0, Math.min(maxAsc, cur + (delta < 0 ? -1 : 1)));

    this.refresh(deps);
    deps.saveMeta?.();
  },

  toggleEndlessMode(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    if (!meta.unlocks?.endless) {
      deps.notice?.('무한 모드는 아직 잠겨 있습니다.');
      this.refresh(deps);
      return;
    }

    cfg.endless = !cfg.endless;
    this.refresh(deps);
    deps.saveMeta?.();
  },

  refreshInscriptions(deps = {}) {
    const { gs } = deps;
    const data = deps.data || globalThis.DATA;
    const meta = _getMeta(gs);
    if (!meta || !data?.inscriptions) return;

    const doc = _getDoc(deps);
    const settingsPanel = doc.querySelector('#runSettingsModal .run-settings-panel');
    const row = doc.getElementById('inscriptionRow');
    const summaryEl = doc.getElementById('inscriptionSummary');
    const toggleLayoutBtn = doc.getElementById('toggleInscriptionLayoutBtn');
    const layout = doc.getElementById('inscriptionLayout');
    const container = doc.getElementById('inscriptionToggles');
    const synergiesWrap = doc.getElementById('inscriptionSynergies');
    const toggleAllBtn = doc.getElementById('toggleAllInscriptionsBtn');

    if (!row || !summaryEl || !toggleLayoutBtn || !layout || !container || !synergiesWrap || !toggleAllBtn) return;

    const runConfig = _ensureRunConfig(meta);
    if (!runConfig) return;

    const insc = meta.inscriptions || {};
    const earnedInsc = Object.entries(insc).filter(([, v]) => Number(v) > 0);

    if (earnedInsc.length === 0) {
      row.style.display = 'none';
      layout.style.display = 'none';
      layout.dataset.open = 'false';
      settingsPanel?.classList.remove('run-settings-with-inscription-layout');
      return;
    }

    row.style.display = '';

    const disabledSet = new Set(runConfig.disabledInscriptions || []);
    const activeCount = earnedInsc.filter(([key]) => !disabledSet.has(key)).length;
    const allDisabled = activeCount === 0;
    const isLayoutOpen = layout.dataset.open === 'true';
    settingsPanel?.classList.toggle('run-settings-with-inscription-layout', isLayoutOpen);

    summaryEl.textContent = `획득 ${earnedInsc.length}개 · 활성 ${activeCount}개`;

    toggleLayoutBtn.classList.toggle('active', isLayoutOpen);
    toggleLayoutBtn.textContent = isLayoutOpen ? '닫기' : '각인 상세';
    toggleLayoutBtn.onclick = () => {
      layout.dataset.open = isLayoutOpen ? 'false' : 'true';
      layout.style.display = isLayoutOpen ? 'none' : '';
      this.refreshInscriptions(deps);
    };

    toggleAllBtn.textContent = allDisabled ? '각인 모두 활성화' : '각인 없이 시작';
    toggleAllBtn.onclick = () => {
      if (allDisabled) runConfig.disabledInscriptions = [];
      else runConfig.disabledInscriptions = earnedInsc.map(([key]) => key);
      this.refreshInscriptions(deps);
      _renderHiddenEnding(meta, runConfig, doc);
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
        this.toggleInscription(key, deps);
        _renderHiddenEnding(meta, runConfig, doc);
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
    const activeSyn = _getActiveSynergies(meta, runConfig, data);
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
  },

  toggleInscription(key, deps = {}) {
    const { gs } = deps;
    const meta = _getMeta(gs);
    if (!meta) return;

    const runConfig = _ensureRunConfig(meta);
    if (!runConfig) return;

    const arr = runConfig.disabledInscriptions;
    const idx = arr.indexOf(key);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(key);

    this.refreshInscriptions(deps);
    deps.saveMeta?.();
  },

  openSettings(deps = {}) {
    const doc = _getDoc(deps);
    const modal = doc.getElementById('runSettingsModal');
    if (!modal) return;

    modal.classList.remove('fade-out');
    modal.style.display = 'flex';
    modal.classList.add('fade-in');

    const layout = doc.getElementById('inscriptionLayout');
    if (layout) {
      layout.dataset.open = 'false';
      layout.style.display = 'none';
    }

    doc.querySelector('#runSettingsModal .run-settings-panel')?.classList.remove('run-settings-with-inscription-layout');

    this.refresh(deps);
    this.refreshInscriptions(deps);
  },

  closeSettings(deps = {}) {
    const doc = _getDoc(deps);
    const modal = doc.getElementById('runSettingsModal');
    if (!modal) return;

    const layout = doc.getElementById('inscriptionLayout');
    if (layout) {
      layout.dataset.open = 'false';
      layout.style.display = 'none';
    }

    doc.querySelector('#runSettingsModal .run-settings-panel')?.classList.remove('run-settings-with-inscription-layout');

    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');

    const onEnd = () => {
      modal.style.display = 'none';
      modal.classList.remove('fade-out');
      modal.removeEventListener('animationend', onEnd);
    };

    modal.addEventListener('animationend', onEnd);
    setTimeout(() => {
      if (modal.style.display !== 'none') onEnd();
    }, 250);
  },
};
