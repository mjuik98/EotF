import {
  getCardTypeClass,
  getCardTypeLabel,
  getCodexCardUpgradeEntry,
  getCodexRecord,
  getCodexSets,
  getEnemyBadgeClass,
  getEnemyTypeLabel,
  getRarityBadgeClass,
  getRarityLabel,
} from './codex_ui_helpers.js';
import { getUnlockRequirementLabel } from '../../../meta_progression/domain/content_unlock_queries.js';
export {
  buildCodexNavBlock,
  buildCodexQuoteBlock,
  buildCodexRecordBlock,
  buildCodexSetPopupBlock,
} from './codex_ui_popup_blocks.js';
import {
  buildCodexRecordBlock,
  buildCodexSetPopupBlock,
} from './codex_ui_popup_blocks.js';

function buildUnlockHintBlock(type, id) {
  const label = getUnlockRequirementLabel({ type, id });
  if (!label) return '';
  return `<div class="cx-popup-sub">해금 조건 · ${label}</div>`;
}

export function buildEnemyPopupPayload(enemy, options = {}) {
  const {
    gs,
    safeHtml = (value) => value || '',
    navHtml = '',
    quoteHtml = '',
    recordHtml = '',
  } = options;
  const themes = {
    boss: { bg1: '#16100a', border: 'rgba(240,180,41,.3)', glow: 'rgba(240,180,41,.1)' },
    miniboss: { bg1: '#160806', border: 'rgba(255,107,74,.3)', glow: 'rgba(255,107,74,.1)' },
    elite: { bg1: '#12081c', border: 'rgba(192,132,252,.3)', glow: 'rgba(192,132,252,.1)' },
    enemy: { bg1: '#140810', border: 'rgba(255,51,102,.25)', glow: 'rgba(255,51,102,.08)' },
  };
  const theme = enemy.isBoss ? themes.boss : enemy.isMiniBoss ? themes.miniboss : enemy.isElite ? themes.elite : themes.enemy;
  return {
    theme: { ...theme, bg2: '#08080f' },
    html: `
      <button class="cx-popup-close" id="cxPopupClose">✕</button>
      <div class="cx-popup-hdr">
        <div class="cx-popup-icon-frame">${enemy.icon || '?'}</div>
        <div class="cx-popup-hdr-info">
          <div class="cx-popup-tags">
            <span class="cx-badge ${getEnemyBadgeClass(enemy)}" style="position:static">${getEnemyTypeLabel(enemy)}</span>
            ${enemy.region ? `<span class="cx-badge b-item" style="position:static">${enemy.region}</span>` : ''}
          </div>
          <div class="cx-popup-name">${enemy.name}</div>
          <div class="cx-popup-sub">${enemy.drops ? `격퇴 시 ${enemy.drops}` : `골드 ${enemy.gold ?? 0}`}</div>
        </div>
      </div>
      <div class="cx-popup-divider"></div>
      <div class="cx-popup-stats">
        <div class="cx-pstat"><div class="cx-pstat-label">체력</div><div class="cx-pstat-val">${enemy.maxHp ?? enemy.hp ?? 0}</div></div>
        <div class="cx-pstat"><div class="cx-pstat-label">공격력</div><div class="cx-pstat-val">${enemy.atk ?? 0}</div></div>
        <div class="cx-pstat"><div class="cx-pstat-label">골드</div><div class="cx-pstat-val">${enemy.gold ?? 0}</div></div>
      </div>
      ${recordHtml || buildCodexRecordBlock(gs, 'enemies', enemy.id)}
      <div class="cx-popup-desc">${safeHtml(enemy.desc || '')}</div>
      ${quoteHtml}
      ${navHtml}
    `,
  };
}

