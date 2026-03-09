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

export const KEYBINDING_GROUPS = [
  ['endTurn', 'echoSkill', 'drawCard', 'nextTarget'],
  ['pause', 'help', 'deckView', 'codex'],
];

export function codeToLabel(code) {
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

export function getDoc(deps) {
  return deps?.doc || document;
}

export function getWin(deps) {
  return deps?.win || window;
}

export function updateToggleVisual(doc, checkboxId, checked) {
  const el = doc.getElementById(checkboxId);
  if (!el) return;

  if (el.type === 'checkbox') {
    el.checked = checked;
  }

  const track = doc.querySelector(`[data-toggle-for="${checkboxId}"]`);
  if (track) track.classList.toggle('on', checked);
}

export function applyTabDisplay(doc, tabName, raf) {
  doc.querySelectorAll('.settings-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

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
}

export function syncVolumeDisplay(type, pct, deps = {}) {
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
}

export function syncKeybindingDisplay(action, doc) {
  const code = SettingsManager.get(`keybindings.${action}`);
  const btn = doc.querySelector(`[data-keybind="${action}"]`);
  if (btn) btn.textContent = codeToLabel(code);
}

export function updateConflictBanner(banner, conflictGroups) {
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
}

export function resolveKeybindRow(doc, action) {
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
}

export function sortKeybindingRows(doc, conflicts, resolveRow = resolveKeybindRow) {
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
      const row = resolveRow(doc, action);
      if (!row) return;
      row.classList?.toggle?.('settings-row-conflict', conflicts.has(action));
      panel.insertBefore(row, anchor);
    });
  });
}

export function checkConflicts(doc, handlers = {}) {
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
  const updateBanner = handlers.updateConflictBanner || updateConflictBanner;
  updateBanner(
    banner,
    Array.from(conflictGroups.entries()).map(([code, actions]) => ({ code, actions })),
  );

  const sortRows = handlers.sortKeybindingRows || sortKeybindingRows;
  sortRows(doc, conflicts);
}

export function syncAllSettingsTabs(doc, handlers = {}) {
  const data = SettingsManager.getAll();
  const syncVolume = handlers.syncVolumeDisplay || syncVolumeDisplay;
  const syncKeybinding = handlers.syncKeybindingDisplay || syncKeybindingDisplay;
  const checkKeybindingConflicts = handlers.checkConflicts || checkConflicts;

  syncVolume('master', Math.round(data.volumes.master * 100), { doc });
  syncVolume('sfx', Math.round(data.volumes.sfx * 100), { doc });
  syncVolume('ambient', Math.round(data.volumes.ambient * 100), { doc });

  for (const [key, val] of Object.entries(data.visual)) {
    updateToggleVisual(doc, `settings-visual-${key}`, Boolean(val));
  }

  doc.querySelectorAll('[data-font-size]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.fontSize === data.accessibility.fontSize);
  });
  updateToggleVisual(doc, 'settings-access-highContrast', Boolean(data.accessibility.highContrast));
  updateToggleVisual(doc, 'settings-access-tooltipDwell', Boolean(data.accessibility.tooltipDwell));

  for (const action of Object.keys(data.keybindings || {})) {
    syncKeybinding(action, doc);
  }

  checkKeybindingConflicts(doc);
}

export function applyBootSettings(deps = {}) {
  const data = SettingsManager.load();
  const doc = getDoc(deps);

  deps.ScreenShake?.setEnabled?.(Boolean(data.visual.screenShake));
  deps.HitStop?.setEnabled?.(Boolean(data.visual.hitStop));
  deps.ParticleSystem?.setEnabled?.(Boolean(data.visual.particles));

  doc.documentElement.classList.toggle('reduced-motion', Boolean(data.visual.reducedMotion));
  doc.documentElement.dataset.fontSize = data.accessibility.fontSize;
  doc.documentElement.classList.toggle('high-contrast', Boolean(data.accessibility.highContrast));

  return data;
}
