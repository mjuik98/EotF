/**
 * init_sequence.js — 부트 시퀀스 / 초기화
 *
 * GAME.init, MazeSystem 설정, StorySystem 생성, 최종 GameInit.boot 실행.
 */
import { registerSubscribers } from './event_subscribers.js';

/**
 * 게임 부팅 실행
 */
export function bootGame(modules, fns, Deps) {
    const {
        GAME, GS, DATA, AudioEngine, ParticleSystem, FovEngine,
        MazeSystem, StoryUI, GameInit, HelpPauseUI, GameBootUI,
        CombatStartUI, exposeGlobals,
    } = modules;

    // ── GAME 네임스페이스 초기화 ──
    GAME.init(GS, DATA, AudioEngine, ParticleSystem);

    // ── 레거시 전역 노출 (exposeGlobals는 global_bridge.js에서 가져옴) ──
    exposeGlobals({
        AudioEngine, ParticleSystem, ScreenShake: modules.ScreenShake,
        HitStop: modules.HitStop, FovEngine, DifficultyScaler: modules.DifficultyScaler,
        RandomUtils: modules.RandomUtils, RunRules: modules.RunRules,
        getRegionData: modules.getRegionData, getBaseRegionIndex: modules.getBaseRegionIndex,
        getRegionCount: modules.getRegionCount, ClassMechanics: modules.ClassMechanics,
        SetBonusSystem: modules.SetBonusSystem, SaveSystem: modules.SaveSystem,
        CardCostUtils: modules.CardCostUtils,
        CodexUI: modules.CodexUI, EventUI: modules.EventUI,
        CombatUI: modules.CombatUI, DeckModalUI: modules.DeckModalUI,
        RunModeUI: modules.RunModeUI, ScreenUI: modules.ScreenUI,
        TitleCanvasUI: modules.TitleCanvasUI, ClassSelectUI: modules.ClassSelectUI,
        CombatHudUI: modules.CombatHudUI, HudUpdateUI: modules.HudUpdateUI,
        RewardUI: modules.RewardUI, CombatActionsUI: modules.CombatActionsUI,
        TooltipUI: modules.TooltipUI, HelpPauseUI, RunSetupUI: modules.RunSetupUI,
        DescriptionUtils: modules.DescriptionUtils,
        classMechanics: modules.ClassMechanics,
        ...fns,
    });

    // ── EventBus 구독 등록 (Pub/Sub 와이어링) ──
    registerSubscribers({
        HudUpdateUI: modules.HudUpdateUI,
        CombatHudUI: modules.CombatHudUI,
        FeedbackUI: modules.FeedbackUI,
        CombatUI: modules.CombatUI,
        StatusEffectsUI: modules.StatusEffectsUI,
        AudioEngine,
        ParticleSystem,
        ScreenShake: modules.ScreenShake,
        HitStop: modules.HitStop,
        doc: document,
        win: window,
        actions: {
            renderHand: fns.renderHand,
            renderCombatCards: fns.renderCombatCards,
            updateEchoSkillBtn: fns.updateEchoSkillBtn,
            updateNoiseWidget: fns.updateNoiseWidget,
            updateStatusDisplay: fns.updateStatusDisplay,
            showCardPlayEffect: fns.showCardPlayEffect,
            showDmgPopup: fns.showDmgPopup,
            renderCombatEnemies: fns.renderCombatEnemies,
            updateUI: fns.updateUI,
            showTurnBanner: fns.showTurnBanner,
            updateCombatLog: fns.updateCombatLog,
        },
    });

    // ── StorySystem 브릿지 ──
    const StorySystem = {
        unlockNextFragment: () => StoryUI?.unlockNextFragment?.(Deps.getStoryDeps()),
        showRunFragment: (overrides = {}) => StoryUI?.showRunFragment?.({
            ...Deps.getStoryDeps(),
            ...overrides,
        }),
        displayFragment: (frag) => StoryUI?.displayFragment?.(frag, Deps.getStoryDeps()),
        checkHiddenEnding: () => !!StoryUI?.checkHiddenEnding?.(Deps.getStoryDeps()),
        showNormalEnding: () => StoryUI?.showNormalEnding?.(Deps.getStoryDeps()),
        showHiddenEnding: () => StoryUI?.showHiddenEnding?.(Deps.getStoryDeps()),
    };
    GAME.register('storySystem', StorySystem);
    modules.StorySystem = StorySystem;
    Deps.patchRefs({ StorySystem });

    // ── GAME.register 추가 등록 ──
    GAME.register('advanceToNextRegion', fns.advanceToNextRegion);
    GAME.register('finalizeRunOutcome', modules.finalizeRunOutcome);
    GAME.register('switchScreen', fns.switchScreen);
    GAME.register('updateUI', fns.updateUI);
    GAME.register('updateNextNodes', fns.updateNextNodes);
    GAME.register('renderMinimap', fns.renderMinimap);

    // ── Maze System 설정 ──
    MazeSystem?.configure?.({
        gs: GS,
        doc: document,
        win: window,
        fovEngine: FovEngine,
        showWorldMemoryNotice: (text) => fns.showWorldMemoryNotice(text),
        startCombat: (isBoss) => fns.startCombat(isBoss),
    });

    // ── 캐릭터 선택 UI 렌더링 ──
    setTimeout(() => {
        if (modules.CharacterSelectUI) {
            modules.CharacterSelectUI.mount({
                doc: document,
                gs: GS,
                audioEngine: AudioEngine,
                onProgressConsumed: () => modules.SaveSystem?.saveMeta?.(Deps.getSaveSystemDeps()),
                onConfirm: (char) => {
                    // 선택 완료 애니메이션 직후, 클래스만 미리 선택해둡니다.
                    if (fns.selectClass) fns.selectClass(char.id);
                },
                onBack: () => {
                    if (fns.backToTitle) fns.backToTitle();
                },
                onStart: (char) => {
                    // 최종 '여정 시작' 버튼 클릭 시
                    if (fns.startGame) fns.startGame(char.id);
                }
            });
        }
    }, 50);

    // ── 볼륨 동기화 ──
    exposeGlobals({
        _syncVolumeUI: () => GameInit.syncVolumeUI(AudioEngine),
    });

    // ── 최종 부트 ──
    try {
        GameInit.boot({
            ...GAME.getDeps(),
            audioEngine: AudioEngine,
            particleSystem: ParticleSystem,
            helpPauseUI: HelpPauseUI,
            gameBootUI: GameBootUI,
            getGameBootDeps: () => Deps.getGameBootDeps(),
            getHelpPauseDeps: () => Deps.getHelpPauseDeps(),
            actions: {
                showCharacterSelect: fns.showCharacterSelect,
                continueRun: fns.continueRun,
                openRunSettings: fns.openRunSettings,
                openCodexFromTitle: fns.openCodexFromTitle,
                quitGame: fns.quitGame,
                selectClass: fns.selectClass,
                startGame: fns.startGame,
                backToTitle: fns.backToTitle,
                closeRunSettings: fns.closeRunSettings,
                shiftAscension: fns.shiftAscension,
                toggleEndlessMode: fns.toggleEndlessMode,
                cycleRunBlessing: fns.cycleRunBlessing,
                cycleRunCurse: fns.cycleRunCurse,
                setMasterVolume: (v) => fns.setMasterVolume(v),
                setSfxVolume: (v) => fns.setSfxVolume(v),
                setAmbientVolume: (v) => fns.setAmbientVolume(v),
                openSettings: fns.openSettings,
                closeSettings: fns.closeSettings,
                drawCard: fns.drawCard,
                endPlayerTurn: fns.endPlayerTurn,
                useEchoSkill: fns.useEchoSkill,
            },
        });
    } catch (e) {
        console.error('Critical Boot Error:', e);
    }

    return { StorySystem };
}
