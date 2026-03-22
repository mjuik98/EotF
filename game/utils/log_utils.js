/**
 * 전투 로그 메시지 표준화 유틸리티
 */
import { getStatusDisplayName } from '../../data/status_effects_data.js';

function _toStatusName(statusName) {
    return getStatusDisplayName(statusName);
}

function _normalizeRecentFeedSource(source) {
    if (!source || typeof source !== 'object') return null;
    const type = typeof source.type === 'string' && source.type ? source.type : 'effect';
    const id = typeof source.id === 'string' && source.id ? source.id : null;
    const name = typeof source.name === 'string' && source.name ? source.name : (id || null);
    if (!name) return null;
    return { type, id, name };
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

export function getCurrentCardLogSource(gs) {
    const currentCard = gs?._currentCard;
    if (!currentCard || typeof currentCard !== 'object') return null;
    const id = typeof currentCard.id === 'string' && currentCard.id ? currentCard.id : null;
    const name = typeof currentCard.name === 'string' && currentCard.name ? currentCard.name : (id || null);
    if (!name) return null;
    return { type: 'card', id, name };
}

export function createRecentFeedMeta({ source = null, text = '', eligible = true } = {}) {
    const nextMeta = {};
    const normalizedSource = _normalizeRecentFeedSource(source);
    if (normalizedSource) nextMeta.source = normalizedSource;
    nextMeta.recentFeed = {
        eligible: !!eligible,
        text: typeof text === 'string' ? text : '',
    };
    return nextMeta;
}

export function formatRecentFeedText({ sourceName, sourceType = 'effect', targetName = '', outcome = '' } = {}) {
    const normalizedSourceName = typeof sourceName === 'string' ? sourceName.trim() : '';
    const normalizedOutcome = typeof outcome === 'string' ? outcome.trim() : '';
    if (!normalizedSourceName) return normalizedOutcome;
    const sourceLabel = sourceType === 'card' ? `[${normalizedSourceName}]` : normalizedSourceName;
    if (targetName) return `${sourceLabel} -> ${targetName}: ${normalizedOutcome}`;
    return `${sourceLabel}: ${normalizedOutcome}`;
}

export function formatRecentFeedStatusOutcome(status, duration) {
    const normalizedDuration = Number.isFinite(duration) ? Math.max(0, Math.floor(duration)) : 0;
    return `${_toStatusName(status)} ${normalizedDuration}턴`;
}
