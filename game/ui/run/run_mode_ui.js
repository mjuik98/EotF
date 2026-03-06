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

function _formatSigned(value) {
  const n = Number(value) || 0;
  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return '0';
}

function _cloneRunConfig(cfg) {
  return {
    ascension: Math.max(0, Math.floor(Number(cfg?.ascension) || 0)),
    endless: !!cfg?.endless,
    blessing: String(cfg?.blessing || 'none'),
    curse: String(cfg?.curse || 'none'),
    disabledInscriptions: Array.isArray(cfg?.disabledInscriptions)
      ? [...new Set(cfg.disabledInscriptions.map((id) => String(id)))]
      : [],
  };
}

function _getPresetSlots(meta) {
  const slots = Array.from({ length: 4 }, (_, idx) => ({
    index: idx,
    preset: Array.isArray(meta?.runConfigPresets) ? meta.runConfigPresets[idx] || null : null,
  }));
  return slots;
}

function _formatRunAge(ts) {
  const value = Number(ts) || 0;
  if (!value) return '-';
  const diffMin = Math.max(0, Math.floor((Date.now() - value) / 60000));
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

function _escapeAttr(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function _getActiveInscriptionCount(meta, cfg) {
  const earned = Object.entries(meta?.inscriptions || {}).filter(([, value]) => Number(value) > 0);
  const disabled = new Set(cfg?.disabledInscriptions || []);
  return earned.filter(([id]) => !disabled.has(id)).length;
}

function _getEarnedInscriptionCount(meta) {
  return Object.values(meta?.inscriptions || {}).filter((value) => Number(value) > 0).length;
}

function _getInscriptionEffectText(def, lvl) {
  const levelDef = def?.levels?.[Math.max(0, lvl - 1)];
  return String(levelDef?.desc || def?.desc || '효과 정보 없음');
}

function _getStartStatSnapshot(meta, cfg, runRules, gs, data) {
  const player = gs?.player || {};
  const snapshot = {
    maxHp: Math.max(1, Number(player.maxHp) || 1),
    hp: Math.max(1, Number(player.hp) || Number(player.maxHp) || 1),
    gold: Math.max(0, Number(player.gold) || 0),
    echo: Math.max(0, Number(player.echo) || 0),
    maxEcho: Math.max(0, Number(player.maxEcho) || Number(player.echo) || 100),
  };
  const baseline = { ...snapshot };

  const asc = runRules?.getAscension?.(gs) || 0;
  const ascHpLoss = Math.min(20, asc * 2);
  if (ascHpLoss > 0) {
    snapshot.maxHp = Math.max(1, snapshot.maxHp - ascHpLoss);
    snapshot.hp = Math.min(snapshot.hp, snapshot.maxHp);
  }

  const blessing = cfg?.blessing || 'none';
  if (blessing === 'vigor') {
    snapshot.maxHp += 15;
    snapshot.hp = Math.min(snapshot.maxHp, snapshot.hp + 15);
  } else if (blessing === 'wealth') {
    snapshot.gold += 35;
  } else if (blessing === 'spark') {
    snapshot.echo = Math.min(snapshot.maxEcho, snapshot.echo + 30);
  }

  const curse = cfg?.curse || 'none';
  if (curse === 'frail') {
    snapshot.maxHp = Math.max(1, snapshot.maxHp - 10);
    snapshot.hp = Math.min(snapshot.hp, snapshot.maxHp);
  }

  const tempGs = { player: snapshot };
  for (const [id, rawLevel] of Object.entries(meta?.inscriptions || {})) {
    if ((cfg?.disabledInscriptions || []).includes(id)) continue;
    const level = Math.max(0, Math.floor(Number(rawLevel) || 0));
    if (!level) continue;
    const def = data?.inscriptions?.[id];
    const apply = def?.levels?.[Math.min(level, def?.maxLevel || level) - 1]?.apply;
    if (typeof apply === 'function') {
      try {
        apply(tempGs);
      } catch (_) {
        // Ignore inscription effects that are not valid in preview math.
      }
    }
  }

  snapshot.hp = Math.min(snapshot.hp, snapshot.maxHp);
  snapshot.echo = Math.min(snapshot.echo, snapshot.maxEcho);

  return {
    baseline,
    current: snapshot,
    delta: {
      hp: snapshot.maxHp - baseline.maxHp,
      gold: snapshot.gold - baseline.gold,
      echo: snapshot.echo - baseline.echo,
    },
  };
}

function _renderStatSimulator(doc, cfg, meta, runRules, gs, data) {
  const zone = doc.getElementById('rmStatSimZone');
  if (!zone) return;

  const stats = _getStartStatSnapshot(meta, cfg, runRules, gs, data);
  const maxHpRef = Math.max(stats.baseline.maxHp, stats.current.maxHp, 1);
  const goldRef = Math.max(stats.baseline.gold, stats.current.gold, 1);
  const echoRef = Math.max(stats.baseline.maxEcho, stats.current.maxEcho, 1);
  const curse = cfg?.curse || 'none';

  const cards = [
    {
      key: 'hp',
      label: '최대 HP',
      value: stats.current.maxHp,
      delta: stats.delta.hp,
      note: curse === 'decay' ? '전투 종료 후 최대 HP가 추가로 감소합니다' : '시작 최대 체력 기준',
      width: `${Math.max(10, (stats.current.maxHp / maxHpRef) * 100)}%`,
    },
    {
      key: 'gold',
      label: '골드',
      value: stats.current.gold,
      delta: stats.delta.gold,
      note: curse === 'tax' ? '상점 비용 +20%가 적용됩니다' : '시작 골드 기준',
      width: `${Math.max(10, (stats.current.gold / goldRef) * 100)}%`,
    },
    {
      key: 'echo',
      label: '잔향',
      value: stats.current.echo,
      delta: stats.delta.echo,
      note: curse === 'silence' ? '초반 3턴 동안 에너지가 제한됩니다' : '시작 잔향 기준',
      width: `${Math.max(10, (stats.current.echo / echoRef) * 100)}%`,
    },
  ];

  zone.innerHTML = `
    <div class="rm-stat-sim${curse !== 'none' ? ' cursed' : ''}">
      <div class="rm-section-label">시작 스탯 시뮬레이션 <span class="rm-section-hint">현재 설정 기준</span></div>
      <div class="rm-stat-grid">
        ${cards.map((card) => `
          <div class="rm-stat-card ${card.key}${card.delta > 0 ? ' buffed' : ''}${card.delta < 0 ? ' nerfed' : ''}">
            <div class="rm-stat-label">${card.label}</div>
            <div class="rm-stat-val-row">
              <span class="rm-stat-base">${card.value}</span>
              <span class="rm-stat-delta ${card.delta > 0 ? 'pos' : card.delta < 0 ? 'neg' : 'none'}">${_formatSigned(card.delta)}</span>
            </div>
            <div class="rm-stat-bar-track">
              <div class="rm-stat-bar-fill" style="width:${card.width}"></div>
            </div>
            <div class="rm-stat-desc">${card.note}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function _renderSummaryBar(doc, cfg, meta, runRules, gs, data) {
  const zone = doc.getElementById('rmSummaryBarZone');
  if (!zone) return;

  const tags = [];
  const blessing = runRules?.blessings?.[cfg?.blessing || 'none'];
  const curse = runRules?.curses?.[cfg?.curse || 'none'];
  const score = _calcDiffScore(runRules, gs);
  const reward = typeof runRules?.getRewardMultiplier === 'function'
    ? runRules.getRewardMultiplier(gs)
    : +(1 + score * 0.015).toFixed(2);
  const activeSyn = _getActiveSynergies(meta, cfg, data);
  const earned = Object.entries(meta?.inscriptions || {}).filter(([, value]) => Number(value) > 0);
  const allOff = earned.length > 0 && earned.every(([key]) => (cfg?.disabledInscriptions || []).includes(key));

  tags.push({ tone: 'neutral', text: `A${cfg?.ascension || 0}` });
  if (cfg?.endless) tags.push({ tone: 'echo', text: '무한 모드' });
  if (blessing && blessing.id !== 'none') tags.push({ tone: 'echo', text: `${blessing.icon || ''} ${blessing.name}`.trim() });
  if (curse && curse.id !== 'none') tags.push({ tone: 'danger', text: `${curse.icon || ''} ${curse.name}`.trim() });
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

function _renderPresets(doc, cfg, meta, runRules) {
  const zone = doc.getElementById('rmPresetZone');
  if (!zone) return;

  const slots = _getPresetSlots(meta);
  const selectedSlot = Math.max(0, Math.min(3, Number(RunModeUI._selectedPresetSlot) || 0));
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
            / ${runRules?.blessings?.[selectedPreset.config?.blessing]?.name || '축복 없음'}
            / ${runRules?.curses?.[selectedPreset.config?.curse]?.name || '저주 없음'}
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

function _renderRunHistory(doc, cfg, meta, runRules, gs) {
  const zone = doc.getElementById('rmHistoryZone');
  if (!zone) return;

  const history = Array.isArray(meta?.runHistory) ? meta.runHistory.slice(0, 5) : [];
  const last = history[0] || null;
  const score = _calcDiffScore(runRules, gs);
  const compare = last ? score - (Number(last.score) || 0) : 0;

  zone.innerHTML = `
    <div class="rm-history-wrap">
      <div class="rm-section-label">최근 런 <span class="rm-section-hint">직전 기록 비교</span></div>
      <div class="rm-history-compare${last && last.result === 'defeat' ? ' defeat' : ''}">
        <div class="rm-history-kicker">직전 런</div>
        ${last ? `
          <div class="rm-history-main">
            <span class="rm-history-result ${last.result}">${last.result === 'victory' ? '승리' : '패배'}</span>
            <span class="rm-history-score">${last.score}점</span>
            <span class="rm-history-delta ${compare > 0 ? 'up' : compare < 0 ? 'down' : 'same'}">${compare === 0 ? '직전과 동일 난이도' : `직전 대비 ${_formatSigned(compare)}`}</span>
          </div>
          <div class="rm-history-sub">A${last.ascension || 0} / ${last.endless ? '무한' : '일반'} / ${runRules?.blessings?.[last.blessing]?.icon || ''} ${runRules?.blessings?.[last.blessing]?.name || '축복 없음'} / ${runRules?.curses?.[last.curse]?.icon || ''} ${runRules?.curses?.[last.curse]?.name || '저주 없음'} / ${_formatRunAge(last.at)}</div>
        ` : `
          <div class="rm-history-main empty">아직 완료한 런이 없습니다</div>
          <div class="rm-history-sub">한 번 완료하면 난이도, 경로, 수정자 흐름을 여기서 비교할 수 있습니다.</div>
        `}
      </div>
      <div class="rm-history-strip">
        ${history.length ? history.map((entry) => `
          <div class="rm-history-chip ${entry.result}">
            <span class="rm-history-chip-result">${entry.result === 'victory' ? '승' : '패'}</span>
            <span class="rm-history-chip-score">${entry.score}</span>
            <span class="rm-history-chip-meta">A${entry.ascension || 0}${entry.endless ? ' / 무한' : ''}</span>
            <span class="rm-history-chip-icons">${runRules?.blessings?.[entry.blessing]?.icon || ''}${runRules?.curses?.[entry.curse]?.icon || ''}</span>
            <span class="rm-history-chip-label">${runRules?.curses?.[entry.curse]?.name || '저주 없음'}</span>
          </div>
        `).join('') : '<div class="rm-history-empty">런을 완료하면 최근 기록이 여기에 쌓입니다.</div>'}
      </div>
    </div>
  `;
}

function _renderInscriptionOverview(doc, meta, cfg, data, deps = {}) {
  const zone = doc.getElementById('rmInscriptionZone');
  if (!zone || !data?.inscriptions) return;

  const earned = Object.entries(meta?.inscriptions || {}).filter(([, value]) => Number(value) > 0);
  if (!earned.length) {
    zone.innerHTML = '';
    return;
  }

  const disabled = new Set(cfg?.disabledInscriptions || []);
  const activeCount = earned.filter(([id]) => !disabled.has(id)).length;
  const activeSyn = _getActiveSynergies(meta, cfg, data);
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
                <div class="rm-insc-effect">${isOff ? '비활성' : _getInscriptionEffectText(def, lvl)}</div>
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

function _renderPresetDialog(doc, deps = {}) {
  const existing = doc.getElementById('rmPresetDialog');
  existing?.remove();

  const state = RunModeUI._presetDialog;
  if (!state?.open) return;

  const overlay = doc.createElement('div');
  overlay.id = 'rmPresetDialog';
  overlay.className = 'rm-preset-dialog-backdrop';
  overlay.innerHTML = `
    <div class="rm-preset-dialog" role="dialog" aria-modal="true" aria-labelledby="rmPresetDialogTitle">
      <div class="rm-preset-dialog-kicker">프리셋 저장</div>
      <div id="rmPresetDialogTitle" class="rm-preset-dialog-title">이 구성을 저장합니다</div>
      <div class="rm-preset-dialog-desc">슬롯 ${state.slot + 1}에 현재 승천, 모드, 축복, 저주, 각인 설정을 저장합니다.</div>
      <input id="rmPresetNameInput" class="rm-preset-input" type="text" maxlength="32" value="${_escapeAttr(state.name || '')}" placeholder="프리셋 이름" />
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
        RunModeUI.closePresetDialog(deps);
        return;
      }
      if (actionTarget.dataset.action === 'confirm-preset-save') {
        RunModeUI.confirmPresetSave(deps);
        return;
      }
    }
    if (event.target === overlay) RunModeUI.closePresetDialog(deps);
  });

  doc.body.appendChild(overlay);
  const input = doc.getElementById('rmPresetNameInput');
  input?.focus();
  input?.select();
}

function _syncModalMood(doc, cfg) {
  const cursed = !!(cfg?.curse && cfg.curse !== 'none');
  doc.body?.classList?.toggle('run-rules-curse-active', cursed);
  doc.getElementById('runSettingsModal')?.classList?.toggle('cursed', cursed);
  doc.querySelector('#runSettingsModal .run-settings-panel')?.classList?.toggle('cursed', cursed);
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
      <div class="rm-conflict-icon">!</div>
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
      <div class="rm-hidden-icon">*</div>
      <div class="rm-hidden-body">
        <div class="rm-hidden-title">히든 엔딩 조건 충족</div>
        <div class="rm-hidden-desc">각인을 모두 비활성화한 채 시작하면 숨겨진 결말에 도달할 수 있습니다.</div>
        <div class="rm-hidden-tag">각인 없는 런</div>
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
      <div class="rm-opt-icon">${opt.icon || '*'}</div>
      <div class="rm-opt-name">${opt.name}${opt.isNew ? '<span class="rm-new-badge">NEW</span>' : ''}</div>
      <div class="rm-opt-desc">${opt.desc || ''}</div>
      ${isConflict ? '<div class="rm-conflict-dot" title="조합 충돌">*</div>' : ''}
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
    if (action === 'toggle-inscription') {
      RunModeUI.toggleInscription(id, deps);
      return;
    }
    if (action === 'select-preset-slot') {
      RunModeUI.selectPresetSlot(Number(target.dataset.slot), deps);
      return;
    }
    if (action === 'save-preset') {
      RunModeUI.savePreset(Number(target.dataset.slot), deps);
      return;
    }
    if (action === 'confirm-preset-save') {
      RunModeUI.confirmPresetSave(deps);
      return;
    }
    if (action === 'cancel-preset-save') {
      RunModeUI.closePresetDialog(deps);
      return;
    }
    if (action === 'load-preset') {
      RunModeUI.loadPreset(Number(target.dataset.slot), deps);
      return;
    }
    if (action === 'delete-preset') {
      RunModeUI.deletePreset(Number(target.dataset.slot), deps);
      return;
    }
  });

  panel.addEventListener('keydown', (event) => {
    const inscPill = event.target.closest('.rm-insc-pill');
    if (inscPill && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      RunModeUI.toggleInscription(inscPill.dataset.id, deps);
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

    if (event.key === 'Escape' && RunModeUI._presetDialog?.open) {
      event.preventDefault();
      RunModeUI.closePresetDialog(deps);
    }
  });

  if (doc.body?.dataset?.runRulesEscBound === 'true') return;
  if (doc.body?.dataset) doc.body.dataset.runRulesEscBound = 'true';

  doc.addEventListener('keydown', (event) => {
    const modal = doc.getElementById('runSettingsModal');
    if (modal?.style.display === 'none') return;

    if (event.key === 'Escape') {
      event.preventDefault();
      if (RunModeUI._presetDialog?.open) {
        RunModeUI.closePresetDialog(deps);
        return;
      }
      RunModeUI.closeSettings(deps);
      return;
    }
    if (event.key === 'Enter' && event.target?.id === 'rmPresetNameInput') {
      event.preventDefault();
      RunModeUI.confirmPresetSave(deps);
    }
  });

  const closeBtn = doc.getElementById('closeRunSettingsBtn');
  if (closeBtn && closeBtn.dataset.bound !== 'true') {
    closeBtn.dataset.bound = 'true';
    closeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      RunModeUI.closeSettings(deps);
    });
  }
}

function _renderPanel(doc, cfg, meta, runRules, gs, data) {
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

    <div id="rmConflictZone"></div>

    <div class="rm-section-label">축복 선택 <span class="rm-section-hint">시작 보너스</span></div>
    <div id="rmBlessingGrid" class="rm-option-grid" role="radiogroup" aria-label="축복 선택"></div>

    <div class="rm-section-label">저주 선택 <span class="rm-section-hint">난이도 상승</span></div>
    <div id="rmCurseGrid" class="rm-option-grid" role="radiogroup" aria-label="저주 선택"></div>

    <div id="rmStatSimZone"></div>
    <div id="rmInscriptionZone"></div>

    <div id="rmHiddenEndingZone"></div>
    <div id="rmHistoryZone"></div>
    <div id="rmSummaryBarZone"></div>
  `;

  _renderPresets(doc, cfg, meta, runRules);
  _renderConflict(cfg, doc);

  _renderOptionGrid(doc.getElementById('rmBlessingGrid'), Object.values(runRules.blessings || {}), cfg.blessing, 'blessing', doc);
  _renderOptionGrid(doc.getElementById('rmCurseGrid'), Object.values(runRules.curses || {}), cfg.curse, 'curse', doc);
  _renderStatSimulator(doc, cfg, meta, runRules, gs, data);
  _renderInscriptionOverview(doc, meta, cfg, data);
  _renderRunHistory(doc, cfg, meta, runRules, gs);
  _renderSummaryBar(doc, cfg, meta, runRules, gs, data);
}

export const RunModeUI = {
  _selectedPresetSlot: 0,

  refresh(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const doc = _getDoc(deps);
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    _renderPanel(doc, cfg, meta, runRules, gs, deps.data || globalThis.DATA);
    _bindPanelEvents(deps);
    _renderPresetDialog(doc, deps);
    _syncModalMood(doc, cfg);

    this.refreshInscriptions(deps);
    _renderHiddenEnding(meta, cfg, doc);
  },

  selectPresetSlot(slot, deps = {}) {
    const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
    this._selectedPresetSlot = idx;

    const { gs } = deps;
    const meta = _getMeta(gs);
    const preset = meta?.runConfigPresets?.[idx];
    if (preset?.config) {
      this.loadPreset(idx, deps);
      return;
    }

    this.refresh(deps);
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

  savePreset(slot, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const idx = Math.max(0, Math.min(3, Math.floor(Number.isFinite(slot) ? slot : this._selectedPresetSlot) || 0));
    this._selectedPresetSlot = idx;
    const existing = meta.runConfigPresets[idx];
    this._presetDialog = {
      open: true,
      slot: idx,
      name: existing?.name || `프리셋 ${idx + 1}`,
    };
    _renderPresetDialog(_getDoc(deps), deps);
  },

  closePresetDialog(deps = {}) {
    this._presetDialog = null;
    _getDoc(deps).getElementById('rmPresetDialog')?.remove();
  },

  confirmPresetSave(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules || !this._presetDialog?.open) return;
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);
    const doc = _getDoc(deps);
    const idx = Math.max(0, Math.min(3, Math.floor(Number(this._presetDialog.slot) || 0)));
    const existing = meta.runConfigPresets[idx];
    const rawName = doc.getElementById('rmPresetNameInput')?.value ?? this._presetDialog.name;
    const fallbackName = existing?.name || `프리셋 ${idx + 1}`;

    meta.runConfigPresets[idx] = {
      id: existing?.id || `preset-${idx + 1}`,
      name: String(rawName || fallbackName).trim().slice(0, 32) || fallbackName,
      config: _cloneRunConfig(cfg),
    };

    this._presetDialog = null;
    this.refresh(deps);
    deps.saveMeta?.();
    deps.notice?.('프리셋을 저장했습니다.');
  },

  loadPreset(slot, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);
    const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
    this._selectedPresetSlot = idx;
    const preset = meta.runConfigPresets[idx];
    if (!preset?.config) return;

    Object.assign(cfg, _cloneRunConfig(preset.config));
    cfg.ascension = Math.max(0, Math.min(meta.maxAscension || 0, cfg.ascension));
    if (!meta.unlocks?.endless) cfg.endless = false;
    if (!runRules.blessings[cfg.blessing]) cfg.blessing = 'none';
    if (!runRules.curses[cfg.curse]) cfg.curse = 'none';

    this.refresh(deps);
    deps.saveMeta?.();
    deps.notice?.('프리셋을 불러왔습니다.');
  },

  deletePreset(slot, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;
    const meta = _getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
    this._selectedPresetSlot = idx;
    if (!meta.runConfigPresets[idx]) return;
    meta.runConfigPresets[idx] = null;
    meta.runConfigPresets = meta.runConfigPresets.slice(0, 4);

    this.refresh(deps);
    deps.saveMeta?.();
    deps.notice?.('프리셋을 삭제했습니다.');
  },

  refreshInscriptions(deps = {}) {
    const { gs } = deps;
    const data = deps.data || globalThis.DATA;
    const meta = _getMeta(gs);
    if (!meta || !data?.inscriptions) return;

    const doc = _getDoc(deps);
    const settingsPanel = doc.querySelector('#runSettingsModal .run-settings-panel');
    const summaryEl = doc.getElementById('inscriptionSummary');
    const layout = doc.getElementById('inscriptionLayout');
    const container = doc.getElementById('inscriptionToggles');
    const synergiesWrap = doc.getElementById('inscriptionSynergies');
    const toggleAllBtn = doc.getElementById('toggleAllInscriptionsBtn');

    if (!summaryEl || !layout || !container || !synergiesWrap || !toggleAllBtn) return;

    const runConfig = _ensureRunConfig(meta);
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

    _renderInscriptionOverview(doc, meta, runConfig, data, deps);
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

    this.refresh(deps);
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
    this.closePresetDialog(deps);
    doc.body?.classList?.remove('run-rules-curse-active');
    modal.classList.remove('cursed');
    doc.querySelector('#runSettingsModal .run-settings-panel')?.classList.remove('cursed');

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


