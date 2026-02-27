/**
 * event_bindings.js — 래퍼 함수 + window/GAME 바인딩
 *
 * 모든 UI 모듈의 래퍼 함수를 정의하고, window 객체에 노출합니다.
 * setupBindings() 를 호출하면 모든 바인딩이 활성화됩니다.
 */
import * as Deps from './deps_factory.js';

/** 래퍼 함수 참조를 외부에서 셋업할 수 있도록 모듈 참조 보관 */
let M = {}; // 모듈 참조

export function setupBindings(modules) {
    M = modules;

    // ──────────────────────────────────────
    // 래퍼 함수 정의 → 객체에 수집
    // ──────────────────────────────────────
    const fns = createWrapperFunctions();

    // ── window 노출 (HTML onclick 핸들러용) ──
    exposeToWindow(fns);

    // ── GAME.API 등록 ──
    registerGameAPI(fns);

    // ── GAME.register (모듈 등록) ──
    registerModules();

    // ── deps_factory에 래퍼 참조 주입 ──
    Deps.initDepsFactory({
        ...M,
        ...fns,
        _gameStarted: () => M._gameStarted,
        markGameStarted: () => { M._gameStarted = true; },
        getSelectedClass: () => M.ClassSelectUI?.getSelectedClass?.() || null,
        clearSelectedClass: () => M.ClassSelectUI?.clearSelection?.(Deps.getClassSelectDeps()),
        resetDeckModalFilter: () => M.DeckModalUI?.resetFilter?.(),
    });

    return fns;
}

