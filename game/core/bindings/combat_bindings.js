/**
 * combat_bindings.js — Combat + Card + Feedback 래퍼 함수
 *
 * 책임: 전투, 카드, 피드백 UI 관련 래퍼
 */
import * as Deps from '../deps_factory.js';

export function createCombatBindings(M, fns) {
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

    // ═══ Cards ═══
    fns.renderCombatCards = () => M.CardUI?.renderCombatCards?.(Deps.baseCardDeps());
    fns.updateHandFanEffect = () => M.CardUI?.updateHandFanEffect?.(Deps.baseCardDeps());
    fns.renderHand = () => M.CardUI?.renderHand?.(Deps.baseCardDeps());
    fns.getCardTypeClass = (type) => M.CardUI?.getCardTypeClass?.(type) || '';
    fns.getCardTypeLabelClass = (type) => M.CardUI?.getCardTypeLabelClass?.(type) || '';

    fns.updateCombatLog = () => M.CombatHudUI?.updateCombatLog?.(M.GAME.getDeps());
    fns.updateEchoSkillBtn = () => M.CombatHudUI?.updateEchoSkillBtn?.(M.GAME.getDeps());

    // Battle Chronicle (전투 기록)
    fns.toggleBattleChronicle = () => M.CombatHudUI?.toggleBattleChronicle?.(M.GAME.getDeps());
    fns.openBattleChronicle = () => M.CombatHudUI?.openBattleChronicle?.(M.GAME.getDeps());
    fns.closeBattleChronicle = () => M.CombatHudUI?.closeBattleChronicle?.(M.GAME.getDeps());

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
}
