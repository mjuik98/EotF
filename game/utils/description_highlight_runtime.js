import {
  DESCRIPTION_BRACKET_KEYWORD_CLASS_MAP,
  DESCRIPTION_STANDALONE_BUFFS,
  DESCRIPTION_STANDALONE_DEBUFFS,
} from './description_highlight_rules.js';

function tokenLabel(index) {
  let value = index;
  let label = '';
  do {
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);
  return label;
}

export function normalizeDescriptionText(text) {
  let normalizedText = String(text ?? '');
  const setLabelMatch = normalizedText.match(/\[세트:[^\]\n]+\]/);
  normalizedText = normalizedText.replace(/\s*\n?\s*세트\s*\d+\s*개\s*:\s*[^\n]*/g, '').trim();

  if (!setLabelMatch) return normalizedText;

  const setLabel = setLabelMatch[0];
  const body = normalizedText
    .replace(/\s*\[세트:[^\]\n]+\]\s*/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return body ? `${body}\n${setLabel}` : setLabel;
}

function protectRawHtml(normalizedText, escapeHtml) {
  const rawHtmlPlaceholders = [];
  const protectedText = normalizedText.replace(/<[^>\n]*>/g, (match) => {
    const id = `__RAWHTML_${tokenLabel(rawHtmlPlaceholders.length)}__`;
    rawHtmlPlaceholders.push(escapeHtml(match));
    return id;
  });

  return {
    rawHtmlPlaceholders,
    escapedText: escapeHtml(protectedText),
  };
}

function createPlaceholderRuntime(text) {
  const placeholders = [];
  let currentText = text;

  function protect(regex, replacement) {
    currentText = currentText.replace(regex, (match) => {
      const id = `__PH${placeholders.length}__`;
      placeholders.push(replacement(match));
      return id;
    });
  }

  return {
    placeholders,
    protect,
    getText: () => currentText,
    setText: (nextText) => {
      currentText = nextText;
    },
  };
}

function applyHighlightRules(runtime) {
  runtime.protect(/\[세트:[^\]\n]+\]/g, (match) => {
    const setName = match.replace(/^\[세트:|\s*\]$/g, '');
    return `<span class="kw-special kw-set kw-block">◈ 세트: ${setName}</span>`;
  });

  runtime.protect(/[\[【]\s*(소진|지속|즉시|치명타|독|낙인|지역 규칙)\s*[\]】]/g, (match) => {
    const keyword = match.replace(/^[\[【]\s*|\s*[\]】]$/g, '');
    const open = match.trim().startsWith('【') ? '【' : '[';
    const close = open === '【' ? '】' : ']';
    const className = DESCRIPTION_BRACKET_KEYWORD_CLASS_MAP[keyword] || 'kw-special';
    return `<span class="${className} kw-block">${open}${keyword}${close}</span>`;
  });

  runtime.protect(/피해\s*\d+|\d+\s*피해/g, (match) => `<span class="kw-dmg">${match}</span>`);
  runtime.protect(/방어막\s*\d+|\d+\s*방어막/g, (match) => `<span class="kw-shield">${match}</span>`);
  runtime.protect(/방어막|보호막/g, (match) => `<span class="kw-shield">${match}</span>`);
  runtime.protect(/잔향\s*\d+\s*충전|잔향\s*\d+/g, (match) => `<span class="kw-echo">${match}</span>`);
  runtime.protect(/잔향\s*충전/g, (match) => `<span class="kw-echo">${match}</span>`);
  runtime.protect(/카드\s*\d+장/g, (match) => `<span class="kw-draw">${match}</span>`);
  runtime.protect(/체력\s*\d+\s*회복|체력\s*\d+\s*소모|회복\s*\d+/g, (match) => (
    `<span class="${match.includes('소모') ? 'kw-dmg' : 'kw-heal'}">${match}</span>`
  ));
  runtime.protect(/에너지\s*\d+\s*획득|에너지\s*\d+\s*소모|에너지\s*\+\d+/g, (match) => (
    `<span class="${match.includes('소모') ? 'kw-dmg' : 'kw-energy'}">${match}</span>`
  ));
  runtime.protect(/에너지\s*\d+/g, (match) => `<span class="kw-energy">${match}</span>`);
  runtime.protect(/(약화|기절|독|낙인|화염|처형 표식|저주|봉인)\s*\d*턴/g, (match) => `<span class="kw-debuff">${match}</span>`);
  runtime.protect(/기절\s*면역\s*\d+\s*회/g, (match) => `<span class="kw-buff">${match}</span>`);
  runtime.protect(/반사\s*및\s*무효화\s*\d+\s*턴/g, (match) => `<span class="kw-buff">${match}</span>`);
  runtime.protect(/(회피|은신|반사|면역|가속|공명)\s*\d+\s*(턴|회)/g, (match) => `<span class="kw-buff">${match}</span>`);
  runtime.protect(/(회피|은신|반사|면역|가속|공명)\s*\d+/g, (match) => `<span class="kw-buff">${match}</span>`);
  runtime.protect(new RegExp(`(${DESCRIPTION_STANDALONE_DEBUFFS.join('|')})`, 'g'), (match) => `<span class="kw-debuff">${match}</span>`);
  runtime.protect(new RegExp(`(${DESCRIPTION_STANDALONE_BUFFS.join('|')})`, 'g'), (match) => `<span class="kw-buff">${match}</span>`);
  runtime.protect(/잔향(?!\s*\d)/g, (match) => `<span class="kw-echo">${match}</span>`);
  runtime.protect(/연쇄/g, (match) => `<span class="kw-chain">${match}</span>`);
  runtime.protect(/치명타/g, (match) => `<span class="kw-crit">${match}</span>`);
  runtime.protect(/\d+\s*×\s*\d+/g, (match) => `<span class="kw-num">${match}</span>`);
  runtime.protect(/\b\d+\b/g, (match) => `<span class="kw-num">${match}</span>`);
  runtime.protect(/매 턴[:\s]/g, (match) => `<span class="kw-buff kw-trigger">${match}</span>`);
  runtime.protect(/(전투 시작|턴 종료|적 처치 시|처치 시)[:\s]/g, (match) => `<span class="kw-special kw-trigger">${match}</span>`);
}

function restorePlaceholders(text, placeholders, rawHtmlPlaceholders) {
  let restoredText = text;

  for (let index = placeholders.length - 1; index >= 0; index -= 1) {
    restoredText = restoredText.split(`__PH${index}__`).join(placeholders[index]);
  }

  for (let index = rawHtmlPlaceholders.length - 1; index >= 0; index -= 1) {
    restoredText = restoredText.split(`__RAWHTML_${tokenLabel(index)}__`).join(rawHtmlPlaceholders[index]);
  }

  return restoredText;
}

export function highlightDescriptionText(text, { escapeHtml } = {}) {
  const normalizedText = normalizeDescriptionText(text);
  if (!normalizedText) return '';

  const { rawHtmlPlaceholders, escapedText } = protectRawHtml(normalizedText, escapeHtml);
  const runtime = createPlaceholderRuntime(escapedText);
  applyHighlightRules(runtime);

  return restorePlaceholders(runtime.getText(), runtime.placeholders, rawHtmlPlaceholders)
    .replace(/\r?\n/g, '<br>');
}