function createWrapperFunctions() {
    const fns = {};

    // ═══ Canvas ═══
    fns.initTitleCanvas = () => M.TitleCanvasUI?.init?.({ doc: document });
    fns.resizeTitleCanvas = () => M.TitleCanvasUI?.resize?.({ doc: document });
    fns.animateTitle = () => M.TitleCanvasUI?.animate?.({ doc: document });

    fns.initGameCanvas = () => {
        const refs = M.GameCanvasSetupUI?.init?.(M.GAME.getDeps());
        if (refs) {
            M._canvasRefs = refs;
        }
    };
    fns.resizeGameCanvas = () => {
        M.GameCanvasSetupUI?.resize?.();
        M._canvasRefs = M.GameCanvasSetupUI?.getRefs?.() || M._canvasRefs;
    };

    // ═══ Game Loop ═══
    fns.gameLoop = (timestamp) => {
        const deps = M.GAME.getDeps();
        deps.refs = { gameCanvas: M._canvasRefs?.gameCanvas, gameCtx: M._canvasRefs?.gameCtx };
        deps.requestAnimationFrame = window.requestAnimationFrame.bind(window);
        deps.gameLoop = fns.gameLoop;
        deps.renderMinimap = fns.renderMinimap;
        deps.renderNodeInfo = fns.renderNodeInfo;
        M.WorldRenderLoopUI?.gameLoop?.(timestamp, deps);
    };
    fns.renderGameWorld = (dt, ctx, w, h) => {
        const deps = M.GAME.getDeps();
        deps.refs = { gameCanvas: M._canvasRefs?.gameCanvas, gameCtx: M._canvasRefs?.gameCtx };
        deps.renderMinimap = fns.renderMinimap;
        deps.renderNodeInfo = fns.renderNodeInfo;
        M.WorldRenderLoopUI?.renderGameWorld?.(dt, ctx, w, h, deps);
    };
    fns.renderRegionBackground = (ctx, w, h) => M.WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, M.GAME.getDeps());
    fns.renderDynamicLights = (ctx, w, h) => M.WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, M.GAME.getDeps());
    fns.renderNodeInfo = (ctx, w, h) => M.WorldCanvasUI?.renderNodeInfo?.(ctx, w, h, Deps.getWorldCanvasDeps());
    fns.getFloorStatusText = (regionId, floor) => M.WorldCanvasUI?.getFloorStatusText?.(regionId, floor, Deps.getWorldCanvasDeps()) || '';
    fns.wrapCanvasText = (ctx, text, x, y, maxW, lineH) => M.WorldCanvasUI?.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
    fns.roundRect = (ctx, x, y, w, h, r) => M.WorldCanvasUI?.roundRect?.(ctx, x, y, w, h, r);
    fns.roundRectTop = (ctx, x, y, w, h, r) => M.WorldCanvasUI?.roundRectTop?.(ctx, x, y, w, h, r);

    // ═══ Map ═══
    fns.generateMap = (regionIdx) => {
        const deps = M.GAME.getDeps();
        deps.updateNextNodes = fns.updateNextNodes;
        deps.updateUI = fns.updateUI;
        deps.showWorldMemoryNotice = fns.showWorldMemoryNotice;
        M.MapGenerationUI?.generateMap?.(regionIdx, deps);
    };
    fns.renderMinimap = () => {
        const deps = M.GAME.getDeps();
        deps.minimapCanvas = M._canvasRefs?.minimapCanvas;
        deps.minimapCtx = M._canvasRefs?.minimapCtx;
        deps.nodeMeta = M.NODE_META;
        deps.getFloorStatusText = fns.getFloorStatusText;
        deps.moveToNodeHandlerName = 'moveToNode';
        M.MapUI?.renderMinimap?.(deps);
    };
    fns.updateNextNodes = () => {
        const deps = M.GAME.getDeps();
        deps.minimapCanvas = M._canvasRefs?.minimapCanvas;
        deps.minimapCtx = M._canvasRefs?.minimapCtx;
        deps.nodeMeta = M.NODE_META;
        deps.getFloorStatusText = fns.getFloorStatusText;
        deps.moveToNodeHandlerName = 'moveToNode';
        M.MapUI?.updateNextNodes?.(deps);
    };
    fns.showFullMap = () => {
        const deps = M.GAME.getDeps();
        deps.minimapCanvas = M._canvasRefs?.minimapCanvas;
        deps.minimapCtx = M._canvasRefs?.minimapCtx;
        deps.nodeMeta = M.NODE_META;
        deps.getFloorStatusText = fns.getFloorStatusText;
        deps.moveToNodeHandlerName = 'moveToNode';
        M.MapUI?.showFullMap?.(deps);
    };
    fns.moveToNode = (node) => {
        const deps = M.GAME.getDeps();
        deps.updateNextNodes = fns.updateNextNodes;
        deps.renderMinimap = fns.renderMinimap;
        deps.updateUI = fns.updateUI;
        deps.startCombat = fns.startCombat;
        deps.triggerRandomEvent = fns.triggerRandomEvent;
        deps.showShop = fns.showShop;
        deps.showRestSite = fns.showRestSite;
        M.MapNavigationUI?.moveToNode?.(node, deps);
    };

    // ═══ Combat ═══
    fns.startCombat = (isBoss = false) => {
        const deps = M.GAME.getDeps();
        deps.showWorldMemoryNotice = fns.showWorldMemoryNotice;
        deps.updateChainUI = fns.updateChainUI;
        deps.renderCombatEnemies = fns.renderCombatEnemies;
        deps.renderCombatCards = fns.renderCombatCards;
        deps.updateCombatLog = fns.updateCombatLog;
        deps.updateNoiseWidget = fns.updateNoiseWidget;
        deps.showTurnBanner = fns.showTurnBanner;
        deps.resetCombatInfoPanel = fns._resetCombatInfoPanel;
        deps.refreshCombatInfoPanel = fns._refreshCombatInfoPanel;
        deps.updateUI = fns.updateUI;
        deps.updateClassSpecialUI = fns.updateClassSpecialUI;
        deps.shuffleArray = M.RandomUtils?.shuffleArray?.bind(M.RandomUtils) || ((arr) => arr.sort(() => Math.random() - 0.5));
        M.CombatStartUI?.startCombat?.(isBoss, deps);
    };

    fns.endPlayerTurn = () => M.CombatTurnUI?.endPlayerTurn?.(Deps.getCombatTurnBaseDeps());
    fns.enemyTurn = () => M.CombatTurnUI?.enemyTurn?.(Deps.getCombatTurnBaseDeps());
    fns.processEnemyStatusTicks = () => M.CombatTurnUI?.processEnemyStatusTicks?.(Deps.getCombatTurnBaseDeps());
    fns.handleBossPhaseShift = (enemy, idx) => M.CombatTurnUI?.handleBossPhaseShift?.(enemy, idx, Deps.getCombatTurnBaseDeps());
    fns.handleEnemyEffect = (effect, enemy, idx) => M.CombatTurnUI?.handleEnemyEffect?.(effect, enemy, idx, Deps.getCombatTurnBaseDeps());

    fns.toggleHudPin = () => M.CombatHudUI?.toggleHudPin?.(M.GAME.getDeps());
    fns.showEchoSkillTooltip = (event) => M.CombatHudUI?.showEchoSkillTooltip?.(event, M.GAME.getDeps());
    fns.hideEchoSkillTooltip = () => M.CombatHudUI?.hideEchoSkillTooltip?.(M.GAME.getDeps());
    fns.showTurnBanner = (type) => M.CombatHudUI?.showTurnBanner?.(type, M.GAME.getDeps());

    fns.showIntentTooltip = (event, enemyIdx) => {
        const deps = M.GAME.getDeps();
        deps.selectTargetHandlerName = 'selectTarget';
        deps.showIntentTooltipHandlerName = 'showIntentTooltip';
        deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
        M.CombatUI?.showIntentTooltip?.(event, enemyIdx, deps);
    };
    fns.hideIntentTooltip = () => {
        const deps = M.GAME.getDeps();
        deps.selectTargetHandlerName = 'selectTarget';
        deps.showIntentTooltipHandlerName = 'showIntentTooltip';
        deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
        M.CombatUI?.hideIntentTooltip?.(deps);
    };

    fns.renderCombatEnemies = (forceFullRender = false) => {
        const deps = M.GAME.getDeps();
        deps.selectTargetHandlerName = 'selectTarget';
        deps.showIntentTooltipHandlerName = 'showIntentTooltip';
        deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
        deps.forceFullRender = forceFullRender;
        M.CombatUI?.renderCombatEnemies?.(deps);
    };
    fns.updateEnemyHpUI = (idx, enemy) => {
        const deps = M.GAME.getDeps();
        deps.selectTargetHandlerName = 'selectTarget';
        deps.showIntentTooltipHandlerName = 'showIntentTooltip';
        deps.hideIntentTooltipHandlerName = 'hideIntentTooltip';
        M.CombatUI?.updateEnemyHpUI?.(idx, enemy, deps);
    };

    fns.renderCombatCards = () => M.CardUI?.renderCombatCards?.(Deps.baseCardDeps());
    fns.updateHandFanEffect = () => M.CardUI?.updateHandFanEffect?.(Deps.baseCardDeps());
    fns.renderHand = () => M.CardUI?.renderHand?.(Deps.baseCardDeps());

    fns.getCardTypeClass = (type) => M.CardUI?.getCardTypeClass?.(type) || '';
    fns.getCardTypeLabelClass = (type) => M.CardUI?.getCardTypeLabelClass?.(type) || '';

    fns.updateCombatLog = () => M.CombatHudUI?.updateCombatLog?.(M.GAME.getDeps());
    fns.updateEchoSkillBtn = () => M.CombatHudUI?.updateEchoSkillBtn?.(M.GAME.getDeps());

    fns.useEchoSkill = () => {
        const deps = M.GAME.getDeps();
        deps.showEchoBurstOverlay = fns.showEchoBurstOverlay;
        deps.renderCombatEnemies = fns.renderCombatEnemies;
        deps.renderCombatCards = fns.renderCombatCards;
        M.EchoSkillUI?.useEchoSkill?.(deps);
    };
    fns.drawCard = () => M.CombatActionsUI?.drawCard?.({ gs: M.GS, ...M.GAME.getDeps() });

    // ═══ Card Drag & Drop ═══
    fns.handleCardDragStart = (event, cardId, idx) => M.CardTargetUI?.handleDragStart?.(event, cardId, idx, Deps.getCardTargetDeps());
    fns.handleCardDragEnd = (event) => M.CardTargetUI?.handleDragEnd?.(event, Deps.getCardTargetDeps());
    fns.handleCardDropOnEnemy = (event, enemyIdx) => M.CardTargetUI?.handleDropOnEnemy?.(event, enemyIdx, Deps.getCardTargetDeps());
    fns.selectTarget = (idx) => M.CardTargetUI?.selectTarget?.(idx, Deps.getCardTargetDeps());

    // ═══ Event System ═══
    fns.triggerRandomEvent = () => M.EventUI?.triggerRandomEvent?.(Deps.getEventDeps());
    fns._updateEventGoldBar = () => M.EventUI?.updateEventGoldBar?.(Deps.getEventDeps());
    fns.showEvent = (event) => M.EventUI?.showEvent?.(event, Deps.getEventDeps());
    fns.resolveEvent = (choiceIdx) => M.EventUI?.resolveEvent?.(choiceIdx, Deps.getEventDeps());
    fns.showShop = () => M.EventUI?.showShop?.(Deps.getEventDeps());
    fns.showRestSite = () => M.EventUI?.showRestSite?.(Deps.getEventDeps());
    fns.showCardDiscard = (gs, isBurn = false) => M.EventUI?.showCardDiscard?.(gs, isBurn, Deps.getEventDeps());
    fns.showItemShop = (gs) => M.EventUI?.showItemShop?.(gs, Deps.getEventDeps());

    // ═══ Reward ═══
    fns.showRewardScreen = (isBoss) => M.RewardUI?.showRewardScreen?.(isBoss, Deps.getRewardDeps());
    fns.takeRewardCard = (cardId) => M.RewardUI?.takeRewardCard?.(cardId, Deps.getRewardDeps());
    fns.takeRewardItem = (itemKey) => M.RewardUI?.takeRewardItem?.(itemKey, Deps.getRewardDeps());
    fns.takeRewardUpgrade = () => M.RewardUI?.takeRewardUpgrade?.(Deps.getRewardDeps());
    fns.takeRewardRemove = () => M.RewardUI?.takeRewardRemove?.(Deps.getRewardDeps());
    fns.showSkipConfirm = () => M.RewardUI?.showSkipConfirm?.(Deps.getRewardDeps());
    fns.hideSkipConfirm = () => M.RewardUI?.hideSkipConfirm?.(Deps.getRewardDeps());
    fns.skipReward = () => M.RewardUI?.skipReward?.(Deps.getRewardDeps());

    fns.returnToGame = (fromReward) => M.RunReturnUI?.returnToGame?.(fromReward, Deps.getRunReturnDeps());

    // ═══ UI System ═══
    fns.updateUI = () => M.HudUpdateUI?.updateUI?.(Deps.getHudUpdateDeps());
    fns._doUpdateUI = () => M.HudUpdateUI?.doUpdateUI?.(Deps.getHudUpdateDeps());
    fns._updateEndBtnWarn = () => M.HudUpdateUI?.updateEndBtnWarn?.(Deps.getHudUpdateDeps());

    fns.updateStatusDisplay = () => {
        M.StatusEffectsUI?.updateStatusDisplay?.({
            gs: M.GS,
            doc: document,
            statusContainerId: 'statusEffects',
            refreshCombatInfoPanel: () => fns._refreshCombatInfoPanel?.(),
        });
    };

    fns._resetCombatInfoPanel = () => M.CombatInfoUI?.reset?.(Deps.getCombatInfoDeps());
    fns.toggleCombatInfo = () => M.CombatInfoUI?.toggle?.(Deps.getCombatInfoDeps());
    fns._refreshCombatInfoPanel = () => M.CombatInfoUI?.refresh?.(Deps.getCombatInfoDeps());

    fns.updateChainUI = (chain) => M.CombatHudUI?.updateChainUI?.(chain, Deps.getCombatHudDeps());
    fns.updateNoiseWidget = () => M.CombatHudUI?.updateNoiseWidget?.(Deps.getCombatHudDeps());
    fns.updateClassSpecialUI = () => M.CombatHudUI?.updateClassSpecialUI?.(Deps.getCombatHudDeps());

    fns.setBar = (id, pct) => M.DomValueUI?.setBar?.(id, pct, { doc: document });
    fns.setText = (id, val) => M.DomValueUI?.setText?.(id, val, { doc: document });

    // ═══ Feedback ═══
    fns.showCombatSummary = (dealt, taken, kills) => M.FeedbackUI?.showCombatSummary?.(dealt, taken, kills, Deps.getFeedbackDeps());
    fns.showDmgPopup = (dmg, x, y, color = '#ff3366') => M.FeedbackUI?.showDmgPopup?.(dmg, x, y, color, Deps.getFeedbackDeps());
    fns.showEdgeDamage = () => M.FeedbackUI?.showEdgeDamage?.(Deps.getFeedbackDeps());
    fns.showEchoBurstOverlay = () => M.FeedbackUI?.showEchoBurstOverlay?.(Deps.getFeedbackDeps());
    fns.showCardPlayEffect = (card) => M.FeedbackUI?.showCardPlayEffect?.(card, Deps.getFeedbackDeps());
    fns.showItemToast = (item) => M.FeedbackUI?.showItemToast?.(item, Deps.getFeedbackDeps());
    fns.showLegendaryAcquire = (item) => M.FeedbackUI?.showLegendaryAcquire?.(item, Deps.getFeedbackDeps());
    fns.showChainAnnounce = (text) => M.FeedbackUI?.showChainAnnounce?.(text, Deps.getFeedbackDeps());
    fns.showWorldMemoryNotice = (text) => M.FeedbackUI?.showWorldMemoryNotice?.(text, Deps.getFeedbackDeps());
    fns._flushNoticeQueue = () => M.FeedbackUI?._flushNoticeQueue?.(Deps.getFeedbackDeps());

    // ═══ Deck Modal / Codex ═══
    fns.showDeckView = () => M.DeckModalUI?.showDeckView?.(Deps.getDeckModalDeps());
    fns._renderDeckModal = () => M.DeckModalUI?.renderDeckModal?.(Deps.getDeckModalDeps());
    fns.setDeckFilter = (type) => M.DeckModalUI?.setDeckFilter?.(type, Deps.getDeckModalDeps());
    fns.closeDeckView = () => M.DeckModalUI?.closeDeckView?.(Deps.getDeckModalDeps());

    fns.openCodex = () => M.CodexUI?.openCodex?.(Deps.getCodexDeps());
    fns.setCodexTab = (tab) => M.CodexUI?.setCodexTab?.(tab, Deps.getCodexDeps());
    fns.renderCodexContent = () => M.CodexUI?.renderCodexContent?.(Deps.getCodexDeps());
    fns.closeCodex = () => M.CodexUI?.closeCodex?.(Deps.getCodexDeps());

    // ═══ Tooltips ═══
    fns.showTooltip = (event, cardId) => M.TooltipUI?.showTooltip?.(event, cardId, Deps.getTooltipDeps());
    fns.hideTooltip = () => M.TooltipUI?.hideTooltip?.(Deps.getTooltipDeps());
    fns.attachCardTooltips = () => M.TooltipUI?.attachCardTooltips?.(Deps.getTooltipDeps());
    fns.showItemTooltip = (event, itemId) => M.TooltipUI?.showItemTooltip?.(event, itemId, Deps.getTooltipDeps());
    fns.hideItemTooltip = () => M.TooltipUI?.hideItemTooltip?.(Deps.getTooltipDeps());
    fns.showGeneralTooltip = (event, title, content) => M.TooltipUI?.showGeneralTooltip?.(event, title, content, Deps.getTooltipDeps());
    fns.hideGeneralTooltip = () => M.TooltipUI?.hideGeneralTooltip?.(Deps.getTooltipDeps());

    // ═══ Screen FSM ═══
    fns.switchScreen = (screen) => M.ScreenUI?.switchScreen?.(screen, Deps.getScreenDeps());

    // ═══ Title / Navigation ═══
    fns.showCharacterSelect = () => {
        const main = document.getElementById('mainTitleSubScreen');
        const char = document.getElementById('charSelectSubScreen');
        if (main && char) { main.style.display = 'none'; char.style.display = 'block'; }
    };
    fns.backToTitle = () => {
        const main = document.getElementById('mainTitleSubScreen');
        const char = document.getElementById('charSelectSubScreen');
        if (main && char) { main.style.display = 'block'; char.style.display = 'none'; }
    };
    fns.openRunSettings = () => M.RunModeUI?.openSettings?.(Deps.getRunModeDeps());
    fns.closeRunSettings = () => M.RunModeUI?.closeSettings?.(Deps.getRunModeDeps());
    fns.openCodexFromTitle = () => M.CodexUI?.openCodex?.({ gs: M.GS, data: M.DATA });
    fns.selectClass = (btn) => M.ClassSelectUI?.selectClass?.(btn, Deps.getClassSelectDeps());
    fns.startGame = () => M.RunSetupUI?.startGame?.(Deps.getRunSetupDeps());

    fns.refreshRunModePanel = () => {
        M.RunModeUI?.refresh?.(Deps.getRunModeDeps());
        M.RunModeUI?.refreshInscriptions?.(Deps.getRunModeDeps());
    };
    fns.shiftAscension = (delta) => {
        M.RunModeUI?.shiftAscension?.(delta, Deps.getRunModeDeps());
        M.RunModeUI?.refreshInscriptions?.(Deps.getRunModeDeps());
    };
    fns.toggleEndlessMode = () => M.RunModeUI?.toggleEndlessMode?.(Deps.getRunModeDeps());
    fns.cycleRunBlessing = () => M.RunModeUI?.cycleBlessing?.(Deps.getRunModeDeps());
    fns.cycleRunCurse = () => M.RunModeUI?.cycleCurse?.(Deps.getRunModeDeps());
    fns.selectFragment = (effect) => M.MetaProgressionUI?.selectFragment?.(effect, Deps.getMetaProgressionDeps());
    fns.advanceToNextRegion = () => M.RegionTransitionUI?.advanceToNextRegion?.(Deps.getRegionTransitionDeps());

    // ═══ Help / Pause ═══
    fns.toggleHelp = () => M.HelpPauseUI?.toggleHelp?.(Deps.getHelpPauseDeps());
    fns.abandonRun = () => M.HelpPauseUI?.abandonRun?.(Deps.getHelpPauseDeps());
    fns.confirmAbandon = () => M.HelpPauseUI?.confirmAbandon?.(Deps.getHelpPauseDeps());
    fns.togglePause = () => M.HelpPauseUI?.togglePause?.(Deps.getHelpPauseDeps());

    // ═══ Utility ═══
    fns.shuffleArray = (arr) => M.RandomUtils?.shuffleArray?.(arr) || arr;
    fns.restartFromEnding = () => M.MetaProgressionUI?.restartFromEnding?.(Deps.getMetaProgressionDeps());

    // ═══ Game Exit ═══
    fns.quitGame = () => {
        if (confirm('정말로 게임을 종료하시겠습니까?')) {
            window.close();
            setTimeout(() => alert('브라우저 정책상 window.close() 가 작동하지 않을 수 있습니다. 창을 직접 닫아주세요.'), 500);
        }
    };

    // ═══ Sound Settings ═══
    fns.setMasterVolume = (v) => {
        let val = parseInt(v); if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(100, val));
        M.AudioEngine?.setVolume?.(val / 100);
        document.querySelectorAll('#volMasterVal').forEach(el => { if (el) el.textContent = val + '%'; });
        document.querySelectorAll('#volMasterSlider, #volMaster').forEach(el => { if (el) el.style.setProperty('--fill-percent', val + '%'); });
        M.GameInit?.saveVolumes?.(M.AudioEngine);
    };
    fns.setSfxVolume = (v) => {
        let val = parseInt(v); if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(100, val));
        M.AudioEngine?.setSfxVolume?.(val / 100);
        document.querySelectorAll('#volSfxVal').forEach(el => { if (el) el.textContent = val + '%'; });
        document.querySelectorAll('#volSfxSlider, #volSfx').forEach(el => { if (el) el.style.setProperty('--fill-percent', val + '%'); });
        M.GameInit?.saveVolumes?.(M.AudioEngine);
    };
    fns.setAmbientVolume = (v) => {
        let val = parseInt(v); if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(100, val));
        M.AudioEngine?.setAmbientVolume?.(val / 100);
        document.querySelectorAll('#volAmbientVal').forEach(el => { if (el) el.textContent = val + '%'; });
        document.querySelectorAll('#volAmbientSlider, #volAmbient').forEach(el => { if (el) el.style.setProperty('--fill-percent', val + '%'); });
        M.GameInit?.saveVolumes?.(M.AudioEngine);
    };

    return fns;
}

