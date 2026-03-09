import { registerSubscribers } from './event_subscribers.js';
import {
    buildGameBootPayload,
    configureMazeSystem,
    mountCharacterSelect,
    registerInitSequenceBindings,
    setupStorySystemBridge,
} from './init_sequence_steps.js';

export function bootGame(modules, fns, Deps) {
    const {
        GAME, GS, DATA, AudioEngine, ParticleSystem, FovEngine,
        MazeSystem, GameInit, HelpPauseUI, GameBootUI, exposeGlobals,
    } = modules;

    GAME.init(GS, DATA, AudioEngine, ParticleSystem);

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
        StatusEffectsUI: modules.StatusEffectsUI,
        RewardUI: modules.RewardUI, CombatActionsUI: modules.CombatActionsUI,
        TooltipUI: modules.TooltipUI, HelpPauseUI, RunSetupUI: modules.RunSetupUI,
        DescriptionUtils: modules.DescriptionUtils,
        classMechanics: modules.ClassMechanics,
        ...fns,
    });

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

    const StorySystem = setupStorySystemBridge({ modules, deps: Deps });
    registerInitSequenceBindings({ game: GAME, modules, fns });

    configureMazeSystem({
        mazeSystem: MazeSystem,
        gs: GS,
        fovEngine: FovEngine,
        fns,
        doc: document,
        win: window,
    });

    setTimeout(() => {
        mountCharacterSelect({
            modules,
            deps: Deps,
            fns,
            doc: document,
        });
    }, 50);

    exposeGlobals({
        _syncVolumeUI: () => GameInit.syncVolumeUI(AudioEngine),
    });

    try {
        GameInit.boot(buildGameBootPayload({ modules, deps: Deps, fns }));
    } catch (e) {
        console.error('Critical Boot Error:', e);
    }

    return { StorySystem };
}