export function buildCardPopupPayload(card, options = {}) {
  const {
    gs,
    data,
    safeHtml = (value) => value || '',
    navHtml = '',
    quoteHtml = '',
  } = options;
  const themes = {
    legendary: { bg1: '#12081c', border: 'rgba(192,132,252,.32)', glow: 'rgba(192,132,252,.1)' },
    rare: { bg1: '#100c06', border: 'rgba(240,180,41,.28)', glow: 'rgba(240,180,41,.1)' },
    attack: { bg1: '#140810', border: 'rgba(255,51,102,.25)', glow: 'rgba(255,51,102,.08)' },
    skill: { bg1: '#080c16', border: 'rgba(80,180,255,.25)', glow: 'rgba(80,180,255,.08)' },
    power: { bg1: '#100c06', border: 'rgba(240,180,41,.25)', glow: 'rgba(240,180,41,.08)' },
  };
  const rarity = String(card.rarity || '').toLowerCase();
  const theme = rarity === 'legendary' ? themes.legendary : rarity === 'rare' ? themes.rare : themes[String(card.type || '').toLowerCase()] || themes.skill;
  const rarityLabel = getRarityLabel(card.rarity);
  const rarityBadge = rarity === 'legendary' ? 'b-legendary' : rarity === 'rare' ? 'b-rare' : 'b-item';
  const upgradeCard = getCodexCardUpgradeEntry(data, card.id);
  const record = getCodexRecord(gs, 'cards', card.id);
  const unlockHintBlock = buildUnlockHintBlock('card', card.id);
  const upgradeBlock = upgradeCard ? `
    <div class="cx-popup-divider"></div>
    <div class="cx-popup-sub" style="margin-bottom:10px">${record?.upgradedDiscovered ? '강화 카드 발견' : '강화 카드 미발견'}</div>
    <div class="cx-popup-desc" style="margin-top:0">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px">
        <span class="cx-badge ${getCardTypeClass(upgradeCard.type)}" style="position:static">${upgradeCard.name}</span>
        <span class="cx-badge ${rarityBadge}" style="position:static">비용 ${upgradeCard.cost ?? 0}</span>
      </div>
      ${record?.upgradedDiscovered ? safeHtml(upgradeCard.desc || '') : '<span style="opacity:.72">강화 버전은 아직 도감에 기록되지 않았습니다.</span>'}
      ${record?.upgradedDiscovered ? `<div style="margin-top:10px;color:#88ccff;font-size:12px">강화 사용 횟수 ${record.upgradeUsed ?? 0}회</div>` : ''}
    </div>
  ` : '';
  return {
    theme: { ...theme, bg2: '#08080f' },
    html: `
      <button class="cx-popup-close" id="cxPopupClose">✕</button>
      <div class="cx-popup-hdr">
        <div class="cx-popup-icon-frame">${card.icon || '?'}</div>
        <div class="cx-popup-hdr-info">
          <div class="cx-popup-tags">
            <span class="cx-badge ${getCardTypeClass(card.type)}" style="position:static">${getCardTypeLabel(card.type)}</span>
            <span class="cx-badge ${rarityBadge}" style="position:static">${rarityLabel}</span>
          </div>
          <div class="cx-popup-name">${card.name}</div>
          <div class="cx-popup-sub">에너지 비용 ${card.cost ?? 0}</div>
        </div>
      </div>
      <div class="cx-popup-divider"></div>
      ${buildCodexRecordBlock(gs, 'cards', card.id)}
      <div class="cx-popup-desc">${safeHtml(card.desc || '')}</div>
      ${unlockHintBlock}
      ${upgradeBlock}
      ${quoteHtml}
      ${navHtml}
    `,
  };
}

export function buildItemPopupPayload(item, options = {}) {
  const {
    gs,
    data,
    safeHtml = (value) => value || '',
    navHtml = '',
    quoteHtml = '',
  } = options;
  const setDef = item.set ? getCodexSets(data)[item.set] : null;
  const unlockHintBlock = buildUnlockHintBlock('relic', item.id);
  return {
    theme: {
      bg1: setDef ? '#0e0a1e' : '#0c0a1a',
      bg2: '#08080f',
      border: setDef?.border || 'rgba(0,255,204,.2)',
      glow: setDef?.glow || 'rgba(0,255,204,.07)',
    },
    html: `
      <button class="cx-popup-close" id="cxPopupClose">✕</button>
      <div class="cx-popup-hdr">
        <div class="cx-popup-icon-frame">${item.icon || '?'}</div>
        <div class="cx-popup-hdr-info">
          <div class="cx-popup-tags">
            <span class="cx-badge b-item" style="position:static">유물</span>
            <span class="cx-badge ${getRarityBadgeClass(item.rarity)}" style="position:static">${getRarityLabel(item.rarity)}</span>
            ${item.set ? '<span class="cx-badge b-set" style="position:static">세트</span>' : ''}
          </div>
          <div class="cx-popup-name">${item.name}</div>
          <div class="cx-popup-sub">${getRarityLabel(item.rarity)} 등급 유물</div>
        </div>
      </div>
      <div class="cx-popup-divider"></div>
      ${buildCodexRecordBlock(gs, 'items', item.id)}
      <div class="cx-popup-desc">${safeHtml(item.desc || '')}</div>
      ${unlockHintBlock}
      ${quoteHtml}
      ${buildCodexSetPopupBlock(item, data, gs)}
      ${navHtml}
    `,
  };
}
