/**
 * game_data.js — 게임 데이터 통합 Re-export
 *
 * 기존 1400줄 가량의 거대한 데이터 파일을 도메인별로 분리하고,
 * 이 파일은 통합 export surface만 제공합니다.
 * 브라우저 전역 노출은 platform/legacy bootstrap 경계에서 처리합니다.
 */

import { ASSETS, UPGRADE_MAP, CARDS } from './cards.js';
import { ITEMS } from './items.js';
import { ENEMIES } from './enemies.js';
import { REGIONS, START_DECKS, BASE_REGION_SEQUENCE, BRANCH_ROUTES } from './regions.js';
import { CLASS_METADATA, CLASS_ID_ORDER } from './class_metadata.js';
import { EVENTS, STORY_FRAGMENTS } from './events_data.js';
import { DEATH_QUOTES } from './death_quotes.js';
import { INSCRIPTIONS, INSCRIPTION_SYNERGIES } from './inscriptions.js';
import { ASSET_MANIFEST, ASSET_SUMMARY } from './asset_manifest.js';
import { resolveAssetPreviewEntry, resolveAssetPreviewUrl } from './asset_preview_runtime.js';

const ASSET_PREVIEW = Object.freeze({
  resolveEntry: resolveAssetPreviewEntry,
  resolveUrl: resolveAssetPreviewUrl,
});

export const DATA = {
  assets: ASSETS,
  assetManifest: ASSET_MANIFEST,
  assetPreview: ASSET_PREVIEW,
  assetSummary: ASSET_SUMMARY,
  cards: CARDS,
  upgradeMap: UPGRADE_MAP,
  items: ITEMS,
  enemies: ENEMIES,
  regions: REGIONS,
  baseRegionSequence: BASE_REGION_SEQUENCE,
  branchRoutes: BRANCH_ROUTES,
  startDecks: START_DECKS,
  classes: CLASS_METADATA,
  classIdOrder: CLASS_ID_ORDER,
  events: EVENTS,
  storyFragments: STORY_FRAGMENTS,
  deathQuotes: DEATH_QUOTES,
  inscriptions: INSCRIPTIONS,
  synergies: INSCRIPTION_SYNERGIES
};

// 개별 import를 지원하기 위해 모두 re-export
export {
  ASSETS,
  UPGRADE_MAP,
  CARDS,
  ITEMS,
  ENEMIES,
  REGIONS,
  BASE_REGION_SEQUENCE,
  BRANCH_ROUTES,
  START_DECKS,
  CLASS_METADATA,
  CLASS_ID_ORDER,
  EVENTS,
  STORY_FRAGMENTS,
  DEATH_QUOTES,
  INSCRIPTIONS,
  INSCRIPTION_SYNERGIES,
  ASSET_MANIFEST,
  ASSET_PREVIEW,
  ASSET_SUMMARY
};
