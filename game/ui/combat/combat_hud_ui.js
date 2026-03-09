import { applyEchoSkillButtonState } from '../hud/hud_render_helpers.js';
import {
  closeBattleChronicleOverlay,
  isChronicleOverlayOpen,
  openBattleChronicleOverlay,
} from './combat_hud_chronicle.js';
import {
  hideEchoSkillTooltip as hideEchoSkillTooltipOverlay,
  showEchoSkillTooltip as showEchoSkillTooltipOverlay,
  showTurnBanner as showCombatTurnBanner,
} from './combat_hud_feedback.js';

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
    showEchoSkillTooltipOverlay(_getDoc(deps), _getWin(deps), event, deps.gs);
  },

  hideEchoSkillTooltip(deps = {}) {
    hideEchoSkillTooltipOverlay(_getDoc(deps));
  },

  showTurnBanner(type, deps = {}) {
    showCombatTurnBanner(_getDoc(deps), _getWin(deps), type);
  },

  updateCombatLog(deps = {}) {
    const gs = deps.gs;
    if (!gs?.combat?.log) return;

    const doc = _getDoc(deps);
    const logContainer = doc.getElementById('combatLog');
    if (!logContainer) return;

    const MAX_LOGS = 30;
    const lastLogs = gs.combat.log.slice(-MAX_LOGS);

    if (lastLogs.length === 0) {
      if (logContainer.children.length > 0) logContainer.textContent = '';
      return;
    }

    const existingById = new Map();
    const existingMsgs = new Set();
    Array.from(logContainer.children).forEach((child) => {
      const id = child.dataset.logId;
      if (id) existingById.set(id, child);
      if (child.textContent) existingMsgs.add(child.textContent);
    });

    const validIds = new Set(lastLogs.map((entry) => entry.id).filter(Boolean));
    for (const [id, element] of existingById.entries()) {
      if (!validIds.has(id)) {
        element.remove();
        existingById.delete(id);
      }
    }

    let logsAdded = false;
    const fragment = doc.createDocumentFragment();

    lastLogs.forEach((entry) => {
      if (entry.id) {
        const existing = existingById.get(entry.id);
        if (existing) {
          if (existing.textContent !== entry.msg) {
            existing.textContent = entry.msg;
            existing.className = `log-entry ${entry.type || ''}`.trim();
            existing.style.animation = 'none';
          }
        } else {
          const node = doc.createElement('div');
          node.className = `log-entry ${entry.type || ''}`.trim();
          node.textContent = entry.msg;
          node.dataset.logId = entry.id;
          fragment.appendChild(node);
          logsAdded = true;
        }
      } else if (!existingMsgs.has(entry.msg)) {
        const node = doc.createElement('div');
        node.className = `log-entry ${entry.type || ''}`.trim();
        node.textContent = entry.msg;
        fragment.appendChild(node);
        existingMsgs.add(entry.msg);
        logsAdded = true;
      }
    });

    if (fragment.childNodes.length > 0) {
      logContainer.appendChild(fragment);
    }

    while (logContainer.children.length > MAX_LOGS) {
      logContainer.removeChild(logContainer.firstChild);
    }

    if (logsAdded) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  },

  updateEchoSkillBtn(deps = {}) {
    const gs = deps.gs;
    if (!gs?.player) return;

    const doc = _getDoc(deps);
    const btn = doc.getElementById('useEchoSkillBtn');
    if (!btn) return;

    applyEchoSkillButtonState(btn, gs.player.echo);
  },

  updateChainUI(chain, deps = {}) {
    const gs = deps.gs;
    if (!gs) return;
    const doc = _getDoc(deps);

    const applyChainWidget = (countEl, dotsEl) => {
      if (!countEl || !dotsEl) return;
      countEl.textContent = chain;
      countEl.classList.toggle('burst', chain >= 5);
      dotsEl.querySelectorAll('.chain-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index < chain && chain < 5);
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
    if (!gs) return;

    const doc = _getDoc(deps);
    const widget = doc.getElementById('noiseWidget');
    if (!widget) return;

    const combatActive = !!gs.combat?.active;
    let combatRegionId = Number.isFinite(Number(gs._activeRegionId))
      ? Number(gs._activeRegionId)
      : null;
    if (combatRegionId == null && typeof globalThis.getRegionIdForStage === 'function') {
      const resolved = Number(globalThis.getRegionIdForStage(gs.currentRegion, gs));
      if (Number.isFinite(resolved)) {
        combatRegionId = Math.max(0, Math.floor(resolved));
      }
    }
    const inSilenceCity = combatActive && combatRegionId === 1;
    const inTimeWasteland = combatActive && combatRegionId === 5;
    widget.style.display = (inSilenceCity || inTimeWasteland) ? 'flex' : 'none';
    if (!inSilenceCity && !inTimeWasteland) return;

    const MAX = 10;
    const gauge = inSilenceCity ? (gs.player.silenceGauge || 0) : (gs.player.timeRiftGauge || 0);
    const pct = (gauge / MAX) * 100;
    const isWarn = gauge >= 7;

    const titleEl = widget.querySelector('.nw-title');
    if (titleEl) {
      titleEl.textContent = inSilenceCity ? '🌑 소음 게이지' : '⏳ 시간의 균열';
    }

    const dots = doc.getElementById('nwDots');
    if (dots) {
      dots.textContent = '';
      for (let index = 0; index < MAX; index += 1) {
        const active = index < gauge;
        const warn = active && index >= 6;
        const dot = doc.createElement('div');
        dot.className = `nw-dot${active ? ' active' : ''}${warn ? ' warn' : ''}`;
        dots.appendChild(dot);
      }
    }
    const fill = doc.getElementById('nwBarFill');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.style.background = inSilenceCity ? 'var(--danger)' : '#b066ff';
    }
    const val = doc.getElementById('nwVal');
    if (val) val.textContent = `${gauge} / ${MAX}`;
    const warnEl = doc.getElementById('nwWarn');
    if (warnEl) {
      warnEl.textContent = inSilenceCity ? '⚠ 파수꾼 임박' : '⚠ 강제 턴 종료 임박';
      warnEl.style.display = isWarn ? 'block' : 'none';
    }

    const warnColor = inSilenceCity ? '240,180,41' : '180,100,255';
    const defaultColor = inSilenceCity ? '255,51,102' : '130,51,255';
    widget.style.borderColor = isWarn ? `rgba(${warnColor},0.5)` : `rgba(${defaultColor},0.3)`;
    widget.style.boxShadow = isWarn ? `0 0 20px rgba(${warnColor},0.15)` : `0 0 20px rgba(${defaultColor},0.1)`;
  },

  updateClassSpecialUI(deps = {}) {
    const gs = deps.gs;
    const doc = _getDoc(deps);
    if (!gs || !gs.player || !deps.classMechanics) return;

    const hoverSpecialEl = doc.getElementById('hoverHudSpecial');
    if (hoverSpecialEl && deps.classMechanics[gs.player.class]) {
      const specialUI = deps.classMechanics[gs.player.class].getSpecialUI(gs);
      hoverSpecialEl.textContent = '';
      if (specialUI instanceof HTMLElement) {
        hoverSpecialEl.appendChild(specialUI);
      } else if (typeof specialUI === 'string') {
        hoverSpecialEl.textContent = specialUI;
      }
    } else if (hoverSpecialEl) {
      hoverSpecialEl.textContent = '';
      const none = doc.createElement('span');
      none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
      none.textContent = '없음';
      hoverSpecialEl.appendChild(none);
    }
  },

  openBattleChronicle(deps = {}) {
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    openBattleChronicleOverlay(doc, deps.gs?.combat?.log || [], {
      requestAnimationFrame: win.requestAnimationFrame?.bind(win),
    });
  },

  closeBattleChronicle(deps = {}) {
    closeBattleChronicleOverlay(_getDoc(deps));
  },

  toggleBattleChronicle(deps = {}) {
    const doc = _getDoc(deps);
    const overlay = doc.getElementById('battleChronicleOverlay');
    if (isChronicleOverlayOpen(overlay, doc)) {
      this.closeBattleChronicle(deps);
    } else {
      this.openBattleChronicle(deps);
    }
  },
};
