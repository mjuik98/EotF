import { SettingsManager } from '../../platform/browser/settings_manager.js';
import {
  getInputBindingCode,
  inputCodeToLabel,
} from '../../ports/public_input_capabilities.js';

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
  return inputCodeToLabel(code);
}

export function syncKeybindingDisplay(action, doc) {
  const code = getInputBindingCode(action, undefined, SettingsManager.get('keybindings'));
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
  const renderBanner = handlers.updateConflictBanner || updateConflictBanner;
  renderBanner(
    banner,
    Array.from(conflictGroups.entries()).map(([code, actions]) => ({ code, actions })),
  );

  const sortRows = handlers.sortKeybindingRows || sortKeybindingRows;
  sortRows(doc, conflicts);
}
