import { describe, expect, it } from 'vitest';
import { CARDS } from '../data/cards.js';
import { DescriptionUtils } from '../game/utils/description_utils.js';

const BRACKET_KEYWORDS = ['소진', '지속', '즉시', '치명타', '약화', '봉인'];

function escapeRegExp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('DescriptionUtils bracket keyword highlight', () => {
  it('highlights bracketed keywords used across card descriptions', () => {
    const cards = Object.values(CARDS || {});

    cards.forEach((card) => {
      const desc = String(card?.desc || '');
      if (!desc) return;

      const highlighted = DescriptionUtils.highlight(desc);

      BRACKET_KEYWORDS.forEach((keyword) => {
        const hasBracketKeyword = new RegExp(
          `[\\[\\u3010]\\s*${escapeRegExp(keyword)}\\s*[\\]\\u3011]`,
        ).test(desc);
        if (!hasBracketKeyword) return;

        const wrappedKeyword = new RegExp(
          `<span class="[^"]*kw-[^"]*">[^<]*${escapeRegExp(keyword)}[^<]*<\\/span>`,
        );
        expect(highlighted, `${card.id}:${keyword}`).toMatch(wrappedKeyword);
      });
    });
  });

  it('supports square bracket exhaust notation', () => {
    const highlighted = DescriptionUtils.highlight('테스트 [소진].');
    expect(highlighted).toContain('kw-exhaust');
    expect(highlighted).toContain('[소진]');
  });
});

describe('DescriptionUtils set label normalization', () => {
  it('strips detailed set bonus lines and keeps only the set label line', () => {
    const highlighted = DescriptionUtils.highlight(
      '공명 폭발 발동 시: 모든 적에게 기절 1턴 부여 시도. [세트:폭풍]\n세트 2개: 카드 사용마다 잔향 +4\n세트 3개: 연속 3회 공격 피해 +10%',
    );

    expect(highlighted).not.toContain('세트 2개:');
    expect(highlighted).not.toContain('세트 3개:');
    expect(highlighted).toContain('kw-special kw-set kw-block');
    expect(highlighted).toContain('세트: 폭풍');
    expect(highlighted).toContain('<br><span class="kw-special kw-set kw-block"');
  });

  it('moves the set label to the final line', () => {
    const highlighted = DescriptionUtils.highlight('피해 10. [세트:혈맹]');
    expect(highlighted).toContain('세트: 혈맹');
    expect(highlighted).toMatch(/<br><span class="kw-special kw-set kw-block"[\s\S]*세트:\s*혈맹[\s\S]*<\/span>\s*$/);
  });
});

describe('DescriptionUtils status duration highlight', () => {
  it('highlights full timed buff phrases including the turn suffix', () => {
    const highlighted = DescriptionUtils.highlight('반사 1턴 획득. 은신 1턴 획득');

    expect(highlighted).toContain('<span class="kw-buff">반사 1턴</span> 획득');
    expect(highlighted).toContain('<span class="kw-buff">은신 1턴</span> 획득');
  });

  it('keeps composite immunity and nullify buffs within a single highlight span', () => {
    const highlighted = DescriptionUtils.highlight('기절 면역 1회 획득. 반사 및 무효화 1턴 획득');

    expect(highlighted).toContain('<span class="kw-buff">기절 면역 1회</span> 획득');
    expect(highlighted).toContain('<span class="kw-buff">반사 및 무효화 1턴</span> 획득');
  });

  it('escapes arbitrary html while still applying repository-owned keyword markup', () => {
    const highlighted = DescriptionUtils.highlight('<img src=x onerror=alert(1)> 피해 14');

    expect(highlighted).not.toContain('<img src=x onerror=alert(1)>');
    expect(highlighted).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(highlighted).toContain('kw-dmg');
  });

  it('supports the shared region rule marker without inline HTML', () => {
    const highlighted = DescriptionUtils.highlight('[지역 규칙] 피해 14');

    expect(highlighted).toContain('kw-special kw-block');
    expect(highlighted).toContain('[지역 규칙]');
    expect(highlighted).toContain('kw-dmg');
  });
});
