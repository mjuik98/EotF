import { AudioEngine } from '../engine/audio.js';
import { ParticleSystem } from '../engine/particles.js';
import { ScreenShake } from '../engine/screenshake.js';
import { HitStop } from '../engine/hitstop.js';
import { FovEngine } from '../engine/fov.js';
import { DATA } from '../data/game_data.js';
import { NODE_META } from './constants/node_meta.js';
import { DifficultyScaler } from './difficulty_scaler.js';
import { SetBonusSystem } from './set_bonus_system.js';
import { SaveSystem } from './save_system.js';
import { RunRules, getRegionData, getBaseRegionIndex, getRegionCount } from './run_rules.js';
import { RandomUtils } from './random_utils.js';

import { TitleCanvasUI } from './title_canvas_ui.js';
import { ClassMechanics } from './class_mechanics.js';
import { ScreenUI } from './screen_ui.js';
import { RunModeUI } from './run_mode_ui.js';
import { ClassSelectUI } from './class_select_ui.js';
import { MetaProgressionUI } from './meta_progression_ui.js';
import { HelpPauseUI } from './help_pause_ui.js';
import { RegionTransitionUI } from './region_transition_ui.js';
import { RunStartUI } from './run_start_ui.js';
import { RunSetupUI } from './run_setup_ui.js';
import { GameCanvasSetupUI } from './game_canvas_setup_ui.js';
import { MazeSystem } from './maze_system_ui.js';
import { StoryUI } from './story_ui.js';
import { CombatStartUI } from './combat_start_ui.js';
import { CombatUI } from './combat_ui.js';
import { CombatHudUI } from './combat_hud_ui.js';
import { EchoSkillUI } from './echo_skill_ui.js';
import { CombatTurnUI } from './combat_turn_ui.js';
import { HudUpdateUI } from './hud_update_ui.js';
import { StatusEffectsUI } from './status_effects_ui.js';
import { CombatInfoUI } from './combat_info_ui.js';
import { CombatActionsUI } from './combat_actions_ui.js';
import { FeedbackUI } from './feedback_ui.js';
import { TooltipUI } from './tooltip_ui.js';
import { EventUI } from './event_ui.js';
import { RewardUI } from './reward_ui.js';
import { RunReturnUI } from './run_return_ui.js';
import { DeckModalUI } from './deck_modal_ui.js';
import { CodexUI } from './codex_ui.js';
import { CardUI } from './card_ui.js';
import { CardTargetUI } from './card_target_ui.js';
import { DomValueUI } from './dom_value_ui.js';
import { WorldCanvasUI } from './world_canvas_ui.js';

import { WorldRenderLoopUI } from './world_render_loop_ui.js';
import { MapGenerationUI } from './map_generation_ui.js';
import { MapNavigationUI } from './map_navigation_ui.js';
import { MapUI } from './map_ui.js';
import { GameBootUI } from './game_boot_ui.js';
import { GameStateCoreMethods } from './game_state_core_methods.js';
import { GS } from './game_state.js';


// ═══════════════════════════════════════════════════════════
//  ECHO OF THE FALLEN v2 — 완전 통합 코드베이스
//  모든 Phase 1~4 기능을 단일 아키텍처로 통합
//  훅 체인 제거 · 클린 FSM · 단일 게임 루프
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────
// WEB AUDIO ENGINE
// ────────────────────────────────────────

Object.assign(GS, GameStateCoreMethods || {});

// ────────────────────────────────────────
// GAME NAMESPACE & DI SYSTEM (Phase 3)
// ────────────────────────────────────────
const GAME = {
  State: GS,
  Data: null,
  Audio: null,
  Particle: null,
  Modules: {}, // Loaded UI/Logic modules

  // Registry for cross-module calls replacing the legacy window wrapper functions.
  // Modules will register their public API here.
  API: {},

  init(global) {
    this.Data = DATA;
    this.Audio = AudioEngine;
    this.Particle = ParticleSystem;

    // Bind legacy global compatibility
    global.GS = this.State;
    global.GameState = this.State;
    global.GAME = this;
    global.DATA = DATA;
  },

  register(moduleName, moduleObj) {
    this.Modules[moduleName] = moduleObj;
    // Auto-bind APIs if exposed
    if (moduleObj && moduleObj.api) {
      Object.assign(this.API, moduleObj.api);
    }
  },

  require(moduleName) {
    const mod = this.Modules[moduleName] || window[moduleName];
    if (!mod) {
      throw new Error(`[GAME] Critical module missing: ${moduleName}`);
    }
    return mod;
  },

  // Builds standard Dependencies object for UI modules
  getDeps() {
    return {
      gs: this.State,
      data: this.Data,
      doc: document,
      win: window,
      audioEngine: this.Audio,
      particleSystem: this.Particle,
      api: this.API,
      runRules: RunRules,
      classMechanics: ClassMechanics,
      getRegionData: getRegionData,
      getBaseRegionIndex: getBaseRegionIndex,
      getRegionCount: getRegionCount,
      difficultyScaler: DifficultyScaler,
      shuffleArray: RandomUtils.shuffleArray,
      hitStop: HitStop,
      screenShake: ScreenShake,
      fovEngine: FovEngine,
      setBonusSystem: SetBonusSystem,
    };
  }
};

