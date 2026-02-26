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
import { GameStateCoreMethods } from './game_state_core_methods.js';
import { CardMethods } from './methods/card_methods.js';
import { CombatMethods } from './methods/combat_methods.js';
import { PlayerMethods } from './methods/player_methods.js';
import { GS } from './game_state.js';

import { GAME, exposeGlobals } from './global_bridge.js';
import { GameInit } from './game_init.js';


// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??//  ECHO OF THE FALLEN v2 ???꾩쟾 ?듯합 肄붾뱶踰좎씠??//  紐⑤뱺 Phase 1~4 湲곕뒫???⑥씪 ?꾪궎?띿쿂濡??듯합
//  ??泥댁씤 ?쒓굅 쨌 ?대┛ FSM 쨌 ?⑥씪 寃뚯엫 猷⑦봽
// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
// ????????????????????????????????????????
// WEB AUDIO ENGINE
// ????????????????????????????????????????

// ????????????????????????????????????????
// GAME NAMESPACE & DI SYSTEM (Phase 3)
// ????????????????????????????????????????

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
  // Helper actions
  updateUI,
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
  sortHandByEnergy,
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
  showDeckView,
  closeDeckView,
  closeCodex,
  toggleHudPin,
  showGeneralTooltip,
  hideGeneralTooltip,
  renderCombatCards,
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
  showDeckView,
  showItemTooltip,
  hideItemTooltip
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

// Register some legacy global dependencies that can't be easily modularized yet
GAME.API.updateCombatLog = () => updateCombatLog();
GAME.API.updateUI = () => updateUI();
GAME.API.showWorldMemoryNotice = (txt) => showWorldMemoryNotice(txt);
GAME.API.toggleHudPin = () => toggleHudPin();
GAME.API.closeDeckView = () => closeDeckView();
GAME.API.closeCodex = () => closeCodex();
GAME.API.showSkipConfirm = () => showSkipConfirm();
GAME.API.skipReward = () => skipReward();
GAME.API.hideSkipConfirm = () => hideSkipConfirm();

// ????????????????????????????????????????
// LEGACY COMPATIBILITY WRAPPERS
// (To be phased out by routing through GAME.API directly)
// ????????????????????????????????????????
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

// ????????????????????????????????????????
// CLASS MECHANICS
// ????????????????????????????????????????
function _getClassMechanics() {
  return ClassMechanics || {};
}

// ????????????????????????????????????????
// CANVAS SETUP
// ????????????????????????????????????????
let gameCanvas, gameCtx;
let minimapCanvas, minimapCtx;
let combatCanvas; // ?뚰떚?댁슜

// ????????????????????????????????????????
// MAZE SYSTEM ???낅┰ ??ㅽ겕由??ㅻ쾭?덉씠
// ????????????????????????????????????????

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

// ????????????????????????????????????????
// GAME LOOP ???⑥씪 ?듯빀 猷⑦봽
// ????????????????????????????????????????
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


// ?? 吏??痢듬퀎 ?곹깭 臾멸뎄 ?ы띁 ??
function getFloorStatusText(regionId, floor) {
  return WorldCanvasUI?.getFloorStatusText?.(regionId, floor, _getWorldCanvasDeps()) || '';
}

// 罹붾쾭???띿뒪??以꾨컮轅??ы띁
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

// ????????????????????????????????????????
// MAP SYSTEM
// ????????????????????????????????????????
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

// ????????????????????????????????????????
// COMBAT SYSTEM
// ????????????????????????????????????????
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

// Echo ?ㅽ궗 ?댄똻
// ?? HUD ?/?명? ?좉? ??
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

// ???꾪솚 以묒븰 諛곕꼫
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

// ?⑥씪 ??HP留?鍮좊Ⅴ寃?媛깆떊 (怨듦꺽 吏곹썑 ?몄텧??
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

