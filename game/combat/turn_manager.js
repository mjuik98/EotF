/**
 * turn_manager.js — 전투 턴 비즈니스 로직 (순수 Model)
 *
 * DOM/window 접근 없이 게임 상태(gs)만 변경합니다.
 * UI 업데이트는 호출측(combat_turn_ui.js)이 반환값/콜백으로 처리합니다.
 */
import { LogUtils } from '../utils/log_utils.js';
import { Actions } from '../core/state_actions.js';
import { ENEMY_TURN_BUFFS, TURN_START_DEBUFFS } from './turn_manager_helpers.js';
import { getRegionIdForStage } from '../systems/run_rules.js';

const INFINITE_STACK_BUFF_IDS = new Set([
    'resonance',
    'time_warp',
    'time_warp_plus',
    'blessing_of_light',
    'blessing_of_light_plus',
    'berserk_mode',
    'berserk_mode_plus',
    'unbreakable_wall',
    'unbreakable_wall_plus',
]);

function _isInfiniteStackBuff(buffId, buff) {
    if (!buff || typeof buff !== 'object') return false;
    if (buff.permanent) return true;
    if (Number.isFinite(buff.stacks) && buff.stacks >= 99) return true;
    // Backward-compat: recover already-degraded "99 sentinel" buffs (e.g. 98)
    if (INFINITE_STACK_BUFF_IDS.has(buffId) && Number.isFinite(buff.stacks) && buff.stacks >= 90) return true;
    return false;
}

function _normalizeInfiniteStack(buffId, buff) {
    if (!buff || typeof buff !== 'object') return;
    if (_isInfiniteStackBuff(buffId, buff) && Number.isFinite(buff.stacks) && buff.stacks < 99) {
        buff.stacks = 99;
    }
}

function _resolveActiveRegionId(gs) {
    const activeRegionId = Number(gs?._activeRegionId);
    if (Number.isFinite(activeRegionId)) {
        return Math.max(0, Math.floor(activeRegionId));
    }

    const regionIdx = Math.max(0, Math.floor(Number(gs?.currentRegion) || 0));
    const resolved = Number(getRegionIdForStage(regionIdx, gs));
    if (Number.isFinite(resolved)) {
        return Math.max(0, Math.floor(resolved));
    }
    return regionIdx;
}

