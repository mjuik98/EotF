'use strict';

(function initDescriptionUtils(globalObj) {
    /**
     * 카드 또는 아이템의 설명 텍스트를 게임의 키워드 체계에 맞춰 하이라이트합니다.
     * 주요 키워드와 숫자에 HTML 스팬 태그를 입힙니다.
     */
    const DescriptionUtils = {
        highlight(text) {
            if (!text) return '';

            // 1. 숫자 하이라이트 (다음에 한글이 오는 경우와 일반적인 숫자)
            let highlighted = text.replace(/(\d+)/g, '<span class="kw-num">$1</span>');

            // 2. 구분자 처리: ", " 또는 " + "를 <br>로 치환하여 줄 바꿈 유도
            // (숫자 내의 쉼표나 단순 기호와 혼동되지 않도록 공백 포함 패턴 사용)
            highlighted = highlighted.replace(/, /g, ', <br>');
            highlighted = highlighted.replace(/ \+ /g, ' + <br>');

            // 3. 주요 게임 시스템 키워드
            const keywords = {
                '피해': 'kw-dmg',
                '방어막': 'kw-shield',
                'Echo': 'kw-echo',
                'Chain': 'kw-chain',
                '에너지': 'kw-energy',
                '침묵': 'kw-silence',
                '모멘텀': 'kw-momentum',
                '체력': 'kw-hp',
                'HP': 'kw-hp',
                '골드': 'kw-gold',
                '드로우': 'kw-draw',
                '소진': 'kw-exhaust',
                '강화': 'kw-upgrade',
                '크리티컬': 'kw-crit',
                '치명타': 'kw-crit',
                '기절': 'kw-debuff',
                '약화': 'kw-debuff',
                '표식': 'kw-debuff',
                '독': 'kw-debuff',
                '화염': 'kw-debuff',
                '면역': 'kw-buff',
                '버스트': 'kw-burst',
                'Burst': 'kw-burst',
                'Resonance': 'kw-special',
                '소각': 'kw-exhaust',
                '에너지 -': 'kw-energy',
                '에너지-': 'kw-energy'
            };

            // 키워드 치환 (가장 긴 단어부터 매칭되도록 정렬)
            const sortedKeywords = Object.keys(keywords).sort((a, b) => b.length - a.length);

            sortedKeywords.forEach(kw => {
                const className = keywords[kw];
                // 중복 치환 방지를 위해 특수 문자로 감싸거나 정확한 워드 바운더리 고려
                // 한글 키워드는 RegExp(/\b/)가 잘 작동하지 않으므로 단순 치환 후 클래스 부여
                const regex = new RegExp(kw, 'g');
                highlighted = highlighted.replace(regex, `<span class="${className}">${kw}</span>`);
            });

            return highlighted;
        }
    };

    globalObj.DescriptionUtils = DescriptionUtils;
})(window);