// ????????????????????????????????????????
// EVENT SYSTEM
// ????????????????????????????????????????
function _getEventDeps() {
  return {
    ..._baseDeps(),
    runRules: RunRules,

    updateUI,
    returnToGame,
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
  return {
    ..._baseDeps(),
    runRules: RunRules,

    switchScreen,
    updateUI,
    updateNextNodes,
    renderMinimap,
    advanceToNextRegion,
    finalizeRunOutcome,
    storySystem: StorySystem,
  };
}

function returnToGame(fromReward) {
  RunReturnUI?.returnToGame?.(fromReward, _getRunReturnDeps());
}

// ????????????????????????????????????????
// UI SYSTEM ???⑥씪 ?듯빀 updateUI (諛곗튂 泥섎━)
// ????????????????????????????????????????
let _gameStarted = false; // 寃뚯엫 ?쒖옉 ?꾩뿉??利됱떆 ?ㅽ뻾
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

// ?? ?꾪닾 ?뺣낫 ?ъ씠???⑤꼸 ??
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

// ????????????????????????????????????????
// 移대뱶 ?쒕옒洹????쒕∼
// ????????????????????????????????????????
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

// ??移대뱶 ?대┃ ???寃?吏??(媛숈? ???ㅼ떆 ?대┃?섎㈃ ?댁젣)
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

// ????????????????????????????????????????
// CODEX SYSTEM ???꾧컧
// ????????????????????????????????????????
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

// ?? 移대뱶 ?댄똻 ??
function showTooltip(event, cardId) {
  TooltipUI?.showTooltip?.(event, cardId, _getTooltipDeps());
}

function hideTooltip() {
  TooltipUI?.hideTooltip?.(_getTooltipDeps());
}

// ?꾪닾 移대뱶???댄똻 ?곌껐 (?뚮뜑 ???몄텧)
function attachCardTooltips() {
  TooltipUI?.attachCardTooltips?.(_getTooltipDeps());
}

// ?? ?꾩씠???댄똻 ??
function showItemTooltip(event, itemId) {
  TooltipUI?.showItemTooltip?.(event, itemId, _getTooltipDeps());
}
function hideItemTooltip() {
  TooltipUI?.hideItemTooltip?.(_getTooltipDeps());
}

// ?? ?쇰컲 ?댄똻 (?대옒???뱀꽦 ?? ??
function showGeneralTooltip(event, title, content) {
  TooltipUI?.showGeneralTooltip?.(event, title, content, _getTooltipDeps());
}
function hideGeneralTooltip() {
  TooltipUI?.hideGeneralTooltip?.(_getTooltipDeps());
}

function showItemToast(item) {
  FeedbackUI?.showItemToast?.(item, _getFeedbackDeps());
}

// ?? ?꾩꽕 ?꾩씠???띾뱷 ??ㅽ겕由??곗텧 ??
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

// ????????????????????????????????????????
// SCREEN FSM
// ????????????????????????????????????????
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

// ????????????????????????????????????????
// TITLE SCREEN / NAVIGATION
// ????????????????????????????????????????
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

// ????????????????????????????????????????
// REGION ADVANCE
// ????????????????????????????????????????
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

// ????????????????????????????????????????
// HELP / PAUSE UI + HOTKEYS
// ????????????????????????????????????????
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

// ????????????????????????????????????????
// UTILITIES
// ????????????????????????????????????????
function shuffleArray(arr) {
  return RandomUtils?.shuffleArray?.(arr) || arr;
}

function restartFromEnding() {
  MetaProgressionUI?.restartFromEnding?.(_getMetaProgressionDeps());
}

// ?? ?ъ슫???ㅼ젙 ?몃뱾????
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
  _saveVolumes();
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
  _saveVolumes();
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
  _saveVolumes();
};

// ????????????????????????????????????????
// AUTOSAVE SYSTEM & SETTINGS
// ????????????????????????????????????????
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
        if (Number.isFinite(volumes.master)) AudioEngine.setVolume(Math.max(0, Math.min(1, volumes.master)));
        if (Number.isFinite(volumes.sfx)) AudioEngine.setSfxVolume(Math.max(0, Math.min(1, volumes.sfx)));
        if (Number.isFinite(volumes.ambient)) AudioEngine.setAmbientVolume(Math.max(0, Math.min(1, volumes.ambient)));
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
  // 紐⑤뱺 蹂쇰ⅷ ?쒖떆 ?낅뜲?댄듃 (?ъ슫???ㅼ젙 + ?쇱떆?뺤? 硫붾돱)
  doc.querySelectorAll('#volMasterVal').forEach(el => el.textContent = m + '%');
  doc.querySelectorAll('#volSfxVal').forEach(el => el.textContent = s + '%');
  doc.querySelectorAll('#volAmbientVal').forEach(el => el.textContent = a + '%');
  // 紐⑤뱺 ?щ씪?대뜑 媛??낅뜲?댄듃
  doc.querySelectorAll('#volMasterSlider').forEach(el => { el.value = m; el.style.setProperty('--fill-percent', m + '%'); });
  doc.querySelectorAll('#volSfxSlider').forEach(el => { el.value = s; el.style.setProperty('--fill-percent', s + '%'); });
  doc.querySelectorAll('#volAmbientSlider').forEach(el => { el.value = a; el.style.setProperty('--fill-percent', a + '%'); });
  // ?ъ슫???ㅼ젙 ?щ씪?대뜑???낅뜲?댄듃
  doc.querySelectorAll('#volMaster').forEach(el => { el.value = m; el.style.setProperty('--fill-percent', m + '%'); });
  doc.querySelectorAll('#volSfx').forEach(el => { el.value = s; el.style.setProperty('--fill-percent', s + '%'); });
  doc.querySelectorAll('#volAmbient').forEach(el => { el.value = a; el.style.setProperty('--fill-percent', a + '%'); });
}

// SaveSystem is provided by game/save_system.js.

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
      toggleEndlessMode, cycleRunBlessing, cycleRunCurse, setMasterVolume: window.setMasterVolume,
      setSfxVolume: window.setSfxVolume, setAmbientVolume: window.setAmbientVolume, drawCard, endPlayerTurn, useEchoSkill
    }
  });
} catch (e) {
  console.error("Critical Boot Error:", e);
}

// ?? ?몃????깊겕 ?⑥닔 ?몄텧 ??
exposeGlobals({
  _syncVolumeUI: () => GameInit.syncVolumeUI(AudioEngine)
});
