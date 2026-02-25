'use strict';

(function initCombatHudUI(globalObj) {
  let _hudPinned = false;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getWin(deps) {
    return deps?.win || window;
  }

  const CombatHudUI = {
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
        const skill = globalObj.CONSTANTS.ECHO_SKILLS[cls]?.[t];
        return {
          stars: '★'.repeat(t),
          cost: skill?.cost || 0,
          active: echo >= (skill?.cost || 0),
          desc: skill?.desc || ''
        };
      });

      content.innerHTML = tiers.map(t => `
        <div class="echo-skill-tt-tier${t.active ? ' active' : ''}">
          <div>
            <div class="echo-skill-tt-stars">${t.stars} <span class="echo-skill-tt-cost">(${t.cost} Echo)</span></div>
            <div class="echo-skill-tt-desc">${t.desc}</div>
          </div>
        </div>
      `).join('');

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
      const log = doc.getElementById('combatLog');
      if (!log) return;
      log.innerHTML = gs.combat.log.slice(-8).map(e => `<div class="log-entry ${e.type}">${e.msg}</div>`).join('');
      log.scrollTop = log.scrollHeight;
    },

    updateEchoSkillBtn(deps = {}) {
      const gs = deps.gs;
      if (!gs?.player) return;

      const doc = _getDoc(deps);
      const btn = doc.getElementById('echoSkillBtn');
      if (!btn) return;

      const echo = gs.player.echo;
      const cls = gs.player.class;
      let tLevel = echo >= 100 ? 3 : echo >= 60 ? 2 : echo >= 30 ? 1 : 0;
      if (tLevel === 0) {
        btn.textContent = `⚡ Echo 스킬 (${echo}/30)`;
        btn.style.opacity = '0.45';
        return;
      }

      const skill = globalObj.CONSTANTS.ECHO_SKILLS[cls]?.[tLevel];
      const stars = '★'.repeat(tLevel);
      const sDesc = skill?.shortDesc || '';
      btn.textContent = `⚡ ${stars} ${sDesc}`;
      btn.style.opacity = '1';
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
        dots.innerHTML = Array.from({ length: MAX }, (_, i) => {
          const active = i < gauge;
          const warn = active && i >= 6;
          return `<div class="nw-dot${active ? ' active' : ''}${warn ? ' warn' : ''}"></div>`;
        }).join('');
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

  globalObj.CombatHudUI = CombatHudUI;
})(window);