function exposeToWindow(fns) {
    const windowExpose = [
        'shiftAscension', 'toggleEndlessMode', 'cycleRunBlessing', 'cycleRunCurse',
        'openCodexFromTitle', 'showCharacterSelect', 'backToTitle', 'openRunSettings',
        'closeRunSettings', 'startGame', 'selectClass', 'showDmgPopup', 'showCombatSummary',
        'showItemTooltip', 'hideItemTooltip', 'showWorldMemoryNotice', 'quitGame',
        'showFullMap', 'toggleHudPin', 'showIntentTooltip', 'hideIntentTooltip',
        'renderCombatEnemies', 'updateEnemyHpUI', 'renderCombatCards', 'renderHand',
        'updateEchoSkillBtn', 'updateCombatLog', 'updateHandFanEffect',
        'closeDeckView', 'closeCodex', 'updateNoiseWidget', 'updateClassSpecialUI',
        'selectTarget', 'showRewardScreen', 'takeRewardItem', 'takeRewardUpgrade',
        'takeRewardRemove', 'setMasterVolume', 'setSfxVolume', 'setAmbientVolume',
    ];
    windowExpose.forEach(name => { if (fns[name]) window[name] = fns[name]; });

    // Special: updateUI wraps through HudUpdateUI
    window.updateUI = () => M.HudUpdateUI?.updateUI?.(Deps.baseDeps());

    // Special: enemy status tooltip
    window.showEnemyStatusTooltip = (event, statusKey) => M.CombatUI?.showEnemyStatusTooltip?.(event, statusKey, M.GAME.getDeps());
    window.hideEnemyStatusTooltip = () => M.CombatUI?.hideEnemyStatusTooltip?.(M.GAME.getDeps());

    // Additional globals
    window.DescriptionUtils = M.DescriptionUtils;
    window.CardCostUtils = M.CardCostUtils;
    window._resetCombatInfoPanel = fns._resetCombatInfoPanel;
}

