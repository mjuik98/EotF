export function getLegacyRoot() {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined') return globalThis;
  return null;
}

const FEATURE_MODULE_NAMES = Object.freeze({
  combat: [
    'CombatUI',
    'HudUpdateUI',
    'StatusEffectsUI',
    'TooltipUI',
    'FeedbackUI',
    'ClassMechanics',
    'CardCostUtils',
    'DescriptionUtils',
  ],
  event: [
    'EventUI',
    'TooltipUI',
    'FeedbackUI',
    'ScreenUI',
    'RunRules',
    'StoryUI',
  ],
  run: [
    'RunRules',
    'MazeSystem',
    'ScreenUI',
    'RunModeUI',
    'RunSetupUI',
    'RunStartUI',
    'HelpPauseUI',
    'FeedbackUI',
    'ClassMechanics',
    'CardCostUtils',
    'StoryUI',
  ],
  canvas: [
    'RunRules',
    'MazeSystem',
    'ClassMechanics',
    'FeedbackUI',
  ],
  hud: [
    'HudUpdateUI',
    'StatusEffectsUI',
    'TooltipUI',
    'FeedbackUI',
    'ClassMechanics',
  ],
  ui: [
    'HudUpdateUI',
    'StatusEffectsUI',
    'TooltipUI',
    'DeckModalUI',
    'CodexUI',
    'ScreenUI',
    'FeedbackUI',
  ],
});

export function buildLegacyCommonDeps(game, root = getLegacyRoot()) {
  const doc = typeof document !== 'undefined' ? document : root?.document || null;
  const win = typeof window !== 'undefined' ? window : root?.window || root || null;
  return {
    gs: game.State,
    State: game.State,
    state: game.State,
    data: game.Data,
    Data: game.Data,
    audio: game.Audio,
    audioEngine: game.Audio,
    particles: game.Particle,
    particleSystem: game.Particle,
    doc,
    win,
    api: game.API,
  };
}

export function buildModuleSubset(game, names = []) {
  return names.reduce((acc, name) => {
    if (Object.prototype.hasOwnProperty.call(game.Modules, name)) {
      acc[name] = game.Modules[name];
    }
    return acc;
  }, {});
}

export function buildLegacyBaseDeps(game, root = getLegacyRoot()) {
  return {
    ...buildLegacyCommonDeps(game, root),
    ...game.Modules,
  };
}

export function buildLegacyFeatureDeps(game, featureName, extra = {}) {
  const root = getLegacyRoot();
  const names = FEATURE_MODULE_NAMES[featureName] || [];
  const deps = {
    ...buildLegacyCommonDeps(game, root),
    ...buildModuleSubset(game, names),
    runRules: root?.RunRules || game.Modules.RunRules,
    ...extra,
  };

  if (featureName === 'combat' && deps.classMechanics === undefined) {
    deps.classMechanics = deps.ClassMechanics;
  }

  return deps;
}

export function exposeLegacyGlobals(mapping, root = getLegacyRoot()) {
  if (!mapping || !root || mapping === root) return;

  const reserved = ['window', 'document', 'location', 'top', 'parent', 'self'];
  Object.entries(mapping).forEach(([key, val]) => {
    if (reserved.includes(key)) return;
    try {
      root[key] = val;
    } catch (e) {
      console.warn(`[GAME] Could not expose global: ${key}`, e);
    }
  });
}
