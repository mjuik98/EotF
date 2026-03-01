/**
 * 전투 로그 메시지 표준화 유틸리티
 */
export const LogUtils = {
    // 기본 공격
    formatAttack(attacker, target, damage) {
        return `⚔️ ${attacker} → ${target}: ${damage} 피해`;
    },
    formatCritical(attacker, target, damage) {
        return `💥 CRITICAL! ${attacker} → ${target}: ${damage} 피해`;
    },

    // ★ 카드 사용 (카드명 포함)
    formatCardAttack(cardName, target, damage) {
        return `🃏 [${cardName}] → ${target}: ${damage} 피해`;
    },
    formatCardCritical(cardName, target, damage) {
        return `💥 [${cardName}] CRITICAL! → ${target}: ${damage} 피해`;
    },
    formatCardHeal(cardName, amount) {
        return `🃏 [${cardName}]: ${amount} 회복`;
    },
    formatCardShield(cardName, amount) {
        return `🃏 [${cardName}]: 방어막 +${amount}`;
    },
    formatCardBuff(cardName, buffDesc) {
        return `🃏 [${cardName}]: ${buffDesc}`;
    },
    formatCardStatus(cardName, target, statusName, duration) {
        return `🃏 [${cardName}] → ${target}: ${statusName} ${duration}턴`;
    },

    // ★ 아이템 효과
    formatItem(itemName, effectDesc) {
        return `💍 ${itemName}: ${effectDesc}`;
    },

    // 기존 유지
    formatHeal(target, amount) {
        return `💚 ${target}: ${amount} 회복`;
    },
    formatShield(target, amount) {
        return `🛡️ ${target}: 방어막 +${amount}`;
    },
    formatStatus(target, statusName, duration) {
        return `💫 ${target}: ${statusName} (${duration}턴)`;
    },
    formatStatChange(target, statName, amount, isBuff = true) {
        const icon = isBuff ? '🔺' : '🔻';
        const sign = amount >= 0 ? '+' : '';
        return `${icon} ${target}: ${statName} ${sign}${amount}`;
    },
    formatAura(msg) { return `🌀 ${msg}`; },
    formatSystem(msg) { return `⚙️ ${msg}`; },
    formatEcho(msg) { return `✨ ${msg}`; }
};