function registerGameAPI(fns) {
    Object.assign(M.GAME.API, {
        AudioEngine: M.AudioEngine, ParticleSystem: M.ParticleSystem,
        ScreenShake: M.ScreenShake, HitStop: M.HitStop, FovEngine: M.FovEngine,
        DifficultyScaler: M.DifficultyScaler, RandomUtils: M.RandomUtils,
        RunRules: M.RunRules, getRegionData: M.getRegionData,
        getBaseRegionIndex: M.getBaseRegionIndex, getRegionCount: M.getRegionCount,
        ClassMechanics: M.ClassMechanics, SetBonusSystem: M.SetBonusSystem,
        SaveSystem: M.SaveSystem, CardCostUtils: M.CardCostUtils,
        // UI
        updateUI: () => M.HudUpdateUI?.updateUI?.(Deps.getHudUpdateDeps()),
        updateCombatLog: fns.updateCombatLog,
        updateEchoSkillBtn: (overrideDeps) => M.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || M.GAME.getDeps()),
        refreshRunModePanel: fns.refreshRunModePanel,
        startGame: fns.startGame, useEchoSkill: fns.useEchoSkill,
        takeDamage: (amt) => M.GameAPI?.applyPlayerDamage?.(amt, M.GS),
        drawCards: (count, gs) => M.GameAPI?.drawCards?.(count, gs),
        executePlayerDraw: (gs) => M.GameAPI?.executePlayerDraw?.(gs),
        drawCard: fns.drawCard, endPlayerTurn: fns.endPlayerTurn,
        renderCombatCards: fns.renderCombatCards,
        processDirtyFlags: () => M.HudUpdateUI?.processDirtyFlags?.(Deps.getHudUpdateDeps()),
        setCodexTab: (tab) => fns.setCodexTab(tab), closeCodex: fns.closeCodex, openCodex: fns.openCodex,
        setDeckFilter: (f) => fns.setDeckFilter(f), closeDeckView: fns.closeDeckView,
        toggleHudPin: fns.toggleHudPin,
        showEchoSkillTooltip: fns.showEchoSkillTooltip, hideEchoSkillTooltip: fns.hideEchoSkillTooltip,
        showSkipConfirm: fns.showSkipConfirm, skipReward: fns.skipReward, hideSkipConfirm: fns.hideSkipConfirm,
        showWorldMemoryNotice: fns.showWorldMemoryNotice,
        shiftAscension: fns.shiftAscension,
    });
}

function registerModules() {
    const G = M.GAME;
    G.register('EventUI', M.EventUI);
    G.register('CombatUI', M.CombatUI);
    G.register('HudUpdateUI', M.HudUpdateUI);
    G.register('MazeSystem', M.MazeSystem);
    G.register('StoryUI', M.StoryUI);
    G.register('CodexUI', M.CodexUI);
    G.register('RunModeUI', M.RunModeUI);
    G.register('MetaProgressionUI', M.MetaProgressionUI);
    G.register('HelpPauseUI', M.HelpPauseUI);
    G.register('TooltipUI', M.TooltipUI);
    G.register('FeedbackUI', M.FeedbackUI);
    G.register('ScreenUI', M.ScreenUI);
    G.register('RunSetupUI', M.RunSetupUI);
    G.register('RunStartUI', M.RunStartUI);
    G.register('ClassMechanics', M.ClassMechanics);
    G.register('RunRules', M.RunRules);
}
