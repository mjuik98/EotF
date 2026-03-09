import { DescriptionUtils } from '../../utils/description_utils.js';
import { CardCostUtils } from '../../utils/card_cost_utils.js';
import { calcSelectedPreview, enemyHpColor, selectedPreviewText } from './combat_render_helpers.js';
import { StatusTooltipUI } from './status_tooltip_builder.js';
import { DEBUFF_STATUS_KEYS } from '../../../data/status_key_data.js';
import { ENEMY_STATUS_DESC, ENEMY_STATUS_KR } from '../../../data/status_effects_data.js';
import { INTENT_DESCRIPTIONS } from '../../../data/combat_meta_data.js';
import { createEnemyCardView, updateEnemyCardView, updateEnemyHpView } from './combat_enemy_card_ui.js';

export { ENEMY_STATUS_DESC, ENEMY_STATUS_KR };

let _intentTipTimer = null;
let _enemyStatusTipTimer = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

function _getIntentIcon(intent) {
  if (!intent) return '?';
  const type = String(intent.type || '').toLowerCase();
  if (type === 'stunned' || type === 'stun') return '!';
  if (type.includes('dodge') || type.includes('phase')) return '~';
  if (type.includes('guard') || type.includes('barrier') || type.includes('shield')) return '#';
  if (type.includes('howl') || type.includes('roar')) return '*';
  if (type.includes('heal') || type.includes('life')) return '+';
  if (type.includes('curse') || type.includes('poison') || type.includes('debuff')) return '-';
  if (type.includes('drain') || type.includes('steal')) return '%';
  if ((intent.dmg || 0) > 0) {
    if (intent.dmg >= 20) return '!!!';
    if (intent.dmg >= 12) return '!!';
    return '!';
  }
  return '?';
}

function _formatIntentLabel(intent) {
  if (typeof intent?.intent === 'function') {
    return 'Intent pending';
  }
  let text = String(intent?.intent || '?');
  if ((intent?.dmg || 0) > 0) {
    if (/^\d+$/.test(text.trim())) return 'Attack';
    const dmgPattern = new RegExp(`\\s+${intent.dmg}$`);
    if (dmgPattern.test(text)) {
      text = text.replace(dmgPattern, '').trim();
    }
  }

  text = text.replace(/damage/gi, '').trim();
  return DescriptionUtils.highlight(text);
}

function _resolveIntentDescription(intent) {
  const text = `${intent?.type || ''} ${intent?.intent || ''}`.toLowerCase();
  for (const [key, info] of Object.entries(INTENT_DESCRIPTIONS)) {
    if (text.includes(key)) return info;
  }
  if ((intent?.dmg || 0) > 0) return INTENT_DESCRIPTIONS.attack;
  const rawLabel = String(intent?.intent || intent?.type || 'Intent')
    .replace(/<[^>]*>/g, '')
    .trim();
  return { type: rawLabel || 'Intent', desc: 'The enemy is preparing its next action.' };
}

function _enemyHpColor(pct) {
  return enemyHpColor(pct);
}

function _renderEnemyStatuses(statusEffects, doc, handlers) {
  const statusEntries = statusEffects ? Object.entries(statusEffects) : [];
  const fragment = doc.createDocumentFragment();

  statusEntries.forEach(([statusKey, statusValue]) => {
    if (statusKey === 'poisonDuration') return;

    const label = ENEMY_STATUS_KR[statusKey] || statusKey;
    const icon = ENEMY_STATUS_DESC[statusKey]?.icon || '?';
    const color = DEBUFF_STATUS_KEYS.includes(statusKey) ? '#ff6688' : '#88ccff';

    let displayDuration = statusValue;
    if (statusKey === 'poisoned' && statusEffects.poisonDuration !== undefined) {
      displayDuration = statusEffects.poisonDuration;
    }

    const durationText = displayDuration > 1 ? `(${displayDuration})` : '';
    const badge = doc.createElement('span');
    badge.className = 'enemy-status-badge';
    badge.style.cssText = `font-size:9px;background:rgba(255,255,255,0.05);border-radius:3px;padding:1px 4px;color:${color};cursor:help;`;
    badge.textContent = `${icon} ${label}${durationText}`;
    badge.addEventListener('mouseenter', (event) => handlers.onShowStatusTooltip(event, statusKey, statusValue, {
      doc,
      poisonDuration: statusEffects.poisonDuration,
    }));
    badge.addEventListener('mouseleave', () => handlers.onHideStatusTooltip({ doc }));

    fragment.appendChild(badge);
    fragment.appendChild(doc.createTextNode(' '));
  });

  return fragment;
}

