/**
 * deps_factory.js — 의존성 팩토리 모음
 *
 * 각 UI 모듈에 주입할 deps 객체를 생성하는 팩토리 함수들.
 * main.js에서 모듈 참조와 래퍼 함수 참조를 주입받아 초기화합니다.
 */

let _refs = {};  // 모든 모듈/래퍼 참조 저장

/**
 * 초기화 — main.js에서 모든 참조를 한번에 주입
 */
export function initDepsFactory(refs) {
    _refs = refs;
}

// ─── 공통 base ───
export function baseDeps() {
    return {
        ...(_refs.GAME?.getDeps?.() || {}),
        isGameStarted: () => _refs._gameStarted?.(),
    };
}

// ─── Story ───
export function getStoryDeps() {
    return {
        ...baseDeps(),
        audioEngine: _refs.AudioEngine,
        particleSystem: _refs.ParticleSystem,
        showWorldMemoryNotice: _refs.showWorldMemoryNotice,
    };
}

// ─── Combat Turn ───
export function getCombatTurnBaseDeps() {
    return {
        ...(_refs.GAME?.getDeps?.() || {}),
        enemyTurn: _refs.enemyTurn,
        updateChainUI: _refs.updateChainUI,
        showTurnBanner: _refs.showTurnBanner,
        renderCombatEnemies: _refs.renderCombatEnemies,
        renderCombatCards: _refs.renderCombatCards,
        updateStatusDisplay: _refs.updateStatusDisplay,
        updateClassSpecialUI: _refs.updateClassSpecialUI,
        updateUI: _refs.updateUI,
        showEchoBurstOverlay: _refs.showEchoBurstOverlay,
        showDmgPopup: _refs.showDmgPopup,
        shuffleArray: (arr) => _refs.RandomUtils?.shuffleArray?.(arr) || arr,
    };
}

// ─── Event ───
export function getEventDeps() {
    return {
        ...baseDeps(),
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
    };
}

// ─── Reward ───
export function getRewardDeps() {
    return {
        ...baseDeps(),
        switchScreen: _refs.switchScreen,
        returnToGame: _refs.returnToGame,
        showItemToast: _refs.showItemToast,
        playItemGet: () => _refs.AudioEngine?.playItemGet?.(),
    };
}

// ─── Run Return ───
export function getRunReturnDeps() {
    return {
        ...baseDeps(),
        storySystem: _refs.StorySystem,
        finalizeRunOutcome: _refs.finalizeRunOutcome,
        advanceToNextRegion: _refs.advanceToNextRegion,
        updateNextNodes: _refs.updateNextNodes,
        renderMinimap: _refs.renderMinimap,
    };
}

// ─── HUD Update ───
export function getHudUpdateDeps() {
    return {
        ...baseDeps(),
        setBonusSystem: _refs.SetBonusSystem,
        classMechanics: _refs.ClassMechanics,
        isGameStarted: () => _refs._gameStarted?.(),
        requestAnimationFrame: window.requestAnimationFrame.bind(window),
        setBar: (id, pct) => _refs.setBar?.(id, pct),
        setText: (id, val) => _refs.setText?.(id, val),
        updateNoiseWidget: () => _refs.updateNoiseWidget?.(),
        updateEchoSkillBtn: (overrideDeps) => _refs.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || _refs.GAME?.getDeps?.()),
        updateStatusDisplay: () => _refs.updateStatusDisplay?.(),
        getRegionData: _refs.getRegionData,
    };
}

// ─── Combat HUD ───
export function getCombatHudDeps() {
    return {
        ...baseDeps(),
        updateChainUI: _refs.updateChainUI,
        updateNoiseWidget: _refs.updateNoiseWidget,
        updateClassSpecialUI: _refs.updateClassSpecialUI,
        updateUI: _refs.updateUI,
        getBaseRegionIndex: _refs.getBaseRegionIndex,
    };
}

// ─── Card Target ───
export function getCardTargetDeps() {
    return {
        ...baseDeps(),
        renderCombatEnemies: _refs.renderCombatEnemies,
    };
}

// ─── Card ───
export function baseCardDeps() {
    const deps = _refs.GAME?.getDeps?.() || {};
    deps.playCardHandler = _refs.GS?.playCard?.bind(_refs.GS);
    deps.renderCombatCardsHandler = _refs.renderCombatCards;
    deps.dragStartHandler = _refs.handleCardDragStart;
    deps.dragEndHandler = _refs.handleCardDragEnd;
    deps.showTooltipHandler = _refs.showTooltip;
    deps.hideTooltipHandler = _refs.hideTooltip;
    return deps;
}

// ─── Feedback ───
export function getFeedbackDeps() {
    return {
        ...baseDeps(),
        audioEngine: _refs.AudioEngine,
        screenShake: _refs.ScreenShake,
    };
}

// ─── Codex ───
export function getCodexDeps() {
    return { ...baseDeps() };
}

// ─── Deck Modal ───
export function getDeckModalDeps() {
    return { ...baseDeps() };
}

// ─── Tooltip ───
export function getTooltipDeps() {
    return {
        ...baseDeps(),
        setBonusSystem: _refs.SetBonusSystem,
    };
}