GAME.init(window);

// ────────────────────────────────────────
// LEGACY COMPATIBILITY WRAPPERS
// (To be phased out by routing through GAME.API directly)
// ────────────────────────────────────────
const _baseDeps = () => GAME.getDeps();

function _getStoryDeps() {
  return {
    ..._baseDeps(),
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    showWorldMemoryNotice,
  };
}

const StorySystem = {
  unlockNextFragment() {
    StoryUI?.unlockNextFragment?.(_getStoryDeps());
  },
  showRunFragment() {
    StoryUI?.showRunFragment?.(_getStoryDeps());
  },
  displayFragment(frag) {
    StoryUI?.displayFragment?.(frag, _getStoryDeps());
  },
  checkHiddenEnding() {
    return !!StoryUI?.checkHiddenEnding?.(_getStoryDeps());
  },
  showNormalEnding() {
    StoryUI?.showNormalEnding?.(_getStoryDeps());
  },
  showHiddenEnding() {
    StoryUI?.showHiddenEnding?.(_getStoryDeps());
  },
};

// ────────────────────────────────────────
// CLASS MECHANICS
// ────────────────────────────────────────
function _getClassMechanics() {
  return ClassMechanics || {};
}

// ────────────────────────────────────────
// CANVAS SETUP
// ────────────────────────────────────────
let gameCanvas, gameCtx;
let minimapCanvas, minimapCtx;
let combatCanvas; // 파티클용

// ────────────────────────────────────────
// MAZE SYSTEM — 독립 풀스크린 오버레이
// ────────────────────────────────────────

MazeSystem?.configure?.({
  gs: GS,
  doc: document,
  win: window,
  fovEngine: FovEngine,
  showWorldMemoryNotice: (text) => showWorldMemoryNotice(text),
  startCombat: (isBoss) => startCombat(isBoss),
});

function initTitleCanvas() {
  TitleCanvasUI?.init?.({ doc: document });
}

function resizeTitleCanvas() {
  TitleCanvasUI?.resize?.({ doc: document });
}

function animateTitle() {
  TitleCanvasUI?.animate?.({ doc: document });
}

function _applyGameCanvasRefs(refs) {
  if (!refs) return;
  gameCanvas = refs.gameCanvas;
  gameCtx = refs.gameCtx;
  minimapCanvas = refs.minimapCanvas;
  minimapCtx = refs.minimapCtx;
  combatCanvas = refs.combatCanvas;
}

function initGameCanvas() {
  const refs = GameCanvasSetupUI?.init?.(GAME.getDeps());
  _applyGameCanvasRefs(refs);
}

function resizeGameCanvas() {
  GameCanvasSetupUI?.resize?.();
  _applyGameCanvasRefs(GameCanvasSetupUI?.getRefs?.());
}

// ────────────────────────────────────────
// GAME LOOP — 단일 통합 루프
// ────────────────────────────────────────
function gameLoop(timestamp) {
  const deps = GAME.getDeps();
  deps.refs = { gameCanvas, gameCtx };
  deps.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  deps.gameLoop = gameLoop;
  deps.renderMinimap = renderMinimap;
  deps.renderNodeInfo = renderNodeInfo;
  WorldRenderLoopUI?.gameLoop?.(timestamp, deps);
}

function renderGameWorld(dt, ctx, w, h) {
  const deps = GAME.getDeps();
  deps.refs = { gameCanvas, gameCtx };
  deps.renderMinimap = renderMinimap;
  deps.renderNodeInfo = renderNodeInfo;
  WorldRenderLoopUI?.renderGameWorld?.(dt, ctx, w, h, deps);
}

function renderRegionBackground(ctx, w, h) {
  WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, GAME.getDeps());
}

function renderDynamicLights(ctx, w, h) {
  WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, GAME.getDeps());
}


function _getWorldCanvasDeps() {
  return {
    ..._baseDeps(),
    getRegionData,
  };
}

function renderNodeInfo(ctx, w, h) {
  WorldCanvasUI?.renderNodeInfo?.(ctx, w, h, _getWorldCanvasDeps());
}


// ── 지역/층별 상태 문구 헬퍼 ──
function getFloorStatusText(regionId, floor) {
  return WorldCanvasUI?.getFloorStatusText?.(regionId, floor, _getWorldCanvasDeps()) || '';
}

// 캔버스 텍스트 줄바꿈 헬퍼
function wrapCanvasText(ctx, text, x, y, maxW, lineH) {
  WorldCanvasUI?.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
}

// 캔버스 둥근 사각형
function roundRect(ctx, x, y, w, h, r) {
  WorldCanvasUI?.roundRect?.(ctx, x, y, w, h, r);
}
function roundRectTop(ctx, x, y, w, h, r) {
  WorldCanvasUI?.roundRectTop?.(ctx, x, y, w, h, r);
}

// ────────────────────────────────────────
// MAP SYSTEM
// ────────────────────────────────────────
function generateMap(regionIdx) {
  const deps = GAME.getDeps();
  deps.updateNextNodes = updateNextNodes;
  deps.updateUI = updateUI;
  deps.showWorldMemoryNotice = showWorldMemoryNotice;
  MapGenerationUI?.generateMap?.(regionIdx, deps);
}