function _syncFloatingTooltipAnchors(doc) {
  const statusTip = doc.getElementById('enemyStatusTooltip');
  if (statusTip?.classList.contains('visible') && !doc.querySelector('.enemy-status-badge:hover')) {
    clearTimeout(_enemyStatusTipTimer);
    statusTip.classList.remove('visible');
  }

  const intentTip = doc.getElementById('intentTooltip');
  if (intentTip?.classList.contains('visible') && !doc.querySelector('.enemy-intent:hover')) {
    clearTimeout(_intentTipTimer);
    intentTip.classList.remove('visible');
  }
}

function _calcSelectedPreview(gs, data, enemy) {
  return calcSelectedPreview(gs, data, enemy, CardCostUtils);
}

function _renderSelectedPreviewText(preview) {
  return selectedPreviewText(preview);
}

function _resolveEnemyIntent(enemy, turn) {
  if (enemy?.statusEffects?.stunned > 0) {
    return { type: 'stunned', intent: 'Stunned', dmg: 0, effect: 'stunned' };
  }

  try {
    return enemy?.ai ? enemy.ai(turn) : { intent: '?', dmg: 0 };
  } catch {
    return { intent: '?', dmg: 0 };
  }
}

function _buildEnemyHpText(enemy) {
  return `${enemy.hp} / ${enemy.maxHp}${enemy.shield ? ` (Shield ${enemy.shield})` : ''}`;
}

function _buildEnemyViewModel({ enemy, index, gs, data, doc, deps, handlers }) {
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const intent = _resolveEnemyIntent(enemy, gs.combat.turn);
  let intentIcon = _getIntentIcon(intent);
  let intentLabel = _formatIntentLabel(intent);
  let intentDmgVal = intent.dmg;

  if (gs.combat.turn <= 0) {
    intentIcon = '?';
    intentLabel = 'No intent';
    intentDmgVal = 0;
  }

  const isSelected = gs._selectedTarget === index && enemy.hp > 0;
  const preview = isSelected ? _calcSelectedPreview(gs, data, enemy) : null;

  return {
    doc,
    enemy,
    index,
    hpPct,
    isSelected,
    hpText: _buildEnemyHpText(enemy),
    spriteIcon: enemy.icon || '?',
    intentIcon,
    intentLabelHtml: intentLabel,
    intentDmgVal,
    statusFragment: _renderEnemyStatuses(enemy.statusEffects, doc, handlers),
    previewText: preview ? _renderSelectedPreviewText(preview) : '',
    hpBarBackground: _enemyHpColor(hpPct),
    selectedMarkerText: '',
    onSelectTarget: enemy.hp > 0
      ? () => {
        const selectHandler = deps.selectTarget || _getWin(deps)[deps.selectTargetHandlerName || 'selectTarget'];
        if (typeof selectHandler === 'function') selectHandler(index);
      }
      : null,
    onIntentEnter: (event) => handlers.onShowIntentTooltip(event, index, deps),
    onIntentLeave: () => handlers.onHideIntentTooltip(deps),
  };
}

export function resolveEnemyStatusTooltipMetrics(_statusKey, statusValue) {
  const value = Number(statusValue);
  if (!Number.isFinite(value) || value <= 0) {
    return { duration: '-', stacks: '-' };
  }

  const normalized = Math.floor(value);
  const duration = normalized >= 99 ? '무한' : `${normalized}턴`;
  return {
    duration,
    stacks: String(normalized),
  };
}

