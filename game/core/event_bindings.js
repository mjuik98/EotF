import * as Deps from './deps_factory.js';
import { getRuntimeMetrics, resetRuntimeMetrics } from './runtime_metrics.js';
import { createCanvasBindings } from './bindings/canvas_bindings.js';
import { createCombatBindings } from './bindings/combat_bindings.js';
import { createEventRewardBindings } from './bindings/event_reward_bindings.js';
import { createUIBindings } from './bindings/ui_bindings.js';
import { createTitleSettingsBindings } from './bindings/title_settings_bindings.js';
import {
    exposeBindingsToWindow,
    registerGameAPIBindings,
    registerGameModules,
} from './event_binding_registry.js';

let M = {};

export function setupBindings(modules) {
    M = modules;

    const fns = {};

    createCanvasBindings(M, fns);
    createCombatBindings(M, fns);
    createEventRewardBindings(M, fns);
    createUIBindings(M, fns);
    createTitleSettingsBindings(M, fns);

    exposeBindingsToWindow(M, fns, Deps);
    registerGameAPIBindings(M, fns, Deps, { getRuntimeMetrics, resetRuntimeMetrics });
    registerGameModules(M);

    Deps.initDepsFactory({
        ...M,
        ...fns,
        _gameStarted: () => M._gameStarted,
        markGameStarted: () => { M._gameStarted = true; },
        getSelectedClass: () => M.ClassSelectUI?.getSelectedClass?.() || null,
        clearSelectedClass: () => M.ClassSelectUI?.clearSelection?.(Deps.getClassSelectDeps()),
        showPendingClassProgressSummary: () => M.CharacterSelectUI?.showPendingSummaries?.(),
        resetDeckModalFilter: () => M.DeckModalUI?.resetFilter?.(),
    });

    return fns;
}
