'use strict';

// ═══════════════════════════════════════════════════════════
//  ECHO OF THE FALLEN v2 — 완전 통합 코드베이스
//  모든 Phase 1~4 기능을 단일 아키텍처로 통합
//  훅 체인 제거 · 클린 FSM · 단일 게임 루프
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────
// WEB AUDIO ENGINE
// ────────────────────────────────────────

const GS = {
  currentScreen: 'title',
  meta: {
    runCount: 1, totalKills: 0, bestChain: 0, echoFragments: 0,
    worldMemory: {},
    inscriptions: { echo_boost:false, resilience:false, fortune:false },
    storyPieces: [], _hiddenEndingHinted: false,
    codex: { enemies: new Set(), cards: new Set(), items: new Set() },
    unlocks: { ascension: false, endless: false },
    maxAscension: 0,
    runConfig: { ascension: 0, endless: false, blessing: 'none', curse: 'none' },
    progress: { echoShards: 0, totalDamage: 0, victories: 0, failures: 0, bossKills: {} },
  },
  player: {
    class:'swordsman', hp:80, maxHp:80, shield:0,
    echo:0, maxEcho:100, echoChain:0,
    energy:3, maxEnergy:3, gold:0, kills:0,
    deck:[], hand:[], graveyard:[], exhausted:[],
    items:[], buffs:{}, silenceGauge:0, zeroCost:false,
    upgradedCards: new Set(), _cardUpgradeBonus: {},
  },
  currentRegion: 0, currentFloor: 1,
  mapNodes: [], currentNode: null, visitedNodes: new Set(),
  combat: { active:false, enemies:[], turn:0, playerTurn:true, log:[] },
  _selectedTarget: null,
  worldMemory: {},
  runConfig: { ascension: 0, endless: false, endlessMode: false, blessing: 'none', curse: 'none' },
  stats: { damageDealt:0, damageTaken:0, cardsPlayed:0, maxChain:0 },
  _heartUsed: false, _temporalTurn: 0, _bossAdvancePending: false,
};

Object.assign(GS, window.GameStateCoreMethods || {});

// 전역 참조 (레거시 호환)
const GameState = GS;

// ────────────────────────────────────────
// STORY SYSTEM
// ────────────────────────────────────────
function _getStoryDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    showWorldMemoryNotice,
  };
}

const StorySystem = {
  unlockNextFragment() {
    window.StoryUI?.unlockNextFragment?.(_getStoryDeps());
  },
  showRunFragment() {
    window.StoryUI?.showRunFragment?.(_getStoryDeps());
  },
  displayFragment(frag) {
    window.StoryUI?.displayFragment?.(frag, _getStoryDeps());
  },
  checkHiddenEnding() {
    return !!window.StoryUI?.checkHiddenEnding?.(_getStoryDeps());
  },
  showNormalEnding() {
    window.StoryUI?.showNormalEnding?.(_getStoryDeps());
  },
  showHiddenEnding() {
    window.StoryUI?.showHiddenEnding?.(_getStoryDeps());
  },
};

