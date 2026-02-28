/**
 * 전투 로그 메시지 표준화 유틸리티
 */
export const LogUtils = {
    /**
     * 공격 로그 포맷
     * @param {string} attacker 공격자 이름
     * @param {string} target 대상 이름
     * @param {number} damage 피해량
     * @returns {string}
     */
    formatAttack(attacker, target, damage) {
        return `⚔️ ${attacker} -> ${target}: ${damage} 피해`;
    },

    /**
     * 크리티컬 공격 로그 포맷
     */
    formatCritical(attacker, target, damage) {
        return `💥 CRITICAL! ${attacker} -> ${target}: ${damage} 피해`;
    },

    /**
     * 회복 로그 포맷
     */
    formatHeal(target, amount) {
        return `💚 ${target}: ${amount} 회복`;
    },

    /**
     * 방어막 로그 포맷
     */
    formatShield(target, amount) {
        return `🛡️ ${target}: ${amount} 방어막 생성`;
    },

    /**
     * 상태이상 부여 로그 포맷
     */
    formatStatus(target, statusName, duration) {
        return `💫 ${target}: ${statusName} (${duration}턴)`;
    },

    /**
     * 능력치 변화 로그 포맷
     */
    formatStatChange(target, statName, amount, isBuff = true) {
        const icon = isBuff ? '🔺' : '🔻';
        const sign = amount >= 0 ? '+' : '';
        return `${icon} ${target}: ${statName} ${sign}${amount}`;
    },

    /**
     * 오라/광역 효과 로그 포맷
     */
    formatAura(msg) {
        return `🌀 ${msg}`;
    },

    /**
     * 특수 이벤트/시스템 로그
     */
    formatSystem(msg) {
        return `⚙️ ${msg}`;
    },

    /**
     * 에코/잔향 관련 로그
     */
    formatEcho(msg) {
        return `✨ ${msg}`;
    }
};