// ─── Screen ───
export function getScreenDeps() {
    return {
        ...baseDeps(),
        onEnterTitle: () => _refs.animateTitle?.(),
    };
}

// ─── Combat Info ───
export function getCombatInfoDeps() {
    return {
        ...baseDeps(),
        statusKr: _refs.StatusEffectsUI?.getStatusMap?.() || {},
    };
}

// ─── Class Select ───
export function getClassSelectDeps() {
    return {
        ...baseDeps(),
        playClassSelect: (cls) => {
            try {
                _refs.AudioEngine?.init?.();
                _refs.AudioEngine?.resume?.();
                _refs.AudioEngine?.playClassSelect?.(cls);
            } catch (e) {
                console.warn('Audio error:', e);
            }
        },
    };
}

// ─── Save System ───
export function getSaveSystemDeps() {
    return {
        ...baseDeps(),
        runRules: _refs.RunRules,
        isGameStarted: () => _refs._gameStarted?.(),
    };
}

// ─── Run Mode ───
export function getRunModeDeps() {
    return {
        ...baseDeps(),
        runRules: _refs.RunRules,
        saveMeta: () => _refs.SaveSystem?.saveMeta?.(getSaveSystemDeps()),
        notice: (msg) => _refs.showWorldMemoryNotice?.(msg),
    };
}

// ─── Run Start ───
export function getRunStartDeps() {
    return {
        ...baseDeps(),
        switchScreen: _refs.switchScreen,
        markGameStarted: _refs.markGameStarted,
        generateMap: _refs.generateMap,
        audioEngine: _refs.AudioEngine,
        updateUI: _refs.updateUI,
        updateClassSpecialUI: _refs.updateClassSpecialUI,
        initGameCanvas: _refs.initGameCanvas,
        gameLoop: _refs.gameLoop,
        requestAnimationFrame: window.requestAnimationFrame.bind(window),
        showRunFragment: () => _refs.StorySystem?.showRunFragment?.(),
        showWorldMemoryNotice: _refs.showWorldMemoryNotice,
    };
}

// ─── Run Setup ───
export function getRunSetupDeps() {
    return {
        ...baseDeps(),
        runRules: _refs.RunRules,
        audioEngine: _refs.AudioEngine,
        getSelectedClass: _refs.getSelectedClass,
        shuffleArray: _refs.shuffleArray,
        resetDeckModalFilter: _refs.resetDeckModalFilter,
        enterRun: () => _refs.RunStartUI?.enterRun?.(getRunStartDeps()),
    };
}

// ─── Meta Progression ───
export function getMetaProgressionDeps() {
    return {
        ...baseDeps(),
        switchScreen: _refs.switchScreen,
        clearSelectedClass: _refs.clearSelectedClass,
        refreshRunModePanel: _refs.refreshRunModePanel,
    };
}

// ─── Region Transition ───
export function getRegionTransitionDeps() {
    return {
        ...baseDeps(),
        mazeSystem: _refs.MazeSystem,
        getRegionData: _refs.getRegionData,
        getBaseRegionIndex: _refs.getBaseRegionIndex,
        audioEngine: _refs.AudioEngine,
        particleSystem: _refs.ParticleSystem,
        screenShake: _refs.ScreenShake,
        generateMap: _refs.generateMap,
        updateUI: _refs.updateUI,
        showRunFragment: () => _refs.StorySystem?.showRunFragment?.(),
    };
}

// ─── Help / Pause ───
export function getHelpPauseDeps() {
    return {
        ...baseDeps(),
        showDeckView: _refs.showDeckView,
        closeDeckView: _refs.closeDeckView,
        openCodex: _refs.openCodex,
        closeCodex: _refs.closeCodex,
        closeRunSettings: _refs.closeRunSettings,
        quitGame: _refs.quitGame,
        setMasterVolume: _refs.setMasterVolume,
        setSfxVolume: _refs.setSfxVolume,
        setAmbientVolume: _refs.setAmbientVolume,
        _syncVolumeUI: _refs._syncVolumeUI,
        useEchoSkill: _refs.useEchoSkill,
        endPlayerTurn: _refs.endPlayerTurn,
        renderCombatEnemies: _refs.renderCombatEnemies,
        finalizeRunOutcome: _refs.finalizeRunOutcome,
        switchScreen: _refs.switchScreen,
        returnToGame: _refs.returnToGame,
    };
}

// ─── World Canvas ───
export function getWorldCanvasDeps() {
    return {
        ...baseDeps(),
        getRegionData: _refs.getRegionData,
    };
}

// ─── Game Boot ───
export function getGameBootDeps() {
    return {
        ...(_refs.GAME?.getDeps?.() || {}),
        gameBootUI: _refs.GameBootUI,
        getGameBootDeps: () => ({
            ...(_refs.GAME?.getDeps?.() || {}),
            audioEngine: _refs.AudioEngine,
            runRules: _refs.RunRules,
            saveSystem: _refs.SaveSystem,
            saveSystemDeps: getSaveSystemDeps(),
            initTitleCanvas: _refs.initTitleCanvas,
            updateUI: _refs.updateUI,
            refreshRunModePanel: _refs.refreshRunModePanel,
        }),
    };
}
