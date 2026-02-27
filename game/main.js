import { AudioEngine } from '../engine/audio.js';
import { ParticleSystem } from '../engine/particles.js';
import { ScreenShake } from '../engine/screenshake.js';
import { HitStop } from '../engine/hitstop.js';
import { FovEngine } from '../engine/fov.js';
import { DATA } from '../data/game_data.js';
import { NODE_META } from './constants/node_meta.js';
import { DifficultyScaler } from './difficulty_scaler.js';
import { CardCostUtils } from './card_cost_utils.js';
import { SetBonusSystem } from './set_bonus_system.js';
import { SaveSystem } from './save_system.js';
import { RunRules, getRegionData, getBaseRegionIndex, getRegionCount, finalizeRunOutcome } from './run_rules.js';
import { RandomUtils } from './random_utils.js';
import { DescriptionUtils } from './description_utils.js';

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
import { GameAPI } from './game_api.js';
import { MapNavigationUI } from './map_navigation_ui.js';
import { MapUI } from './map_ui.js';
import { GameBootUI } from './game_boot_ui.js';
import { GS } from './game_state.js';

import { GAME, exposeGlobals } from './global_bridge.js';
import { GameInit } from './game_init.js';


// ──────────────────────────────────────────────────────────────────────────────
//  ECHO OF THE FALLEN - 코드 통합 베이스
//  모든 Phase 1~4 기능을 단일 아키텍처로 통합
// ──────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
// WEB AUDIO ENGINE
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// GAME NAMESPACE & DI SYSTEM (Phase 3)
// ──────────────────────────────────────────────────────────────────────────────

// GAME Initialization (Phase 3 cleanup)
GAME.init(GS, DATA, AudioEngine, ParticleSystem);

// 레거시 지원을 위해 필요한 전역 변수들 노출
exposeGlobals({
  AudioEngine,
  ParticleSystem,
  ScreenShake,
  HitStop,
  FovEngine,
  DifficultyScaler,
  RandomUtils,
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
  ClassMechanics,
  SetBonusSystem,
  SaveSystem,
  CardCostUtils,
  // UI Modules needed by legacy handlers
  CodexUI,
  EventUI,
  CombatUI,
  DeckModalUI,
  RunModeUI,
  ScreenUI,
  TitleCanvasUI,
  ClassSelectUI,
  CombatHudUI,
  HudUpdateUI,
  RewardUI,
  CombatActionsUI,
  TooltipUI,
  HelpPauseUI,
  RunSetupUI,
  // New: Feedback & Utility exposures
  showDmgPopup,
  showCombatSummary,
  showItemTooltip,
  hideItemTooltip,
  showWorldMemoryNotice,
  DescriptionUtils,
  // Helper actions
  updateUI,
  updateCombatLog,
  refreshRunModePanel,
  showCharacterSelect,
  backToTitle,
  openRunSettings,
  closeRunSettings,
  openCodexFromTitle,
  selectClass,
  startGame,
  shiftAscension,
  toggleEndlessMode,
  cycleRunBlessing,
  cycleRunCurse,
  useEchoSkill,
  drawCard,
  drawCards: drawCard,
  endPlayerTurn,
  skipReward,
  showSkipConfirm,
  hideSkipConfirm,
  abandonRun,
  confirmAbandon,
  openCodex,
  setCodexTab,
  showDeckView,
  closeDeckView,
  closeCodex,
  toggleHudPin,
  showGeneralTooltip,
  hideGeneralTooltip,
  renderCombatCards,
  processDirtyFlags: () => HudUpdateUI.processDirtyFlags(),
  selectFragment,
  toggleCombatInfo,
  moveToNode,
  resolveEvent,
  takeRewardCard,
  takeRewardItem,
  returnToGame,
  restartFromEnding,
  handleCardDragStart,
  handleCardDragEnd,
  handleCardDropOnEnemy,
  showItemTooltip,
  hideItemTooltip,
  _resetCombatInfoPanel,
  classMechanics: ClassMechanics,
});

