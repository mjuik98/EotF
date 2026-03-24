export function applyCombatRelicSlotVisuals(slot, rarity, setState, doc) {
  const visualStyle = rarity === 'legendary'
    ? 'border-color:rgba(192,132,252,.42);background:linear-gradient(180deg,rgba(28,12,40,.96),rgba(12,8,26,.98));box-shadow:inset 0 0 0 1px rgba(192,132,252,.1),0 0 18px rgba(192,132,252,.12);color:rgba(245,235,255,.96);'
    : rarity === 'rare'
      ? 'border-color:rgba(240,180,41,.34);background:linear-gradient(180deg,rgba(30,20,6,.94),rgba(14,10,6,.96));box-shadow:inset 0 0 0 1px rgba(240,180,41,.08),0 0 14px rgba(240,180,41,.08);color:rgba(255,236,186,.96);'
      : rarity === 'uncommon'
        ? 'border-color:rgba(74,243,204,.28);background:linear-gradient(180deg,rgba(7,23,24,.92),rgba(9,12,24,.94));box-shadow:inset 0 0 0 1px rgba(74,243,204,.05),0 0 12px rgba(74,243,204,.06);color:rgba(226,255,248,.95);'
        : 'border-color:rgba(155,138,184,.16);background:linear-gradient(180deg,rgba(20,18,34,.9),rgba(10,10,22,.92));color:rgba(232,234,255,.9);';
  slot.style.cssText = `${slot.style.cssText || ''}${visualStyle}`;

  if (!setState) return;
  const badge = doc?.createElement?.('span');
  if (!badge) return;
  badge.setAttribute?.('aria-hidden', 'true');
  badge.style.cssText = `position:absolute;top:4px;left:4px;width:6px;height:6px;border-radius:999px;pointer-events:none;background:${setState === 'active' ? 'rgba(74,243,204,.96)' : 'rgba(74,243,204,.76)'};box-shadow:0 0 0 1px rgba(4,10,18,.84),0 0 ${setState === 'active' ? '10px' : '8px'} rgba(74,243,204,${setState === 'active' ? '.5' : '.3'});`;
  slot.appendChild(badge);
}

export function applyCombatRelicPanelVisuals(detailPanel, rarity) {
  if (!detailPanel?.style) return;
  if (rarity === 'legendary') {
    detailPanel.style.borderColor = 'rgba(192,132,252,.34)';
    detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28),0 0 22px rgba(192,132,252,.1)';
    return;
  }
  if (rarity === 'rare') {
    detailPanel.style.borderColor = 'rgba(240,180,41,.28)';
    detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28),0 0 18px rgba(240,180,41,.08)';
    return;
  }
  if (rarity === 'uncommon') {
    detailPanel.style.borderColor = 'rgba(74,243,204,.24)';
    detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28),0 0 18px rgba(74,243,204,.08)';
    return;
  }
  detailPanel.style.borderColor = 'rgba(123,47,255,.24)';
  detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28)';
}
