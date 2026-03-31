import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { CLASS_METADATA } from '../data/class_metadata.js';
import { EVENTS } from '../data/events_data.js';
import { getStatusTooltipMeta } from '../data/status_tooltip_meta_data.js';
import { buildDeathFragmentChoices } from '../game/features/combat/presentation/browser/death_fragment_choice_presenter.js';
import { createShopEventService } from '../game/features/event/application/shop_service.js';
import {
  buildCardPopupPayload,
  buildEnemyPopupPayload,
} from '../game/features/codex/public.js';
import { renderCharacterInfoPanel } from '../game/features/title/ports/public_character_select_presentation_capabilities.js';
import { buildCharacterSelectShellMarkup } from '../game/features/title/platform/browser/ensure_character_select_shell.js';

function createPanel() {
  return {
    style: { setProperty() { } },
    innerHTML: '',
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
  };
}

describe('player_facing_localization_regression', () => {
  it('keeps title and character select headings in Korean', () => {
    const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    const shellMarkup = buildCharacterSelectShellMarkup();

    expect(html).toContain('잔향의 공명');
    expect(html).toContain('체력');
    expect(html).toContain('이어하기');
    expect(html).toContain('저장된 런');
    expect(html).toContain('재개와 슬롯 관리를 정리합니다');
    expect(html).toContain('게임 종료');
    expect(html).toMatch(/title-menu-section title-menu-section--utility[\s\S]*id="mainQuitBtn" class="title-menu-btn title-menu-btn--utility"/);
    expect(html).not.toMatch(/id="mainQuitBtn" class="title-menu-btn title-menu-btn--danger"/);
    expect(html).not.toContain('새 런 시작');
    expect(html).not.toContain('모드와 각인 확인');
    expect(html).not.toContain('해금한 적과 카드');
    expect(html).not.toContain('오디오와 연출 조정');
    expect(html).not.toContain('브라우저 창 닫기');
    expect(html).not.toContain('메인 메뉴');
    expect(html).not.toContain('세션 이탈');
    expect(html).not.toContain('게임을 마치고 브라우저를 벗어납니다');
    expect(shellMarkup).toContain('당신의 잔향을 선택하라');
  });

  it('keeps class presentation labels in Korean', () => {
    expect(CLASS_METADATA.swordsman.title).toBe('Swordsman');
    expect(CLASS_METADATA.mage.title).toBe('Mage');
    expect(CLASS_METADATA.hunter.title).toBe('Hunter');
    expect(CLASS_METADATA.paladin.title).toBe('Paladin');
    expect(CLASS_METADATA.berserker.title).toBe('Berserker');
    expect(CLASS_METADATA.guardian.title).toBe('Guardian');
    expect(CLASS_METADATA.swordsman.traitTitle).toBe('공명');
    expect(CLASS_METADATA.mage.traitTitle).toBe('메아리');
    expect(CLASS_METADATA.hunter.traitTitle).toBe('정적');
    expect(CLASS_METADATA.paladin.traitTitle).toBe('성가');
    expect(CLASS_METADATA.berserker.traitTitle).toBe('불협화음');
    expect(CLASS_METADATA.guardian.traitTitle).toBe('잔영 갑주');
  });

  it('keeps character mastery panel labels in Korean', () => {
    const panel = createPanel();

    renderCharacterInfoPanel({
      panel,
      selectedChar: {
        accent: '#7cc8ff',
        color: '#13354b',
        name: '잔향검사',
        title: '검사',
        traitTitle: '공명',
        traitDesc: '카드를 사용할수록 공명이 커진다.',
        stats: { HP: 80, ATK: 60, DEF: 70, ECH: 55, RHY: 45, RES: 65 },
        startRelic: { icon: '*', name: '무딘 검', desc: '시작 유물.' },
        startDeck: ['strike'],
        playStyle: ['연속 압박형'],
        featuredCardIds: ['strike'],
        featuredCardTags: { strike: '기본기' },
        echoSkill: { icon: '!', name: '공명 폭풍', desc: '폭발한다.', echoCost: '잔향 게이지' },
      },
      classProgress: { level: 12, totalXp: 2200, nextLevelXp: null, progress: 1 },
      roadmap: [],
      buildSectionLabel: (label) => `<span>${label}</span>`,
      buildRadar: () => '<svg>radar</svg>',
      cards: { strike: { name: '타격' } },
      generalTooltipUI: { hideGeneralTooltip() { }, showGeneralTooltip() { } },
      cardTooltipUI: { hideTooltip() { }, showTooltip() { } },
      doc: {},
      win: {},
      hover() { },
      echo() { },
      openModal() { },
    });

    expect(panel.innerHTML).toContain('클래스 숙련도');
    expect(panel.innerHTML).toContain('최고 레벨');
    expect(panel.innerHTML).not.toContain(' XP');
  });

  it('keeps codex popup stat and cost labels in Korean', () => {
    const enemyPayload = buildEnemyPopupPayload(
      { id: 'wolf', name: 'Wolf', isElite: true, icon: 'W', atk: 5, hp: 12 },
      { safeHtml: (value) => value },
    );
    const cardPayload = buildCardPopupPayload(
      { id: 'strike', name: 'Strike', type: 'ATTACK', rarity: 'common', cost: 1, desc: 'Deal 6', icon: 'S' },
      { gs: { meta: { codexRecords: { cards: { strike: { used: 4, upgradedDiscovered: true, upgradeUsed: 1 } } } } }, data: { cards: { strike_plus: { id: 'strike_plus', type: 'ATTACK', name: '타격+', cost: 2, desc: '피해 12' } } }, safeHtml: (value) => value },
    );

    expect(enemyPayload.html).toContain('체력');
    expect(enemyPayload.html).toContain('공격력');
    expect(cardPayload.html).toContain('비용');
    expect(cardPayload.html).not.toContain(' cost');
  });

  it('keeps event, shop, fragment, and tooltip copy in Korean', () => {
    const shopEvent = createShopEventService({ uiActions: { handleChoice: () => null } }).create({}, {}, {
      getShopCost: (_gs, baseCost) => baseCost,
    });
    const fragmentChoices = buildDeathFragmentChoices(() => 0);
    const echoEvent = EVENTS.find((event) => event.id === 'silent_pool');
    const blessingOfLightMeta = getStatusTooltipMeta('blessing_of_light');

    expect(shopEvent.choices[0].text).toContain('체력 +30');
    expect(shopEvent.choices[0].text).toContain('골드');
    expect(fragmentChoices).toContainEqual(expect.objectContaining({
      name: '잔향 강화',
      desc: '다음 런 시작 시 잔향 +30',
    }));
    expect(echoEvent.choices[0].text).toBe('🍵 들이킨다 (체력 -10, 덱에 비범 카드 추가)');
    expect(echoEvent.choices[1].text).toBe('🌊 삼켜진다 (체력 -20, 덱에 레어 카드 추가)');
    expect(echoEvent.choices[2].text).toBe('🔮 관찰만 한다 (잔향 +30)');
    expect(blessingOfLightMeta.nextTurnText({ healPerTurn: 3 })).toBe('매 턴 종료 시 체력 +3 회복');
    expect(blessingOfLightMeta.statUnit).toBe('체력');
  });
});