// ═══════════════════════════════════════
//  상수
// ═══════════════════════════════════════
// ═══════════════════════════════════════
//  적 이펙트 핸들러 (순수 상태 변경)
// ═══════════════════════════════════════
const ENEMY_EFFECTS = {
    self_atk_up(gs, enemy) {
        enemy.atk += 3;
        gs.addLog(LogUtils.formatStatChange(enemy.name, '공격력', 3), 'system');
    },
    self_shield(gs, enemy) {
        enemy.shield = (enemy.shield || 0) + 8;
        gs.addLog(LogUtils.formatShield(enemy.name, 8), 'shield');
    },
    self_shield_15(gs, enemy) {
        enemy.shield = (enemy.shield || 0) + 15;
        gs.addLog(LogUtils.formatShield(enemy.name, 15), 'shield');
    },
    self_shield_20(gs, enemy) {
        enemy.shield = (enemy.shield || 0) + 20;
        gs.addLog(LogUtils.formatShield(enemy.name, 20), 'shield');
    },
    add_noise_5(gs, _enemy, _deps, regionId) {
        if (regionId === 1) gs.addSilence(5);
    },
    mass_debuff(gs) {
        const debuffs = ['weakened', 'slowed', 'burning'];
        debuffs.forEach(d => { gs.player.buffs[d] = { stacks: 1 }; });
        gs.addLog(LogUtils.formatAura('전체 디버프 부여!'), 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    curse(gs, enemy) {
        gs.player.buffs.cursed = { stacks: 2 };
        gs.addLog(LogUtils.formatStatus(gs.player.name || '플레이어', '저주', 2), 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    drain_echo(gs, enemy) {
        gs.drainEcho(20);
        gs.addLog(LogUtils.formatEcho(`${enemy.name}: 잔향 흡수! (-20)`), 'damage');
    },
    nullify_echo(gs) {
        gs.player.echo = 0;
        gs.player.echoChain = 0;
        gs.addLog(LogUtils.formatEcho('잔향 완전 무효화!'), 'damage');
        return { uiAction: 'updateChainUI', value: 0 };
    },
    add_noise(gs, _enemy, _deps, regionId) {
        if (regionId === 1) gs.addSilence(3);
    },
    exhaust_card(gs, _enemy, _deps, _baseRegion, data) {
        if (gs.player.hand.length > 0) {
            const ci = Math.floor(Math.random() * gs.player.hand.length);
            const c = gs.player.hand.splice(ci, 1)[0];
            gs.player.exhausted.push(c);
            gs.addLog(`💀 ${data.cards[c]?.name} 소각!`, 'damage');
            return { uiAction: 'renderCombatCards' };
        }
    },
    drain_energy(gs) {
        gs.player.energy = Math.max(0, gs.player.energy - 1);
        gs.addLog(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
        return { uiAction: 'updateUI' };
    },
    drain_energy_2(gs) {
        gs.player.energy = Math.max(0, gs.player.energy - 2);
        gs.addLog(LogUtils.formatStatChange('플레이어', '에너지', -2, false), 'damage');
        return { uiAction: 'updateUI' };
    },
    drain_energy_all(gs) {
        gs.addLog(LogUtils.formatSystem('에너지 완전 【소진】!'), 'damage');
        return { uiAction: 'updateUI' };
    },
    confusion(gs) {
        // 셔플은 외부에서 처리 필요
        gs.addLog(LogUtils.formatAura('카드 뒤섞임!'), 'damage');
        return { uiAction: 'shuffleAndRender' };
    },
    weaken(gs, enemy) {
        gs.player.buffs.weakened = { stacks: (gs.player.buffs.weakened?.stacks || 0) + 1 };
        gs.addLog(LogUtils.formatStatus('플레이어', '약화', 1), 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    dodge(gs, enemy) {
        if (!enemy.statusEffects) enemy.statusEffects = {};
        enemy.statusEffects.dodge = (enemy.statusEffects.dodge || 0) + 1;
        gs.addLog(LogUtils.formatSystem(`${enemy.name}: 회피 태세!`), 'system');
    },
    lifesteal(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + 4);
        gs.addLog(LogUtils.formatHeal(enemy.name, 4), 'heal');
        return { uiAction: 'updateUI' };
    },
    poison_3(gs, enemy) {
        gs.player.buffs.poisoned = { stacks: 3 };
        gs.addLog(LogUtils.formatStatus('플레이어', '맹독', 3), 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    self_heal_15(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, (enemy.hp || 0) + 15);
        gs.addLog(LogUtils.formatHeal(enemy.name, 15), 'heal');
    },
    self_atk_up_4(gs, enemy) {
        enemy.atk += 4;
        gs.addLog(LogUtils.formatStatChange(enemy.name, '공격력', 4), 'system');
    },
    all_atk_up(gs) {
        gs.combat.enemies.forEach(e => {
            if (e.hp > 0) {
                e.atk += 2;
                gs.addLog(LogUtils.formatStatChange(e.name, '공격력', 2), 'system');
            }
        });
    },
    heal_12(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 12);
        gs.addLog(LogUtils.formatHeal(enemy.name, 12), 'heal');
    },
    heal_15(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 15);
        gs.addLog(LogUtils.formatHeal(enemy.name, 15), 'heal');
    },
    heal_20(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 20);
        gs.addLog(LogUtils.formatHeal(enemy.name, 20), 'heal');
    },
    heal_30(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 30);
        gs.addLog(LogUtils.formatHeal(enemy.name, 30), 'heal');
    },
    phase_shift(gs, enemy) {
        gs.addLog(LogUtils.formatSystem(`${enemy.name}: 위상 전환!`), 'system');
    },
    stun(gs, enemy) {
        gs.player.energy = 0;
        gs.player.buffs.stunned = { stacks: 1 };
        gs.addLog(LogUtils.formatStatus('플레이어', '기절', 1), 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    thorns(gs, enemy) {
        enemy.statusEffects = enemy.statusEffects || {};
        enemy.statusEffects.thorns = (enemy.statusEffects.thorns || 0) + 4;
        gs.addLog(`🌵 ${enemy.name}: 가시 반격 준비`, 'system');
    },
    doom_3(gs, enemy) {
        enemy.statusEffects = enemy.statusEffects || {};
        enemy.statusEffects.doom = 3;
        gs.addLog(`☠️ ${enemy.name}: 파멸의 선고! 3턴 후 폭발`, 'damage');
    },
    vulnerable(gs, enemy) {
        gs.player.buffs.vulnerable = { stacks: (gs.player.buffs.vulnerable?.stacks || 0) + 2 };
        gs.addLog(`💢 ${enemy.name}: 취약 부여!`, 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    weaken_vulnerable(gs, enemy) {
        gs.player.buffs.weakened = { stacks: (gs.player.buffs.weakened?.stacks || 0) + 1 };
        gs.player.buffs.vulnerable = { stacks: (gs.player.buffs.vulnerable?.stacks || 0) + 1 };
        gs.addLog(`💫 ${enemy.name}: 약화 및 취약 부여!`, 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
};

// ═══════════════════════════════════════
//  TurnManager (순수 로직)
// ═══════════════════════════════════════
export const TurnManager = {

    /**
     * 플레이어 턴 종료 로직 (상태만 변경)
     * @returns {{ skippableCards: number }} 사용 가능했던 카드 수
     */
    endPlayerTurnLogic(gs, data, { canPlayFn, shuffleArrayFn } = {}) {
        if (!gs?.combat?.active || !gs.combat.playerTurn) return null;

        let skippableCards = 0;
        if (gs.player.hand.length > 0 && canPlayFn) {
            const playable = gs.player.hand.filter(id => {
                const card = data?.cards?.[id];
                if (!card) return false;
                return canPlayFn(id, card, gs.player);
            });
            skippableCards = playable.length;
            if (skippableCards > 0) {
                gs.addLog?.(`💡 사용 가능한 카드 ${skippableCards}장을 남기고 턴 종료`, 'system');
            }
        }
        // 버프 스택 감소
        Object.keys(gs.player.buffs).forEach(buffId => {
            const buff = gs.player.buffs[buffId];
            if (!buff || typeof buff !== 'object') return;
            _normalizeInfiniteStack(buffId, buff);
            if (TURN_START_DEBUFFS.has(buffId)) return;
            if (ENEMY_TURN_BUFFS.has(buffId)) return;
            if (buffId === 'resonance') return; // Resonance does not decay
            if (buff.nextEnergy) return;
            if (buff.echoRegen) gs.addEcho(buff.echoRegen);
            if (_isInfiniteStackBuff(buffId, buff)) return;
            if (!Number.isFinite(buff.stacks)) return;
            buff.stacks--;
            if (buff.stacks <= 0) delete gs.player.buffs[buffId];
        });

        // 침묵의 도시에서는 모든 클래스가 턴 종료 시 소음을 1 낮춘다.
        // 헌터는 기존 규칙대로 지역과 무관하게 1 낮춘다.
        const activeRegionId = _resolveActiveRegionId(gs);
        const shouldReduceSilence = activeRegionId === 1 || gs.player.class === 'hunter';
        if (shouldReduceSilence && gs.player.silenceGauge > 0) {
            gs.player.silenceGauge = Math.max(0, gs.player.silenceGauge - 1);
        }

        if (activeRegionId === 5) {
            gs.player.timeRiftGauge = 0;
        }

        // 턴 종료 기반 유물 트리거 (남은 에너지/상태 참조)
        gs.triggerItems?.('turn_end');
        if ((gs.player.echoChain || 0) > 0) {
            gs.triggerItems?.('chain_break', { chain: gs.player.echoChain });
        }

        // 손패 → 무덤
        gs.player.graveyard.push(...gs.player.hand);
        gs.player.hand = [];
        gs.player.echoChain = 0;

        // 비용 할인 관련 버프/상태 무조건 초기화 (허공 급류 지속 버그 방지)
        gs.player.costDiscount = 0;
        gs.player._nextCardDiscount = 0;
        gs.player.zeroCost = false;
        gs.player._freeCardUses = 0;

        gs.combat.playerTurn = false;

        return { skippableCards };
    },

    /**
     * 단일 적의 공격 데미지 처리 (상태 변경)
     * @returns {{ reflected: boolean, enemyDied: boolean, dmgDealt: number }}
     */
    processEnemyAttack(gs, enemy, index, action) {
        const hitCount = action.multi || 1;
        gs.addLog?.(LogUtils.formatSystem(`${enemy.name}의 행동: ${action.intent}`), 'damage');

        const results = [];
        for (let h = 0; h < hitCount; h++) {
            if (!gs.combat.active || gs.player.hp <= 0) break;

            let dmg = action.dmg;
            let weakened = false;
            if (enemy.statusEffects?.weakened > 0) {
                dmg = Math.floor(dmg * 0.5);
                weakened = true;
                gs.addLog?.(`💫 ${enemy.name}: 약화 (피해 감소)`, 'echo');
            }

            let reflected = false;
            let enemyDied = false;

            if (gs.player.buffs?.dodge) {
                gs.addLog?.(LogUtils.formatSystem('💨 회피: 공격을 피했습니다!'), 'system');
                const buff = gs.player.buffs.dodge;
                if (buff.stacks > 1) buff.stacks--;
                else delete gs.player.buffs.dodge;
                continue;
            }

            const mirrorBuff = gs.player.buffs?.mirror;
            const spikeShieldBuff = gs.player.buffs?.spike_shield;
            if (mirrorBuff || spikeShieldBuff) {
                const hpBefore = enemy.hp;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                const dealt = Math.max(0, hpBefore - enemy.hp);
                if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                gs.addLog?.(LogUtils.formatAttack('반사막', enemy.name, dmg), 'echo');
                if (mirrorBuff) {
                    if (Number.isFinite(mirrorBuff.stacks) && mirrorBuff.stacks > 1) mirrorBuff.stacks--;
                    else delete gs.player.buffs.mirror;
                }
                reflected = true;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }
            } else {
                gs.takeDamage?.(dmg, { name: enemy.name, type: 'enemy' });
            }

            results.push({ dmg, reflected, enemyDied, weakened, hitIndex: h });
            if (enemyDied) break;
        }

        return results;
    },

    /**
     * 적 상태효과 틱 처리 (독, 화염, 표식, 파멸 등)
     * @returns {Array<{ index, type, dmg, enemyDied }>} UI가 표시할 이벤트 목록
     */
    processEnemyStatusTicks(gs) {
        if (!gs?.combat?.enemies) return [];

        const events = [];

        gs.combat.enemies.forEach((enemy, index) => {
            if (!enemy.statusEffects || enemy.hp <= 0) return;
            const se = enemy.statusEffects;

            if (se.poisoned > 0) {
                let dmg = se.poisoned * 5;
                if (typeof gs.triggerItems === 'function') {
                    const scaled = gs.triggerItems('poison_damage', { amount: dmg, targetIdx: index });
                    if (typeof scaled === 'number' && Number.isFinite(scaled)) {
                        dmg = Math.max(0, Math.floor(scaled));
                    } else if (scaled && typeof scaled.amount === 'number') {
                        dmg = Math.max(0, Math.floor(scaled.amount));
                    }
                }
                const hpBefore = enemy.hp;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                const dealt = Math.max(0, hpBefore - enemy.hp);
                if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                gs.addLog?.(LogUtils.formatAttack('독', enemy.name, dmg), 'damage');

                let enemyDied = false;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }

                // 지속시간 감소
                if (!enemyDied) {
                    se.poisonDuration = (se.poisonDuration || 1) - 1;
                    if (se.poisonDuration <= 0) {
                        delete se.poisoned;
                        delete se.poisonDuration;
                    }
                }

                events.push({ index, type: 'poison', dmg, enemyDied, color: '#44ff88' });
                if (enemyDied) return;
            }

            if (se.burning > 0) {
                const dmg = 5;
                const hpBefore = enemy.hp;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                const dealt = Math.max(0, hpBefore - enemy.hp);
                if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                gs.addLog?.(LogUtils.formatAttack('화염', enemy.name, dmg), 'damage');
                se.burning--;
                if (se.burning <= 0) delete se.burning;
                let enemyDied = false;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }
                events.push({ index, type: 'burning', dmg, enemyDied, color: '#ff8844' });
                if (enemyDied) return;
            }

            if (se.abyss_regen > 0) {
                const heal = Math.max(0, Math.floor(Number(se.abyss_regen) || 0));
                if (heal > 0) {
                    enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + heal);
                    gs.addLog?.(LogUtils.formatHeal(enemy.name, heal), 'heal');
                }
            }

            if (se.marked !== undefined) {
                se.marked--;
                if (se.marked <= 0) {
                    const dmg = 30;
                    const hpBefore = enemy.hp;
                    enemy.hp = Math.max(0, enemy.hp - dmg);
                    const dealt = Math.max(0, hpBefore - enemy.hp);
                    if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                    gs.addLog?.(LogUtils.formatAttack('표식', enemy.name, dmg), 'echo');
                    delete se.marked;
                    let enemyDied = false;
                    if (enemy.hp <= 0) {
                        gs.onEnemyDeath?.(enemy, index);
                        enemyDied = true;
                    }
                    events.push({ index, type: 'marked_explode', dmg, enemyDied, color: '#ff2255' });
                    if (enemyDied) return;
                }
            }

            if (se.immune > 0) {
                se.immune--;
                if (se.immune <= 0) delete se.immune;
            }

            if (se.doom !== undefined) {
                se.doom--;
                if (se.doom <= 0) {
                    const dmg = 40;
                    gs.takeDamage?.(dmg, { name: '파멸', type: 'enemy' });
                    delete se.doom;
                    events.push({ index, type: 'doom_explode', dmg, enemyDied: false, color: '#ff00ff' });
                } else {
                    gs.addLog?.(`☠️ ${enemy.name}: 파멸 카운트다운 ${se.doom}`, 'system');
                }
            }
        });

        return events;
    },

    /**
     * 플레이어 상태이상 턴 시작 틱 처리
     * @returns {{ alive: boolean, actions: string[] }}
     */
    processPlayerStatusTicks(gs, { shuffleArrayFn } = {}) {
        if (!gs?.combat?.active || !gs?.player?.buffs) return { alive: true, actions: [] };

        const buffs = gs.player.buffs;
        const actions = [];

        const decStack = (id) => {
            const buff = buffs[id];
            if (!buff || !Number.isFinite(buff.stacks)) return;
            buff.stacks--;
            if (buff.stacks <= 0) delete buffs[id];
        };

        if ((buffs.burning?.stacks || 0) > 0) {
            gs.takeDamage(5, { name: '화염', type: 'enemy' });
            decStack('burning');
            if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
        }

        if ((buffs.poisoned?.stacks || 0) > 0) {
            const poisonDmg = Math.max(0, Number(buffs.poisoned.stacks || 0)) * 5;
            gs.takeDamage(poisonDmg, { name: '독', type: 'enemy' });

            // 플레이어 독 지속시간 처리
            buffs.poisoned.poisonDuration = (buffs.poisoned.poisonDuration || 1) - 1;
            if (buffs.poisoned.poisonDuration <= 0) {
                delete buffs.poisoned;
            }
            if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
        }

        if ((buffs.slowed?.stacks || 0) > 0) {
            gs.player.energy = Math.max(0, gs.player.energy - 1);
            gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
            decStack('slowed');
        }

        if ((buffs.confusion?.stacks || 0) > 0) {
            if (gs.player.hand.length > 1 && shuffleArrayFn) {
                shuffleArrayFn(gs.player.hand);
                gs.addLog?.(LogUtils.formatAura('혼란: 손패가 뒤섞였다'), 'damage');
                actions.push('renderCombatCards');
            }
            decStack('confusion');
        }

        actions.push('updateStatusDisplay', 'updateUI');
        return { alive: true, actions };
    },

    /**
     * 보스 페이즈 전환 상태 변경
     * @returns {{ phase: number, buffsPurged: boolean }}
     */
    handleBossPhaseShiftLogic(gs, enemy) {
        if (!gs || !enemy) return null;

        if (!enemy.statusEffects) enemy.statusEffects = {};
        enemy.statusEffects.immune = Math.max(enemy.statusEffects.immune || 0, 1);
        gs.addLog?.(LogUtils.formatStatus(enemy.name, '무적', 1), 'echo');

        enemy.phase = (enemy.phase || 1) + 1;

        let buffsPurged = false;
        if (enemy.phase === 2) {
            gs.addLog?.(LogUtils.formatSystem(`${enemy.name} 2페이즈 각성!`), 'echo');
            const permanentBuffs = {};
            Object.keys(gs.player.buffs).forEach(buffId => {
                const buff = gs.player.buffs[buffId];
                _normalizeInfiniteStack(buffId, buff);
                if (_isInfiniteStackBuff(buffId, buff)) {
                    permanentBuffs[buffId] = buff;
                }
            });
            gs.player.buffs = permanentBuffs;
            gs.addLog?.(LogUtils.formatSystem('플레이어 모든 버프 해제!'), 'damage');
            buffsPurged = true;
        } else if (enemy.phase === 3) {
            gs.addLog?.(`💀 ${enemy.name} 최종 페이즈!`, 'damage');
            enemy.atk = Math.floor(enemy.atk * 1.3);
        }

        return { phase: enemy.phase, buffsPurged };
    },

    /**
     * 적 이펙트 디스패치 (이펙트 실행 후 필요한 UI 액션 반환)
     * @returns {{ uiAction?: string, value?: any } | undefined}
     */
    handleEnemyEffect(effect, gs, enemy, { regionId, data } = {}) {
        if (!effect || !gs || !enemy) return undefined;
        if (enemy.hp <= 0) return undefined;
        if (!(gs.combat?.active ?? true)) return undefined;
        const playerHp = Number(gs.player?.hp);
        if (Number.isFinite(playerHp) && playerHp < 1) return undefined;
        const handler = ENEMY_EFFECTS[effect];
        if (handler) return handler(gs, enemy, {}, regionId, data);
        else console.warn('[TurnManager] 알 수 없는 효과:', effect);
        return undefined;
    },

    /**
     * 적 턴 → 플레이어 턴 전환 시 상태 초기화
     */
    startPlayerTurnLogic(gs) {
        // 적 턴 버프 감소
        ENEMY_TURN_BUFFS.forEach(buffId => {
            const buff = gs.player.buffs?.[buffId];
            _normalizeInfiniteStack(buffId, buff);
            if (_isInfiniteStackBuff(buffId, buff)) return;
            if (!buff || !Number.isFinite(buff.stacks)) return;
            buff.stacks--;
            if (buff.stacks <= 0) delete gs.player.buffs[buffId];
        });

        gs.combat.turn++;
        gs.combat.playerTurn = true;

        const isStunned = (gs.player.buffs?.stunned?.stacks || 0) > 0;
        if (isStunned) {
            gs.player.energy = 0;
            gs.addLog?.(LogUtils.formatSystem('기절 상태: 에너지 충전 실패'), 'damage');
        } else {
            gs.player.energy = gs.player.maxEnergy;
        }

        gs.player.shield = 0;

        // ── 지역별 스테이지 효과 (Stage Effects) 발동 ──
        const activeRegionId = _resolveActiveRegionId(gs);

        if (activeRegionId === 2) { // 기억의 미궁: 카드 1장 소멸
            const pools = [
                { key: 'deck', cards: gs.player.deck },
                { key: 'hand', cards: gs.player.hand },
                { key: 'graveyard', cards: gs.player.graveyard },
            ].filter(p => Array.isArray(p.cards) && p.cards.length > 0);

            const totalCards = pools.reduce((sum, p) => sum + p.cards.length, 0);
            if (totalCards > 0) {
                let pick = Math.floor(Math.random() * totalCards);
                let pickedPool = null;

                for (const pool of pools) {
                    if (pick < pool.cards.length) {
                        pickedPool = pool;
                        break;
                    }
                    pick -= pool.cards.length;
                }

                if (pickedPool) {
                    const [targetCardId] = pickedPool.cards.splice(pick, 1);
                    if (targetCardId) {
                        gs.player.exhausted.push(targetCardId);
                        if (pickedPool.key === 'hand') gs.markDirty?.('hand');
                        const cardName = globalThis.DATA?.cards?.[targetCardId]?.name || targetCardId;
                        gs.addLog?.(LogUtils.formatSystem(`지역 효과: ${cardName} 카드가 소멸되었습니다.`), 'damage');
                    }
                }
            }
        } else if (activeRegionId === 3) { // 신의 무덤: 에너지 회복량 -1
            if (!isStunned) {
                gs.player.energy = Math.max(0, gs.player.energy - 1);
                gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
            }
        } else if (activeRegionId === 4) { // 메아리의 근원: 매 턴 최대 에코 -5
            gs.player.maxEcho = Math.max(50, (gs.player.maxEcho || 100) - 5);
            gs.player.echo = Math.min(gs.player.echo, gs.player.maxEcho);
            gs.addLog?.(LogUtils.formatStatChange('플레이어', '최대 에코', -5, false), 'damage');
        }

        const drawBlocked = gs.combat.enemies.some(
            (enemy) => enemy.hp > 0 && (enemy.statusEffects?.draw_block || 0) > 0,
        );
        let drawCount = drawBlocked ? 4 : 5;
        if (activeRegionId === 5) {
            drawCount += 1;
            gs.addLog?.(LogUtils.formatSystem('지역 효과: 시간의 왜곡으로 카드 1장을 추가로 뽑습니다.'), 'echo');
        }
        if (drawBlocked) {
            gs.addLog?.(LogUtils.formatSystem('심연 간섭: 이번 턴 드로우 -1'), 'damage');
        }
        gs.drawCards(drawCount, { skipRift: true });

        // 에너지 버프 처리
        Object.keys(gs.player.buffs || {}).forEach(buffId => {
            const buff = gs.player.buffs[buffId];
            _normalizeInfiniteStack(buffId, buff);
            if (buff?.nextEnergy) {
                gs.player.energy += buff.nextEnergy;
                const label = buffId === 'time_warp' ? '시간 왜곡' : (buff.name || '효과');
                gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', buff.nextEnergy), 'echo');
                if (Number.isFinite(buff.stacks)) {
                    if (!_isInfiniteStackBuff(buffId, buff)) {
                        buff.stacks--;
                        if (buff.stacks <= 0) delete gs.player.buffs[buffId];
                    }
                } else {
                    delete gs.player.buffs[buffId];
                }
            } else if (buff?.energyPerTurn) {
                gs.player.energy += buff.energyPerTurn;
                const label = buffId === 'time_warp' ? '시간 왜곡' : (buff.name || '효과');
                gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', buff.energyPerTurn), 'echo');
                if (Number.isFinite(buff.stacks)) {
                    if (!_isInfiniteStackBuff(buffId, buff)) {
                        buff.stacks--;
                        if (buff.stacks <= 0) delete gs.player.buffs[buffId];
                    }
                }
            }
        });

        gs.addLog?.(`── 턴 ${gs.combat.turn} ──`, 'turn-divider');
        gs.triggerItems?.('turn_start');

        return { isStunned };
    },

    /**
     * 적의 기절 상태 처리
     * @returns {boolean} 기절 상태여서 행동을 건너뛸지 여부
     */
    processEnemyStun(enemy) {
        if (enemy.statusEffects?.stunned > 0) {
            enemy.statusEffects.stunned--;
            if (enemy.statusEffects.stunned <= 0) delete enemy.statusEffects.stunned;

            if (enemy.statusEffects?.weakened > 0) {
                enemy.statusEffects.weakened--;
                if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
            }
            return true; // stunned, skip action
        }
        return false;
    },

    /**
     * 적 AI에서 행동 결정
     */
    getEnemyAction(enemy, turn) {
        try {
            return enemy.ai(turn);
        } catch {
            return { type: 'strike', intent: `공격 ${enemy.atk}`, dmg: enemy.atk };
        }
    },

    /**
     * 적 약화 스택 감소 (턴당 1회)
     */
    decayEnemyWeaken(enemy) {
        if (enemy.statusEffects?.weakened > 0) {
            enemy.statusEffects.weakened--;
            if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
        }
    },
};