function renderMinimap() {
  const deps = GAME.getDeps();
  deps.minimapCanvas = minimapCanvas;
  deps.minimapCtx = minimapCtx;
  deps.nodeMeta = NODE_META;
  deps.getFloorStatusText = getFloorStatusText;
  deps.moveToNodeHandlerName = 'moveToNode';
  MapUI?.renderMinimap?.(deps);
}

export function updateNextNodes() {
  const deps = GAME.getDeps();
  deps.minimapCanvas = minimapCanvas;
  deps.minimapCtx = minimapCtx;
  deps.nodeMeta = NODE_META;
  deps.getFloorStatusText = getFloorStatusText;
  deps.moveToNodeHandlerName = 'moveToNode';
  MapUI?.updateNextNodes?.(deps);
}


function showFullMap() {
  const deps = GAME.getDeps();
  deps.minimapCanvas = minimapCanvas;
  deps.minimapCtx = minimapCtx;
  deps.nodeMeta = NODE_META;
  deps.getFloorStatusText = getFloorStatusText;
  deps.moveToNodeHandlerName = 'moveToNode';
  MapUI?.showFullMap?.(deps);
}
window.showFullMap = showFullMap;

function isNodeAccessible(node) {
  if (node.floor !== GS.currentFloor + 1) return false;
  return true;
}

function moveToNode(node) {
  const deps = GAME.getDeps();
  deps.updateNextNodes = updateNextNodes;
  deps.renderMinimap = renderMinimap;
  deps.updateUI = updateUI;
  deps.startCombat = startCombat;
  deps.triggerRandomEvent = triggerRandomEvent;
  deps.showShop = showShop;
  deps.showRestSite = showRestSite;
  MapNavigationUI?.moveToNode?.(node, deps);
}

// ────────────────────────────────────────
// COMBAT SYSTEM
// ────────────────────────────────────────
function startCombat(isBoss = false) {
  const deps = GAME.getDeps();
  deps.showWorldMemoryNotice = showWorldMemoryNotice;
  deps.updateChainUI = updateChainUI;
  deps.renderCombatEnemies = renderCombatEnemies;
  deps.renderCombatCards = renderCombatCards;
  deps.updateCombatLog = updateCombatLog;
  deps.updateNoiseWidget = updateNoiseWidget;
  deps.showTurnBanner = showTurnBanner;
  deps.resetCombatInfoPanel = _resetCombatInfoPanel;
  deps.refreshCombatInfoPanel = _refreshCombatInfoPanel;
  deps.updateUI = updateUI;
  deps.updateClassSpecialUI = updateClassSpecialUI;
  CombatStartUI?.startCombat?.(isBoss, deps);
}

// Echo 스킬 툴팁
// ── HUD 핀/언핀 토글 ──
function toggleHudPin() {
  CombatHudUI?.toggleHudPin?.(GAME.getDeps());
}
window.toggleHudPin = toggleHudPin;

function showEchoSkillTooltip(event) {
  CombatHudUI?.showEchoSkillTooltip?.(event, GAME.getDeps());
}
function hideEchoSkillTooltip() {
  CombatHudUI?.hideEchoSkillTooltip?.(GAME.getDeps());
}

// 턴 전환 중앙 배너
function showTurnBanner(type) {
  CombatHudUI?.showTurnBanner?.(type, GAME.getDeps());
}

function showIntentTooltip(event, enemyIdx) {
  const deps = GAME.getDeps();
  deps.selectTargetHandlerName = 'selectTarget';
  deps.showIntentTooltipHandlerName = 'showIntentTooltip';
  deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
  CombatUI?.showIntentTooltip?.(event, enemyIdx, deps);
}

function hideIntentTooltip() {
  const deps = GAME.getDeps();
  deps.selectTargetHandlerName = 'selectTarget';
  deps.showIntentTooltipHandlerName = 'showIntentTooltip';
  deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
  CombatUI?.hideIntentTooltip?.(deps);
}

window.showIntentTooltip = showIntentTooltip;
window.hideIntentTooltip = hideIntentTooltip;

function renderCombatEnemies() {
  const deps = GAME.getDeps();
  deps.selectTargetHandlerName = 'selectTarget';
  deps.showIntentTooltipHandlerName = 'showIntentTooltip';
  deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
  CombatUI?.renderCombatEnemies?.(deps);
}

// 단일 적 HP만 빠르게 갱신 (공격 직후 호출용)
function updateEnemyHpUI(idx, enemy) {
  const deps = GAME.getDeps();
  deps.selectTargetHandlerName = 'selectTarget';
  deps.showIntentTooltipHandlerName = 'showIntentTooltip';
  deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
  CombatUI?.updateEnemyHpUI?.(idx, enemy, deps);
}

function getCardTypeClass(type) {
  return CardUI?.getCardTypeClass?.(type) || '';
}
function getCardTypeLabelClass(type) {
  return CardUI?.getCardTypeLabelClass?.(type) || '';
}

