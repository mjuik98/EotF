/**
 * combat_bindings.js — Combat + Card + Feedback 래퍼 함수
 *
 * 책임: 전투, 카드, 피드백 UI 관련 래퍼
 */
import * as Deps from '../deps_factory.js';

function getCombatDeps(game, extra = {}) {
    const deps = game.getCombatDeps?.() || {};
    return { ...deps, ...extra };
}

function getHudDeps(game, extra = {}) {
    const deps = game.getHudDeps?.() || {};
    return { ...deps, ...extra };
}

export function createCombatBindings(M, fns) {
    // ═══ Combat ═══
    fns.startCombat = (isBoss = false) => {
        const deps = getCombatDeps(M.GAME, {
            showWorldMemoryNotice: fns.showWorldMemoryNotice,
            updateChainUI: fns.updateChainUI,
            renderCombatEnemies: fns.renderCombatEnemies,
            renderCombatCards: fns.renderCombatCards,
            updateCombatLog: fns.updateCombatLog,
            updateNoiseWidget: fns.updateNoiseWidget,
            showTurnBanner: fns.showTurnBanner,
            resetCombatInfoPanel: fns._resetCombatInfoPanel,
            refreshCombatInfoPanel: fns._refreshCombatInfoPanel,
            updateUI: fns.updateUI,
            updateClassSpecialUI: fns.updateClassSpecialUI,
            shuffleArray: M.RandomUtils?.shuffleArray?.bind(M.RandomUtils) || ((arr) => arr.sort(() => Math.random() - 0.5)),
        });
        M.CombatStartUI?.startCombat?.(isBoss, deps);
    };

    fns.endPlayerTurn = () => M.CombatTurnUI?.endPlayerTurn?.(Deps.getCombatTurnBaseDeps());
    fns.enemyTurn = () => M.CombatTurnUI?.enemyTurn?.(Deps.getCombatTurnBaseDeps());
    fns.processEnemyStatusTicks = () => M.CombatTurnUI?.processEnemyStatusTicks?.(Deps.getCombatTurnBaseDeps());
    fns.handleBossPhaseShift = (enemy, idx) => M.CombatTurnUI?.handleBossPhaseShift?.(enemy, idx, Deps.getCombatTurnBaseDeps());
    fns.handleEnemyEffect = (effect, enemy, idx) => M.CombatTurnUI?.handleEnemyEffect?.(effect, enemy, idx, Deps.getCombatTurnBaseDeps());

    fns.toggleHudPin = () => M.CombatHudUI?.toggleHudPin?.(getHudDeps(M.GAME));
    fns.showEchoSkillTooltip = (event) => M.CombatHudUI?.showEchoSkillTooltip?.(event, getHudDeps(M.GAME));
    fns.hideEchoSkillTooltip = () => M.CombatHudUI?.hideEchoSkillTooltip?.(getHudDeps(M.GAME));
    fns.showTurnBanner = (type) => M.CombatHudUI?.showTurnBanner?.(type, getHudDeps(M.GAME));

    fns.showIntentTooltip = (event, enemyIdx) => {
        const deps = getCombatDeps(M.GAME, {
            selectTargetHandlerName: 'selectTarget',
            showIntentTooltipHandlerName: 'showIntentTooltip',
            hideIntentTooltipHandlerName: 'hideIntentTooltip',
        });
        M.CombatUI?.showIntentTooltip?.(event, enemyIdx, deps);
    };
    fns.hideIntentTooltip = () => {
        const deps = getCombatDeps(M.GAME, {
            selectTargetHandlerName: 'selectTarget',
            showIntentTooltipHandlerName: 'showIntentTooltip',
            hideIntentTooltipHandlerName: 'hideIntentTooltip',
        });
        M.CombatUI?.hideIntentTooltip?.(deps);
    };

    fns.renderCombatEnemies = (forceFullRender = false) => {
        const deps = getCombatDeps(M.GAME, {
            selectTargetHandlerName: 'selectTarget',
            showIntentTooltipHandlerName: 'showIntentTooltip',
            hideIntentTooltipHandlerName: 'hideIntentTooltip',
            forceFullRender,
        });
        M.CombatUI?.renderCombatEnemies?.(deps);
    };
    fns.updateEnemyHpUI = (idx, enemy) => {
        const deps = getCombatDeps(M.GAME, {
            selectTargetHandlerName: 'selectTarget',
            showIntentTooltipHandlerName: 'showIntentTooltip',
            hideIntentTooltipHandlerName: 'hideIntentTooltip',
        });
        M.CombatUI?.updateEnemyHpUI?.(idx, enemy, deps);
    };

    // ═══ Cards ═══
    fns.renderCombatCards = () => M.CardUI?.renderCombatCards?.(Deps.baseCardDeps());
    fns.updateHandFanEffect = () => M.CardUI?.updateHandFanEffect?.(Deps.baseCardDeps());
    fns.renderHand = () => M.CardUI?.renderHand?.(Deps.baseCardDeps());
    fns.getCardTypeClass = (type) => M.CardUI?.getCardTypeClass?.(type) || '';
    fns.getCardTypeLabelClass = (type) => M.CardUI?.getCardTypeLabelClass?.(type) || '';

    fns.updateCombatLog = () => M.CombatHudUI?.updateCombatLog?.(getHudDeps(M.GAME));
    fns.updateEchoSkillBtn = () => M.CombatHudUI?.updateEchoSkillBtn?.(getHudDeps(M.GAME));

    // Battle Chronicle (전투 기록)
    fns.toggleBattleChronicle = () => M.CombatHudUI?.toggleBattleChronicle?.(getHudDeps(M.GAME));
    fns.openBattleChronicle = () => M.CombatHudUI?.openBattleChronicle?.(getHudDeps(M.GAME));
    fns.closeBattleChronicle = () => M.CombatHudUI?.closeBattleChronicle?.(getHudDeps(M.GAME));

    fns.useEchoSkill = () => {
        const deps = getCombatDeps(M.GAME, {
            showEchoBurstOverlay: fns.showEchoBurstOverlay,
            renderCombatEnemies: fns.renderCombatEnemies,
            renderCombatCards: fns.renderCombatCards,
        });
        M.EchoSkillUI?.useEchoSkill?.(deps);
    };
    fns.drawCard = () => M.CombatActionsUI?.drawCard?.(getCombatDeps(M.GAME, { gs: M.GS }));

    // ═══ Card Drag & Drop ═══
    fns.handleCardDragStart = (event, cardId, idx) => M.CardTargetUI?.handleDragStart?.(event, cardId, idx, Deps.getCardTargetDeps());
    fns.handleCardDragEnd = (event) => M.CardTargetUI?.handleDragEnd?.(event, Deps.getCardTargetDeps());
    fns.handleCardDropOnEnemy = (event, enemyIdx) => M.CardTargetUI?.handleDropOnEnemy?.(event, enemyIdx, Deps.getCardTargetDeps());
    fns.selectTarget = (idx) => M.CardTargetUI?.selectTarget?.(idx, Deps.getCardTargetDeps());

    // ═══ Feedback ═══
    fns.showCombatSummary = (dealt, taken, kills) => M.FeedbackUI?.showCombatSummary?.(dealt, taken, kills, Deps.getFeedbackDeps());
    fns.showDmgPopup = (dmg, x, y, color = '#ff3366') => M.FeedbackUI?.showDmgPopup?.(dmg, x, y, color, Deps.getFeedbackDeps());
    fns.showEdgeDamage = () => M.FeedbackUI?.showEdgeDamage?.(Deps.getFeedbackDeps());
    fns.showEchoBurstOverlay = () => M.FeedbackUI?.showEchoBurstOverlay?.(Deps.getFeedbackDeps());
    fns.showCardPlayEffect = (card) => M.FeedbackUI?.showCardPlayEffect?.(card, Deps.getFeedbackDeps());
    fns.showItemToast = (item, options = {}) => M.FeedbackUI?.showItemToast?.(item, Deps.getFeedbackDeps(), options);
    fns.showLegendaryAcquire = (item) => M.FeedbackUI?.showLegendaryAcquire?.(item, Deps.getFeedbackDeps());
    fns.showChainAnnounce = (text) => M.FeedbackUI?.showChainAnnounce?.(text, Deps.getFeedbackDeps());
    fns.showWorldMemoryNotice = (text) => M.FeedbackUI?.showWorldMemoryNotice?.(text, Deps.getFeedbackDeps());
    fns._flushNoticeQueue = () => M.FeedbackUI?._flushNoticeQueue?.(Deps.getFeedbackDeps());
}
