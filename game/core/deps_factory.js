/**
 * Dependency factory for feature modules.
 *
 * Each contract defines the exact dependency surface a feature can use.
 * This keeps module boundaries explicit and prevents hidden global coupling.
 */

import { AppError } from './error_reporter.js';
import { ErrorCodes } from './error_codes.js';

let _refs = {};

export function initDepsFactory(refs) {
    _refs = refs || {};
}

export function patchRefs(partial) {
    Object.assign(_refs, partial || {});
}

function getRaf() {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame.bind(window);
    }
    return (cb) => setTimeout(cb, 16);
}

function buildBaseDeps() {
    return {
        ...(_refs.GAME?.getDeps?.() || {}),
        isGameStarted: () => _refs._gameStarted?.(),
    };
}

const CONTRACT_BUILDERS = Object.freeze({
    base: () => ({
        ...buildBaseDeps(),
    }),

    story: () => ({
        ...buildBaseDeps(),
        audioEngine: _refs.AudioEngine,
        particleSystem: _refs.ParticleSystem,
        showWorldMemoryNotice: _refs.showWorldMemoryNotice,
        restartFromEnding: _refs.restartFromEnding,
    }),

    combatTurnBase: () => ({
        ...(_refs.GAME?.getDeps?.() || {}),
        enemyTurn: _refs.enemyTurn,
        updateChainUI: _refs.updateChainUI,
        showTurnBanner: _refs.showTurnBanner,
        renderCombatEnemies: _refs.renderCombatEnemies,
        renderCombatCards: _refs.renderCombatCards,
        updateStatusDisplay: _refs.updateStatusDisplay,
        updateClassSpecialUI: _refs.updateClassSpecialUI,
        updateCombatEnergy: (gs) => _refs.HudUpdateUI?.updateCombatEnergy?.(gs, _refs.GAME?.getDeps?.() || {}),
        hudUpdateUI: _refs.HudUpdateUI,
        updateUI: _refs.updateUI,
        showEchoBurstOverlay: _refs.showEchoBurstOverlay,
        showDmgPopup: _refs.showDmgPopup,
        shuffleArray: (arr) => _refs.RandomUtils?.shuffleArray?.(arr) || arr,
    }),

    event: () => ({
        ...buildBaseDeps(),
        runRules: _refs.RunRules,
        updateUI: _refs.updateUI,
        returnToGame: _refs.returnToGame,
        switchScreen: _refs.switchScreen,
        renderMinimap: _refs.renderMinimap,
        updateNextNodes: _refs.updateNextNodes,
        showItemToast: _refs.showItemToast,
        audioEngine: _refs.AudioEngine,
        screenShake: _refs.ScreenShake,
        playItemGet: () => _refs.AudioEngine?.playItemGet?.(),
    }),

    reward: () => ({
        ...buildBaseDeps(),
        switchScreen: _refs.switchScreen,
        returnToGame: _refs.returnToGame,
        showItemToast: _refs.showItemToast,
        playItemGet: () => _refs.AudioEngine?.playItemGet?.(),
    }),

    runReturn: () => ({
        ...buildBaseDeps(),
        storySystem: _refs.StorySystem,
        finalizeRunOutcome: _refs.finalizeRunOutcome,
        advanceToNextRegion: _refs.advanceToNextRegion,
        updateNextNodes: _refs.updateNextNodes,
        renderMinimap: _refs.renderMinimap,
    }),

    hudUpdate: () => ({
        ...buildBaseDeps(),
        setBonusSystem: _refs.SetBonusSystem,
        classMechanics: _refs.ClassMechanics,
        tooltipUI: _refs.TooltipUI,
        runRules: _refs.RunRules,
        isGameStarted: () => _refs._gameStarted?.(),
        requestAnimationFrame: getRaf(),
        setBar: (id, pct) => _refs.setBar?.(id, pct),
        setText: (id, val) => _refs.setText?.(id, val),
        updateNoiseWidget: () => _refs.updateNoiseWidget?.(),
        updateEchoSkillBtn: (overrideDeps) => _refs.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || _refs.GAME?.getDeps?.()),
        updateStatusDisplay: () => _refs.updateStatusDisplay?.(),
        renderCombatEnemies: () => _refs.renderCombatEnemies?.(),
        renderCombatCards: () => _refs.renderCombatCards?.(),
        showItemTooltip: (event, id) => _refs.showItemTooltip?.(event, id),
        hideItemTooltip: () => _refs.hideItemTooltip?.(),
        showGeneralTooltip: (event, title, desc, deps) => _refs.showGeneralTooltip?.(event, title, desc, deps),
        hideGeneralTooltip: () => _refs.hideGeneralTooltip?.(),
        getRegionData: _refs.getRegionData,
    }),

    combatHud: () => ({
        ...buildBaseDeps(),
        updateChainUI: _refs.updateChainUI,
        updateNoiseWidget: _refs.updateNoiseWidget,
        updateClassSpecialUI: _refs.updateClassSpecialUI,
        updateUI: _refs.updateUI,
        getBaseRegionIndex: _refs.getBaseRegionIndex,
    }),

    cardTarget: () => ({
        ...buildBaseDeps(),
        renderCombatEnemies: _refs.renderCombatEnemies,
    }),

    baseCard: () => ({
        ...(_refs.GAME?.getDeps?.() || {}),
        playCardHandler: _refs.GS?.playCard?.bind(_refs.GS),
        renderCombatCardsHandler: _refs.renderCombatCards,
        dragStartHandler: _refs.handleCardDragStart,
        dragEndHandler: _refs.handleCardDragEnd,
        showTooltipHandler: _refs.showTooltip,
        hideTooltipHandler: _refs.hideTooltip,
    }),

    feedback: () => ({
        ...buildBaseDeps(),
        audioEngine: _refs.AudioEngine,
        screenShake: _refs.ScreenShake,
        particleSystem: _refs.ParticleSystem,
        gameCanvas: _refs._canvasRefs?.gameCanvas,
    }),

    codex: () => ({
        ...buildBaseDeps(),
    }),

    deckModal: () => ({
        ...buildBaseDeps(),
    }),

    tooltip: () => ({
        ...buildBaseDeps(),
        setBonusSystem: _refs.SetBonusSystem,
    }),

    screen: () => ({
        ...buildBaseDeps(),
        onEnterTitle: () => _refs.animateTitle?.(),
    }),

    combatInfo: () => ({
        ...buildBaseDeps(),
        statusKr: _refs.StatusEffectsUI?.getStatusMap?.() || {},
    }),

    classSelect: () => ({
        ...buildBaseDeps(),
        playClassSelect: (cls) => {
            try {
                _refs.AudioEngine?.init?.();
                _refs.AudioEngine?.resume?.();
                _refs.AudioEngine?.playClassSelect?.(cls);
            } catch (e) {
                console.warn('Audio error:', e);
            }
        },
    }),

    saveSystem: () => ({
        ...buildBaseDeps(),
        runRules: _refs.RunRules,
        isGameStarted: () => _refs._gameStarted?.(),
    }),

    runMode: () => ({
        ...buildBaseDeps(),
        runRules: _refs.RunRules,
        saveMeta: () => _refs.SaveSystem?.saveMeta?.(createDeps('saveSystem')),
        notice: (msg) => _refs.showWorldMemoryNotice?.(msg),
    }),

    runStart: () => ({
        ...buildBaseDeps(),
        switchScreen: _refs.switchScreen,
        markGameStarted: _refs.markGameStarted,
        generateMap: _refs.generateMap,
        audioEngine: _refs.AudioEngine,
        updateUI: _refs.updateUI,
        updateClassSpecialUI: _refs.updateClassSpecialUI,
        initGameCanvas: _refs.initGameCanvas,
        gameLoop: _refs.gameLoop,
        requestAnimationFrame: getRaf(),
        showRunFragment: () => _refs.StorySystem?.showRunFragment?.(),
        showWorldMemoryNotice: _refs.showWorldMemoryNotice,
    }),

    runSetup: () => ({
        ...buildBaseDeps(),
        runRules: _refs.RunRules,
        audioEngine: _refs.AudioEngine,
        getSelectedClass: _refs.getSelectedClass,
        shuffleArray: _refs.shuffleArray,
        resetDeckModalFilter: _refs.resetDeckModalFilter,
        enterRun: () => _refs.RunStartUI?.enterRun?.(createDeps('runStart')),
    }),

    metaProgression: () => ({
        ...buildBaseDeps(),
        switchScreen: _refs.switchScreen,
        clearSelectedClass: _refs.clearSelectedClass,
        refreshRunModePanel: _refs.refreshRunModePanel,
    }),

    regionTransition: () => ({
        ...buildBaseDeps(),
        mazeSystem: _refs.MazeSystem,
        getRegionData: _refs.getRegionData,
        getBaseRegionIndex: _refs.getBaseRegionIndex,
        audioEngine: _refs.AudioEngine,
        particleSystem: _refs.ParticleSystem,
        screenShake: _refs.ScreenShake,
        generateMap: _refs.generateMap,
        updateUI: _refs.updateUI,
        showRunFragment: () => _refs.StorySystem?.showRunFragment?.(),
    }),

    helpPause: () => ({
        ...buildBaseDeps(),
        showDeckView: _refs.showDeckView,
        closeDeckView: _refs.closeDeckView,
        openCodex: _refs.openCodex,
        closeCodex: _refs.closeCodex,
        closeRunSettings: _refs.closeRunSettings,
        quitGame: _refs.quitGame,
        setMasterVolume: _refs.setMasterVolume,
        setSfxVolume: _refs.setSfxVolume,
        setAmbientVolume: _refs.setAmbientVolume,
        closeBattleChronicle: _refs.closeBattleChronicle,
        _syncVolumeUI: _refs._syncVolumeUI || (() => window._syncVolumeUI?.()),
        useEchoSkill: _refs.useEchoSkill,
        drawCard: _refs.drawCard,
        endPlayerTurn: _refs.endPlayerTurn,
        renderCombatEnemies: _refs.renderCombatEnemies,
        finalizeRunOutcome: _refs.finalizeRunOutcome,
        switchScreen: _refs.switchScreen,
        returnToGame: _refs.returnToGame,
    }),

    worldCanvas: () => ({
        ...buildBaseDeps(),
        getRegionData: _refs.getRegionData,
    }),

    gameBoot: () => ({
        ...(_refs.GAME?.getDeps?.() || {}),
        audioEngine: _refs.AudioEngine,
        runRules: _refs.RunRules,
        saveSystem: _refs.SaveSystem,
        saveSystemDeps: createDeps('saveSystem'),
        initTitleCanvas: _refs.initTitleCanvas,
        updateUI: _refs.updateUI,
        refreshRunModePanel: _refs.refreshRunModePanel,
    }),
});

