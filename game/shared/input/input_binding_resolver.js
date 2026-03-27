import {
  INPUT_ACTION_CANCEL,
  INPUT_ACTION_CODEX,
  INPUT_ACTION_CONFIRM,
  INPUT_ACTION_DECK_VIEW,
  INPUT_ACTION_DRAW_CARD,
  INPUT_ACTION_ECHO_SKILL,
  INPUT_ACTION_END_TURN,
  INPUT_ACTION_HELP,
  INPUT_ACTION_PAUSE,
  INPUT_ACTION_TARGET_CYCLE,
} from './input_action_ids.js';

const INPUT_BINDING_CONFIG = Object.freeze({
  [INPUT_ACTION_CONFIRM]: { settingsKey: null, fallback: 'Enter' },
  [INPUT_ACTION_CANCEL]: { settingsKey: null, fallback: 'Escape' },
  [INPUT_ACTION_PAUSE]: { settingsKey: 'pause', fallback: 'Escape' },
  [INPUT_ACTION_HELP]: { settingsKey: 'help', fallback: 'Slash' },
  [INPUT_ACTION_DECK_VIEW]: { settingsKey: 'deckView', fallback: 'KeyD' },
  [INPUT_ACTION_CODEX]: { settingsKey: 'codex', fallback: 'KeyC' },
  [INPUT_ACTION_END_TURN]: { settingsKey: 'endTurn', fallback: 'Enter' },
  [INPUT_ACTION_ECHO_SKILL]: { settingsKey: 'echoSkill', fallback: 'KeyE' },
  [INPUT_ACTION_DRAW_CARD]: { settingsKey: 'drawCard', fallback: 'KeyQ' },
  [INPUT_ACTION_TARGET_CYCLE]: { settingsKey: 'nextTarget', fallback: 'Tab' },
});

const INPUT_ACTION_ALIASES = Object.freeze({
  nextTarget: INPUT_ACTION_TARGET_CYCLE,
});

function normalizeInputActionId(actionId) {
  return INPUT_ACTION_ALIASES[actionId] || actionId;
}

function resolveInputBindings(bindings = null) {
  if (!bindings || typeof bindings !== 'object') return {};
  if (bindings.keybindings && typeof bindings.keybindings === 'object') {
    return bindings.keybindings;
  }
  return bindings;
}

export function getInputBindingConfig(actionId) {
  return INPUT_BINDING_CONFIG[normalizeInputActionId(actionId)] || null;
}

export function getInputSettingsKey(actionId) {
  return getInputBindingConfig(actionId)?.settingsKey || null;
}

export function getInputBindingCode(actionId, fallback = undefined, bindings = null) {
  const config = getInputBindingConfig(actionId);
  const resolvedFallback = fallback ?? config?.fallback ?? null;
  const settingsKey = config?.settingsKey;
  if (!settingsKey) return resolvedFallback;

  const code = resolveInputBindings(bindings)[settingsKey];
  if (typeof code === 'string' && code.trim()) return code;
  return resolvedFallback;
}

export function getInputBindingMap(bindings = null) {
  return Object.fromEntries(
    Object.keys(INPUT_BINDING_CONFIG).map((actionId) => [
      actionId,
      getInputBindingCode(actionId, undefined, bindings),
    ]),
  );
}