// ────────────────────────────────────────
// CLASS MECHANICS
// ────────────────────────────────────────
function _getClassMechanics() {
  return window.ClassMechanics || {};
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
const MazeSystem = window.MazeSystem;
window.MazeSystem?.configure?.({
  gs: GS,
  doc: document,
  win: window,
  fovEngine: FovEngine,
  showWorldMemoryNotice: (text) => showWorldMemoryNotice(text),
  startCombat: (isBoss) => startCombat(isBoss),
});

function initTitleCanvas() {
  window.TitleCanvasUI?.init?.({ doc: document });
}

function resizeTitleCanvas() {
  window.TitleCanvasUI?.resize?.({ doc: document });
}

function animateTitle() {
  window.TitleCanvasUI?.animate?.({ doc: document });
}

function _applyGameCanvasRefs(refs) {
  if (!refs) return;
  gameCanvas = refs.gameCanvas;
  gameCtx = refs.gameCtx;
  minimapCanvas = refs.minimapCanvas;
  minimapCtx = refs.minimapCtx;
  combatCanvas = refs.combatCanvas;
}

function _getGameCanvasSetupDeps() {
  return {
    gs: GS,
    doc: document,
    showMapOverlay,
    particleSystem: ParticleSystem,
  };
}

function initGameCanvas() {
  const refs = window.GameCanvasSetupUI?.init?.(_getGameCanvasSetupDeps());
  _applyGameCanvasRefs(refs);
}

function resizeGameCanvas() {
  window.GameCanvasSetupUI?.resize?.();
  _applyGameCanvasRefs(window.GameCanvasSetupUI?.getRefs?.());
}

// ────────────────────────────────────────
// GAME LOOP — 단일 통합 루프
// ────────────────────────────────────────
function _getWorldRenderLoopDeps() {
  return {
    gs: GS,
    refs: {
      gameCanvas,
      gameCtx,
    },
    hitStop: HitStop,
    screenShake: ScreenShake,
    particleSystem: ParticleSystem,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    gameLoop,
    renderMinimap: () => renderMinimap(),
    renderNodeInfo: (ctx, w, h) => renderNodeInfo(ctx, w, h),
    getRegionData,
  };
}

function gameLoop(timestamp) {
  window.WorldRenderLoopUI?.gameLoop?.(timestamp, _getWorldRenderLoopDeps());
}

function renderGameWorld(dt, ctx, w, h) {
  window.WorldRenderLoopUI?.renderGameWorld?.(dt, ctx, w, h, _getWorldRenderLoopDeps());
}

function renderRegionBackground(ctx, w, h) {
  window.WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, _getWorldRenderLoopDeps());
}

function renderDynamicLights(ctx, w, h) {
  window.WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, _getWorldRenderLoopDeps());
}

// ── 노드 타입별 메타 ──
const NODE_META = {
  combat: { icon:'⚔️', label:'전투',   color:'#cc2244', glow:'rgba(204,34,68,',   desc:'일반 적과 싸워 카드를 획득한다' },
  elite:  { icon:'⭐', label:'정예',   color:'#d4a017', glow:'rgba(212,160,23,',  desc:'위험한 정예 몬스터. 희귀 보상 확정' },
  boss:   { icon:'💀', label:'보스',   color:'#7b2fff', glow:'rgba(123,47,255,',  desc:'지역 보스. 처치하면 새 지역이 열린다' },
  event:  { icon:'🎭', label:'이벤트', color:'#0099cc', glow:'rgba(0,153,204,',   desc:'선택지에 따라 좋을 수도, 나쁠 수도' },
  shop:   { icon:'🏪', label:'상점',   color:'#00cc88', glow:'rgba(0,204,136,',   desc:'골드로 카드·유물을 구입한다' },
  rest:   { icon:'🔥', label:'휴식',   color:'#cc5500', glow:'rgba(204,85,0,',    desc:'체력을 회복하거나 카드를 강화한다' },
};

function _getWorldCanvasDeps() {
  return {
    gs: GS,
    getRegionData,
  };
}

function renderNodeInfo(ctx, w, h) {
  window.WorldCanvasUI?.renderNodeInfo?.(ctx, w, h, _getWorldCanvasDeps());
}


// ── 지역/층별 상태 문구 헬퍼 ──
function getFloorStatusText(regionId, floor) {
  return window.WorldCanvasUI?.getFloorStatusText?.(regionId, floor, _getWorldCanvasDeps()) || '';
}

// 캔버스 텍스트 줄바꿈 헬퍼
function wrapCanvasText(ctx, text, x, y, maxW, lineH) {
  window.WorldCanvasUI?.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
}

// 캔버스 둥근 사각형
function roundRect(ctx, x, y, w, h, r) {
  window.WorldCanvasUI?.roundRect?.(ctx, x, y, w, h, r);
}
function roundRectTop(ctx, x, y, w, h, r) {
  window.WorldCanvasUI?.roundRectTop?.(ctx, x, y, w, h, r);
}

// ────────────────────────────────────────
// MAP SYSTEM
// ────────────────────────────────────────
function _getMapGenerationDeps() {
  return {
    gs: GS,
    getRegionData,
    updateNextNodes: () => updateNextNodes(),
    renderMapOverlay: () => renderMapOverlay(),
    updateUI,
    showWorldMemoryNotice,
  };
}

