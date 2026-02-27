/**
 * game_data.js — 게임 데이터 통합 Re-export
 *
 * 기존 1400줄 가량의 거대한 데이터 파일을 도메인별로 분리하고,
 * 기존 코드와의 호환성을 위해 이 파일에서 모두 모아서 `window.DATA` 및 개별 상수로 export 합니다.
 */

import { ASSETS, UPGRADE_MAP, CARDS } from './cards.js';
import { ITEMS } from './items.js';
import { ENEMIES } from './enemies.js';
import { REGIONS, START_DECKS } from './regions.js';
import { CLASS_METADATA } from './class_metadata.js';
import { EVENTS, STORY_FRAGMENTS, DEATH_QUOTES } from './events_data.js';

export const DATA = {
  assets: ASSETS,
  cards: CARDS,
  upgradeMap: UPGRADE_MAP,
  items: ITEMS,
  enemies: ENEMIES,
  regions: REGIONS,
  startDecks: START_DECKS,
  classes: CLASS_METADATA,
  events: EVENTS,
  storyFragments: STORY_FRAGMENTS,
  deathQuotes: DEATH_QUOTES
};

// 브라우저 환경 전역 노출 (하위 호환 및 전역 상태 참조용)
if (typeof window !== 'undefined') {
  window.DATA = DATA;
}

// 개별 import를 지원하기 위해 모두 re-export
export {
  ASSETS,
  UPGRADE_MAP,
  CARDS,
  ITEMS,
  ENEMIES,
  REGIONS,
  START_DECKS,
  EVENTS,
  STORY_FRAGMENTS,
  DEATH_QUOTES
};