export const DepContracts = Object.freeze(Object.keys(CONTRACT_BUILDERS));

export function listDepContracts() {
    return [...DepContracts];
}

export function createDeps(contractName, overrides = {}) {
    const builder = CONTRACT_BUILDERS[contractName];
    if (!builder) {
        throw new AppError(
            ErrorCodes.DEPS_CONTRACT_MISSING,
            `[deps_factory] Unknown dependency contract: ${contractName}`,
            { context: 'deps_factory.createDeps', meta: { contractName } },
        );
    }
    return {
        ...builder(),
        ...overrides,
    };
}

export function baseDeps() { return createDeps('base'); }
export function getStoryDeps() { return createDeps('story'); }
export function getCombatTurnBaseDeps() { return createDeps('combatTurnBase'); }
export function getEventDeps() { return createDeps('event'); }
export function getRewardDeps() { return createDeps('reward'); }
export function getRunReturnDeps() { return createDeps('runReturn'); }
export function getHudUpdateDeps() { return createDeps('hudUpdate'); }
export function getCombatHudDeps() { return createDeps('combatHud'); }
export function getCardTargetDeps() { return createDeps('cardTarget'); }
export function baseCardDeps() { return createDeps('baseCard'); }
export function getFeedbackDeps() { return createDeps('feedback'); }
export function getCodexDeps() { return createDeps('codex'); }
export function getDeckModalDeps() { return createDeps('deckModal'); }
export function getTooltipDeps() { return createDeps('tooltip'); }
export function getScreenDeps() { return createDeps('screen'); }
export function getCombatInfoDeps() { return createDeps('combatInfo'); }
export function getClassSelectDeps() { return createDeps('classSelect'); }
export function getSaveSystemDeps() { return createDeps('saveSystem'); }
export function getRunModeDeps() { return createDeps('runMode'); }
export function getRunStartDeps() { return createDeps('runStart'); }
export function getRunSetupDeps() { return createDeps('runSetup'); }
export function getMetaProgressionDeps() { return createDeps('metaProgression'); }
export function getRegionTransitionDeps() { return createDeps('regionTransition'); }
export function getHelpPauseDeps() { return createDeps('helpPause'); }
export function getWorldCanvasDeps() { return createDeps('worldCanvas'); }
export function getGameBootDeps() { return createDeps('gameBoot'); }
