import { SecurityUtils } from './security.js';
import { highlightDescriptionText } from './description_highlight_runtime.js';

// ═══════════════════════════════════════════════════════
//  description_utils.js — 카드/아이템 텍스트 하이라이팅
//
//  텍스트 표준 (Slay the Spire / Hearthstone 참고):
//  • 피해 X   — 빨간색 (kw-dmg)
//  • 방어막 X  — 파란색 (kw-shield)
//  • 잔향 X   — 보라색 (kw-echo)
//  • 카드 X장  — 초록색 (kw-draw)
//  • 체력 X   — 분홍색 (kw-hp)
//  • 에너지 X  — 금색 (kw-energy)
//  • 상태이상  — 연보라 (kw-debuff)
//  • [소진]  — 주황색 (kw-exhaust)
//  • [지속]  — 청록색 (kw-buff)
// ═══════════════════════════════════════════════════════

export const DescriptionUtils = {
    highlight(text) {
        return highlightDescriptionText(text, { escapeHtml: SecurityUtils.escapeHtml });
    },

    // 카드 타입 표시 텍스트 (한국어 표기)
    getTypeLabel(type) {
        const map = { 'ATTACK': '공격', 'SKILL': '기술', 'POWER': '능력' };
        return map[type] || type;
    },

    // 희귀도 표시 텍스트 (통일된 표기)
    getRarityLabel(rarity) {
        const map = {
            'common': '일반',
            'uncommon': '비범',
            'rare': '희귀',
            'legendary': '전설',
            'boss': '보스'
        };
        return map[rarity] || rarity;
    }
}