function generateMap(regionIdx) {
  window.MapGenerationUI?.generateMap?.(regionIdx, _getMapGenerationDeps());
}

function _getMapDeps() {
  return {
    gs: GS,
    doc: document,
    mapCanvasId: 'mapCanvas',
    minimapCanvas,
    minimapCtx,
    nodeMeta: NODE_META,
    getFloorStatusText,
    renderMapOverlay: () => renderMapOverlay(),
    moveToNodeHandlerName: 'moveToNode',
    closeMapOverlay: () => closeMapOverlay(),
  };
}

function renderMapOverlay() {
  window.MapUI?.renderMapOverlay?.(_getMapDeps());
}

function renderMinimap() {
  window.MapUI?.renderMinimap?.(_getMapDeps());
}

function updateNextNodes() {
  window.MapUI?.updateNextNodes?.(_getMapDeps());
}

function isNodeAccessible(node) {
  if (node.floor !== GS.currentFloor + 1) return false;
  return true;
}

function handleMapClick(event) {
  window.MapUI?.handleMapClick?.(event, _getMapDeps());
}

function _getMapNavigationDeps() {
  return {
    gs: GS,
    doc: document,
    classMechanics: _getClassMechanics(),
    audioEngine: AudioEngine,
    updateNextNodes: () => updateNextNodes(),
    renderMapOverlay: () => renderMapOverlay(),
    renderMinimap: () => renderMinimap(),
    updateUI,
    startCombat,
    triggerRandomEvent,
    showShop,
    showRestSite,
  };
}

function moveToNode(node) {
  window.MapNavigationUI?.moveToNode?.(node, _getMapNavigationDeps());
}

// ────────────────────────────────────────
// COMBAT SYSTEM
// ────────────────────────────────────────
function _getCombatStartDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    difficultyScaler: DifficultyScaler,
    audioEngine: AudioEngine,
    runRules: RunRules,
    classMechanics: _getClassMechanics(),
    showWorldMemoryNotice,
    updateChainUI: (chain) => updateChainUI(chain),
    renderCombatEnemies: () => renderCombatEnemies(),
    renderCombatCards: () => renderCombatCards(),
    updateCombatLog: () => updateCombatLog(),
    updateNoiseWidget: () => updateNoiseWidget(),
    showTurnBanner: (type) => showTurnBanner(type),
    resetCombatInfoPanel: () => _resetCombatInfoPanel(),
    refreshCombatInfoPanel: () => _refreshCombatInfoPanel(),
    updateUI,
    updateClassSpecialUI,
  };
}

function startCombat(isBoss=false) {
  window.CombatStartUI?.startCombat?.(isBoss, _getCombatStartDeps());
}

function _getCombatHudDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    win: window,
    classMechanics: _getClassMechanics(),
    getBaseRegionIndex,
  };
}

// Echo 스킬 툴팁
// ── HUD 핀/언핀 토글 ──
function toggleHudPin() {
  window.CombatHudUI?.toggleHudPin?.(_getCombatHudDeps());
}
window.toggleHudPin = toggleHudPin;

function showEchoSkillTooltip(event) {
  window.CombatHudUI?.showEchoSkillTooltip?.(event, _getCombatHudDeps());
}
function hideEchoSkillTooltip() {
  window.CombatHudUI?.hideEchoSkillTooltip?.(_getCombatHudDeps());
}

// 턴 전환 중앙 배너
function showTurnBanner(type) {
  window.CombatHudUI?.showTurnBanner?.(type, _getCombatHudDeps());
}

function _getCombatDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    win: window,
    selectTargetHandlerName: 'selectTarget',
    showIntentTooltipHandlerName: 'showIntentTooltip',
    hideIntentTooltipHandlerName: 'hideIntentTooltip',
  };
}

function showIntentTooltip(event, enemyIdx) {
  window.CombatUI?.showIntentTooltip?.(event, enemyIdx, _getCombatDeps());
}

function hideIntentTooltip() {
  window.CombatUI?.hideIntentTooltip?.(_getCombatDeps());
}

