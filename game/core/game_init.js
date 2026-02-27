/**
 * Game Initialization & Bootstrapping
 */
import { GAME } from './global_bridge.js';

export const GameInit = {
    boot(deps) {
        this.loadVolumes(deps.audioEngine);
        this.initEventHandlers(deps);
        this.initHelpPauseUI(deps);
        deps.gameBootUI?.bootGame?.(deps.getGameBootDeps());
    },

    loadVolumes(audioEngine) {
        try {
            const saved = localStorage.getItem('eotf_settings');
            if (saved) {
                const { volumes } = JSON.parse(saved);
                if (volumes && audioEngine) {
                    if (Number.isFinite(volumes.master)) audioEngine.setVolume(Math.max(0, Math.min(1, volumes.master)));
                    if (Number.isFinite(volumes.sfx)) audioEngine.setSfxVolume(Math.max(0, Math.min(1, volumes.sfx)));
                    if (Number.isFinite(volumes.ambient)) audioEngine.setAmbientVolume(Math.max(0, Math.min(1, volumes.ambient)));
                }
            }
        } catch (e) { console.warn('Load settings error:', e); }
    },

    saveVolumes(audioEngine) {
        if (!audioEngine) return;
        const vol = audioEngine.getVolumes();
        localStorage.setItem('eotf_settings', JSON.stringify({ volumes: vol }));
    },

    syncVolumeUI(audioEngine) {
        if (!audioEngine) return;
        const vol = audioEngine.getVolumes();
        const m = Math.round(vol.master * 100);
        const s = Math.round(vol.sfx * 100);
        const a = Math.round(vol.ambient * 100);
        const doc = document;
        doc.querySelectorAll('#volMasterVal').forEach(el => el.textContent = m + '%');
        doc.querySelectorAll('#volSfxVal').forEach(el => el.textContent = s + '%');
        doc.querySelectorAll('#volAmbientVal').forEach(el => el.textContent = a + '%');
        doc.querySelectorAll('#volMasterSlider').forEach(el => { el.value = m; el.style.setProperty('--fill-percent', m + '%'); });
        doc.querySelectorAll('#volSfxSlider').forEach(el => { el.value = s; el.style.setProperty('--fill-percent', s + '%'); });
        doc.querySelectorAll('#volAmbientSlider').forEach(el => { el.value = a; el.style.setProperty('--fill-percent', a + '%'); });
        doc.querySelectorAll('#volMaster').forEach(el => { el.value = m; el.style.setProperty('--fill-percent', m + '%'); });
        doc.querySelectorAll('#volSfx').forEach(el => { el.value = s; el.style.setProperty('--fill-percent', s + '%'); });
        doc.querySelectorAll('#volAmbient').forEach(el => { el.value = a; el.style.setProperty('--fill-percent', a + '%'); });
    },

    initEventHandlers(deps) {
        const doc = deps.doc || document;
        const {
            showCharacterSelect, openRunSettings, openCodexFromTitle, quitGame,
            selectClass, startGame, backToTitle, closeRunSettings, shiftAscension,
            toggleEndlessMode, cycleRunBlessing, cycleRunCurse, setMasterVolume,
            setSfxVolume, setAmbientVolume, drawCard, endPlayerTurn, useEchoSkill
        } = deps.actions;

        // Title Screen
        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const char = doc.getElementById('charSelectSubScreen');
                if (char && char.style.display === 'block') {
                    backToTitle?.();
                }
            }
        });

        doc.getElementById('mainStartBtn')?.addEventListener('click', () => showCharacterSelect?.());
        doc.getElementById('mainRunRulesBtn')?.addEventListener('click', () => openRunSettings?.());
        doc.getElementById('mainCodexBtn')?.addEventListener('click', () => openCodexFromTitle?.());
        doc.getElementById('mainSettingsBtn')?.addEventListener('click', () => {
            deps.audioEngine?.playClick?.();
            doc.getElementById('soundSettings')?.classList.toggle('open');
        });
        doc.getElementById('mainQuitBtn')?.addEventListener('click', () => typeof quitGame === 'function' && quitGame());

        doc.querySelectorAll('.class-btn').forEach(btn => {
            btn.addEventListener('click', () => selectClass?.(btn));
        });

        doc.getElementById('startBtn')?.addEventListener('click', () => startGame?.());
        doc.getElementById('backToTitleBtn')?.addEventListener('click', () => backToTitle?.());

        // Run Rules
        doc.getElementById('runSettingsCloseBtn')?.addEventListener('click', () => closeRunSettings?.());
        doc.getElementById('runSettingsConfirmBtn')?.addEventListener('click', () => closeRunSettings?.());
        doc.querySelectorAll('.run-mode-stepper .run-mode-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => shiftAscension?.(i === 0 ? -1 : 1));
        });
        doc.getElementById('endlessToggleBtn')?.addEventListener('click', () => toggleEndlessMode?.());
        doc.getElementById('blessingCycleBtn')?.addEventListener('click', () => cycleRunBlessing?.());
        doc.getElementById('curseCycleBtn')?.addEventListener('click', () => cycleRunCurse?.());

        // Sound
        doc.getElementById('soundToggleBtn')?.addEventListener('click', () => {
            deps.audioEngine?.playClick?.();
            doc.getElementById('soundSettings')?.classList.toggle('open');
        });
        doc.getElementById('volMaster')?.addEventListener('input', (e) => setMasterVolume?.(e.target.value));
        doc.getElementById('volSfx')?.addEventListener('input', (e) => setSfxVolume?.(e.target.value));
        doc.getElementById('volAmbient')?.addEventListener('input', (e) => setAmbientVolume?.(e.target.value));

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
            echoBtn.addEventListener('click', () => useEchoSkill?.());
            echoBtn.addEventListener('mouseenter', (e) => GAME.API.showEchoSkillTooltip?.(e));
            echoBtn.addEventListener('mouseleave', () => GAME.API.hideEchoSkillTooltip?.());
        }
        doc.getElementById('combatDrawCardBtn')?.addEventListener('click', () => drawCard?.());
        doc.getElementById('endPlayerTurnBtn')?.addEventListener('click', () => endPlayerTurn?.());

        // HUD
        doc.getElementById('hoverHud')?.addEventListener('click', () => GAME.API.toggleHudPin?.());

        // Rewards
        doc.getElementById('rewardSkipInitBtn')?.addEventListener('click', () => GAME.API.showSkipConfirm?.());
        doc.getElementById('rewardSkipConfirmBtn')?.addEventListener('click', () => GAME.API.skipReward?.());
        doc.getElementById('rewardSkipCancelBtn')?.addEventListener('click', () => GAME.API.hideSkipConfirm?.());

        // Deck View
        doc.querySelectorAll('.deck-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => GAME.API.setDeckFilter?.(btn.dataset.filter));
        });
        doc.getElementById('deckViewCloseBtn')?.addEventListener('click', () => GAME.API.closeDeckView?.());

        // Codex
        doc.querySelectorAll('.codex-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => GAME.API.setCodexTab?.(btn.dataset.tab));
        });
        doc.getElementById('codexCloseBtn')?.addEventListener('click', () => GAME.API.closeCodex?.());
    },

    initHelpPauseUI(deps) {
        if (!deps.helpPauseUI) return;
        const hpDeps = deps.getHelpPauseDeps();
        deps.helpPauseUI.showMobileWarning?.(hpDeps);
        deps.helpPauseUI.bindGlobalHotkeys?.(hpDeps);
    }
};
