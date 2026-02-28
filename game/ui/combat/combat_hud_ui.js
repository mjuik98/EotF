import { CONSTANTS } from '../../data/constants.js';


let _hudPinned = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

export const CombatHudUI = {
  toggleHudPin(deps = {}) {
    _hudPinned = !_hudPinned;
    const doc = _getDoc(deps);
    const hud = doc.getElementById('hoverHud');
    const hint = doc.getElementById('hudPinHint');
    if (!hud) return;

    hud.classList.toggle('pinned', _hudPinned);
    if (_hudPinned && hint) hint.style.display = 'none';
    else if (!_hudPinned && hint) hint.style.display = '';
  },

  showEchoSkillTooltip(event, deps = {}) {
    const gs = deps.gs;
    if (!gs?.player) return;

    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const tt = doc.getElementById('echoSkillTooltip');
    const content = doc.getElementById('echoSkillTtContent');
    if (!tt || !content) return;

    const cls = gs.player.class;
    const echo = gs.player.echo;
    const tiers = [1, 2, 3].map(t => {
      const skill = CONSTANTS.ECHO_SKILLS[cls]?.[t];
      return {
        stars: '★'.repeat(t),
        cost: skill?.cost || 0,
        active: echo >= (skill?.cost || 0),
        desc: skill?.desc || ''
      };
    });

    content.textContent = '';
    tiers.forEach(t => {
      const tierEl = doc.createElement('div');
      tierEl.className = `echo-skill-tt-tier${t.active ? ' active' : ''}`;

      const inner = doc.createElement('div');
      const starsEl = doc.createElement('div');
      starsEl.className = 'echo-skill-tt-stars';
      starsEl.textContent = t.stars + ' ';

      const costEl = doc.createElement('span');
      costEl.className = 'echo-skill-tt-cost';
      costEl.textContent = `(${t.cost} 잔향)`;
      starsEl.appendChild(costEl);

      const descEl = doc.createElement('div');
      descEl.className = 'echo-skill-tt-desc';
      descEl.textContent = t.desc;

      inner.appendChild(starsEl);
      inner.appendChild(descEl);
      tierEl.appendChild(inner);
      content.appendChild(tierEl);
    });

    const rect = event.target.getBoundingClientRect();
    tt.style.left = `${Math.min(rect.left, win.innerWidth - 240)}px`;
    tt.style.top = `${rect.top - tt.offsetHeight - 10}px`;
    tt.classList.add('visible');

    win.requestAnimationFrame(() => {
      const h = tt.offsetHeight;
      const top = rect.top - h - 10;
      tt.style.top = `${top < 10 ? rect.bottom + 10 : top}px`;
    });
  },

  hideEchoSkillTooltip(deps = {}) {
    const doc = _getDoc(deps);
    const tt = doc.getElementById('echoSkillTooltip');
    if (tt) tt.classList.remove('visible');
  },

  showTurnBanner(type, deps = {}) {
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const el = doc.getElementById('turnBanner');
    if (!el) return;

    el.className = type === 'player' ? 'player' : 'enemy';
    el.textContent = type === 'player' ? '⚡ 플레이어 턴' : '💢 적의 턴';
    el.style.display = 'block';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'turnBannerIn 1.2s ease forwards';
    win.clearTimeout(el._hideTimer);
    el._hideTimer = win.setTimeout(() => { el.style.display = 'none'; }, 1200);
  },

  updateCombatLog(deps = {}) {
    const gs = deps.gs;
    if (!gs?.combat?.log) return;

    const doc = _getDoc(deps);
    const logContainer = doc.getElementById('combatLog');
    if (!logContainer) return;

    // 현재 DOM에 표시된 로그의 ID들을 셋으로 관리하여 중복 추가 방지
    const currentIds = Array.from(logContainer.children).map(c => c.dataset.logId);
    const lastLogs = gs.combat.log.slice(-6); // 화면에 보여줄 개수 제한

    lastLogs.forEach(e => {
      if (e.id) {
        const existing = logContainer.querySelector(`[data-log-id="${e.id}"]`);
        if (existing) {
          if (existing.textContent !== e.msg) {
            existing.textContent = e.msg;
            existing.style.animation = 'none';
            void existing.offsetWidth; // Trigger reflow to restart animation
            existing.style.animation = 'logEntryIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
          }
        } else if (!currentIds.includes(e.id)) {
          const entry = doc.createElement('div');
          entry.className = `log-entry ${e.type}`;
          entry.textContent = e.msg;
          entry.dataset.logId = e.id;
          logContainer.prepend(entry);
        }
      } else if (!e.id) {
        // 기존 하위 호환성 (ID 없는 경우 텍스트 비교)
        const currentMsgs = Array.from(logContainer.children).map(c => c.textContent);
        if (!currentMsgs.includes(e.msg)) {
          const entry = doc.createElement('div');
          entry.className = `log-entry ${e.type}`;
          entry.textContent = e.msg;
          logContainer.prepend(entry);
        }
      }
    });

    // 화면에 너무 많이 쌓이지 않도록 정리
    while (logContainer.children.length > 6) {
      logContainer.removeChild(logContainer.lastChild);
    }
  },

  updateEchoSkillBtn(deps = {}) {
    const gs = deps.gs;
    if (!gs?.player) return;

    const doc = _getDoc(deps);
    const btn = doc.getElementById('useEchoSkillBtn');
    if (!btn) return;

    const echo = gs.player.echo;
    const cls = gs.player.class;
    let tLevel = echo >= 100 ? 3 : echo >= 60 ? 2 : echo >= 30 ? 1 : 0;
    if (tLevel === 0) {
      btn.textContent = `⚡ 잔향 스킬 (${echo}/30)`;
      btn.style.opacity = '0.45';
      btn.disabled = true;
      return;
    }

    const skill = CONSTANTS.ECHO_SKILLS[cls]?.[tLevel];
    const stars = '★'.repeat(tLevel);
    const sDesc = skill?.shortDesc || '';
    btn.textContent = `⚡ ${stars} ${sDesc}`;
    btn.style.opacity = '1';
    btn.disabled = false;
  },

  updateChainUI(chain, deps = {}) {
    const gs = deps.gs;
    if (!gs) return;
    const doc = _getDoc(deps);

    const applyChainWidget = (countEl, dotsEl) => {
      if (!countEl || !dotsEl) return;
      countEl.textContent = chain;
      countEl.classList.toggle('burst', chain >= 5);
      dotsEl.querySelectorAll('.chain-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i < chain && chain < 5);
        dot.classList.toggle('burst-dot', chain >= 5);
      });
    };

    applyChainWidget(
      doc.getElementById('chainCount'),
      doc.getElementById('chainDots'),
    );
    const combatWidget = doc.getElementById('combatChainInline');
    if (combatWidget) combatWidget.style.display = gs.combat.active ? 'flex' : 'none';
    applyChainWidget(
      doc.getElementById('combatChainCount'),
      doc.getElementById('combatChainDots'),
    );
  },

  updateNoiseWidget(deps = {}) {
    const gs = deps.gs;
    const getBaseRegionIndex = deps.getBaseRegionIndex;
    if (!gs || typeof getBaseRegionIndex !== 'function') return;

    const doc = _getDoc(deps);
    const widget = doc.getElementById('noiseWidget');
    if (!widget) return;

    const inSilenceCity = getBaseRegionIndex(gs.currentRegion) === 1 && gs.combat.active;
    widget.style.display = inSilenceCity ? 'block' : 'none';
    if (!inSilenceCity) return;

    const MAX = 10;
    const gauge = gs.player.silenceGauge || 0;
    const pct = (gauge / MAX) * 100;
    const isWarn = gauge >= 7;

    const dots = doc.getElementById('nwDots');
    if (dots) {
      dots.textContent = '';
      for (let i = 0; i < MAX; i++) {
        const active = i < gauge;
        const warn = active && i >= 6;
        const dot = doc.createElement('div');
        dot.className = `nw-dot${active ? ' active' : ''}${warn ? ' warn' : ''}`;
        dots.appendChild(dot);
      }
    }
    const fill = doc.getElementById('nwBarFill');
    if (fill) fill.style.width = `${pct}%`;
    const val = doc.getElementById('nwVal');
    if (val) val.textContent = `${gauge} / ${MAX}`;
    const warnEl = doc.getElementById('nwWarn');
    if (warnEl) warnEl.style.display = isWarn ? 'block' : 'none';

    widget.style.borderColor = isWarn ? 'rgba(240,180,41,0.5)' : 'rgba(255,51,102,0.3)';
    widget.style.boxShadow = isWarn ? '0 0 20px rgba(240,180,41,0.15)' : '0 0 20px rgba(255,51,102,0.1)';
  },

};
