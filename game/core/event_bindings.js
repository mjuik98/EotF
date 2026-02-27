/**
 * event_bindings.js — 래퍼 함수 + window/GAME 바인딩 (오케스트레이터)
 *
 * 도메인별로 분리된 바인딩 모듈들을 조합하고,
 * window 노출 + GAME.API 등록 + 모듈 등록을 수행합니다.
 *
 * 하위 모듈:
 * - bindings/canvas_bindings.js:          Canvas + Game Loop + Map
 * - bindings/combat_bindings.js:          Combat + Card + Feedback
 * - bindings/event_reward_bindings.js:    Event + Reward + Run
 * - bindings/ui_bindings.js:              UI System + Deck/Codex + Tooltip + Screen
 * - bindings/title_settings_bindings.js:  Title + Help + Sound + Utility
 */
import * as Deps from './deps_factory.js';
import { createCanvasBindings } from './bindings/canvas_bindings.js';
import { createCombatBindings } from './bindings/combat_bindings.js';
import { createEventRewardBindings } from './bindings/event_reward_bindings.js';
import { createUIBindings } from './bindings/ui_bindings.js';
import { createTitleSettingsBindings } from './bindings/title_settings_bindings.js';

/** 래퍼 함수 참조를 외부에서 셋업할 수 있도록 모듈 참조 보관 */
let M = {}; // 모듈 참조

export function setupBindings(modules) {
    M = modules;

    // ──────────────────────────────────────
    // 래퍼 함수 정의 → 객체에 수집
    // ──────────────────────────────────────
    const fns = {};

    // 도메인별 래퍼 함수 생성
    createCanvasBindings(M, fns);
    createCombatBindings(M, fns);
    createEventRewardBindings(M, fns);
    createUIBindings(M, fns);
    createTitleSettingsBindings(M, fns);

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
        // 제보받은 누락 함수 목록 추가 등록
        'endPlayerTurn', 'takeRewardCard', 'moveToNode', 'toggleHelp', 'togglePause',
        'abandonRun', 'confirmAbandon', 'showDeckView', 'useEchoSkill', 'drawCard',
        'resolveEvent', 'returnToGame', 'openCodex', 'toggleCombatInfo', 'updateStatusDisplay',
        'showCardPlayEffect',
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
    G.register('CardCostUtils', M.CardCostUtils);
}
