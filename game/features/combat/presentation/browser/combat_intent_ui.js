import {
  DescriptionUtils,
  INTENT_DESCRIPTIONS,
} from '../../ports/presentation/public_combat_card_support_capabilities.js';
import { getResolvedEnemyAction } from '../../domain/enemy_intent_domain.js';
import { COMBAT_INTENT_LABEL_TRANSLATIONS } from './combat_copy.js';

let _intentTipTimer = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

function localizeEnemyIntentLabel(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '?';
  return COMBAT_INTENT_LABEL_TRANSLATIONS[normalized.toLowerCase()] || normalized;
}

export function getEnemyIntentIcon(intent) {
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
    return '!';
  }
  return '?';
}

export function formatEnemyIntentLabel(intent) {
  if (typeof intent?.intent === 'function') {
    return '행동 준비 중';
  }

  let text = String(intent?.intent || '?');
  if ((intent?.dmg || 0) > 0) {
    if (/^\d+$/.test(text.trim())) return '공격';
    const dmgPattern = new RegExp(`\\s+${intent.dmg}$`);
    if (dmgPattern.test(text)) {
      text = text.replace(dmgPattern, '').trim();
    }
  }

  text = text.replace(/damage/gi, '').trim();
  return DescriptionUtils.highlight(localizeEnemyIntentLabel(text));
}

export function resolveEnemyIntentDescription(intent) {
  const text = `${intent?.type || ''} ${intent?.intent || ''}`.toLowerCase();
  for (const [key, info] of Object.entries(INTENT_DESCRIPTIONS)) {
    if (text.includes(key)) return info;
  }
  if ((intent?.dmg || 0) > 0) return INTENT_DESCRIPTIONS.attack;

  const rawLabel = String(intent?.intent || intent?.type || '행동')
    .replace(/<[^>]*>/g, '')
    .trim();
  return {
    type: localizeEnemyIntentLabel(rawLabel || '행동'),
    desc: '적이 다음 행동을 준비하고 있습니다.',
  };
}

export function resolveEnemyIntent(enemy, turn, gs = null) {
  if (enemy?.statusEffects?.stunned > 0) {
    return { type: 'stunned', intent: '기절', dmg: 0, effect: 'stunned' };
  }
  if (!enemy?.ai) return { intent: '?', dmg: 0 };
  return getResolvedEnemyAction(gs, enemy, turn);
}

export function showEnemyIntentTooltip(event, enemyIdx, deps = {}) {
  const gs = deps.gs;
  if (!gs?.combat?.enemies) return;

  const doc = _getDoc(deps);
  const win = _getWin(deps);

  clearTimeout(_intentTipTimer);
  const idx = Number(enemyIdx);
  if (!Number.isFinite(idx)) return;
  const enemy = gs.combat.enemies[idx];
  if (!enemy?.ai) return;

  const intent = resolveEnemyIntent(enemy, gs.combat.turn, gs);
  if (gs.combat.turn <= 0) return;

  const icon = getEnemyIntentIcon(intent);
  const label = formatEnemyIntentLabel(intent);
  const descInfo = resolveEnemyIntentDescription(intent);

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
    dmg.textContent = `예상 피해: ${String(intent.dmg)}`;
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
}

export function hideEnemyIntentTooltip(deps = {}) {
  const doc = _getDoc(deps);
  _intentTipTimer = setTimeout(() => {
    doc.getElementById('intentTooltip')?.classList.remove('visible');
  }, 80);
}

export function cleanupEnemyIntentTooltip(deps = {}) {
  const doc = _getDoc(deps);
  clearTimeout(_intentTipTimer);
  doc.getElementById('intentTooltip')?.classList.remove('visible');
}

export function syncEnemyIntentTooltipAnchor(doc) {
  const intentTip = doc.getElementById('intentTooltip');
  if (intentTip?.classList.contains('visible') && !doc.querySelector('.enemy-intent:hover')) {
    clearTimeout(_intentTipTimer);
    intentTip.classList.remove('visible');
  }
}
