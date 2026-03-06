/**
 * Game Initialization & Bootstrapping
 */
import { GAME } from './global_bridge.js';
import { SettingsManager } from './settings_manager.js';
import { SettingsUI } from '../ui/screens/settings_ui.js';

export const GameInit = {
    boot(deps) {
        this.loadVolumes(deps.audioEngine);
        SettingsUI.applyOnBoot({
            doc: document,
            ScreenShake: deps.ScreenShake,
            HitStop: deps.HitStop,
            ParticleSystem: deps.ParticleSystem,
        });
        this.syncVolumeUI(deps.audioEngine);
        this.initEventHandlers(deps);
        this.initHelpPauseUI(deps);
        deps.gameBootUI?.bootGame?.(deps.getGameBootDeps());
    },

    loadVolumes(audioEngine) {
        const data = SettingsManager.load();
        if (!audioEngine) return;
        if (Number.isFinite(data?.volumes?.master)) audioEngine.setVolume(data.volumes.master);
        if (Number.isFinite(data?.volumes?.sfx)) audioEngine.setSfxVolume(data.volumes.sfx);
        if (Number.isFinite(data?.volumes?.ambient)) audioEngine.setAmbientVolume(data.volumes.ambient);
    },

    saveVolumes(audioEngine) {
        if (!audioEngine) return;
        const vol = audioEngine.getVolumes();
        SettingsManager.set('volumes.master', vol.master);
        SettingsManager.set('volumes.sfx', vol.sfx);
        SettingsManager.set('volumes.ambient', vol.ambient);
    },

    syncVolumeUI(audioEngine) {
        if (!audioEngine) return;
        const vol = audioEngine.getVolumes();
        const m = Math.round(vol.master * 100);
        const s = Math.round(vol.sfx * 100);
        const a = Math.round(vol.ambient * 100);
        const doc = document;
        doc.querySelectorAll('#settings-vol-master-val, #volMasterSliderVal').forEach(el => el.textContent = m + '%');
        doc.querySelectorAll('#settings-vol-sfx-val, #volSfxSliderVal').forEach(el => el.textContent = s + '%');
        doc.querySelectorAll('#settings-vol-ambient-val, #volAmbientSliderVal').forEach(el => el.textContent = a + '%');
        doc.querySelectorAll('#settings-vol-master-slider, #volMasterSlider').forEach(el => { el.value = m; el.style.setProperty('--fill-percent', m + '%'); });
        doc.querySelectorAll('#settings-vol-sfx-slider, #volSfxSlider').forEach(el => { el.value = s; el.style.setProperty('--fill-percent', s + '%'); });
        doc.querySelectorAll('#settings-vol-ambient-slider, #volAmbientSlider').forEach(el => { el.value = a; el.style.setProperty('--fill-percent', a + '%'); });
        doc.querySelectorAll('#settings-vol-master-icon').forEach(el => { el.textContent = m === 0 ? '🔇' : m < 40 ? '🔈' : m < 70 ? '🔉' : '🔊'; });
        doc.querySelectorAll('#settings-vol-sfx-icon').forEach(el => { el.textContent = s === 0 ? '🔇' : s < 40 ? '🔈' : s < 70 ? '🔉' : '🔊'; });
        doc.querySelectorAll('#settings-vol-ambient-icon').forEach(el => { el.textContent = a === 0 ? '🔇' : a < 40 ? '🔈' : a < 70 ? '🔉' : '🔊'; });
    },

    initEventHandlers(deps) {
        const doc = deps.doc || document;
        const isTitleScreen = () => deps.gs?.currentScreen === 'title';
        const isEscapeKey = (event) => event?.key === 'Escape' || event?.key === 'Esc';
        const isVisibleModal = (el) => {
            if (!el) return false;
            if (el.classList?.contains('active')) return true;
            const inlineDisplay = String(el.style?.display || '').trim().toLowerCase();
            if (inlineDisplay === 'none') return false;
            if (inlineDisplay) return true;
            const view = doc?.defaultView || globalThis;
            if (typeof view?.getComputedStyle !== 'function') return true;
            return view.getComputedStyle(el).display !== 'none';
        };
        const {
            showCharacterSelect, continueRun, openRunSettings, openCodexFromTitle, quitGame,
            selectClass, startGame, backToTitle, closeRunSettings, shiftAscension,
            toggleEndlessMode, cycleRunBlessing, cycleRunCurse, drawCard, endPlayerTurn, useEchoSkill,
            openSettings, closeSettings
        } = deps.actions;

        // Title-screen-only Escape Handler
        // (Combat/game ESC is handled by help_pause_ui.js bindGlobalHotkeys)
        doc.addEventListener('keydown', (e) => {
            if (!isTitleScreen()) return;
            if (isEscapeKey(e)) {
                // Codex (opened from title)
                const codexModal = doc.getElementById('codexModal');
                if (isVisibleModal(codexModal)) {
                    GAME.API.closeCodex?.();
                    return;
                }

                // Run Settings (opened from title)
                const runSettings = doc.getElementById('runSettingsModal');
                if (isVisibleModal(runSettings)) {
                    closeRunSettings?.();
                    return;
                }

                // Settings modal (opened from title)
                const settingsModal = doc.getElementById('settingsModal');
                if (isVisibleModal(settingsModal)) {
                    closeSettings?.();
                    return;
                }

                // Character Select (Title Screen)
                const char = doc.getElementById('charSelectSubScreen');
                if (char && char.style.display === 'block') {
                    backToTitle?.();
                    return;
                }
            }
        });

        doc.getElementById('mainContinueBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); continueRun?.(); });
        doc.getElementById('mainStartBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); showCharacterSelect?.(); });
        doc.getElementById('mainRunRulesBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); openRunSettings?.(); });
        doc.getElementById('mainCodexBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); openCodexFromTitle?.(); });
        doc.getElementById('mainSettingsBtn')?.addEventListener('click', () => {
            deps.audioEngine?.playClick?.();
            openSettings?.();
        });
        doc.getElementById('mainQuitBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); typeof quitGame === 'function' && quitGame(); });

        doc.getElementById('startBtn')?.addEventListener('click', () => startGame?.());
        doc.getElementById('backToTitleBtn')?.addEventListener('click', () => backToTitle?.());

        // Run Rules
        doc.getElementById('runSettingsCloseBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); closeRunSettings?.(); });
        doc.getElementById('runSettingsConfirmBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); closeRunSettings?.(); });
        doc.querySelectorAll('.run-mode-stepper .run-mode-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => { deps.audioEngine?.playClick?.(); shiftAscension?.(i === 0 ? -1 : 1); });
        });
        doc.getElementById('endlessToggleBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); toggleEndlessMode?.(); });
        doc.getElementById('blessingCycleBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); cycleRunBlessing?.(); });
        doc.getElementById('curseCycleBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); cycleRunCurse?.(); });
        doc.getElementById('toggleInscriptionLayoutBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); });
        doc.getElementById('toggleAllInscriptionsBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); });

        // Maze
        doc.getElementById('mazeMinimapCanvas')?.addEventListener('click', (e) => {
            e.stopPropagation();
            window.MapUI?.showFullMap?.();
        });
        const mazeMove = (dx, dy) => {
            deps.audioEngine?.resume();
            deps.audioEngine?.playFootstep();
            GAME.Modules.MazeSystem?.move(dx, dy);
        };
        doc.getElementById('mazeMoveUp')?.addEventListener('click', () => mazeMove(0, -1));
        doc.getElementById('mazeMoveLeft')?.addEventListener('click', () => mazeMove(-1, 0));
        doc.getElementById('mazeMoveDown')?.addEventListener('click', () => mazeMove(0, 1));
        doc.getElementById('mazeMoveRight')?.addEventListener('click', () => mazeMove(1, 0));

        // Combat
        const echoBtn = doc.getElementById('useEchoSkillBtn');
        if (echoBtn) {
            echoBtn.addEventListener('click', () => {
                useEchoSkill?.();
                GAME.Modules.FeedbackUI?.triggerEchoButtonEffect?.('useEchoSkillBtn', {
                    doc: deps.doc || document
                });
            });
            echoBtn.addEventListener('mouseenter', (e) => GAME.API.showEchoSkillTooltip?.(e));
            echoBtn.addEventListener('mouseleave', () => GAME.API.hideEchoSkillTooltip?.());
        }
        doc.getElementById('combatDrawCardBtn')?.addEventListener('click', () => {
            drawCard?.();
            GAME.Modules.FeedbackUI?.triggerDrawButtonEffect?.('combatDrawCardBtn', {
                doc: deps.doc || document
            });
        });
        doc.getElementById('endPlayerTurnBtn')?.addEventListener('click', () => endPlayerTurn?.());

        // Battle Chronicle (전투 기록)
        doc.getElementById('showBattleChronicleBtn')?.addEventListener('click', () => {
            deps.audioEngine?.playClick?.();
            GAME.API.toggleBattleChronicle?.();
        });
        doc.getElementById('closeBattleChronicleBtn')?.addEventListener('click', () => {
            deps.audioEngine?.playClick?.();
            GAME.API.closeBattleChronicle?.();
        });
        doc.addEventListener('keydown', (e) => {
            if (e.key === 'l' || e.key === 'L') {
                const combatOverlay = doc.getElementById('combatOverlay');
                if (combatOverlay?.classList.contains('active')) {
                    GAME.API.toggleBattleChronicle?.();
                }
            }
        });

        // HUD
        doc.getElementById('hoverHud')?.addEventListener('click', () => GAME.API.toggleHudPin?.());

        // Rewards
        doc.getElementById('rewardSkipInitBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); GAME.API.showSkipConfirm?.(); });
        doc.getElementById('rewardSkipConfirmBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); GAME.API.skipReward?.(); });
        doc.getElementById('rewardSkipCancelBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); GAME.API.hideSkipConfirm?.(); });

        // Deck View
        doc.querySelectorAll('.deck-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => { deps.audioEngine?.playClick?.(); GAME.API.setDeckFilter?.(btn.dataset.filter); });
        });
        doc.getElementById('deckViewCloseBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); GAME.API.closeDeckView?.(); });

        // Codex
        doc.querySelectorAll('.codex-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => { deps.audioEngine?.playClick?.(); GAME.API.setCodexTab?.(btn.dataset.tab); });
        });
        doc.getElementById('codexCloseBtn')?.addEventListener('click', () => { deps.audioEngine?.playClick?.(); GAME.API.closeCodex?.(); });
    },

    initHelpPauseUI(deps) {
        if (!deps.helpPauseUI) return;
        const hpDeps = deps.getHelpPauseDeps();
        deps.helpPauseUI.showMobileWarning?.(hpDeps);
        deps.helpPauseUI.bindGlobalHotkeys?.(hpDeps);
    }
};
