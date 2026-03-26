import { SecurityUtils } from './security.js';

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
        if (!text) return '';

        function tokenLabel(index) {
            let value = index;
            let label = '';
            do {
                label = String.fromCharCode(65 + (value % 26)) + label;
                value = Math.floor(value / 26) - 1;
            } while (value >= 0);
            return label;
        }

        let normalizedText = String(text);
        const setLabelMatch = normalizedText.match(/\[세트:[^\]\n]+\]/);
        normalizedText = normalizedText.replace(/\s*\n?\s*세트\s*\d+\s*개\s*:\s*[^\n]*/g, '').trim();
        if (setLabelMatch) {
            const setLabel = setLabelMatch[0];
            const body = normalizedText
                .replace(/\s*\[세트:[^\]\n]+\]\s*/g, ' ')
                .replace(/[ \t]+\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            normalizedText = body ? `${body}\n${setLabel}` : setLabel;
        }

        // ── 1단계: raw HTML 태그 보호 후 이스케이프 (XSS 방지) ──
        const rawHtmlPlaceholders = [];
        normalizedText = normalizedText.replace(/<[^>\n]*>/g, (match) => {
            const id = `__RAWHTML_${tokenLabel(rawHtmlPlaceholders.length)}__`;
            rawHtmlPlaceholders.push(SecurityUtils.escapeHtml(match));
            return id;
        });
        normalizedText = SecurityUtils.escapeHtml(normalizedText);

        // ── 2단계: 특수 키워드 블록 ([ ] 포맷) ────────────────
        // 플레이스홀더 방식으로 이중 치환 방지
        const placeholders = [];
        let ph = normalizedText;

        function protect(regex, replacement) {
            ph = ph.replace(regex, (match) => {
                const id = `__PH${placeholders.length}__`;
                placeholders.push(replacement(match));
                return id;
            });
        }

        // 세트 아이템 태그 처리 [세트:이름]
        protect(/\[세트:[^\]\n]+\]/g, (m) => {
            const setName = m.replace(/^\[세트:|\s*\]$/g, '');
            return `<span class="kw-special kw-set kw-block">◈ 세트: ${setName}</span>`;
        });

        // 대괄호/겹괄호 블록 키워드
        const bracketKeywordClassMap = {
            소진: 'kw-exhaust',
            지속: 'kw-buff',
            즉시: 'kw-burst',
            치명타: 'kw-crit',
            독: 'kw-debuff',
            낙인: 'kw-debuff',
            '지역 규칙': 'kw-special',
        };
        protect(/[\[【]\s*(소진|지속|즉시|치명타|독|낙인|지역 규칙)\s*[\]】]/g, (match) => {
            const keyword = match.replace(/^[\[【]\s*|\s*[\]】]$/g, '');
            const open = match.trim().startsWith('【') ? '【' : '[';
            const close = open === '【' ? '】' : ']';
            const className = bracketKeywordClassMap[keyword] || 'kw-special';
            return `<span class="${className} kw-block">${open}${keyword}${close}</span>`;
        });

        // ── 3단계: 숫자 + 단위 조합 (순서 중요: 긴 패턴부터) ────

        // "피해 X" 또는 "X 피해"
        protect(/피해\s*\d+|\d+\s*피해/g, (m) =>
            `<span class="kw-dmg">${m}</span>`
        );

        // "방어막 X" 또는 "X 방어막"
        protect(/방어막\s*\d+|\d+\s*방어막/g, (m) =>
            `<span class="kw-shield">${m}</span>`
        );

        // "방어막의", "방어막만큼", "보호막 획득" 같은 비숫자 문맥
        protect(/방어막|보호막/g, (m) =>
            `<span class="kw-shield">${m}</span>`
        );

        // "잔향 X 충전" 또는 "잔향 X"
        protect(/잔향\s*\d+\s*충전|잔향\s*\d+/g, (m) =>
            `<span class="kw-echo">${m}</span>`
        );

        // "잔향 충전" (숫자 없이)
        protect(/잔향\s*충전/g, (m) =>
            `<span class="kw-echo">${m}</span>`
        );

        // "카드 X장" 드로우
        protect(/카드\s*\d+장/g, (m) =>
            `<span class="kw-draw">${m}</span>`
        );

        // "체력 X 회복" 또는 "체력 X 소모"
        protect(/체력\s*\d+\s*회복|체력\s*\d+\s*소모|회복\s*\d+/g, (m) => {
            const isCost = m.includes('소모');
            return `<span class="${isCost ? 'kw-dmg' : 'kw-heal'}">${m}</span>`;
        });

        // "에너지 X 획득" 또는 "에너지 X 소모"
        protect(/에너지\s*\d+\s*획득|에너지\s*\d+\s*소모|에너지\s*\+\d+/g, (m) => {
            const isCost = m.includes('소모');
            return `<span class="${isCost ? 'kw-dmg' : 'kw-energy'}">${m}</span>`;
        });

        // "에너지 X" 독립적
        protect(/에너지\s*\d+/g, (m) =>
            `<span class="kw-energy">${m}</span>`
        );

        // ── 4단계: 상태이상 키워드 ───────────────────────────────

        // 부여 상태이상 (빨간 디버프)
        protect(/(약화|기절|독|낙인|화염|처형 표식|저주|봉인)\s*\d*턴/g, (m) =>
            `<span class="kw-debuff">${m}</span>`
        );

        // 복합 버프 문구
        protect(/기절\s*면역\s*\d+\s*회/g, (m) =>
            `<span class="kw-buff">${m}</span>`
        );

        protect(/반사\s*및\s*무효화\s*\d+\s*턴/g, (m) =>
            `<span class="kw-buff">${m}</span>`
        );

        // 턴/횟수 버프
        protect(/(회피|은신|반사|면역|가속|공명)\s*\d+\s*(턴|회)/g, (m) =>
            `<span class="kw-buff">${m}</span>`
        );

        // 획득 버프
        protect(/(회피|은신|반사|면역|가속|공명)\s*\d+/g, (m) =>
            `<span class="kw-buff">${m}</span>`
        );

        // 독립 키워드 (숫자 없이)
        const standaloneDebuffs = ['약화', '기절', '독', '낙인', '화염', '처형 표식', '침묵', '봉인'];
        const standaloneBuffs = ['회피', '은신', '반사', '면역', '가속', '공명'];

        protect(new RegExp(`(${standaloneDebuffs.join('|')})`, 'g'), (m) =>
            `<span class="kw-debuff">${m}</span>`
        );

        protect(new RegExp(`(${standaloneBuffs.join('|')})`, 'g'), (m) =>
            `<span class="kw-buff">${m}</span>`
        );

        // ── 5단계: 잔향 / 연쇄 단독 키워드 ─────────────────────

        protect(/잔향(?!\s*\d)/g, (m) =>
            `<span class="kw-echo">${m}</span>`
        );

        protect(/연쇄/g, (m) =>
            `<span class="kw-chain">${m}</span>`
        );

        protect(/치명타/g, (m) =>
            `<span class="kw-crit">${m}</span>`
        );

        // ── 6단계: 숫자 × 배수 (피해 X × N) ────────────────────
        protect(/\d+\s*×\s*\d+/g, (m) =>
            `<span class="kw-num">${m}</span>`
        );

        // ── 7단계: 남은 독립 숫자 하이라이트 ────────────────────
        protect(/\b\d+\b/g, (m) =>
            `<span class="kw-num">${m}</span>`
        );

        // ── 8단계: 매 턴 / 전투 시작 등 트리거 접두어 ───────────
        protect(/매 턴[:\s]/g, (m) =>
            `<span class="kw-buff kw-trigger">${m}</span>`
        );

        protect(/(전투 시작|턴 종료|적 처치 시|처치 시)[:\s]/g, (m) =>
            `<span class="kw-special kw-trigger">${m}</span>`
        );


        // ── 플레이스홀더 복원 ─────────────────────────────────────
        // 역순으로 복원해야 중첩된 플레이스홀더가 정상적으로 치환됩니다.
        for (let i = placeholders.length - 1; i >= 0; i--) {
            // 정규 표현식을 사용하거나, 검색 문자열 자체에 $ 등이 포함될 수 있으므로
            // 안전하게 함수를 전달하여 치환한다.
            ph = ph.split(`__PH${i}__`).join(placeholders[i]);
            // 또는: ph = ph.replace(new RegExp(`__PH${i}__`, 'g'), () => placeholders[i]);
        }

        for (let i = rawHtmlPlaceholders.length - 1; i >= 0; i--) {
            ph = ph.split(`__RAWHTML_${tokenLabel(i)}__`).join(rawHtmlPlaceholders[i]);
        }

        // 설명 문자열 개행을 실제 줄바꿈으로 렌더링한다.
        ph = ph.replace(/\r?\n/g, '<br>');

        return ph;
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
