/**
 * turn_manager.js — 전투 턴 비즈니스 로직 (순수 Model)
 *
 * DOM/window 접근 없이 게임 상태(gs)만 변경합니다.
 * UI 업데이트는 호출측(combat_turn_ui.js)이 반환값/콜백으로 처리합니다.
 */

// ═══════════════════════════════════════
//  상수
// ═══════════════════════════════════════
const TURN_START_DEBUFFS = new Set(['poisoned', 'burning', 'slowed', 'confusion']);
const ENEMY_TURN_BUFFS = new Set(['mirror', 'immune']);

// ═══════════════════════════════════════
//  적 이펙트 핸들러 (순수 상태 변경)
// ═══════════════════════════════════════
const ENEMY_EFFECTS = {
    self_atk_up(gs, enemy) {
        enemy.atk += 3;
        gs.addLog(`💪 ${enemy.name}: 공격 강화 (+3)`, 'system');
    },
    self_shield(gs, enemy) {
        enemy.shield = (enemy.shield || 0) + 8;
        gs.addLog(`🛡️ ${enemy.name}: 방어막 8`, 'system');
    },
    self_shield_15(gs, enemy) {
        enemy.shield = (enemy.shield || 0) + 15;
        gs.addLog(`🛡️ ${enemy.name}: 신성 방어막 15`, 'system');
    },
    self_shield_20(gs, enemy) {
        enemy.shield = (enemy.shield || 0) + 20;
        gs.addLog(`🛡️ ${enemy.name}: 방어막 20`, 'system');
    },
    add_noise_5(gs, _enemy, _deps, baseRegion) {
        if (baseRegion === 1) gs.addSilence(5);
    },
    mass_debuff(gs) {
        const debuffs = ['weakened', 'slowed', 'burning'];
        debuffs.forEach(d => { gs.player.buffs[d] = { stacks: 1 }; });
        gs.addLog('⚠️ 전체 디버프 부여!', 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    curse(gs, enemy) {
        gs.player.buffs.cursed = { stacks: 2 };
        gs.addLog(`💀 ${enemy.name}: 저주 부여!`, 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    drain_echo(gs, enemy) {
        gs.drainEcho(20);
        gs.addLog(`🌑 ${enemy.name}: Echo 흡수!`, 'damage');
    },
    nullify_echo(gs) {
        gs.player.echo = 0;
        gs.player.echoChain = 0;
        gs.addLog('🌑 Echo 완전 무효화!', 'damage');
        return { uiAction: 'updateChainUI', value: 0 };
    },
    add_noise(gs, _enemy, _deps, baseRegion) {
        if (baseRegion === 1) gs.addSilence(3);
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
        gs.addLog('⚡ 에너지 -1!', 'damage');
        return { uiAction: 'updateUI' };
    },
    drain_energy_2(gs) {
        gs.player.energy = Math.max(0, gs.player.energy - 2);
        gs.addLog('⚡ 에너지 -2!', 'damage');
        return { uiAction: 'updateUI' };
    },
    drain_energy_all(gs) {
        gs.player.energy = 0;
        gs.addLog('⚡ 에너지 완전 소진!', 'damage');
        return { uiAction: 'updateUI' };
    },
    confusion(gs) {
        // 셔플은 외부에서 처리 필요
        gs.addLog('🌀 카드 뒤섞임!', 'damage');
        return { uiAction: 'shuffleAndRender' };
    },
    weaken(gs, enemy) {
        gs.player.buffs.weakened = { stacks: (gs.player.buffs.weakened?.stacks || 0) + 1 };
        gs.addLog(`💫 ${enemy.name}: 약화 부여`, 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    dodge(gs, enemy) {
        if (!enemy.statusEffects) enemy.statusEffects = {};
        enemy.statusEffects.dodge = (enemy.statusEffects.dodge || 0) + 1;
        gs.addLog(`💨 ${enemy.name}: 회피 태세!`, 'system');
    },
    lifesteal(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + 4);
        gs.addLog(`💚 ${enemy.name}: 생명력 흡수 (+4)`, 'heal');
        return { uiAction: 'updateUI' };
    },
    poison_3(gs, enemy) {
        gs.player.buffs.poisoned = { stacks: 3 };
        gs.addLog(`☠️ ${enemy.name}: 맹독 부여!`, 'damage');
        return { uiAction: 'updateStatusDisplay' };
    },
    self_heal_15(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, (enemy.hp || 0) + 15);
        gs.addLog(`💚 ${enemy.name}: 체력 회복 (+15)`, 'heal');
    },
    self_atk_up_4(gs, enemy) {
        enemy.atk += 4;
        gs.addLog(`💪 ${enemy.name}: 공격 대폭 강화 (+4)`, 'system');
    },
    all_atk_up(gs) {
        gs.combat.enemies.forEach(e => {
            if (e.hp > 0) {
                e.atk += 2;
                gs.addLog(`💪 ${e.name}: 공격력 전술 강화 (+2)`, 'system');
            }
        });
    },
    heal_12(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 12);
        gs.addLog(`💚 ${enemy.name}: 체력 회복 (+12)`, 'heal');
    },
    heal_15(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 15);
        gs.addLog(`💚 ${enemy.name}: 체력 회복 (+15)`, 'heal');
    },
    heal_20(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 20);
        gs.addLog(`💚 ${enemy.name}: 체력 회복 (+20)`, 'heal');
    },
    heal_30(gs, enemy) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + 30);
        gs.addLog(`💚 ${enemy.name}: 체력 회복 (+30)`, 'heal');
    },
    phase_shift(gs, enemy) {
        gs.addLog(`⚠️ ${enemy.name}: 위상 전환!`, 'system');
    },
    stun(gs, enemy) {
        gs.player.energy = 0;
        gs.player.buffs.stunned = { stacks: 1 };
        gs.addLog(`⚡ ${enemy.name}: 기절! 에너지 소진`, 'damage');
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
            if (TURN_START_DEBUFFS.has(buffId)) return;
            if (ENEMY_TURN_BUFFS.has(buffId)) return;
            if (buffId === 'momentum') return;
            if (buff.nextEnergy) return;
            if (buff.echoRegen) gs.addEcho(buff.echoRegen);
            if (!Number.isFinite(buff.stacks)) return;
            buff.stacks--;
            if (buff.stacks <= 0) delete gs.player.buffs[buffId];
        });

        // 침묵 게이지
        if (gs.player.class === 'hunter' && gs.player.silenceGauge > 0) {
            gs.player.silenceGauge = Math.max(0, gs.player.silenceGauge - 1);
        }

        // 손패 → 무덤
        gs.player.graveyard.push(...gs.player.hand);
        gs.player.hand = [];
        gs.player.echoChain = 0;

        gs.API?.modifyEnergy?.(0, gs);
        gs.player.costDiscount = 0;
        gs.player._nextCardDiscount = 0;

        gs.combat.playerTurn = false;

        return { skippableCards };
    },

    /**
     * 단일 적의 공격 데미지 처리 (상태 변경)
     * @returns {{ reflected: boolean, enemyDied: boolean, dmgDealt: number }}
     */
    processEnemyAttack(gs, enemy, index, action) {
        const hitCount = action.multi || 1;
        gs.addLog?.(`💢 ${enemy.name}: ${action.intent}`, 'damage');

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

            if (gs.player.buffs?.mirror) {
                enemy.hp = Math.max(0, enemy.hp - dmg);
                gs.addLog?.(`🪞 반사! ${enemy.name}에게 ${dmg} 피해`, 'echo');
                delete gs.player.buffs.mirror;
                reflected = true;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }
            } else {
                gs.API?.applyPlayerDamage?.(dmg, gs);
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
                const dmg = se.poisoned * 2;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                gs.addLog?.(`🐍 ${enemy.name}: 독 ${dmg}`, 'damage');
                se.poisoned--;
                if (se.poisoned <= 0) delete se.poisoned;
                let enemyDied = false;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }
                events.push({ index, type: 'poison', dmg, enemyDied, color: '#44ff88' });
                if (enemyDied) return;
            }

            if (se.burning > 0) {
                const dmg = 5;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                gs.addLog?.(`🔥 ${enemy.name}: 화염 ${dmg}`, 'damage');
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

            if (se.marked !== undefined) {
                se.marked--;
                if (se.marked <= 0) {
                    const dmg = 30;
                    enemy.hp = Math.max(0, enemy.hp - dmg);
                    gs.addLog?.(`💢 ${enemy.name}: 처형 표식 폭발! ${dmg}!`, 'echo');
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
                    gs.takeDamage?.(dmg);
                    gs.addLog?.(`☠️ ${enemy.name}: 파멸 발동! ${dmg} 피해!`, 'damage');
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
            gs.takeDamage(5);
            gs.addLog?.('🔥 화염: 턴 시작 피해 5', 'damage');
            decStack('burning');
            if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
        }

        if ((buffs.poisoned?.stacks || 0) > 0) {
            const poisonDmg = 1 + Math.max(1, buffs.poisoned.stacks);
            gs.takeDamage(poisonDmg);
            gs.addLog?.(`☠️ 독: 턴 시작 피해 ${poisonDmg}`, 'damage');
            decStack('poisoned');
            if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
        }

        if ((buffs.slowed?.stacks || 0) > 0) {
            gs.player.energy = Math.max(0, gs.player.energy - 1);
            gs.addLog?.('🐢 감속: 에너지 -1', 'damage');
            decStack('slowed');
        }

        if ((buffs.confusion?.stacks || 0) > 0) {
            if (gs.player.hand.length > 1 && shuffleArrayFn) {
                shuffleArrayFn(gs.player.hand);
                gs.addLog?.('🌀 혼란: 손패가 뒤섞였다', 'damage');
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
        gs.addLog?.(`🛡️ ${enemy.name}: 1턴 무적`, 'echo');

        enemy.phase = (enemy.phase || 1) + 1;

        let buffsPurged = false;
        if (enemy.phase === 2) {
            gs.addLog?.(`⚠️ ${enemy.name} 2페이즈 각성!`, 'echo');
            const permanentBuffs = {};
            Object.keys(gs.player.buffs).forEach(buffId => {
                const buff = gs.player.buffs[buffId];
                if (buff?.permanent || (Number.isFinite(buff.stacks) && buff.stacks >= 99)) {
                    permanentBuffs[buffId] = buff;
                }
            });
            gs.player.buffs = permanentBuffs;
            gs.addLog?.('💀 플레이어 버프 해제!', 'damage');
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
    handleEnemyEffect(effect, gs, enemy, { baseRegion, data } = {}) {
        if (!effect) return undefined;
        const handler = ENEMY_EFFECTS[effect];
        if (handler) return handler(gs, enemy, {}, baseRegion, data);
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
            if (!buff || !Number.isFinite(buff.stacks)) return;
            buff.stacks--;
            if (buff.stacks <= 0) delete gs.player.buffs[buffId];
        });

        gs.combat.turn++;
        gs.combat.playerTurn = true;

        const isStunned = (gs.player.buffs?.stunned?.stacks || 0) > 0;
        if (isStunned) {
            gs.player.energy = 0;
            gs.addLog?.('🌀 기절 상태: 에너지가 충전되지 않았습니다!', 'damage');
        } else {
            gs.player.energy = gs.player.maxEnergy;
        }

        gs.player.shield = 0;

        gs.drawCards(5);

        // 에너지 버프 처리
        Object.keys(gs.player.buffs || {}).forEach(buffId => {
            const buff = gs.player.buffs[buffId];
            if (buff?.nextEnergy) {
                gs.player.energy += buff.nextEnergy;
                const label = buffId === 'time_warp' ? '시간 왜곡' : (buff.name || '효과');
                gs.addLog?.(`🌀 ${label}: 에너지 +${buff.nextEnergy}`, 'echo');
                if (Number.isFinite(buff.stacks)) {
                    buff.stacks--;
                    if (buff.stacks <= 0) delete gs.player.buffs[buffId];
                } else {
                    delete gs.player.buffs[buffId];
                }
            } else if (buff?.energyPerTurn) {
                gs.player.energy += buff.energyPerTurn;
                const label = buffId === 'time_warp' ? '시간 왜곡' : (buff.name || '효과');
                gs.addLog?.(`🌀 ${label}: 에너지 +${buff.energyPerTurn}`, 'echo');
                if (Number.isFinite(buff.stacks)) {
                    buff.stacks--;
                    if (buff.stacks <= 0) delete gs.player.buffs[buffId];
                }
            }
        });

        gs.addLog?.('─── 새 턴 ───', 'system');
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
