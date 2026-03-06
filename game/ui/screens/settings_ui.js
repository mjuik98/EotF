import { SettingsManager } from '../../core/settings_manager.js';

const CODE_LABEL_MAP = {
  Space: 'SPACE',
  Escape: 'ESC',
  Slash: '?',
  Enter: 'ENTER',
  Tab: 'TAB',
  KeyQ: 'Q',
  KeyW: 'W',
  KeyE: 'E',
  KeyR: 'R',
  KeyT: 'T',
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyF: 'F',
  KeyG: 'G',
  KeyZ: 'Z',
  KeyX: 'X',
  KeyC: 'C',
  KeyV: 'V',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
};

const KEYBIND_ACTION_LABELS = {
  endTurn: '턴 종료',
  echoSkill: '잔향 스킬',
  drawCard: '카드 드로우',
  nextTarget: '다음 대상',
  pause: '일시정지',
  help: '도움말',
  deckView: '덱 보기',
  codex: '도감',
};

const KEYBINDING_GROUPS = [
  ['endTurn', 'echoSkill', 'drawCard', 'nextTarget'],
  ['pause', 'help', 'deckView', 'codex'],
];

function codeToLabel(code) {
  if (!code) return '';
  if (CODE_LABEL_MAP[code]) return CODE_LABEL_MAP[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Arrow')) {
    const dir = code.slice(5);
    return { Up: 'UP', Down: 'DOWN', Left: 'LEFT', Right: 'RIGHT' }[dir] ?? code;
  }
  return code;
}

function getDoc(deps) {
  return deps?.doc || document;
}

function getWin(deps) {
  return deps?.win || window;
}

function updateToggleVisual(doc, checkboxId, checked) {
  const el = doc.getElementById(checkboxId);
  if (!el) return;

  if (el.type === 'checkbox') {
    el.checked = checked;
  }

  const track = doc.querySelector(`[data-toggle-for="${checkboxId}"]`);
  if (track) track.classList.toggle('on', checked);
}

