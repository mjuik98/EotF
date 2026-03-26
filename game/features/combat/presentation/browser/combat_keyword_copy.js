import { setDatasetBooleanState } from './combat_surface_state.js';

export const COMBAT_KEYWORD_MAP = Object.freeze({
  '[소진]': { title: '소진', text: '사용 후 이번 전투에서 영구 제거됩니다. 소모 더미로 가지 않습니다.' },
  '[지속]': { title: '지속', text: '전투가 끝날 때까지 계속 효과가 발동되는 능력 카드입니다.' },
  '[즉시]': { title: '즉시', text: '사용 즉시 발동되는 강력한 일회성 효과입니다.' },
  잔향: { title: '잔향', text: '특수 능력을 발동하는 에너지 자원. 0~100 사이를 유지하며, 게이지에 따라 효과가 달라집니다.' },
  연쇄: { title: '연쇄', text: '연속 공격 횟수를 나타냅니다. 5회 이상 쌓이면 다음 공격에 추가 피해가 적용됩니다.' },
  침묵: { title: '침묵', text: '침묵사냥꾼 전용 게이지. 최대치(10) 도달 시 다음 공격이 대폭 강화됩니다.' },
  약화: { title: '약화', text: '대상의 공격력이 50% 감소합니다. 지속 시간이 만료되면 해제됩니다.' },
  '기절 면역': { title: '기절 면역', text: '적의 기절 효과를 지정된 횟수만큼 완전히 무효화합니다.' },
  기절: { title: '기절', text: '다음 턴에 행동하지 못합니다. 기절 턴에는 공격과 방어 모두 불가합니다.' },
  독: { title: '독', text: '중독된 대상의 턴 시작 시 독 스택 × 5 피해를 입힙니다. 매 턴 독 스택이 1씩 감소합니다.' },
  화염: { title: '화염', text: '매 턴 시작 시 피해 5를 입습니다. 지속 시간이 끝나면 소멸합니다.' },
  '처형 표식': { title: '처형 표식', text: '3턴 후 표식이 폭발하여 피해 30을 입힙니다. 시간이 얼마 남지 않았을 때 더욱 위험합니다.' },
  면역: { title: '면역', text: '모든 피해와 상태이상을 완전히 무효화합니다. 지속 시간 동안 무적 상태입니다.' },
  회피: { title: '회피', text: '다음 적의 공격 1회를 완전히 무효화합니다. 회피 후 즉시 소모됩니다.' },
  은신: { title: '은신', text: '다음에 사용하는 공격 카드가 치명타로 적중합니다. 공격 즉시 은신이 해제됩니다.' },
  반사: { title: '반사', text: '피해를 받을 때 해당 피해를 공격자에게 되돌립니다.' },
  '시간 왜곡': { title: '시간 왜곡', text: '매 턴 시작 시 에너지를 1 추가로 획득합니다. 전투가 끝날 때까지 지속됩니다.' },
  드로우: { title: '드로우', text: '덱에서 카드를 손패로 가져옵니다. 덱이 비면 소모 더미를 섞어 새 덱을 만듭니다.' },
});

export function getCombatKeywordTooltip(keyword) {
  return COMBAT_KEYWORD_MAP[keyword] || null;
}

export function resolveCombatKeywordTooltips(card) {
  const seen = new Set();
  const desc = String(card?.desc || '');
  const sortedKeys = Object.keys(COMBAT_KEYWORD_MAP).sort((a, b) => b.length - a.length);

  const matches = sortedKeys
    .map((keyword) => {
      const index = desc.indexOf(keyword);
      if (index >= 0) return { keyword, index };
      if (card?.exhaust && keyword === '[소진]') return { keyword, index: Number.MAX_SAFE_INTEGER - 1 };
      return null;
    })
    .filter(Boolean)
    .sort((left, right) => left.index - right.index);

  return matches
    .map(({ keyword }) => {
      const keywordData = getCombatKeywordTooltip(keyword);
      if (!keywordData) return null;
      if (seen.has(keywordData.title)) return null;
      seen.add(keywordData.title);
      return {
        keyword,
        title: keywordData.title,
        text: keywordData.text,
      };
    })
    .filter(Boolean);
}

export function resolvePrimaryCombatKeywordTooltip(card) {
  return resolveCombatKeywordTooltips(card)[0] || null;
}

function setKeywordTabActive(tab, active) {
  tab.className = active ? 'card-clone-keyword-tab is-active' : 'card-clone-keyword-tab';
}

function setMechanicTriggerActive(trigger, active) {
  trigger.className = active
    ? 'card-hover-mechanic-trigger is-active'
    : 'card-hover-mechanic-trigger';
}

export function createCombatCloneKeywordPanel(doc, card) {
  const keywordItems = resolveCombatKeywordTooltips(card);
  if (keywordItems.length === 0) return { link: null, mechanics: null, panel: null };

  const mechanics = doc.createElement('div');
  mechanics.className = 'card-hover-mechanics';

  const link = doc.createElement('div');
  link.className = 'card-clone-keyword-link';

  const panel = doc.createElement('div');
  panel.className = 'card-clone-keyword-panel';
  setDatasetBooleanState(panel, 'open', false);
  const chipRow = doc.createElement('div');
  chipRow.className = 'card-clone-keyword-tabs';
  const activeBody = doc.createElement('div');
  activeBody.className = 'card-clone-keyword-body';
  const activeTitle = doc.createElement('div');
  activeTitle.className = 'card-clone-keyword-body-title';
  const activeContent = doc.createElement('div');
  activeContent.className = 'card-clone-keyword-body-content';
  activeBody.appendChild(activeTitle);
  activeBody.appendChild(activeContent);

  const setActive = (index) => {
    keywordItems.forEach((item, itemIndex) => {
      const chip = chipRow.children?.[itemIndex];
      if (chip) setKeywordTabActive(chip, itemIndex === index);
      const trigger = mechanics.children?.[itemIndex];
      if (trigger) setMechanicTriggerActive(trigger, itemIndex === index);
      if (itemIndex === index) {
        activeTitle.textContent = item.title;
        activeContent.textContent = item.text;
      }
    });
  };

  keywordItems.forEach((item, index) => {
    const chip = doc.createElement('button');
    chip.type = 'button';
    chip.className = 'card-clone-keyword-tab';
    chip.textContent = item.title;
    setKeywordTabActive(chip, index === 0);
    chip.addEventListener('mouseenter', () => setActive(index));
    chip.addEventListener('click', () => setActive(index));
    chipRow.appendChild(chip);

    const trigger = doc.createElement('button');
    trigger.type = 'button';
    trigger.className = 'card-hover-mechanic-trigger';
    trigger.dataset.keywordIndex = String(index);
    trigger.textContent = item.title;
    setMechanicTriggerActive(trigger, index === 0);
    mechanics.appendChild(trigger);
  });

  setActive(0);
  panel.__setActiveKeyword = setActive;
  panel.__keywordItems = keywordItems;
  panel.appendChild(chipRow);
  panel.appendChild(activeBody);
  return { link, mechanics, panel };
}
