/**
 * 전투 로그 메시지 표준화 유틸리티
 */
const STATUS_NAME_MAP = {
    resonance: '공명',
    acceleration: '가속',
    soul_armor: '영혼 갑옷',
    vanish: '은신',
    immune: '무적',
    shadow_atk: '그림자 강화',
    mirror: '반사막',
    zeroCost: '무소모',
    weakened: '약화',
    slowed: '감속',
    burning: '화상',
    cursed: '저주',
    poisoned: '중독',
    stunned: '기절',
    confusion: '혼란',
    dodge: '회피',
    strength: '힘',
    dexterity: '민첩',
    vulnerable: '취약',
    blessing_of_light: '빛의 축복',
    blessing_of_light_plus: '빛의 축복+',
    divine_grace: '신성 은총',
    time_warp: '시간 왜곡',
    time_warp_plus: '시간 왜곡+',
    berserk_mode: '광전사의 격노',
    berserk_mode_plus: '광전사의 격노+',
    unbreakable_wall: '불굴의 벽',
    unbreakable_wall_plus: '불굴의 벽+',
    echo_on_hit: '피격 잔향',
    marked: '표식',
    thorns: '가시',
    doom: '파멸',
    silence: '침묵',
};

function _toStatusName(statusName) {
    const raw = String(statusName || '');
    if (!raw) return raw;
    const key = raw.trim();
    return STATUS_NAME_MAP[key]
        || STATUS_NAME_MAP[key.replace(/_plus$/i, '')]
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