// window 객체에 직접 노출 (HTML onclick 핸들러 지원)
window.shiftAscension = shiftAscension;
window.toggleEndlessMode = toggleEndlessMode;
window.cycleRunBlessing = cycleRunBlessing;
window.cycleRunCurse = cycleRunCurse;
window.openCodexFromTitle = openCodexFromTitle;
window.showCharacterSelect = showCharacterSelect;
window.backToTitle = backToTitle;
window.openRunSettings = openRunSettings;
window.closeRunSettings = closeRunSettings;
window.startGame = startGame;
window.selectClass = selectClass;

// Feedback & Tooltips
window.showDmgPopup = showDmgPopup;
window.showCombatSummary = showCombatSummary;
window.showItemTooltip = showItemTooltip;
window.hideItemTooltip = hideItemTooltip;
window.showWorldMemoryNotice = showWorldMemoryNotice;
window.DescriptionUtils = DescriptionUtils;
window.CardCostUtils = CardCostUtils;
window._resetCombatInfoPanel = _resetCombatInfoPanel; // Bug #3: Expose this to window

// Consolidate global functions into GAME.API for primary interface
Object.assign(GAME.API, {
  AudioEngine,
  ParticleSystem,
  ScreenShake,
  HitStop,
  FovEngine,
  DifficultyScaler,
  RandomUtils,
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
  ClassMechanics,
  SetBonusSystem,
  SaveSystem,
  CardCostUtils,
  updateUI: () => HudUpdateUI.updateUI(_baseDeps()),
  refreshRunModePanel,
  startGame,
  useEchoSkill,
  takeDamage: (amt) => GameAPI.applyPlayerDamage(amt, GS),
  drawCards: drawCard,
  endPlayerTurn,
  renderCombatCards,
  processDirtyFlags: () => HudUpdateUI.processDirtyFlags(_baseDeps()),
  setCodexTab: (tab) => CodexUI.setCodexTab(tab, _getCodexDeps()),
  closeCodex: () => CodexUI.closeCodex(_getCodexDeps()),
  openCodex: () => CodexUI.openCodex(_getCodexDeps()),
  setDeckFilter: (filter) => DeckModalUI.setDeckFilter(filter, _getDeckModalDeps()),
  closeDeckView: () => DeckModalUI.closeDeckView(_getDeckModalDeps()),
  toggleHudPin: () => CombatHudUI.toggleHudPin(GAME.getDeps()),
  showEchoSkillTooltip: (e) => CombatHudUI.showEchoSkillTooltip(e, GAME.getDeps()),
  hideEchoSkillTooltip: () => CombatHudUI.hideEchoSkillTooltip(GAME.getDeps()),
  showSkipConfirm: () => RewardUI.showSkipConfirm(_baseDeps()),
  skipReward: () => RewardUI.skipReward(_baseDeps()),
  hideSkipConfirm: () => RewardUI.hideSkipConfirm(_baseDeps()),
  shiftAscension: (delta) => RunRules.shiftAscension(delta, _baseDeps()),
});

// ────────────────────────────────────────
// GAME EXIT LOGIC
// ────────────────────────────────────────
function quitGame() {
  if (confirm('정말로 게임을 종료하시겠습니까?')) {
    // 방법 1: window.close()
    window.close();

    // 방법 2: 브라우저 정책상 window.close() 가 작동하지 않을 경우 대안
    setTimeout(() => {
      alert('브라우저 정책상 window.close() 가 작동하지 않을 수 있습니다. 창을 직접 닫아주세요.');
    }, 500);
  }
}
window.quitGame = quitGame;