function _baseCardDeps() {
  const deps = GAME.getDeps();
  deps.playCardHandlerName = 'GS.playCard';
  deps.renderCombatCardsHandlerName = 'renderCombatCards';
  deps.dragStartHandlerName = 'handleCardDragStart';
  deps.dragEndHandlerName = 'handleCardDragEnd';
  deps.showTooltipHandlerName = 'showTooltip';
  deps.hideTooltipHandlerName = 'hideTooltip';
  return deps;
}

function renderCombatCards() {
  CardUI?.renderCombatCards?.(_baseCardDeps());
}

function updateHandFanEffect() {
  CardUI?.updateHandFanEffect?.(_baseCardDeps());
}

function renderHand() {
  CardUI?.renderHand?.(_baseCardDeps());
}

function updateCombatLog() {
  CombatHudUI?.updateCombatLog?.(GAME.getDeps());
}

function updateEchoSkillBtn() {
  CombatHudUI?.updateEchoSkillBtn?.(GAME.getDeps());
}

function useEchoSkill() {
  const deps = GAME.getDeps();
  deps.showEchoBurstOverlay = showEchoBurstOverlay;
  deps.renderCombatEnemies = renderCombatEnemies;
  deps.renderCombatCards = renderCombatCards;
  EchoSkillUI?.useEchoSkill?.(deps);
}

function sortHandByEnergy() {
  const deps = GAME.getDeps();
  deps.renderCombatCards = renderCombatCards;
  deps.updateUI = updateUI;
  CombatActionsUI?.sortHandByEnergy?.(deps);
}
window.sortHandByEnergy = sortHandByEnergy;

function drawCard() {
  const deps = GAME.getDeps();
  deps.renderCombatCards = renderCombatCards;
  deps.updateUI = updateUI;
  CombatActionsUI?.drawCard?.(deps);
}

function _getCombatTurnBaseDeps() {
  const deps = GAME.getDeps();
  deps.enemyTurn = enemyTurn;
  deps.updateChainUI = updateChainUI;
  deps.showTurnBanner = showTurnBanner;
  deps.renderCombatEnemies = renderCombatEnemies;
  deps.renderCombatCards = renderCombatCards;
  deps.updateStatusDisplay = updateStatusDisplay;
  deps.updateClassSpecialUI = updateClassSpecialUI;
  deps.updateUI = updateUI;
  deps.showEchoBurstOverlay = showEchoBurstOverlay;
  deps.showDmgPopup = showDmgPopup;
  return deps;
}

function endPlayerTurn() {
  CombatTurnUI?.endPlayerTurn?.(_getCombatTurnBaseDeps());
}

function enemyTurn() {
  CombatTurnUI?.enemyTurn?.(_getCombatTurnBaseDeps());
}

function processEnemyStatusTicks() {
  CombatTurnUI?.processEnemyStatusTicks?.(_getCombatTurnBaseDeps());
}

function handleBossPhaseShift(enemy, idx) {
  CombatTurnUI?.handleBossPhaseShift?.(enemy, idx, _getCombatTurnBaseDeps());
}

function handleEnemyEffect(effect, enemy, idx) {
  CombatTurnUI?.handleEnemyEffect?.(effect, enemy, idx, _getCombatTurnBaseDeps());
}

// ────────────────────────────────────────
// EVENT SYSTEM
// ────────────────────────────────────────
function _getEventDeps() {
  return {
    ..._baseDeps(),
    runRules: RunRules,

    updateUI,
    showItemToast,
    playItemGet: () => AudioEngine.playItemGet(),
  };
}

function triggerRandomEvent() {
  EventUI?.triggerRandomEvent?.(_getEventDeps());
}

function _updateEventGoldBar() {
  EventUI?.updateEventGoldBar?.(_getEventDeps());
}

function showEvent(event) {
  EventUI?.showEvent?.(event, _getEventDeps());
}

function resolveEvent(choiceIdx) {
  EventUI?.resolveEvent?.(choiceIdx, _getEventDeps());
}

function showShop() {
  EventUI?.showShop?.(_getEventDeps());
}

function showRestSite() {
  EventUI?.showRestSite?.(_getEventDeps());
}

function showCardDiscard(gs, isBurn = false) {
  EventUI?.showCardDiscard?.(gs, isBurn, _getEventDeps());
}

function showItemShop(gs) {
  EventUI?.showItemShop?.(gs, _getEventDeps());
}

function _getRewardDeps() {
  return {
    ..._baseDeps(),
    switchScreen,
    returnToGame,
    showItemToast,
    playItemGet: () => AudioEngine.playItemGet(),
  };
}

function showRewardScreen(isBoss) {
  RewardUI?.showRewardScreen?.(isBoss, _getRewardDeps());
}

function takeRewardCard(cardId) {
  RewardUI?.takeRewardCard?.(cardId, _getRewardDeps());
}

function takeRewardItem(itemKey) {
  RewardUI?.takeRewardItem?.(itemKey, _getRewardDeps());
}

function showSkipConfirm() {
  RewardUI?.showSkipConfirm?.(_getRewardDeps());
}

function hideSkipConfirm() {
  RewardUI?.hideSkipConfirm?.(_getRewardDeps());
}