window.showIntentTooltip = showIntentTooltip;
window.hideIntentTooltip = hideIntentTooltip;

function renderCombatEnemies() {
  window.CombatUI?.renderCombatEnemies?.(_getCombatDeps());
}

// 단일 적 HP만 빠르게 갱신 (공격 직후 호출용)
function updateEnemyHpUI(idx, enemy) {
  window.CombatUI?.updateEnemyHpUI?.(idx, enemy, _getCombatDeps());
}

function _getCardDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    playCardHandlerName: 'GS.playCard',
    renderCombatCardsHandlerName: 'renderCombatCards',
    dragStartHandlerName: 'handleCardDragStart',
    dragEndHandlerName: 'handleCardDragEnd',
    showTooltipHandlerName: 'showTooltip',
    hideTooltipHandlerName: 'hideTooltip',
  };
}

function getCardTypeClass(type) {
  return window.CardUI?.getCardTypeClass?.(type) || '';
}
function getCardTypeLabelClass(type) {
  return window.CardUI?.getCardTypeLabelClass?.(type) || '';
}

function renderCombatCards() {
  window.CardUI?.renderCombatCards?.(_getCardDeps());
}

function updateHandFanEffect() {
  window.CardUI?.updateHandFanEffect?.(_getCardDeps());
}

function renderHand() {
  window.CardUI?.renderHand?.(_getCardDeps());
}

function updateCombatLog() {
  window.CombatHudUI?.updateCombatLog?.(_getCombatHudDeps());
}

function updateEchoSkillBtn() {
  window.CombatHudUI?.updateEchoSkillBtn?.(_getCombatHudDeps());
}

function _getEchoSkillDeps() {
  return {
    gs: GS,
    doc: document,
    audioEngine: AudioEngine,
    showEchoBurstOverlay,
    renderCombatEnemies,
    renderCombatCards,
  };
}

function useEchoSkill() {
  window.EchoSkillUI?.useEchoSkill?.(_getEchoSkillDeps());
}

function _getCombatActionsDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    audioEngine: AudioEngine,
    renderCombatCards,
    updateUI,
  };
}

function sortHandByEnergy() {
  window.CombatActionsUI?.sortHandByEnergy?.(_getCombatActionsDeps());
}
window.sortHandByEnergy = sortHandByEnergy;

function drawCard() {
  window.CombatActionsUI?.drawCard?.(_getCombatActionsDeps());
}

function _getCombatTurnDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    win: window,
    runRules: RunRules,
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    screenShake: ScreenShake,
    getBaseRegionIndex,
    shuffleArray,
    enemyTurn: () => enemyTurn(),
    updateChainUI: (chain) => updateChainUI(chain),
    showTurnBanner: (type) => showTurnBanner(type),
    renderCombatEnemies: () => renderCombatEnemies(),
    renderCombatCards: () => renderCombatCards(),
    updateStatusDisplay: () => updateStatusDisplay(),
    updateClassSpecialUI: () => updateClassSpecialUI(),
    updateUI,
    showEchoBurstOverlay: () => showEchoBurstOverlay(),
    showDmgPopup: (dmg, x, y, color) => showDmgPopup(dmg, x, y, color),
  };
}

function endPlayerTurn() {
  window.CombatTurnUI?.endPlayerTurn?.(_getCombatTurnDeps());
}

function enemyTurn() {
  window.CombatTurnUI?.enemyTurn?.(_getCombatTurnDeps());
}

function processEnemyStatusTicks() {
  window.CombatTurnUI?.processEnemyStatusTicks?.(_getCombatTurnDeps());
}

function handleBossPhaseShift(enemy, idx) {
  window.CombatTurnUI?.handleBossPhaseShift?.(enemy, idx, _getCombatTurnDeps());
}

function handleEnemyEffect(effect, enemy, idx) {
  window.CombatTurnUI?.handleEnemyEffect?.(effect, enemy, idx, _getCombatTurnDeps());
}

// ────────────────────────────────────────
// EVENT SYSTEM
// ────────────────────────────────────────
function _getEventDeps() {
  return {
    gs: GS,
    data: DATA,
    runRules: RunRules,
    doc: document,
    updateUI,
    showItemToast,
    playItemGet: () => AudioEngine.playItemGet(),
  };
}

