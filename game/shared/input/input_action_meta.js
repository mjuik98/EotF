import {
  INPUT_ACTION_CODEX,
  INPUT_ACTION_DECK_VIEW,
  INPUT_ACTION_DRAW_CARD,
  INPUT_ACTION_ECHO_SKILL,
  INPUT_ACTION_END_TURN,
  INPUT_ACTION_HELP,
  INPUT_ACTION_PAUSE,
  INPUT_ACTION_TARGET_CYCLE,
} from './input_action_ids.js';
import { getInputBindingCode } from './input_binding_resolver.js';
import { inputCodeToLabel } from './keyboard_to_action.js';

export const INPUT_ACTION_CATEGORY = Object.freeze({
  GLOBAL: 'global',
  COMBAT: 'combat',
});

export const INPUT_ACTION_META = Object.freeze({
  [INPUT_ACTION_PAUSE]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.GLOBAL,
    description: '일시정지 (창 닫기)',
  }),
  [INPUT_ACTION_DECK_VIEW]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.GLOBAL,
    description: '덱 보기',
  }),
  [INPUT_ACTION_CODEX]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.GLOBAL,
    description: '도감 열기',
  }),
  [INPUT_ACTION_HELP]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.GLOBAL,
    description: '도움말 열기',
  }),
  [INPUT_ACTION_ECHO_SKILL]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.COMBAT,
    description: '잔향 스킬 발동 (전투 중)',
  }),
  [INPUT_ACTION_DRAW_CARD]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.COMBAT,
    description: '카드 드로우 (전투 중)',
  }),
  [INPUT_ACTION_END_TURN]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.COMBAT,
    description: '턴 종료 (전투 중)',
  }),
  [INPUT_ACTION_TARGET_CYCLE]: Object.freeze({
    category: INPUT_ACTION_CATEGORY.COMBAT,
    description: '다음 적 대상 전환',
  }),
});

const INPUT_HELP_ORDER = Object.freeze([
  { actionId: INPUT_ACTION_PAUSE },
  { actionId: INPUT_ACTION_DECK_VIEW },
  { actionId: INPUT_ACTION_HELP },
  { actionId: INPUT_ACTION_ECHO_SKILL },
  { actionId: INPUT_ACTION_DRAW_CARD },
  { actionId: INPUT_ACTION_END_TURN },
  { keyLabel: '1 - 0', description: '손패 카드 빠른 사용', category: INPUT_ACTION_CATEGORY.COMBAT },
  { actionId: INPUT_ACTION_TARGET_CYCLE },
]);

export function getInputActionMeta(actionId) {
  return INPUT_ACTION_META[actionId] || null;
}

export function getInputHelpEntries(bindings = null) {
  return INPUT_HELP_ORDER.map((entry) => {
    if (!entry.actionId) {
      return {
        actionId: null,
        keyLabel: entry.keyLabel,
        description: entry.description,
        category: entry.category,
      };
    }

    const meta = getInputActionMeta(entry.actionId) || {};
    const code = getInputBindingCode(entry.actionId, undefined, bindings);
    return {
      actionId: entry.actionId,
      keyLabel: inputCodeToLabel(code),
      description: meta.description || '',
      category: meta.category || INPUT_ACTION_CATEGORY.GLOBAL,
    };
  });
}