function skipReward() {
  RewardUI?.skipReward?.(_getRewardDeps());
}

function _getRunReturnDeps() {
  return {
    ..._baseDeps(),
    runRules: RunRules,

    switchScreen,
    updateUI,
    updateNextNodes,
    advanceToNextRegion,
    finalizeRunOutcome,
    storySystem: StorySystem,
  };
}

function returnToGame(fromReward) {
  RunReturnUI?.returnToGame?.(fromReward, _getRunReturnDeps());
}

// ────────────────────────────────────────
// UI SYSTEM — 단일 통합 updateUI (배치 처리)
// ────────────────────────────────────────
let _gameStarted = false; // 게임 시작 전에는 즉시 실행
function _getHudUpdateDeps() {
  return {
    ..._baseDeps(),
    setBonusSystem: SetBonusSystem,

    isGameStarted: () => _gameStarted,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    setBar: (id, pct) => setBar(id, pct),
    setText: (id, val) => setText(id, val),
    updateNoiseWidget: () => updateNoiseWidget(),
    updateEchoSkillBtn: () => updateEchoSkillBtn(),
    updateStatusDisplay: () => updateStatusDisplay(),
    getRegionData,
  };
}

function _updateEndBtnWarn() {
  HudUpdateUI?.updateEndBtnWarn?.(_getHudUpdateDeps());
}

function updateUI() {
  HudUpdateUI?.updateUI?.(_getHudUpdateDeps());
}

function _doUpdateUI() {
  HudUpdateUI?.doUpdateUI?.(_getHudUpdateDeps());
}

function _getStatusKrMap() {
  return StatusEffectsUI?.getStatusMap?.() || {};
}

function _getCombatInfoDeps() {
  return {
    ..._baseDeps(),
    statusKr: _getStatusKrMap(),
  };
}
function _resetCombatInfoPanel() {
  CombatInfoUI?.reset?.(_getCombatInfoDeps());
}
function updateStatusDisplay() {
  StatusEffectsUI?.updateStatusDisplay?.({
    gs: GS,
    doc: document,
    statusContainerId: 'statusEffects',
    refreshCombatInfoPanel: () => _refreshCombatInfoPanel(),
  });
}

// ── 전투 정보 사이드 패널 ──
function toggleCombatInfo() {
  CombatInfoUI?.toggle?.(_getCombatInfoDeps());
}

function _refreshCombatInfoPanel() {
  CombatInfoUI?.refresh?.(_getCombatInfoDeps());
}

function updateChainUI(chain) {
  CombatHudUI?.updateChainUI?.(chain, _getCombatHudDeps());
}

function updateNoiseWidget() {
  CombatHudUI?.updateNoiseWidget?.(_getCombatHudDeps());
}
window.updateNoiseWidget = updateNoiseWidget;

function updateClassSpecialUI() {
  CombatHudUI?.updateClassSpecialUI?.(_getCombatHudDeps());
}
window.updateClassSpecialUI = updateClassSpecialUI;

function setBar(id, pct) {
  DomValueUI?.setBar?.(id, pct, { doc: document });
}
function setText(id, val) {
  DomValueUI?.setText?.(id, val, { doc: document });
}

// ────────────────────────────────────────
// 카드 드래그 앤 드롭
// ────────────────────────────────────────
function _getCardTargetDeps() {
  return {
    ..._baseDeps(),
    renderCombatEnemies,
  };
}

function handleCardDragStart(event, cardId, idx) {
  CardTargetUI?.handleDragStart?.(event, cardId, idx, _getCardTargetDeps());
}

function handleCardDragEnd(event) {
  CardTargetUI?.handleDragEnd?.(event, _getCardTargetDeps());
}

function handleCardDropOnEnemy(event, enemyIdx) {
  CardTargetUI?.handleDropOnEnemy?.(event, enemyIdx, _getCardTargetDeps());
}

// 적 카드 클릭 → 타겟 지정 (같은 적 다시 클릭하면 해제)
function selectTarget(idx) {
  CardTargetUI?.selectTarget?.(idx, _getCardTargetDeps());
}
window.selectTarget = selectTarget;

function _getFeedbackDeps() {
  return {
    ..._baseDeps(),
    audioEngine: AudioEngine,
    screenShake: ScreenShake,
  };
}

function showCombatSummary(dealt, taken, kills) {
  FeedbackUI?.showCombatSummary?.(dealt, taken, kills, _getFeedbackDeps());
}

function showDmgPopup(dmg, x, y, color = '#ff3366') {
  FeedbackUI?.showDmgPopup?.(dmg, x, y, color, _getFeedbackDeps());
}

function showEdgeDamage() {
  FeedbackUI?.showEdgeDamage?.(_getFeedbackDeps());
}

function showEchoBurstOverlay() {
  FeedbackUI?.showEchoBurstOverlay?.(_getFeedbackDeps());
}

function showCardPlayEffect(card) {
  FeedbackUI?.showCardPlayEffect?.(card, _getFeedbackDeps());
}

function _getDeckModalDeps() {
  return {
    ..._baseDeps(),
  };
}

function _resetDeckModalFilter() {
  DeckModalUI?.resetFilter?.();
}