function triggerRandomEvent() {
  window.EventUI?.triggerRandomEvent?.(_getEventDeps());
}

function _updateEventGoldBar() {
  window.EventUI?.updateEventGoldBar?.(_getEventDeps());
}

function showEvent(event) {
  window.EventUI?.showEvent?.(event, _getEventDeps());
}

function resolveEvent(choiceIdx) {
  window.EventUI?.resolveEvent?.(choiceIdx, _getEventDeps());
}

function showShop() {
  window.EventUI?.showShop?.(_getEventDeps());
}

function showRestSite() {
  window.EventUI?.showRestSite?.(_getEventDeps());
}

function showCardDiscard(gs, isBurn = false) {
  window.EventUI?.showCardDiscard?.(gs, isBurn, _getEventDeps());
}

function showItemShop(gs) {
  window.EventUI?.showItemShop?.(gs, _getEventDeps());
}

function _getRewardDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    switchScreen,
    returnToGame,
    showItemToast,
    playItemGet: () => AudioEngine.playItemGet(),
  };
}

function showRewardScreen(isBoss) {
  window.RewardUI?.showRewardScreen?.(isBoss, _getRewardDeps());
}

function takeRewardCard(cardId) {
  window.RewardUI?.takeRewardCard?.(cardId, _getRewardDeps());
}

function takeRewardItem(itemKey) {
  window.RewardUI?.takeRewardItem?.(itemKey, _getRewardDeps());
}

function showSkipConfirm() {
  window.RewardUI?.showSkipConfirm?.(_getRewardDeps());
}

function hideSkipConfirm() {
  window.RewardUI?.hideSkipConfirm?.(_getRewardDeps());
}

function skipReward() {
  window.RewardUI?.skipReward?.(_getRewardDeps());
}

function _getRunReturnDeps() {
  return {
    gs: GS,
    runRules: RunRules,
    doc: document,
    switchScreen,
    updateUI,
    renderMapOverlay,
    updateNextNodes,
    advanceToNextRegion,
    finalizeRunOutcome,
    storySystem: StorySystem,
  };
}

function returnToGame(fromReward) {
  window.RunReturnUI?.returnToGame?.(fromReward, _getRunReturnDeps());
}

// ────────────────────────────────────────
// UI SYSTEM — 단일 통합 updateUI (배치 처리)
// ────────────────────────────────────────
let _gameStarted = false; // 게임 시작 전에는 즉시 실행
function _getHudUpdateDeps() {
  return {
    gs: GS,
    data: DATA,
    setBonusSystem: SetBonusSystem,
    doc: document,
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
  window.HudUpdateUI?.updateEndBtnWarn?.(_getHudUpdateDeps());
}

function updateUI() {
  window.HudUpdateUI?.updateUI?.(_getHudUpdateDeps());
}

function _doUpdateUI() {
  window.HudUpdateUI?.doUpdateUI?.(_getHudUpdateDeps());
}

function _getStatusKrMap() {
  return window.StatusEffectsUI?.getStatusMap?.() || {};
}

function _getCombatInfoDeps() {
  return {
    gs: GS,
    data: DATA,
    statusKr: _getStatusKrMap(),
    doc: document,
  };
}
function _resetCombatInfoPanel() {
  window.CombatInfoUI?.reset?.(_getCombatInfoDeps());
}
function updateStatusDisplay() {
  window.StatusEffectsUI?.updateStatusDisplay?.({
    gs: GS,
    doc: document,
    statusContainerId: 'statusEffects',
    refreshCombatInfoPanel: () => _refreshCombatInfoPanel(),
  });
}

// ── 전투 정보 사이드 패널 ──
function toggleCombatInfo() {
  window.CombatInfoUI?.toggle?.(_getCombatInfoDeps());
}

function _refreshCombatInfoPanel() {
  window.CombatInfoUI?.refresh?.(_getCombatInfoDeps());
}

function updateChainUI(chain) {
  window.CombatHudUI?.updateChainUI?.(chain, _getCombatHudDeps());
}

function updateNoiseWidget() {
  window.CombatHudUI?.updateNoiseWidget?.(_getCombatHudDeps());
}
window.updateNoiseWidget = updateNoiseWidget;

function updateClassSpecialUI() {
  window.CombatHudUI?.updateClassSpecialUI?.(_getCombatHudDeps());
}
window.updateClassSpecialUI = updateClassSpecialUI;

function setBar(id, pct) {
  window.DomValueUI?.setBar?.(id, pct, { doc: document });
}
function setText(id, val) {
  window.DomValueUI?.setText?.(id, val, { doc: document });
}

// ────────────────────────────────────────
// 카드 드래그 앤 드롭
// ────────────────────────────────────────
function _getCardTargetDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    renderCombatEnemies,
  };
}

