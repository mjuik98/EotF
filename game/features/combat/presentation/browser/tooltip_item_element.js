import { DomSafe } from '../../../../utils/dom_safe.js';
import { buildItemDetailViewModel } from './item_detail_view_model.js';

export function createItemTooltipElement(doc, item, data, state) {
  const { rarityMeta } = state;
  const detail = buildItemDetailViewModel(item.id || '', item, data, state);
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
  iconBox.textContent = detail.icon || '?';
  const infoCol = doc.createElement('div');
  infoCol.style.cssText = 'padding-top:2px;flex:1;';
  const nameEl = doc.createElement('div');
  nameEl.style.cssText = `font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:${rarityMeta.color};margin-bottom:5px;line-height:1.2;`;
  nameEl.textContent = detail.title;
  const badges = doc.createElement('div');
  badges.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';
  const rarityBadge = doc.createElement('span');
  rarityBadge.style.cssText = `font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.15em;background:rgba(${rarityMeta.rgb},0.1);border:1px solid rgba(${rarityMeta.rgb},0.35);border-radius:4px;padding:2px 7px;color:${rarityMeta.color};`;
  rarityBadge.textContent = detail.rarityLabel;
  const triggerBadge = doc.createElement('span');
  triggerBadge.style.cssText = 'font-size:8px;letter-spacing:0.04em;background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:4px;padding:2px 7px;color:var(--echo,#00ffcc);';
  triggerBadge.textContent = `⚡ ${detail.triggerText}`;
  badges.append(rarityBadge, triggerBadge);
  infoCol.append(nameEl, badges);
  header.append(iconBox, infoCol);
  body.appendChild(header);

  const descBox = doc.createElement('div');
  descBox.style.cssText = 'font-size:11.5px;color:var(--text,#c8c8e8);line-height:1.72;background:rgba(255,255,255,0.025);border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:8px;padding:8px 10px;';
  DomSafe.setHighlightedText(descBox, detail.desc || '');
  body.appendChild(descBox);

  if (detail.charge) {
    const chargePanel = doc.createElement('div');
    chargePanel.style.cssText = 'padding:8px 10px;border-radius:8px;background:rgba(0,255,204,0.04);border:1px solid rgba(0,255,204,0.15);';
    const chargeLabel = doc.createElement('div');
    chargeLabel.style.cssText = "font-size:9px;color:var(--text-dim,#7a7a9a);letter-spacing:0.08em;margin-bottom:6px;font-family:'Cinzel',serif;";
    chargeLabel.textContent = detail.charge.label;
    const chargeValue = doc.createElement('div');
    chargeValue.style.cssText = 'font-size:10px;color:var(--echo,#00ffcc);';
    chargeValue.textContent = detail.charge.value;
    chargePanel.append(chargeLabel, chargeValue);
    body.appendChild(chargePanel);
  }

  if (detail.set) {
    const setPanel = doc.createElement('div');
    setPanel.style.cssText = 'background:rgba(123,47,255,0.07);border:1px solid rgba(123,47,255,0.25);border-radius:8px;padding:9px 11px;';
    const setHeader = doc.createElement('div');
    setHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
    const setNameEl = doc.createElement('span');
    setNameEl.style.cssText = "font-size:9px;color:var(--echo-bright,#a78bfa);letter-spacing:0.12em;font-family:'Cinzel',serif;";
    setNameEl.textContent = `◈ ${detail.set.name}`;
    const setCountBadge = doc.createElement('span');
    setCountBadge.style.cssText = 'font-size:8px;padding:1px 7px;border-radius:3px;';
    setCountBadge.textContent = `${detail.set.count} / ${detail.set.total}`;
    setHeader.append(setNameEl, setCountBadge);
    setPanel.appendChild(setHeader);

    const itemList = doc.createElement('div');
    itemList.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
    detail.set.members.forEach((member) => {
      const row = doc.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:7px;padding:4px 7px;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid var(--border,rgba(255,255,255,0.08));';
      row.textContent = `${member.owned ? '보유 ' : ''}${member.icon || '?'} ${member.name || member.id}`;
      itemList.appendChild(row);
    });
    setPanel.appendChild(itemList);

    detail.set.bonuses.forEach((bonus) => {
      const isActive = bonus.active;
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
      tierBadge.textContent = String(bonus.tier);

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