export const CombatUI = {
  showEnemyStatusTooltip(event, statusKey, statusValueOrDeps = null, deps = {}) {
    const statusValue = typeof statusValueOrDeps === 'number' ? statusValueOrDeps : null;
    const resolvedDeps = (statusValueOrDeps && typeof statusValueOrDeps === 'object')
      ? statusValueOrDeps
      : deps;

    const doc = resolvedDeps?.doc ?? globalThis.document;
    const win = resolvedDeps?.win ?? globalThis.window ?? globalThis;
    const statusMeta = ENEMY_STATUS_DESC[statusKey];
    if (!statusMeta) return;

    const infoKR = {
      icon: statusMeta.icon,
      name: ENEMY_STATUS_KR[statusKey] ?? statusKey,
      buff: !DEBUFF_STATUS_KEYS.includes(statusKey),
      desc: statusMeta.desc,
    };

    const source = {
      type: 'enemy',
      label: 'Enemy',
      name: 'Enemy status',
      color: infoKR.buff ? '#88ccff' : '#ff6688',
    };

    StatusTooltipUI.show(event, statusKey, infoKR, statusValue, {
      rawValue: statusValue,
      source,
      doc,
      win,
      poisonDuration: resolvedDeps.poisonDuration,
    });
  },

  hideEnemyStatusTooltip(deps = {}) {
    const doc = deps?.doc ?? globalThis.document;
    StatusTooltipUI.hide({ doc });
  },

  showIntentTooltip(event, enemyIdx, deps = {}) {
    const gs = deps.gs;
    if (!gs?.combat?.enemies) return;

    const doc = _getDoc(deps);
    const win = _getWin(deps);

    clearTimeout(_intentTipTimer);
    const idx = Number(enemyIdx);
    if (!Number.isFinite(idx)) return;
    const enemy = gs.combat.enemies[idx];
    if (!enemy?.ai) return;

    const intent = _resolveEnemyIntent(enemy, gs.combat.turn);
    if (gs.combat.turn <= 0) return;

    const icon = _getIntentIcon(intent);
    const label = _formatIntentLabel(intent);
    const descInfo = _resolveIntentDescription(intent);

    let el = doc.getElementById('intentTooltip');
    if (!el) {
      el = doc.createElement('div');
      el.id = 'intentTooltip';
      doc.body.appendChild(el);
    }

    el.textContent = '';

    const title = doc.createElement('div');
    title.className = 'itt-title';
    title.innerHTML = `${icon} ${label}`;

    const type = doc.createElement('div');
    type.className = 'itt-type';
    type.textContent = `-- ${String(descInfo.type || '')} --`;

    const desc = doc.createElement('div');
    desc.className = 'itt-desc';
    desc.innerHTML = DescriptionUtils.highlight(descInfo.desc);

    el.append(title, type, desc);

    if ((intent.dmg || 0) > 0) {
      const dmg = doc.createElement('div');
      dmg.className = 'itt-dmg';
      dmg.textContent = `Expected damage: ${String(intent.dmg)}`;
      el.appendChild(dmg);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + 12;
    let y = rect.top;
    if (x + 240 > win.innerWidth) x = rect.left - 244;
    if (y + 190 > win.innerHeight) y = win.innerHeight - 194;
    y = Math.max(10, y);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.classList.add('visible');
  },

  hideIntentTooltip(deps = {}) {
    const doc = _getDoc(deps);
    _intentTipTimer = setTimeout(() => {
      doc.getElementById('intentTooltip')?.classList.remove('visible');
    }, 80);
  },

  cleanupAllTooltips(deps = {}) {
    const doc = _getDoc(deps);
    const tooltipModule = globalThis.StatusTooltipUI || globalThis.GAME?.Modules?.StatusTooltipUI;
    if (tooltipModule) tooltipModule.hide({ doc });

    clearTimeout(_enemyStatusTipTimer);
    doc.getElementById('enemyStatusTooltip')?.classList.remove('visible');
    clearTimeout(_intentTipTimer);
    doc.getElementById('intentTooltip')?.classList.remove('visible');
  },

  renderCombatEnemies(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.combat?.enemies || !data?.cards) return;

    const doc = _getDoc(deps);
    const zone = doc.getElementById('enemyZone');
    if (!zone) return;

    const handlers = {
      onShowStatusTooltip: this.showEnemyStatusTooltip,
      onHideStatusTooltip: this.hideEnemyStatusTooltip,
      onShowIntentTooltip: this.showIntentTooltip,
      onHideIntentTooltip: this.hideIntentTooltip,
    };

    const existing = zone.querySelectorAll('.enemy-card');
    const expectedCount = gs.combat.enemies.length;
    const needsFullRender = deps.forceFullRender || existing.length !== expectedCount || existing.length === 0;

    if (needsFullRender) {
      this.cleanupAllTooltips({ doc, win: _getWin(deps) });
      zone.textContent = '';
      gs.combat.enemies.forEach((enemy, index) => {
        if (!enemy || !enemy.ai) return;
        const viewModel = _buildEnemyViewModel({ enemy, index, gs, data, doc, deps, handlers });
        zone.appendChild(createEnemyCardView(viewModel));
      });
    } else {
      gs.combat.enemies.forEach((enemy, index) => {
        if (!enemy) return;
        const viewModel = _buildEnemyViewModel({ enemy, index, gs, data, doc, deps, handlers });
        if (!gs.combat.playerTurn) viewModel.previewText = '';
        updateEnemyCardView(viewModel);
      });
    }

    _syncFloatingTooltipAnchors(doc);
  },

  updateEnemyHpUI(idx, enemy, deps = {}) {
    if (!enemy) return;
    const doc = _getDoc(deps);
    const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    updateEnemyHpView({
      doc,
      index: idx,
      enemy,
      hpPct,
      hpText: _buildEnemyHpText(enemy),
      hpBarBackground: _enemyHpColor(hpPct),
    });
  },

  api: {
    updateCombatUI: (deps) => CombatUI.renderCombatEnemies(deps),
    showIntentTooltip: (event, idx, deps) => CombatUI.showIntentTooltip(event, idx, deps),
    hideIntentTooltip: (deps) => CombatUI.hideIntentTooltip(deps),
    renderCombatEnemies: (deps) => CombatUI.renderCombatEnemies(deps),
  },
};