function handleCardDragStart(event, cardId, idx) {
  window.CardTargetUI?.handleDragStart?.(event, cardId, idx, _getCardTargetDeps());
}

function handleCardDragEnd(event) {
  window.CardTargetUI?.handleDragEnd?.(event, _getCardTargetDeps());
}

function handleCardDropOnEnemy(event, enemyIdx) {
  window.CardTargetUI?.handleDropOnEnemy?.(event, enemyIdx, _getCardTargetDeps());
}

// 적 카드 클릭 → 타겟 지정 (같은 적 다시 클릭하면 해제)
function selectTarget(idx) {
  window.CardTargetUI?.selectTarget?.(idx, _getCardTargetDeps());
}
window.selectTarget = selectTarget;

function _getFeedbackDeps() {
  return {
    gs: GS,
    doc: document,
    win: window,
    audioEngine: AudioEngine,
    screenShake: ScreenShake,
  };
}

function showCombatSummary(dealt, taken, kills) {
  window.FeedbackUI?.showCombatSummary?.(dealt, taken, kills, _getFeedbackDeps());
}

function showDmgPopup(dmg, x, y, color='#ff3366') {
  window.FeedbackUI?.showDmgPopup?.(dmg, x, y, color, _getFeedbackDeps());
}

function showEdgeDamage() {
  window.FeedbackUI?.showEdgeDamage?.(_getFeedbackDeps());
}

function showEchoBurstOverlay() {
  window.FeedbackUI?.showEchoBurstOverlay?.(_getFeedbackDeps());
}

function showCardPlayEffect(card) {
  window.FeedbackUI?.showCardPlayEffect?.(card, _getFeedbackDeps());
}

function _getDeckModalDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
  };
}

function _resetDeckModalFilter() {
  window.DeckModalUI?.resetFilter?.();
}

function showDeckView() {
  window.DeckModalUI?.showDeckView?.(_getDeckModalDeps());
}

function _renderDeckModal() {
  window.DeckModalUI?.renderDeckModal?.(_getDeckModalDeps());
}

// ────────────────────────────────────────
// CODEX SYSTEM — 도감
// ────────────────────────────────────────
function _getCodexDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
  };
}

function openCodex() {
  window.CodexUI?.openCodex?.(_getCodexDeps());
}

function closeCodex() {
  window.CodexUI?.closeCodex?.(_getCodexDeps());
}

function setCodexTab(tab) {
  window.CodexUI?.setCodexTab?.(tab, _getCodexDeps());
}

function renderCodexContent() {
  window.CodexUI?.renderCodexContent?.(_getCodexDeps());
}

function setDeckFilter(type) {
  window.DeckModalUI?.setDeckFilter?.(type, _getDeckModalDeps());
}

function closeDeckView() {
  window.DeckModalUI?.closeDeckView?.(_getDeckModalDeps());
}

function _getTooltipDeps() {
  return {
    gs: GS,
    data: DATA,
    setBonusSystem: SetBonusSystem,
    doc: document,
    win: window,
  };
}

// ── 카드 툴팁 ──
function showTooltip(event, cardId) {
  window.TooltipUI?.showTooltip?.(event, cardId, _getTooltipDeps());
}

function hideTooltip() {
  window.TooltipUI?.hideTooltip?.(_getTooltipDeps());
}

// 전투 카드에 툴팁 연결 (렌더 후 호출)
function attachCardTooltips() {
  window.TooltipUI?.attachCardTooltips?.(_getTooltipDeps());
}