// Register Core UI/Logic Modules
GAME.register('EventUI', EventUI);
GAME.register('CombatUI', CombatUI);
GAME.register('HudUpdateUI', HudUpdateUI);
GAME.register('MazeSystem', MazeSystem);
GAME.register('StoryUI', StoryUI);
GAME.register('CodexUI', CodexUI);
GAME.register('RunModeUI', RunModeUI);
GAME.register('MetaProgressionUI', MetaProgressionUI);
GAME.register('HelpPauseUI', HelpPauseUI);
GAME.register('TooltipUI', TooltipUI);   // Added
GAME.register('FeedbackUI', FeedbackUI); // Added
GAME.register('ScreenUI', ScreenUI);     // Added
GAME.register('RunSetupUI', RunSetupUI); // Added
GAME.register('RunStartUI', RunStartUI); // Added
GAME.register('ClassMechanics', ClassMechanics); // Added specifically
GAME.register('RunRules', RunRules);
GAME.register('advanceToNextRegion', advanceToNextRegion);
GAME.register('finalizeRunOutcome', finalizeRunOutcome);
GAME.register('switchScreen', switchScreen);
GAME.register('updateUI', updateUI);
GAME.register('updateNextNodes', updateNextNodes);
GAME.register('renderMinimap', renderMinimap);

// Register some legacy global dependencies that can't be easily modularized yet
GAME.API.updateCombatLog = () => updateCombatLog();
GAME.API.updateUI = () => updateUI();
GAME.API.updateEchoSkillBtn = () => updateEchoSkillBtn();
GAME.API.showWorldMemoryNotice = (txt) => showWorldMemoryNotice(txt);
GAME.API.toggleHudPin = () => toggleHudPin();
GAME.API.closeDeckView = () => closeDeckView();
GAME.API.closeCodex = () => closeCodex();
GAME.API.showSkipConfirm = () => showSkipConfirm();
GAME.API.skipReward = () => skipReward();
GAME.API.hideSkipConfirm = () => hideSkipConfirm();

// ──────────────────────────────────────────────────────────────────────────────
// LEGACY COMPATIBILITY WRAPPERS
// (To be phased out by routing through GAME.API directly)
// ──────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
// _gameStarted 는 아래 UI SYSTEM 섹션에서 정의됨 (line 782)
const _baseDeps = () => ({
  ...GAME.getDeps(),
  isGameStarted: () => _gameStarted,  // 게임 시작 전/후 UI 업데이트 최적화 (rAF 지연 여부)
});

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
GAME.register('storySystem', StorySystem);

// ──────────────────────────────────────────────────────────────────────────────
// CLASS MECHANICS
// ──────────────────────────────────────────────────────────────────────────────
function _getClassMechanics() {
  return ClassMechanics || {};
}

// ──────────────────────────────────────────────────────────────────────────────
// CANVAS SETUP
// ──────────────────────────────────────────────────────────────────────────────
let gameCanvas, gameCtx;
let minimapCanvas, minimapCtx;
let combatCanvas; // 파티클용

// ──────────────────────────────────────────────────────────────────────────────
// MAZE SYSTEM (독립 스크립트 오버레이)
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// GAME LOOP (단일 통합 루프)
// ──────────────────────────────────────────────────────────────────────────────
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


// ────────────────────────────────────────
// 지역별 층계 상태 문구 헬퍼
// ────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// MAP SYSTEM
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// COMBAT SYSTEM
// ──────────────────────────────────────────────────────────────────────────────
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
  deps.shuffleArray = RandomUtils?.shuffleArray?.bind(RandomUtils) || ((arr) => arr.sort(() => Math.random() - 0.5));
  CombatStartUI?.startCombat?.(isBoss, deps);
}

// Echo 스킬 UI
// ────────────────────────────────────────
// HUD 고정/해제
// ────────────────────────────────────────
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

// 턴전환 중앙 배너
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
window.showEnemyStatusTooltip = function (event, statusKey) { CombatUI?.showEnemyStatusTooltip?.(event, statusKey, GAME.getDeps()); };
window.hideEnemyStatusTooltip = function () { CombatUI?.hideEnemyStatusTooltip?.(GAME.getDeps()); };

