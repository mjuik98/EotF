import { bindTooltipTrigger } from '../../../ui/ports/public_shared_support_capabilities.js';

import { appendEnemySelectionLabel } from './combat_enemy_card_renderers_ui.js';

export function createEnemyCardShell(doc, { enemy, index, isSelected, selectedMarkerText, onSelectTarget }) {
  const card = doc.createElement('div');
  card.id = `enemy_${index}`;
  card.className = `enemy-card${enemy.hp <= 0 ? ' dead' : ''}${isSelected ? ' selected-target' : ''}${enemy.isBoss ? ' boss' : ''}`;

  const deadStyle = enemy.hp <= 0 ? 'opacity:0.3;filter:grayscale(1);pointer-events:none;' : '';
  const selectedStyle = isSelected ? 'outline:2px solid var(--cyan);box-shadow:0 0 18px rgba(0,255,204,0.45);' : '';
  card.style.cssText = `${deadStyle}${selectedStyle}cursor:${enemy.hp > 0 ? 'pointer' : 'default'};`;

  if (enemy.hp > 0 && typeof onSelectTarget === 'function') {
    card.addEventListener('click', onSelectTarget);
  }

  if (isSelected) {
    appendEnemySelectionLabel(card, doc, selectedMarkerText);
  }

  return card;
}

export function createEnemySpriteNode(doc, index, spriteIcon) {
  const sprite = doc.createElement('div');
  sprite.id = `enemy_sprite_${index}`;
  sprite.className = 'enemy-sprite';
  const spriteIconEl = doc.createElement('span');
  spriteIconEl.style.fontSize = '64px';
  spriteIconEl.textContent = spriteIcon;
  sprite.appendChild(spriteIconEl);
  return sprite;
}

export function createEnemyNameNode(doc, enemy) {
  const name = doc.createElement('div');
  name.className = 'enemy-name';
  name.textContent = enemy.name;
  if (enemy.isBoss) {
    const phase = doc.createElement('span');
    phase.style.color = 'var(--gold)';
    phase.textContent = ` P${enemy.phase || 1}`;
    name.appendChild(phase);
  }
  return name;
}

export function createEnemyHpTextNode(doc, index, hpText) {
  const hpTextEl = doc.createElement('div');
  hpTextEl.id = `enemy_hptext_${index}`;
  hpTextEl.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text-dim);";
  hpTextEl.textContent = hpText;
  return hpTextEl;
}

export function createEnemyIntentContainer(doc, index, onIntentEnter, onIntentLeave) {
  const intentEl = doc.createElement('div');
  intentEl.id = `enemy_intent_${index}`;
  intentEl.className = 'enemy-intent';
  bindEnemyIntentTooltip(intentEl, onIntentEnter, onIntentLeave);
  return intentEl;
}

export function bindEnemyIntentTooltip(intentEl, onIntentEnter, onIntentLeave) {
  return bindTooltipTrigger(intentEl, {
    label: '적 행동 의도',
    bindMode: 'property',
    show: onIntentEnter,
    hide: onIntentLeave,
  });
}

export function createEnemyStatusContainer(doc, index, statusFragment) {
  const statusCont = doc.createElement('div');
  statusCont.id = `enemy_status_${index}`;
  statusCont.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;justify-content:center;margin-top:4px;';
  statusCont.appendChild(statusFragment);
  return statusCont;
}

export function createEnemyPreviewNode(doc, previewText) {
  if (!previewText) return null;
  const previewEl = doc.createElement('div');
  previewEl.className = 'enemy-dmg-preview';
  previewEl.textContent = previewText;
  return previewEl;
}