// ── 아이템 툴팁 ──
function showItemTooltip(event, itemId) {
  window.TooltipUI?.showItemTooltip?.(event, itemId, _getTooltipDeps());
}
function hideItemTooltip() {
  window.TooltipUI?.hideItemTooltip?.(_getTooltipDeps());
}

function showItemToast(item) {
  window.FeedbackUI?.showItemToast?.(item, _getFeedbackDeps());
}

// ── 전설 아이템 획득 풀스크린 연출 ──
function showLegendaryAcquire(item) {
  window.FeedbackUI?.showLegendaryAcquire?.(item, _getFeedbackDeps());
}

function showChainAnnounce(text) {
  window.FeedbackUI?.showChainAnnounce?.(text, _getFeedbackDeps());
}

function showWorldMemoryNotice(text) {
  window.FeedbackUI?.showWorldMemoryNotice?.(text, _getFeedbackDeps());
}
function _flushNoticeQueue() {
  window.FeedbackUI?._flushNoticeQueue?.(_getFeedbackDeps());
}

function showMapOverlay(autoClose = false) {
  window.MapUI?.showOverlay?.(autoClose, _getMapDeps());
}
function closeMapOverlay() {
  window.MapUI?.closeOverlay?.(_getMapDeps());
  // 닫힌 후 노드 카드 등장 애니메이션
  _nodeCardReveal = Date.now();
}
let _nodeCardReveal = 0;

// ────────────────────────────────────────
// SCREEN FSM
// ────────────────────────────────────────
function _getScreenDeps() {
  return {
    gs: GS,
    doc: document,
    onEnterTitle: () => {
      animateTitle();
    },
  };
}

function switchScreen(screen) {
  window.ScreenUI?.switchScreen?.(screen, _getScreenDeps());
}

