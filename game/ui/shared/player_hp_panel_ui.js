function _getDoc(deps = {}) {
  return deps.doc || document;
}

function _createEl(doc, tag, className) {
  const el = doc.createElement(tag);
  if (className) el.className = className;
  return el;
}

function _resolveStatusEffectsUI(deps = {}) {
  return deps.StatusEffectsUI
    || deps.statusEffectsUI
    || globalThis.GAME?.Modules?.StatusEffectsUI
    || globalThis.GAME?.Modules?.['StatusEffectsUI'];
}

export function getPlayerHpPanelLevel(gs) {
  const hp = Math.max(0, Number(gs?.player?.hp) || 0);
  const maxHp = Math.max(1, Number(gs?.player?.maxHp) || 1);
  const ratio = hp / maxHp;
  if (ratio <= 0.2) return 'critical';
  if (ratio <= 0.4) return 'low';
  if (ratio <= 0.65) return 'mid';
  return 'safe';
}

function _buildPlayerHpPanel(doc, gs, deps = {}, options = {}) {
  const hp = Math.max(0, Number(gs?.player?.hp) || 0);
  const maxHp = Math.max(1, Number(gs?.player?.maxHp) || 1);
  const shield = Math.max(0, Number(gs?.player?.shield) || 0);
  const hpPct = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
  const level = getPlayerHpPanelLevel(gs);
  const panelId = options.panelId || 'ncFloatingHpPanel';
  const statusContainerId = options.statusContainerId || `${panelId}StatusBadges`;
  const palette = {
    critical: {
      bar: 'linear-gradient(90deg, #550010, #990022, #cc2244)',
      barGlow: 'rgba(204, 34, 68, 0.8)',
      num: 'var(--danger)',
      numGlow: 'rgba(255, 34, 68, 0.85)',
    },
    low: {
      bar: 'linear-gradient(90deg, #771122, #bb2244, #ee4455)',
      barGlow: 'rgba(187, 34, 68, 0.5)',
      num: '#ff6677',
      numGlow: 'rgba(255, 80, 100, 0.45)',
    },
    mid: {
      bar: 'linear-gradient(90deg, #775500, #c49010, #e8b830)',
      barGlow: 'rgba(200, 150, 20, 0.3)',
      num: 'var(--gold)',
      numGlow: 'rgba(240, 180, 41, 0.3)',
    },
    safe: {
      bar: 'linear-gradient(90deg, #004d22, #009944, #00bb66)',
      barGlow: 'rgba(0, 160, 70, 0.28)',
      num: '#44dd88',
      numGlow: 'rgba(68, 220, 136, 0.28)',
    },
  }[level];

  const wrap = doc.createElement('div');
  wrap.id = panelId;
  wrap.className = `nc-hp-wrap nc-hp-${level} nc-hp-floating`;

  const topRow = doc.createElement('div');
  topRow.className = 'nc-hp-top';

  const labelCol = doc.createElement('div');
  labelCol.className = 'nc-hp-label-col';
  const labelEl = doc.createElement('span');
  labelEl.className = 'nc-hp-label';
  labelEl.textContent = 'HEALTH';
  labelCol.appendChild(labelEl);
  if (level === 'critical' || level === 'low') {
    const warnEl = doc.createElement('span');
    warnEl.className = 'nc-hp-warn';
    warnEl.textContent = level === 'critical' ? 'CRITICAL' : 'LOW';
    labelCol.appendChild(warnEl);
  }

  const numWrap = doc.createElement('div');
  numWrap.className = 'nc-hp-num-wrap';
  const numCur = doc.createElement('span');
  numCur.className = 'nc-hp-num';
  numCur.textContent = String(hp);
  numCur.style.color = palette.num;
  numCur.style.textShadow = `0 0 18px ${palette.numGlow}, 0 0 36px ${palette.numGlow}`;
  const numSep = doc.createElement('span');
  numSep.className = 'nc-hp-sep';
  numSep.textContent = '/';
  const numMax = doc.createElement('span');
  numMax.className = 'nc-hp-max';
  numMax.textContent = String(maxHp);
  numWrap.append(numCur, numSep, numMax);
  topRow.append(labelCol, numWrap);
  wrap.appendChild(topRow);

  const barSection = doc.createElement('div');
  barSection.className = 'nc-hp-bar-section';
  const hpBarOuter = doc.createElement('div');
  hpBarOuter.className = 'nc-hp-bar-outer';
  const hpBarFill = doc.createElement('div');
  hpBarFill.className = 'nc-hp-bar-fill';
  hpBarFill.style.width = `${hpPct}%`;
  hpBarFill.style.background = palette.bar;
  hpBarFill.style.boxShadow = `0 0 10px ${palette.barGlow}`;
  hpBarOuter.append(hpBarFill, _createEl(doc, 'div', 'nc-hp-scan'));
  barSection.appendChild(hpBarOuter);

  if (shield > 0) {
    const shieldPct = Math.max(0, Math.min(100, Math.round((shield / maxHp) * 100)));
    const shieldSection = doc.createElement('div');
    shieldSection.className = 'nc-hp-shield-section';
    const shieldOuter = doc.createElement('div');
    shieldOuter.className = 'nc-hp-shield-bar-outer';
    const shieldFill = doc.createElement('div');
    shieldFill.className = 'nc-hp-shield-bar-fill';
    shieldFill.style.width = `${shieldPct}%`;
    shieldOuter.appendChild(shieldFill);

    const shieldLabel = doc.createElement('div');
    shieldLabel.className = 'nc-hp-shield-label';
    const shieldLeft = _createEl(doc, 'div', 'nc-hp-shield-label-left');
    shieldLeft.textContent = 'Shield';
    const shieldRight = _createEl(doc, 'div', 'nc-hp-shield-label-right');
    const shieldNum = _createEl(doc, 'span', 'nc-hp-shield-num');
    shieldNum.textContent = String(shield);
    const shieldExpire = _createEl(doc, 'span', 'nc-hp-shield-expire');
    shieldExpire.textContent = 'next hit';
    shieldRight.append(shieldNum, shieldExpire);
    shieldLabel.append(shieldLeft, shieldRight);
    shieldSection.append(shieldOuter, shieldLabel);
    barSection.appendChild(shieldSection);
  }

  wrap.appendChild(barSection);

  const meta = doc.createElement('div');
  meta.className = 'nc-hp-meta';
  const pctEl = _createEl(doc, 'span', 'nc-hp-pct');
  pctEl.textContent = `${hpPct}%`;
  meta.appendChild(pctEl);
  wrap.appendChild(meta);

  if (level === 'critical' || level === 'low') {
    const banner = doc.createElement('div');
    banner.className = 'nc-hp-danger-banner';
    const dot = _createEl(doc, 'div', 'nc-hp-danger-dot');
    const dangerText = _createEl(doc, 'span', 'nc-hp-danger-text');
    dangerText.textContent = level === 'critical' ? 'critical health' : 'low health';
    const rec = _createEl(doc, 'span', 'nc-hp-danger-rec');
    rec.textContent = level === 'critical' ? 'heal now' : 'recover soon';
    banner.append(dot, dangerText, rec);
    wrap.appendChild(banner);
  }

  const statusSection = doc.createElement('div');
  statusSection.className = 'nc-hp-status-section';
  const statusLabel = _createEl(doc, 'div', 'nc-hp-status-label');
  statusLabel.textContent = 'status';
  const statusBadges = doc.createElement('div');
  statusBadges.id = statusContainerId;
  statusBadges.className = 'nc-hp-status-badges';
  statusSection.append(statusLabel, statusBadges);
  wrap.appendChild(statusSection);

  const statusEffectsUI = _resolveStatusEffectsUI(deps);
  if (typeof statusEffectsUI?.updateStatusDisplay === 'function') {
    statusEffectsUI.updateStatusDisplay({
      ...deps,
      gs,
      doc,
      statusContainerId,
    });
  } else {
    const none = doc.createElement('span');
    none.style.cssText = 'font-size:11px;color:var(--text-dim);font-style:italic;';
    none.textContent = '없음';
    statusBadges.appendChild(none);
  }

  return wrap;
}

function _shouldShowFloatingPlayerHpPanel(gs) {
  return !!gs?.player && (
    gs?.combat?.active === true
    || gs?.currentScreen === 'game'
    || gs?.currentScreen === 'combat'
  );
}

export function renderFloatingPlayerHpPanel(deps = {}) {
  const doc = _getDoc(deps);
  const gs = deps.gs;
  const existingShell = doc.getElementById('ncFloatingHpShell');

  if (!_shouldShowFloatingPlayerHpPanel(gs)) {
    existingShell?.remove();
    return null;
  }

  const shell = existingShell || doc.createElement('div');
  shell.id = 'ncFloatingHpShell';
  shell.className = 'nc-floating-hp-shell';

  shell.textContent = '';
  shell.appendChild(_buildPlayerHpPanel(doc, gs, deps, {
    panelId: 'ncFloatingHpPanel',
    statusContainerId: 'ncFloatingHpStatusBadges',
  }));

  if (!existingShell) {
    doc.body?.appendChild(shell);
  }

  return shell;
}
