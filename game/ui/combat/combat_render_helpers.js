export function enemyHpColor(pct) {
    if (pct > 60) return 'linear-gradient(90deg,#cc2244,#ff4466)';
    if (pct > 30) return 'linear-gradient(90deg,#cc5500,#ff8800)';
    return 'linear-gradient(90deg,#8b0000,#ff2200)';
}

export function calcSelectedPreview(gs, data, enemy, cardCostUtils) {
    if (!gs?.combat?.playerTurn) return null;
    const atkCards = gs.player.hand.filter((id) => {
        const c = data.cards[id];
        if (!c || c.type !== 'ATTACK' || !c.dmg) return false;
        return cardCostUtils.canPlay(id, c, gs.player);
    });
    if (!atkCards.length) return null;

    const totalDmg = atkCards.reduce((sum, id) => {
        const c = data.cards[id];
        const resBonus = gs.getBuff('resonance')?.dmgBonus || 0;
        const accelBonus = gs.getBuff('acceleration')?.dmgBonus || 0;
        return sum + (c.dmg || 0) + resBonus + accelBonus;
    }, 0);
    const enemyShield = enemy.shield || 0;
    const netDmg = Math.max(0, totalDmg - enemyShield);
    return { netDmg, enemyShield };
}

export function selectedPreviewText(preview) {
    if (!preview) return '';
    return preview.enemyShield > 0
        ? `예상 피해 ${preview.netDmg} (방어막 ${preview.enemyShield})`
        : `예상 총 피해 ${preview.netDmg}`;
}