// ────────────────────────────────────────
// TITLE SCREEN
// ────────────────────────────────────────
function _getClassSelectDeps() {
  return {
    doc: document,
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
  return window.ClassSelectUI?.getSelectedClass?.() || null;
}

function _clearSelectedClass() {
  window.ClassSelectUI?.clearSelection?.(_getClassSelectDeps());
}

function selectClass(btn) {
  window.ClassSelectUI?.selectClass?.(btn, _getClassSelectDeps());
}

function _getSaveSystemDeps() {
  return {
    gs: GS,
    runRules: RunRules,
    doc: document,
    isGameStarted: () => _gameStarted,
  };
}

function _getRunModeDeps() {
  return {
    gs: GS,
    runRules: RunRules,
    saveMeta: () => window.SaveSystem?.saveMeta?.(_getSaveSystemDeps()),
    notice: (msg) => {
      if (typeof showWorldMemoryNotice === 'function') showWorldMemoryNotice(msg);
    },
  };
}

function _getRunStartDeps() {
  return {
    gs: GS,
    doc: document,
    switchScreen,
    markGameStarted: () => { _gameStarted = true; },
    generateMap,
    audioEngine: AudioEngine,
    updateUI,
    updateClassSpecialUI,
    initGameCanvas,
    gameLoop,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    showMapOverlay,
    showRunFragment: () => StorySystem.showRunFragment(),
    showWorldMemoryNotice,
  };
}

function refreshRunModePanel() {
  window.RunModeUI?.refresh?.(_getRunModeDeps());
}

function shiftAscension(delta) {
  window.RunModeUI?.shiftAscension?.(delta, _getRunModeDeps());
}

function toggleEndlessMode() {
  window.RunModeUI?.toggleEndlessMode?.(_getRunModeDeps());
}

function cycleRunBlessing() {
  window.RunModeUI?.cycleBlessing?.(_getRunModeDeps());
}

function cycleRunCurse() {
  window.RunModeUI?.cycleCurse?.(_getRunModeDeps());
}

function _getRunSetupDeps() {
  return {
    gs: GS,
    data: DATA,
    runRules: RunRules,
    audioEngine: AudioEngine,
    getSelectedClass: () => _getSelectedClass(),
    shuffleArray,
    resetDeckModalFilter: () => _resetDeckModalFilter(),
    enterRun: () => window.RunStartUI?.enterRun?.(_getRunStartDeps()),
  };
}

function startGame() {
  window.RunSetupUI?.startGame?.(_getRunSetupDeps());
}

function _getMetaProgressionDeps() {
  return {
    gs: GS,
    doc: document,
    switchScreen,
    clearSelectedClass: _clearSelectedClass,
    refreshRunModePanel,
  };
}

function selectFragment(effect) {
  window.MetaProgressionUI?.selectFragment?.(effect, _getMetaProgressionDeps());
}

// ────────────────────────────────────────
// REGION ADVANCE
// ────────────────────────────────────────
function _getRegionTransitionDeps() {
  return {
    gs: GS,
    doc: document,
    mazeSystem: MazeSystem,
    getRegionData,
    getBaseRegionIndex,
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    screenShake: ScreenShake,
    generateMap,
    updateUI,
    showRunFragment: () => StorySystem.showRunFragment(),
    showMapOverlay,
  };
}

function advanceToNextRegion() {
  window.RegionTransitionUI?.advanceToNextRegion?.(_getRegionTransitionDeps());
}

// ────────────────────────────────────────
// HELP / PAUSE UI + HOTKEYS
// ────────────────────────────────────────
function _getHelpPauseDeps() {
  return {
    gs: GS,
    doc: document,
    showMapOverlay,
    closeMapOverlay,
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
  if (window.HelpPauseUI?.toggleHelp) {
    window.HelpPauseUI.toggleHelp(_getHelpPauseDeps());
  }
}

function abandonRun() {
  if (window.HelpPauseUI?.abandonRun) {
    window.HelpPauseUI.abandonRun(_getHelpPauseDeps());
  }
}

function confirmAbandon() {
  if (window.HelpPauseUI?.confirmAbandon) {
    window.HelpPauseUI.confirmAbandon(_getHelpPauseDeps());
  }
}

function togglePause() {
  if (window.HelpPauseUI?.togglePause) {
    window.HelpPauseUI.togglePause(_getHelpPauseDeps());
  }
}

(function initHelpPauseUIBindings() {
  if (!window.HelpPauseUI) return;
  const deps = _getHelpPauseDeps();
  window.HelpPauseUI.showMobileWarning(deps);
  window.HelpPauseUI.bindGlobalHotkeys(deps);
})();

// ────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────
function shuffleArray(arr) {
  return window.RandomUtils?.shuffleArray?.(arr) || arr;
}

function restartFromEnding() {
  window.MetaProgressionUI?.restartFromEnding?.(_getMetaProgressionDeps());
}

// ────────────────────────────────────────
// GLOBAL EXPORTS
// ────────────────────────────────────────
window.GS = GS;
window.GameState = GS;
window.selectClass = selectClass;
window.startGame = startGame;
window.shiftAscension = shiftAscension;
window.toggleEndlessMode = toggleEndlessMode;
window.cycleRunBlessing = cycleRunBlessing;
window.cycleRunCurse = cycleRunCurse;
window.selectFragment = selectFragment;
window.useEchoSkill = useEchoSkill;
window.drawCard = drawCard;
window.endPlayerTurn = endPlayerTurn;
window.showMapOverlay = showMapOverlay;
window.closeMapOverlay = closeMapOverlay;
window.toggleCombatInfo = toggleCombatInfo;
window.handleMapClick = handleMapClick;
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

// ────────────────────────────────────────
// AUTOSAVE SYSTEM
// ────────────────────────────────────────
// SaveSystem is provided by game/save_system.js.

function _getGameBootDeps() {
  return {
    gs: GS,
    doc: document,
    audioEngine: AudioEngine,
    runRules: RunRules,
    saveSystem: window.SaveSystem,
    saveSystemDeps: _getSaveSystemDeps(),
    initTitleCanvas,
    updateUI,
    refreshRunModePanel,
  };
}

function _bootGame() {
  window.GameBootUI?.bootGame?.(_getGameBootDeps());
}

// 즉시 실행 (load 이벤트 대신)
window.GameBootUI?.bootWhenReady?.(_getGameBootDeps());