export const SettingsUI = {
  _activeTab: 'sound',
  _listeningAction: null,
  _keydownHandler: null,
  _rebindWindow: null,
  _boundDoc: null,
  _runtimeDeps: {},

  openSettings(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('settingsModal');
    if (!modal) {
      console.warn('[SettingsUI] #settingsModal not found');
      return;
    }

    this._runtimeDeps = deps;
    this._bindDomEvents(doc);
    SettingsManager.load();
    this._syncAllTabs(doc);
    this.setTab(this._activeTab, deps);
    modal.classList.add('active');
    deps.audioEngine?.playClick?.();
  },

  closeSettings(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('settingsModal');
    modal?.classList.remove('active');
    this._cancelRebind(deps);
    deps.audioEngine?.playClick?.();
  },

  isOpen(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('settingsModal');
    return modal?.classList.contains('active') ?? false;
  },

  setTab(tabName, deps = {}) {
    const doc = getDoc(deps);
    this._activeTab = tabName;

    doc.querySelectorAll('.settings-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    const raf = getWin(deps)?.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
    doc.querySelectorAll('.settings-tab-panel').forEach((panel) => {
      const isActive = panel.dataset.tab === tabName;
      panel.style.display = isActive ? 'block' : 'none';

      if (!isActive) return;
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(8px)';
      raf(() => {
        panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
      });
    });
  },

  applyVolume(type, value, deps = {}) {
    const percent = Math.max(0, Math.min(100, Number(value)));
    const normalized = percent / 100;

    SettingsManager.set(`volumes.${type}`, normalized);

    if (type === 'master') deps.audioEngine?.setVolume?.(normalized);
    if (type === 'sfx') deps.audioEngine?.setSfxVolume?.(normalized);
    if (type === 'ambient') deps.audioEngine?.setAmbientVolume?.(normalized);

    this._syncVolumeDisplay(type, percent, deps);
  },

  muteToggle(type, deps = {}) {
    const doc = getDoc(deps);
    const slider = doc.querySelector(`#settings-vol-${type}-slider`);
    if (!slider) return;

    const current = Number(slider.value);
    if (current > 0) {
      slider.dataset.prevValue = String(current);
      this.applyVolume(type, 0, deps);
      return;
    }

    const prev = Number(slider.dataset.prevValue ?? 80);
    this.applyVolume(type, prev, deps);
  },

  applyVisual(key, value, deps = {}) {
    SettingsManager.set(`visual.${key}`, value);

    if (key === 'screenShake') deps.ScreenShake?.setEnabled?.(value);
    if (key === 'hitStop') deps.HitStop?.setEnabled?.(value);
    if (key === 'particles') deps.ParticleSystem?.setEnabled?.(value);
    if (key === 'reducedMotion') {
      const doc = getDoc(deps);
      doc.documentElement.classList.toggle('reduced-motion', value);
    }

    const doc = getDoc(deps);
    const el = doc.getElementById(`settings-visual-${key}`);
    if (el) el.checked = value;
    updateToggleVisual(doc, `settings-visual-${key}`, value);
  },

  applyAccessibility(key, value, deps = {}) {
    SettingsManager.set(`accessibility.${key}`, value);
    const doc = getDoc(deps);

    if (key === 'fontSize') {
      doc.documentElement.dataset.fontSize = value;
      doc.querySelectorAll('[data-font-size]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.fontSize === value);
      });
      return;
    }

    if (key === 'highContrast') {
      doc.documentElement.classList.toggle('high-contrast', value);
      updateToggleVisual(doc, 'settings-access-highContrast', value);
      return;
    }

    if (key === 'tooltipDwell') {
      updateToggleVisual(doc, 'settings-access-tooltipDwell', value);
    }
  },

  startRebind(action, deps = {}) {
    const doc = getDoc(deps);
    this._cancelRebind(deps);

    this._listeningAction = action;
    this._rebindWindow = getWin(deps);

    const btn = doc.querySelector(`[data-keybind="${action}"]`);
    if (btn) {
      btn.textContent = '입력...';
      btn.classList.add('listening');
    }

    this._keydownHandler = (e) => {
      e.preventDefault();
      if (e.code === 'Escape') {
        this._cancelRebind(deps);
        return;
      }

      SettingsManager.set(`keybindings.${action}`, e.code);
      this._syncKeybindingDisplay(action, doc);
      this._cleanupRebind(action, doc);
    };

    this._rebindWindow?.addEventListener('keydown', this._keydownHandler);
  },

  _cancelRebind(deps = {}) {
    if (!this._listeningAction) return;

    const doc = getDoc(deps);
    this._syncKeybindingDisplay(this._listeningAction, doc);
    this._cleanupRebind(this._listeningAction, doc);
  },

  _cleanupRebind(action, doc) {
    const btn = doc.querySelector(`[data-keybind="${action}"]`);
    btn?.classList.remove('listening');

    if (this._keydownHandler) {
      this._rebindWindow?.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }

    this._listeningAction = null;
    this._rebindWindow = null;
    this._checkConflicts(doc);
  },

  resetToDefaults(deps = {}) {
    const defaults = SettingsManager.resetToDefaults();
    const doc = getDoc(deps);
    this._syncAllTabs(doc);

    deps.audioEngine?.setVolume?.(defaults.volumes.master);
    deps.audioEngine?.setSfxVolume?.(defaults.volumes.sfx);
    deps.audioEngine?.setAmbientVolume?.(defaults.volumes.ambient);

    deps.ScreenShake?.setEnabled?.(defaults.visual.screenShake);
    deps.HitStop?.setEnabled?.(defaults.visual.hitStop);
    deps.ParticleSystem?.setEnabled?.(defaults.visual.particles);

    doc.documentElement.classList.toggle('reduced-motion', defaults.visual.reducedMotion);
    doc.documentElement.dataset.fontSize = defaults.accessibility.fontSize;
    doc.documentElement.classList.toggle('high-contrast', defaults.accessibility.highContrast);
  },

  applyOnBoot(deps = {}) {
    const data = SettingsManager.load();
    const doc = getDoc(deps);

    deps.ScreenShake?.setEnabled?.(Boolean(data.visual.screenShake));
    deps.HitStop?.setEnabled?.(Boolean(data.visual.hitStop));
    deps.ParticleSystem?.setEnabled?.(Boolean(data.visual.particles));

    doc.documentElement.classList.toggle('reduced-motion', Boolean(data.visual.reducedMotion));
    doc.documentElement.dataset.fontSize = data.accessibility.fontSize;
    doc.documentElement.classList.toggle('high-contrast', Boolean(data.accessibility.highContrast));

    return data;
  },

  _syncAllTabs(doc) {
    const data = SettingsManager.getAll();

    this._syncVolumeDisplay('master', Math.round(data.volumes.master * 100), { doc });
    this._syncVolumeDisplay('sfx', Math.round(data.volumes.sfx * 100), { doc });
    this._syncVolumeDisplay('ambient', Math.round(data.volumes.ambient * 100), { doc });

    for (const [key, val] of Object.entries(data.visual)) {
      updateToggleVisual(doc, `settings-visual-${key}`, Boolean(val));
    }

    doc.querySelectorAll('[data-font-size]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.fontSize === data.accessibility.fontSize);
    });
    updateToggleVisual(doc, 'settings-access-highContrast', Boolean(data.accessibility.highContrast));
    updateToggleVisual(doc, 'settings-access-tooltipDwell', Boolean(data.accessibility.tooltipDwell));

    for (const action of Object.keys(data.keybindings || {})) {
      this._syncKeybindingDisplay(action, doc);
    }

    this._checkConflicts(doc);
  },

  _syncVolumeDisplay(type, pct, deps = {}) {
    const doc = getDoc(deps);
    const val = Number.isFinite(Number(pct)) ? Math.round(Number(pct)) : 0;
    const icon = val === 0 ? '🔇' : val < 40 ? '🔈' : val < 70 ? '🔉' : '🔊';

    doc.querySelectorAll(`#settings-vol-${type}-val`).forEach((el) => {
      el.textContent = `${val}%`;
    });
    doc.querySelectorAll(`#settings-vol-${type}-slider`).forEach((el) => {
      el.value = String(val);
      el.style.setProperty('--fill-percent', `${val}%`);
    });
    doc.querySelectorAll(`#settings-vol-${type}-icon`).forEach((el) => {
      el.textContent = icon;
    });
  },

  _syncKeybindingDisplay(action, doc) {
    const code = SettingsManager.get(`keybindings.${action}`);
    const btn = doc.querySelector(`[data-keybind="${action}"]`);
    if (btn) btn.textContent = codeToLabel(code);
  },

  _checkConflicts(doc) {
    const kb = SettingsManager.get('keybindings') ?? {};
    const used = {};
    const conflicts = new Set();
    const conflictGroups = new Map();

    for (const [action, code] of Object.entries(kb)) {
      if (!code) continue;
      if (used[code]) {
        conflicts.add(action);
        conflicts.add(used[code]);
        const actions = conflictGroups.get(code) || [used[code]];
        if (!actions.includes(action)) actions.push(action);
        conflictGroups.set(code, actions);
      } else {
        used[code] = action;
      }
    }

    doc.querySelectorAll('[data-keybind]').forEach((btn) => {
      const action = btn.dataset.keybind;
      btn.classList.toggle('conflict', conflicts.has(action));
    });

    const banner = doc.getElementById('settings-conflict-banner');
    this._updateConflictBanner(
      banner,
      Array.from(conflictGroups.entries()).map(([code, actions]) => ({ code, actions })),
    );
    this._sortKeybindingRows(doc, conflicts);
  },

  _updateConflictBanner(banner, conflictGroups) {
    if (!banner) return;
    if (!Array.isArray(conflictGroups) || conflictGroups.length === 0) {
      banner.style.display = 'none';
      banner.textContent = '단축키 충돌이 있습니다. 버튼을 눌러 다시 지정하세요.';
      return;
    }

    const lines = conflictGroups.map(({ code, actions }) => {
      const labels = (actions || []).map((action) => KEYBIND_ACTION_LABELS[action] || action);
      return `${codeToLabel(code)}: ${labels.join(' / ')}`;
    });
    banner.textContent = `단축키 충돌: ${lines.join(' | ')}`;
    banner.style.display = 'flex';
  },

  _resolveKeybindRow(doc, action) {
    const btn = doc?.querySelector?.(`[data-keybind="${action}"]`);
    if (!btn) return null;
    if (typeof btn.closest === 'function') {
      const row = btn.closest('.settings-row');
      if (row) return row;
    }

    const rows = doc?.querySelectorAll?.('.settings-tab-panel[data-tab="keybindings"] .settings-row') || [];
    for (const row of rows) {
      if (row?.querySelector?.(`[data-keybind="${action}"]`) === btn) return row;
    }
    return null;
  },

  _sortKeybindingRows(doc, conflicts) {
    const panel = doc?.querySelector?.('.settings-tab-panel[data-tab="keybindings"]');
    if (!panel || typeof panel.insertBefore !== 'function') return;

    const groupLabels = panel.querySelectorAll?.('.settings-keybind-group-label');
    if (!groupLabels || groupLabels.length === 0) return;

    KEYBINDING_GROUPS.forEach((groupActions, index) => {
      const anchor = groupLabels[index + 1] || null;
      const orderedActions = [...groupActions].sort((a, b) => {
        const aScore = conflicts.has(a) ? 1 : 0;
        const bScore = conflicts.has(b) ? 1 : 0;
        return bScore - aScore;
      });

      orderedActions.forEach((action) => {
        const row = this._resolveKeybindRow(doc, action);
        if (!row) return;
        row.classList?.toggle?.('settings-row-conflict', conflicts.has(action));
        panel.insertBefore(row, anchor);
      });
    });
  },

  _getLiveDeps(doc) {
    return {
      ...(this._runtimeDeps || {}),
      doc,
      win: getWin(this._runtimeDeps || {}),
    };
  },

  _bindDomEvents(doc) {
    if (!doc || this._boundDoc === doc) return;
    this._boundDoc = doc;

    doc.querySelectorAll('.settings-tab-btn[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setTab(btn.dataset.tab, this._getLiveDeps(doc));
      });
    });

    const bindVolume = (type) => {
      const slider = doc.getElementById(`settings-vol-${type}-slider`);
      slider?.addEventListener('input', (event) => {
        this.applyVolume(type, event?.target?.value, this._getLiveDeps(doc));
      });
      const icon = doc.getElementById(`settings-vol-${type}-icon`);
      icon?.addEventListener('click', () => {
        this.muteToggle(type, this._getLiveDeps(doc));
      });
    };
    bindVolume('master');
    bindVolume('sfx');
    bindVolume('ambient');

    const bindVisualToggle = (key) => {
      const checkbox = doc.getElementById(`settings-visual-${key}`);
      checkbox?.addEventListener('change', (event) => {
        this.applyVisual(key, Boolean(event?.target?.checked), this._getLiveDeps(doc));
      });
    };
    bindVisualToggle('particles');
    bindVisualToggle('screenShake');
    bindVisualToggle('hitStop');
    bindVisualToggle('reducedMotion');

    doc.querySelectorAll('.settings-font-btn[data-font-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.applyAccessibility('fontSize', btn.dataset.fontSize, this._getLiveDeps(doc));
      });
    });
    const highContrast = doc.getElementById('settings-access-highContrast');
    highContrast?.addEventListener('change', (event) => {
      this.applyAccessibility('highContrast', Boolean(event?.target?.checked), this._getLiveDeps(doc));
    });
    const tooltipDwell = doc.getElementById('settings-access-tooltipDwell');
    tooltipDwell?.addEventListener('change', (event) => {
      this.applyAccessibility('tooltipDwell', Boolean(event?.target?.checked), this._getLiveDeps(doc));
    });

    doc.querySelectorAll('.settings-keybind-btn[data-keybind]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.startRebind(btn.dataset.keybind, this._getLiveDeps(doc));
      });
    });

    doc.querySelector('.settings-reset-btn')?.addEventListener('click', () => {
      this.resetToDefaults(this._getLiveDeps(doc));
    });
    doc.querySelector('.settings-close-btn')?.addEventListener('click', () => {
      this.closeSettings(this._getLiveDeps(doc));
    });
  },
};