function showDeckView() {
  DeckModalUI?.showDeckView?.(_getDeckModalDeps());
}

function _renderDeckModal() {
  DeckModalUI?.renderDeckModal?.(_getDeckModalDeps());
}

// ────────────────────────────────────────
// CODEX SYSTEM — 도감
// ────────────────────────────────────────
function _getCodexDeps() {
  return {
    ..._baseDeps(),
  };
}

function openCodex() {
  CodexUI?.openCodex?.(_getCodexDeps());
}

function closeCodex() {
  CodexUI?.closeCodex?.(_getCodexDeps());
}

function setCodexTab(tab) {
  CodexUI?.setCodexTab?.(tab, _getCodexDeps());
}

function renderCodexContent() {
  CodexUI?.renderCodexContent?.(_getCodexDeps());
}

function setDeckFilter(type) {
  DeckModalUI?.setDeckFilter?.(type, _getDeckModalDeps());
}

function closeDeckView() {
  DeckModalUI?.closeDeckView?.(_getDeckModalDeps());
}

function _getTooltipDeps() {
  return {
    ..._baseDeps(),
    setBonusSystem: SetBonusSystem,
  };
}

// ── 카드 툴팁 ──
function showTooltip(event, cardId) {
  TooltipUI?.showTooltip?.(event, cardId, _getTooltipDeps());
}

function hideTooltip() {
  TooltipUI?.hideTooltip?.(_getTooltipDeps());
}

// 전투 카드에 툴팁 연결 (렌더 후 호출)
function attachCardTooltips() {
  TooltipUI?.attachCardTooltips?.(_getTooltipDeps());
}

// ── 아이템 툴팁 ──
function showItemTooltip(event, itemId) {
  TooltipUI?.showItemTooltip?.(event, itemId, _getTooltipDeps());
}
function hideItemTooltip() {
  TooltipUI?.hideItemTooltip?.(_getTooltipDeps());
}

function showItemToast(item) {
  FeedbackUI?.showItemToast?.(item, _getFeedbackDeps());
}

// ── 전설 아이템 획득 풀스크린 연출 ──
function showLegendaryAcquire(item) {
  FeedbackUI?.showLegendaryAcquire?.(item, _getFeedbackDeps());
}

function showChainAnnounce(text) {
  FeedbackUI?.showChainAnnounce?.(text, _getFeedbackDeps());
}

function showWorldMemoryNotice(text) {
  FeedbackUI?.showWorldMemoryNotice?.(text, _getFeedbackDeps());
}
function _flushNoticeQueue() {
  FeedbackUI?._flushNoticeQueue?.(_getFeedbackDeps());
}

// ────────────────────────────────────────
// SCREEN FSM
// ────────────────────────────────────────
function _getScreenDeps() {
  return {
    ..._baseDeps(),
    onEnterTitle: () => {
      animateTitle();
    },
  };
}

function switchScreen(screen) {
  ScreenUI?.switchScreen?.(screen, _getScreenDeps());
}

// ────────────────────────────────────────
// TITLE SCREEN / NAVIGATION
// ────────────────────────────────────────
function showCharacterSelect() {
  const main = document.getElementById('mainTitleSubScreen');
  const char = document.getElementById('charSelectSubScreen');
  if (main && char) {
    main.style.display = 'none';
    char.style.display = 'block';
  }
}

function backToTitle() {
  const main = document.getElementById('mainTitleSubScreen');
  const char = document.getElementById('charSelectSubScreen');
  if (main && char) {
    main.style.display = 'block';
    char.style.display = 'none';
  }
}

function openRunSettings() {
  RunModeUI.openSettings(_getRunModeDeps());
}

function closeRunSettings() {
  RunModeUI.closeSettings(_getRunModeDeps());
}

function openCodexFromTitle() {
  CodexUI.openCodex({ gs: GS, data: DATA });
}

function _getClassSelectDeps() {
  return {
    ..._baseDeps(),
    playClassSelect: (cls) => {
      try {
        AudioEngine.init();
        AudioEngine.resume();
        AudioEngine.playClassSelect(cls);
      } catch (e) {
        console.warn('Audio error:', e);
      }
    },
  };
}

function _getSelectedClass() {
  return ClassSelectUI?.getSelectedClass?.() || null;
}

function _clearSelectedClass() {
  ClassSelectUI?.clearSelection?.(_getClassSelectDeps());
}

function selectClass(btn) {
  ClassSelectUI?.selectClass?.(btn, _getClassSelectDeps());
}

function _getSaveSystemDeps() {
  return {
    ..._baseDeps(),
    runRules: RunRules,

    isGameStarted: () => _gameStarted,
  };
}

function _getRunModeDeps() {
  return {
    ..._baseDeps(),
    runRules: RunRules,
    saveMeta: () => SaveSystem?.saveMeta?.(_getSaveSystemDeps()),
    notice: (msg) => {
      if (typeof showWorldMemoryNotice === 'function') showWorldMemoryNotice(msg);
    },
  };
}

