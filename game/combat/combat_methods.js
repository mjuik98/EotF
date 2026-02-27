/**
 * combat_methods.js — 전투 메서드 통합 모듈
 *
 * 책임별로 분리된 하위 모듈들을 하나의 CombatMethods 객체로 통합합니다.
 * 기존 소비자(game_state_core_methods.js)는 변경 없이 동작합니다.
 *
 * 하위 모듈:
 * - damage_system.js:    데미지 처리 (dealDamage, addShield, takeDamage 등)
 * - death_handler.js:    사망 처리 (onEnemyDeath, onPlayerDeath 등)
 * - combat_lifecycle.js: 전투 흐름 (endCombat, updateChainDisplay 등)
 */

import { DamageSystem } from './damage_system.js';
import { DeathHandler } from './death_handler.js';
import { CombatLifecycle } from './combat_lifecycle.js';

export const CombatMethods = {
    ...DamageSystem,
    ...DeathHandler,
    ...CombatLifecycle,
};
