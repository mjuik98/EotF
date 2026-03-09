/**
 * 전투 로그 메시지 표준화 유틸리티
 */
import { ENEMY_STATUS_KR, STATUS_KR, STATUS_NAME_OVERRIDES } from '../../data/status_effects_data.js';

function _toStatusName(statusName) {
    const raw = String(statusName || '');
    if (!raw) return raw;
    const key = raw.trim();
    const normalizedKey = key.replace(/_plus$/i, '');
    return STATUS_KR[key]?.name
        || STATUS_KR[normalizedKey]?.name
        || ENEMY_STATUS_KR[key]
        || ENEMY_STATUS_KR[normalizedKey]
        || STATUS_NAME_OVERRIDES[key]
        || STATUS_NAME_OVERRIDES[normalizedKey]
        || key;
}

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
        return `🃏 [${cardName}] → ${target}: ${_toStatusName(statusName)} ${duration}턴`;
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
        return `💫 ${target}: ${_toStatusName(statusName)} (${duration}턴)`;
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