function _getRunStartDeps() {
  return {
    ..._baseDeps(),
    switchScreen,
    markGameStarted: () => { _gameStarted = true; },
    generateMap,
    audioEngine: AudioEngine,
    updateUI,
    updateClassSpecialUI,
    initGameCanvas,
    gameLoop,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    showRunFragment: () => StorySystem.showRunFragment(),
    showWorldMemoryNotice,
  };
}

function refreshRunModePanel() {
  RunModeUI?.refresh?.(_getRunModeDeps());
  RunModeUI?.refreshInscriptions?.(_getRunModeDeps());
}

function shiftAscension(delta) {
  RunModeUI?.shiftAscension?.(delta, _getRunModeDeps());
  RunModeUI?.refreshInscriptions?.(_getRunModeDeps());
}

function toggleEndlessMode() {
  RunModeUI?.toggleEndlessMode?.(_getRunModeDeps());
}

function cycleRunBlessing() {
  RunModeUI?.cycleBlessing?.(_getRunModeDeps());
}

function cycleRunCurse() {
  RunModeUI?.cycleCurse?.(_getRunModeDeps());
}

function _getRunSetupDeps() {
  return {
    ..._baseDeps(),
    runRules: RunRules,
    audioEngine: AudioEngine,
    getSelectedClass: () => _getSelectedClass(),
    shuffleArray,
    resetDeckModalFilter: () => _resetDeckModalFilter(),
    enterRun: () => RunStartUI?.enterRun?.(_getRunStartDeps()),
  };
}

function startGame() {
  RunSetupUI?.startGame?.(_getRunSetupDeps());
}

function _getMetaProgressionDeps() {
  return {
    ..._baseDeps(),
    switchScreen,
    clearSelectedClass: _clearSelectedClass,
    refreshRunModePanel,
  };
}

function selectFragment(effect) {
  MetaProgressionUI?.selectFragment?.(effect, _getMetaProgressionDeps());
}

// ────────────────────────────────────────
// REGION ADVANCE
// ────────────────────────────────────────
function _getRegionTransitionDeps() {
  return {
    ..._baseDeps(),
    mazeSystem: MazeSystem,
    getRegionData,
    getBaseRegionIndex,
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    screenShake: ScreenShake,
    generateMap,
    updateUI,
    showRunFragment: () => StorySystem.showRunFragment(),
  };
}

function advanceToNextRegion() {
  RegionTransitionUI?.advanceToNextRegion?.(_getRegionTransitionDeps());
}

// ────────────────────────────────────────
// HELP / PAUSE UI + HOTKEYS
// ────────────────────────────────────────
function _getHelpPauseDeps() {
  return {
    ..._baseDeps(),
    showDeckView,
    closeDeckView,
    useEchoSkill,
    endPlayerTurn,
    renderCombatEnemies,
    finalizeRunOutcome,
    switchScreen,
  };
}

function toggleHelp() {
  if (HelpPauseUI?.toggleHelp) {
    HelpPauseUI.toggleHelp(_getHelpPauseDeps());
  }
}

function abandonRun() {
  if (HelpPauseUI?.abandonRun) {
    HelpPauseUI.abandonRun(_getHelpPauseDeps());
  }
}

function confirmAbandon() {
  if (HelpPauseUI?.confirmAbandon) {
    HelpPauseUI.confirmAbandon(_getHelpPauseDeps());
  }
}

function togglePause() {
  if (HelpPauseUI?.togglePause) {
    HelpPauseUI.togglePause(_getHelpPauseDeps());
  }
}

function _initHelpPauseUI() {
  if (!HelpPauseUI) return;
  const deps = _getHelpPauseDeps();
  HelpPauseUI.showMobileWarning(deps);
  HelpPauseUI.bindGlobalHotkeys(deps);
}


// ────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────
function shuffleArray(arr) {
  return RandomUtils?.shuffleArray?.(arr) || arr;
}

function restartFromEnding() {
  MetaProgressionUI?.restartFromEnding?.(_getMetaProgressionDeps());
}

// ────────────────────────────────────────
// GLOBAL EXPORTS
// ────────────────────────────────────────
window.GameState = GS;
window.selectClass = selectClass;
window.startGame = startGame;
window.shiftAscension = shiftAscension;
window.toggleEndlessMode = toggleEndlessMode;
window.cycleRunBlessing = cycleRunBlessing;
window.cycleRunCurse = cycleRunCurse;
window.toggleInscription = (key) => RunModeUI?.toggleInscription?.(key, _getRunModeDeps());
window.selectFragment = selectFragment;
window.useEchoSkill = useEchoSkill;
window.drawCard = drawCard;
window.endPlayerTurn = endPlayerTurn;
window.toggleCombatInfo = toggleCombatInfo;
window.moveToNode = moveToNode;
window.resolveEvent = resolveEvent;
window.takeRewardCard = takeRewardCard;
window.takeRewardItem = takeRewardItem;
window.skipReward = skipReward;
window.showSkipConfirm = showSkipConfirm;
window.hideSkipConfirm = hideSkipConfirm;
window.returnToGame = returnToGame;
window.restartFromEnding = restartFromEnding;
window.toggleHelp = toggleHelp;
window.handleCardDragStart = handleCardDragStart;
window.handleCardDragEnd = handleCardDragEnd;
window.handleCardDropOnEnemy = handleCardDropOnEnemy;
window.showDeckView = showDeckView;
window.showItemTooltip = showItemTooltip;
window.hideItemTooltip = hideItemTooltip;
window.closeDeckView = closeDeckView;
window.openCodex = openCodex;
window.closeCodex = closeCodex;
window.setCodexTab = setCodexTab;

