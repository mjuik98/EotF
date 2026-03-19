import { DomSafe } from '../../../../utils/dom_safe.js';
import { RARITY_LABELS } from '../../../../../data/rarity_meta.js';

export function createItemTooltipElement(doc, item, data, state) {
  const { liveCharge, rarity, rarityMeta, setCount, setDef, setOwnedFlags, triggerText } = state;
  const el = doc.createElement('div');
  el.id = '_itemTip';
  el.style.cssText = [
    'position:fixed;z-index:960;width:268px;',
    'background:var(--panel,rgba(8,8,26,0.98));',
    `border:1px solid ${rarityMeta.border};border-radius:14px;`,
    'overflow:hidden;pointer-events:none;',
    'backdrop-filter:blur(28px);',
    `box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 40px ${rarityMeta.glow};`,
    'animation:itemTipIn 0.18s cubic-bezier(0.34,1.4,0.64,1) both;',
  ].join('');

  const topBar = doc.createElement('div');
  topBar.style.cssText = `height:3px;background:linear-gradient(90deg,transparent,${rarityMeta.color} 30%,${rarityMeta.color} 70%,transparent);`;
  el.appendChild(topBar);

  const body = doc.createElement('div');
  body.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:10px;';

  const header = doc.createElement('div');
  header.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';
  const iconBox = doc.createElement('div');
  iconBox.style.cssText = [
    'width:56px;height:56px;border-radius:11px;flex-shrink:0;',
    `background:radial-gradient(circle at 38% 38%,rgba(${rarityMeta.rgb},0.25) 0%,transparent 68%);`,
    `border:1px solid rgba(${rarityMeta.rgb},0.45);`,
    'display:flex;align-items:center;justify-content:center;',
    'font-size:28px;position:relative;',
  ].join('');
  iconBox.textContent = item.icon || '?';
  const infoCol = doc.createElement('div');
  infoCol.style.cssText = 'padding-top:2px;flex:1;';
  const nameEl = doc.createElement('div');
  nameEl.style.cssText = `font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:${rarityMeta.color};margin-bottom:5px;line-height:1.2;`;
  nameEl.textContent = item.name;
  const badges = doc.createElement('div');
  badges.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';
  const rarityBadge = doc.createElement('span');
  rarityBadge.style.cssText = `font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.15em;background:rgba(${rarityMeta.rgb},0.1);border:1px solid rgba(${rarityMeta.rgb},0.35);border-radius:4px;padding:2px 7px;color:${rarityMeta.color};`;
  rarityBadge.textContent = RARITY_LABELS[rarity] || rarity;
  const triggerBadge = doc.createElement('span');
  triggerBadge.style.cssText = 'font-size:8px;letter-spacing:0.04em;background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:4px;padding:2px 7px;color:var(--echo,#00ffcc);';
  triggerBadge.textContent = `⚡ ${triggerText}`;
  badges.append(rarityBadge, triggerBadge);
  infoCol.append(nameEl, badges);
  header.append(iconBox, infoCol);
  body.appendChild(header);

  const descBox = doc.createElement('div');
  descBox.style.cssText = 'font-size:11.5px;color:var(--text,#c8c8e8);line-height:1.72;background:rgba(255,255,255,0.025);border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:8px;padding:8px 10px;';
  DomSafe.setHighlightedText(descBox, item.desc || '');
  body.appendChild(descBox);

  if (liveCharge) {
    const chargePanel = doc.createElement('div');
    chargePanel.style.cssText = 'padding:8px 10px;border-radius:8px;background:rgba(0,255,204,0.04);border:1px solid rgba(0,255,204,0.15);';
    const chargeLabel = doc.createElement('div');
    chargeLabel.style.cssText = "font-size:9px;color:var(--text-dim,#7a7a9a);letter-spacing:0.08em;margin-bottom:6px;font-family:'Cinzel',serif;";
    chargeLabel.textContent = liveCharge.label;
    const chargeValue = doc.createElement('div');
    chargeValue.style.cssText = 'font-size:10px;color:var(--echo,#00ffcc);';
    if (liveCharge.type === 'bool') chargeValue.textContent = liveCharge.active ? '현재 활성화됨' : '비활성';
    else if (liveCharge.type === 'num') chargeValue.textContent = `${liveCharge.val} / ${liveCharge.max}`;
    else chargeValue.textContent = liveCharge.remaining > 0 ? `${liveCharge.remaining}회 남음` : '소진됨';
    chargePanel.append(chargeLabel, chargeValue);
    body.appendChild(chargePanel);
  }

  if (setDef) {
    const setPanel = doc.createElement('div');
    setPanel.style.cssText = 'background:rgba(123,47,255,0.07);border:1px solid rgba(123,47,255,0.25);border-radius:8px;padding:9px 11px;';
    const setHeader = doc.createElement('div');
    setHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
    const setNameEl = doc.createElement('span');
    setNameEl.style.cssText = "font-size:9px;color:var(--echo-bright,#a78bfa);letter-spacing:0.12em;font-family:'Cinzel',serif;";
    setNameEl.textContent = `◈ ${setDef.name}`;
    const setCountBadge = doc.createElement('span');
    setCountBadge.style.cssText = 'font-size:8px;padding:1px 7px;border-radius:3px;';
    setCountBadge.textContent = `${setCount} / ${setDef.items.length}`;
    setHeader.append(setNameEl, setCountBadge);
    setPanel.appendChild(setHeader);

    const itemList = doc.createElement('div');
    itemList.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
    setDef.items.forEach((memberId, index) => {
      const row = doc.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:7px;padding:4px 7px;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid var(--border,rgba(255,255,255,0.08));';
      const memberData = data.items[memberId];
      row.textContent = `${setOwnedFlags[index] ? '보유 ' : ''}${memberData?.icon || '?'} ${memberData?.name || memberId}`;
      itemList.appendChild(row);
    });
    setPanel.appendChild(itemList);

    const bonusEntries = Object.entries(setDef.bonuses || {}).sort(([a], [b]) => Number(a) - Number(b));
    bonusEntries.forEach(([tier, bonus]) => {
      const tierNum = Number(tier);
      const isActive = setCount >= tierNum;
      const bonusRow = doc.createElement('div');
      bonusRow.style.cssText = 'display:flex;gap:7px;align-items:flex-start;margin-top:5px;';

      const tierBadge = doc.createElement('div');
      tierBadge.style.cssText = [
        'width:15px;height:15px;border-radius:3px;flex-shrink:0;margin-top:1px;',
        `background:${isActive ? 'rgba(123,47,255,0.25)' : 'rgba(255,255,255,0.04)'};`,
        `border:1px solid ${isActive ? 'rgba(167,139,250,0.5)' : 'var(--border,rgba(255,255,255,0.08))'};`,
        'display:flex;align-items:center;justify-content:center;',
        `font-size:7px;color:${isActive ? 'var(--echo-bright,#a78bfa)' : 'var(--text-dim,#7a7a9a)'};`,
      ].join('');
      tierBadge.textContent = tier;

      const bonusText = doc.createElement('span');
      bonusText.style.cssText = `font-size:10px;color:${isActive ? '#c4b5fd' : 'var(--text-dim,#7a7a9a)'};line-height:1.5;flex:1;`;
      bonusText.textContent = bonus.label || '';
      bonusRow.append(tierBadge, bonusText);

      if (isActive) {
        const activeMark = doc.createElement('span');
        activeMark.style.cssText = 'font-size:8px;color:var(--echo,#00ffcc);flex-shrink:0;';
        activeMark.textContent = '✦';
        bonusRow.appendChild(activeMark);
      }

      setPanel.appendChild(bonusRow);
    });

    body.appendChild(setPanel);
  }

  el.appendChild(body);
  const botBar = doc.createElement('div');
  botBar.style.cssText = `height:2px;background:linear-gradient(90deg,transparent,rgba(${rarityMeta.rgb},0.35),transparent);`;
  el.appendChild(botBar);

  return el;
}
