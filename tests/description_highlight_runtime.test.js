import { describe, expect, it } from 'vitest';

import {
  highlightDescriptionText,
  normalizeDescriptionText,
} from '../game/utils/description_highlight_runtime.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

describe('description_highlight_runtime', () => {
  it('normalizes set labels onto the final line while dropping verbose bonus lines', () => {
    const normalized = normalizeDescriptionText(
      '피해 10. [세트:혈맹]\n세트 2개: 카드 사용마다 잔향 +4\n세트 3개: 연속 3회 공격 피해 +10%',
    );

    expect(normalized).toBe('피해 10.\n[세트:혈맹]');
  });

  it('highlights escaped text without allowing injected html back into the output', () => {
    const highlighted = highlightDescriptionText('<img src=x onerror=alert(1)> 피해 14', { escapeHtml });

    expect(highlighted).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(highlighted).not.toContain('<img src=x onerror=alert(1)>');
    expect(highlighted).toContain('<span class="kw-dmg">피해 14</span>');
  });

  it('keeps status phrases and trigger prefixes in a stable replacement order', () => {
    const highlighted = highlightDescriptionText('매 턴: 반사 1턴 획득. [지역 규칙] 피해 14', { escapeHtml });

    expect(highlighted).toContain('<span class="kw-buff kw-trigger">매 턴:</span>');
    expect(highlighted).toContain('<span class="kw-buff">반사 1턴</span>');
    expect(highlighted).toContain('<span class="kw-special kw-block">[지역 규칙]</span>');
    expect(highlighted).toContain('<span class="kw-dmg">피해 14</span>');
  });
});