function renderCombatEnemies(forceFullRender = false) {
  const deps = GAME.getDeps();
  deps.selectTargetHandlerName = 'selectTarget';
  deps.showIntentTooltipHandlerName = 'showIntentTooltip';
  deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
  deps.forceFullRender = forceFullRender;
  CombatUI?.renderCombatEnemies?.(deps);
}
window.renderCombatEnemies = renderCombatEnemies;

// 단일 적 HP바만 빠르게 갱신 (공격 직후 호출)
function updateEnemyHpUI(idx, enemy) {
  const deps = GAME.getDeps();
  deps.selectTargetHandlerName = 'selectTarget';
  deps.showIntentTooltipHandlerName = 'showIntentTooltip';
  deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
  CombatUI?.updateEnemyHpUI?.(idx, enemy, deps);
}
window.updateEnemyHpUI = updateEnemyHpUI;
function getCardTypeClass(type) {
  return CardUI?.getCardTypeClass?.(type) || '';
}
function getCardTypeLabelClass(type) {
  return CardUI?.getCardTypeLabelClass?.(type) || '';
}

function _baseCardDeps() {
  const deps = GAME.getDeps();
  deps.playCardHandler = GS?.playCard?.bind(GS);
  deps.renderCombatCardsHandler = renderCombatCards;
  deps.dragStartHandler = handleCardDragStart;
  deps.dragEndHandler = handleCardDragEnd;
  deps.showTooltipHandler = showTooltip;
  deps.hideTooltipHandler = hideTooltip;
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

// Export UI functions to window for API calls
window.renderCombatCards = renderCombatCards;
window.renderHand = renderHand;
window.updateUI = () => HudUpdateUI?.updateUI?.(_baseDeps());
window.updateEchoSkillBtn = updateEchoSkillBtn;
window.updateCombatLog = updateCombatLog;
window.updateHandFanEffect = updateHandFanEffect;

function useEchoSkill() {
  const deps = GAME.getDeps();
  deps.showEchoBurstOverlay = showEchoBurstOverlay;
  deps.renderCombatEnemies = renderCombatEnemies;
  deps.renderCombatCards = renderCombatCards;
  EchoSkillUI?.useEchoSkill?.(deps);
}


function drawCard() {
  CombatActionsUI?.drawCard?.({ gs: GS, ...GAME.getDeps() });
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
  deps.shuffleArray = (arr) => RandomUtils?.shuffleArray?.(arr) || arr;
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

// ──────────────────────────────────────────────────────────────────────────────
// EVENT SYSTEM
// ──────────────────────────────────────────────────────────────────────────────
function _getEventDeps() {
  return {
    ..._baseDeps(),
    runRules: RunRules,

    updateUI,
    returnToGame,
    switchScreen,
    renderMinimap,
    updateNextNodes,
    showItemToast,
    audioEngine: AudioEngine,
    screenShake: ScreenShake,
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
window.showRewardScreen = showRewardScreen;

function takeRewardCard(cardId) {
  RewardUI?.takeRewardCard?.(cardId, _getRewardDeps());
}

function takeRewardItem(itemKey) {
  RewardUI?.takeRewardItem?.(itemKey, _getRewardDeps());
}
window.takeRewardItem = takeRewardItem;

function takeRewardUpgrade() {
  RewardUI?.takeRewardUpgrade?.(_getRewardDeps());
}
window.takeRewardUpgrade = takeRewardUpgrade;

function takeRewardRemove() {
  RewardUI?.takeRewardRemove?.(_getRewardDeps());
}
window.takeRewardRemove = takeRewardRemove;

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
  return _baseDeps();
}

function returnToGame(fromReward) {
  RunReturnUI?.returnToGame?.(fromReward, _getRunReturnDeps());
}

// ──────────────────────────────────────────────────────────────────────────────
// UI SYSTEM (단일 통합 updateUI (배치 처리))
// ──────────────────────────────────────────────────────────────────────────────
let _gameStarted = false; // 게임 시작 전에 즉시 실행
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

// ────────────────────────────────────────
// 전투 정보 사이드 패널
// ────────────────────────────────────────
function toggleCombatInfo() {
  CombatInfoUI?.toggle?.(_getCombatInfoDeps());
}

function _refreshCombatInfoPanel() {
  CombatInfoUI?.refresh?.(_getCombatInfoDeps());
}

function _getCombatHudDeps() {
  return {
    ..._baseDeps(),
    updateChainUI,
    updateNoiseWidget,
    updateClassSpecialUI,
    updateUI,
    getBaseRegionIndex,
  };
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

// ──────────────────────────────────────────────────────────────────────────────
// 카드 드래그 & 드롭
// ──────────────────────────────────────────────────────────────────────────────
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

// 단일 카드 클릭 시 타겟 지정 (같은 적 다시 클릭하면 해제)
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

// ──────────────────────────────────────────────────────────────────────────────
// CODEX SYSTEM
// ──────────────────────────────────────────────────────────────────────────────
function _getCodexDeps() {
  return {
    ..._baseDeps(),
  };
}

function openCodex() {
  CodexUI?.openCodex?.(_getCodexDeps());
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

function closeCodex() {
  CodexUI?.closeCodex?.(_getCodexDeps());
}

// Export to window for onclick handlers
window.closeDeckView = closeDeckView;
window.closeCodex = closeCodex;

function _getTooltipDeps() {
  return {
    ..._baseDeps(),
    setBonusSystem: SetBonusSystem,
  };
}

// ────────────────────────────────────────
// 카드 툴팁
// ────────────────────────────────────────
function showTooltip(event, cardId) {
  TooltipUI?.showTooltip?.(event, cardId, _getTooltipDeps());
}

function hideTooltip() {
  TooltipUI?.hideTooltip?.(_getTooltipDeps());
}

// 전투 카드에 툴팁 연결 (폴더 재출력)
function attachCardTooltips() {
  TooltipUI?.attachCardTooltips?.(_getTooltipDeps());
}

// ────────────────────────────────────────
// 아이템 툴팁
// ────────────────────────────────────────
function showItemTooltip(event, itemId) {
  TooltipUI?.showItemTooltip?.(event, itemId, _getTooltipDeps());
}
function hideItemTooltip() {
  TooltipUI?.hideItemTooltip?.(_getTooltipDeps());
}

// ────────────────────────────────────────
// 일반 툴팁 (예: 속성 등)
// ────────────────────────────────────────
function showGeneralTooltip(event, title, content) {
  TooltipUI?.showGeneralTooltip?.(event, title, content, _getTooltipDeps());
}
function hideGeneralTooltip() {
  TooltipUI?.hideGeneralTooltip?.(_getTooltipDeps());
}

function showItemToast(item) {
  FeedbackUI?.showItemToast?.(item, _getFeedbackDeps());
}

// ────────────────────────────────────────
// 전설 아이템 획득 스크린 연출
// ────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// SCREEN FSM
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// TITLE SCREEN / NAVIGATION
// ──────────────────────────────────────────────────────────────────────────────
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
  if (CodexUI) {
    CodexUI.openCodex({ gs: GS, data: DATA });
  } else {
    console.error('[openCodexFromTitle] CodexUI is not defined');
  }
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

// ──────────────────────────────────────────────────────────────────────────────
// REGION ADVANCE
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// HELP / PAUSE UI + HOTKEYS
// ──────────────────────────────────────────────────────────────────────────────
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
    returnToGame,
  };
}

function toggleHelp() {
  HelpPauseUI?.toggleHelp?.(_getHelpPauseDeps());
}

function abandonRun() {
  HelpPauseUI?.abandonRun?.(_getHelpPauseDeps());
}

function confirmAbandon() {
  HelpPauseUI?.confirmAbandon?.(_getHelpPauseDeps());
}

function togglePause() {
  HelpPauseUI?.togglePause?.(_getHelpPauseDeps());
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────────────────────────────────────────
function shuffleArray(arr) {
  return RandomUtils?.shuffleArray?.(arr) || arr;
}

function restartFromEnding() {
  MetaProgressionUI?.restartFromEnding?.(_getMetaProgressionDeps());
}

// 사운드 설정 핸들러
window.setMasterVolume = function (v) {
  let val = parseInt(v);
  if (isNaN(val)) val = 0;
  val = Math.max(0, Math.min(100, val));
  AudioEngine.setVolume(val / 100);
  document.querySelectorAll('#volMasterVal').forEach(el => {
    if (el) el.textContent = val + '%';
  });
  document.querySelectorAll('#volMasterSlider, #volMaster').forEach(el => {
    if (el) el.style.setProperty('--fill-percent', val + '%');
  });
  GameInit.saveVolumes(AudioEngine);
};
window.setSfxVolume = function (v) {
  let val = parseInt(v);
  if (isNaN(val)) val = 0;
  val = Math.max(0, Math.min(100, val));
  AudioEngine.setSfxVolume(val / 100);
  document.querySelectorAll('#volSfxVal').forEach(el => {
    if (el) el.textContent = val + '%';
  });
  document.querySelectorAll('#volSfxSlider, #volSfx').forEach(el => {
    if (el) el.style.setProperty('--fill-percent', val + '%');
  });
  GameInit.saveVolumes(AudioEngine);
};
window.setAmbientVolume = function (v) {
  let val = parseInt(v);
  if (isNaN(val)) val = 0;
  val = Math.max(0, Math.min(100, val));
  AudioEngine.setAmbientVolume(val / 100);
  document.querySelectorAll('#volAmbientVal').forEach(el => {
    if (el) el.textContent = val + '%';
  });
  document.querySelectorAll('#volAmbientSlider, #volAmbient').forEach(el => {
    if (el) el.style.setProperty('--fill-percent', val + '%');
  });
  GameInit.saveVolumes(AudioEngine);
};

// ──────────────────────────────────────────────────────────────────────────────
// AUTOSAVE SYSTEM & SETTINGS
// ──────────────────────────────────────────────────────────────────────────────

const _getGameBootDeps = () => ({
  ...GAME.getDeps(),
  gameBootUI: GameBootUI,
  getGameBootDeps: () => ({
    ...GAME.getDeps(),
    audioEngine: AudioEngine,
    runRules: RunRules,
    saveSystem: SaveSystem,
    saveSystemDeps: _getSaveSystemDeps(),
    initTitleCanvas,
    updateUI,
    refreshRunModePanel,
  }),
});

// Final Boot Sequence
try {
  GameInit.boot({
    ...GAME.getDeps(),
    audioEngine: AudioEngine,
    helpPauseUI: HelpPauseUI,
    gameBootUI: GameBootUI,
    getGameBootDeps: _getGameBootDeps,
    getHelpPauseDeps: _getHelpPauseDeps,
    actions: {
      showCharacterSelect, openRunSettings, openCodexFromTitle, quitGame,
      selectClass, startGame, backToTitle, closeRunSettings, shiftAscension,
      toggleEndlessMode, cycleRunBlessing, cycleRunCurse,
      setMasterVolume: (v) => window.setMasterVolume?.(v),  // Bug #5 fix
      setSfxVolume: (v) => window.setSfxVolume?.(v),        // Bug #5 fix
      setAmbientVolume: (v) => window.setAmbientVolume?.(v), // Bug #5 fix
      drawCard, endPlayerTurn, useEchoSkill
    }
  });
} catch (e) {
  console.error("Critical Boot Error:", e);
}

// 전역 함수 노출 (브라우저 콘솔 및 디버깅용)
exposeGlobals({
  _syncVolumeUI: () => GameInit.syncVolumeUI(AudioEngine)
});