// ── 사운드 설정 핸들러 ──
window.setMasterVolume = function (v) {
  const val = Math.max(0, Math.min(100, parseInt(v) || 0));
  AudioEngine.setVolume(val / 100);
  const el = document.getElementById('volMasterVal');
  if (el) el.textContent = val + '%';
  _saveVolumes();
};
window.setSfxVolume = function (v) {
  const val = Math.max(0, Math.min(100, parseInt(v) || 0));
  AudioEngine.setSfxVolume(val / 100);
  const el = document.getElementById('volSfxVal');
  if (el) el.textContent = val + '%';
  _saveVolumes();
};
window.setAmbientVolume = function (v) {
  const val = Math.max(0, Math.min(100, parseInt(v) || 0));
  AudioEngine.setAmbientVolume(val / 100);
  const el = document.getElementById('volAmbientVal');
  if (el) el.textContent = val + '%';
  _saveVolumes();
};

// ────────────────────────────────────────
// AUTOSAVE SYSTEM & SETTINGS
// ────────────────────────────────────────
function _saveVolumes() {
  const vol = AudioEngine.getVolumes();
  localStorage.setItem('eotf_settings', JSON.stringify({ volumes: vol }));
}

function _loadVolumes() {
  try {
    const saved = localStorage.getItem('eotf_settings');
    if (saved) {
      const { volumes } = JSON.parse(saved);
      if (volumes) {
        if (Number.isFinite(volumes.master)) AudioEngine.setVolume(volumes.master);
        if (Number.isFinite(volumes.sfx)) AudioEngine.setSfxVolume(volumes.sfx);
        if (Number.isFinite(volumes.ambient)) AudioEngine.setAmbientVolume(volumes.ambient);
      }
    }
  } catch (e) { console.warn('Load settings error:', e); }
}

function _syncVolumeUI() {
  const vol = AudioEngine.getVolumes();
  const m = Math.round(vol.master * 100);
  const s = Math.round(vol.sfx * 100);
  const a = Math.round(vol.ambient * 100);
  const doc = document;
  const volM = doc.getElementById('volMasterVal');
  const volS = doc.getElementById('volSfxVal');
  const volA = doc.getElementById('volAmbientVal');
  if (volM) volM.textContent = m + '%';
  if (volS) volS.textContent = s + '%';
  if (volA) volA.textContent = a + '%';
  const d = document;
  const mSl = d.getElementById('volMasterSlider');
  const sSl = d.getElementById('volSfxSlider');
  const aSl = d.getElementById('volAmbientSlider');
  if (mSl) mSl.value = m;
  if (sSl) sSl.value = s;
  if (aSl) aSl.value = a;
}

// SaveSystem is provided by game/save_system.js.

function _getGameBootDeps() {
  return {
    ..._baseDeps(),
    audioEngine: AudioEngine,
    runRules: RunRules,
    saveSystem: SaveSystem,
    saveSystemDeps: _getSaveSystemDeps(),
    initTitleCanvas,
    updateUI,
    refreshRunModePanel,
  };
}

function _bootGame() {
  _loadVolumes();
  _initHelpPauseUI();
  GameBootUI?.bootGame?.(_getGameBootDeps());
}

// ── 최종적으로 게임 엔진 기동 ──
_bootGame();

// ── 외부용 싱크 함수 노출 ──
window._syncVolumeUI = _syncVolumeUI;
window.GS = GS;
window.GameState = GS;
window.updateUI = updateUI;
window.refreshRunMode = refreshRunMode;
window._bootGame = _bootGame;

// UI Event Handlers used by index.html onclick=""
window.showCharacterSelect = showCharacterSelect;
window.backToTitle = backToTitle;
window.openRunSettings = openRunSettings;
window.closeRunSettings = closeRunSettings;
window.openCodexFromTitle = openCodexFromTitle;
window.selectClass = selectClass;
window.startGame = startGame;
window.shiftAscension = shiftAscension;
window.toggleEndlessMode = toggleEndlessMode;
window.cycleRunBlessing = cycleRunBlessing;
window.cycleRunCurse = cycleRunCurse;

window.sortHandByEnergy = sortHandByEnergy;
window.useEchoSkill = useEchoSkill;
window.drawCard = drawCard;
window.endPlayerTurn = endPlayerTurn;
window.showEchoSkillTooltip = showEchoSkillTooltip;
window.hideEchoSkillTooltip = hideEchoSkillTooltip;

window.skipReward = skipReward;
window.showSkipConfirm = showSkipConfirm;
window.hideSkipConfirm = hideSkipConfirm;

window.setDeckFilter = setDeckFilter;
window.closeDeckView = closeDeckView;
window.setCodexTab = setCodexTab;
window.closeCodex = closeCodex;
window.toggleHudPin = toggleHudPin;
window.showFullMap = showFullMap;
