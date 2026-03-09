import { EndingScreenUI } from './ending_screen_ui.js';
import { removeFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';
import {
  clearActiveRunSave,
  eventMatchesCode,
  getDoc,
  getKeybindingCode,
  isCombatOverlayActive,
  isInGame,
  isVisibleModal,
  resolveGs,
} from './help_pause_ui_helpers.js';
import {
  createAbandonConfirm,
  createHelpMenu,
  createMobileWarning,
  createPauseMenu,
  createReturnTitleConfirm,
} from './help_pause_ui_overlays.js';

let _helpOpen = false;
let _pauseOpen = false;
let _hotkeysBound = false;

function saveRunBeforeReturn(deps) {
  const gs = resolveGs(deps);
  if (!gs) return;

  const saveSystem = globalThis.GAME?.Modules?.SaveSystem ?? globalThis.SaveSystem;
  if (saveSystem && typeof saveSystem.saveRun === 'function') {
    saveSystem.saveRun({ gs, isGameStarted: () => true });
  } else if (typeof deps.saveRun === 'function') {
    deps.saveRun();
  }
}

function closePauseMenu(doc) {
  doc.getElementById('pauseMenu')?.remove();
  _pauseOpen = false;
}

function swallowEscape(event) {
  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation();
  }
}

export const HelpPauseUI = {
  isHelpOpen() {
    return _helpOpen;
  },

  showMobileWarning(deps = {}) {
    const doc = getDoc(deps);
    const isMobile = globalThis.innerWidth < 900 || 'ontouchstart' in globalThis;
    if (!isMobile || doc.getElementById('mobileWarn')) return;

    const warn = createMobileWarning(doc, () => warn.remove());
    doc.body.appendChild(warn);
  },

  toggleHelp(deps = {}) {
    const doc = getDoc(deps);
    _helpOpen = !_helpOpen;

    if (_helpOpen) {
      const menu = createHelpMenu(doc, deps, () => this.toggleHelp(deps));
      doc.body.appendChild(menu);
      return;
    }

    doc.getElementById('helpMenu')?.remove();
  },

  abandonRun(deps = {}) {
    const doc = getDoc(deps);
    const confirmEl = createAbandonConfirm(
      doc,
      () => confirmEl.remove(),
      () => this.confirmAbandon(deps),
    );
    doc.body.appendChild(confirmEl);
  },

  confirmReturnToTitle(deps = {}) {
    const doc = getDoc(deps);
    const old = doc.getElementById('returnTitleConfirm');
    if (old) {
      old.remove();
      return;
    }

    const confirmEl = createReturnTitleConfirm(
      doc,
      () => confirmEl.remove(),
      () => {
        confirmEl.remove();
        saveRunBeforeReturn(deps);
        location.reload();
      },
    );
    doc.body.appendChild(confirmEl);
  },

  confirmAbandon(deps = {}) {
    const gs = resolveGs(deps);
    if (!gs) return;

    const doc = getDoc(deps);
    doc.getElementById('abandonConfirm')?.remove();
    closePauseMenu(doc);

    if (gs.combat.active) {
      gs.combat.active = false;
      const hudUpdateUI = deps.hudUpdateUI
        || globalThis.GAME?.Modules?.HudUpdateUI
        || globalThis.HudUpdateUI;
      if (typeof hudUpdateUI?.resetCombatUI === 'function') {
        hudUpdateUI.resetCombatUI({ ...deps, doc, gs });
      } else {
        doc.getElementById('combatOverlay')?.classList.remove('active');
      }
    }
    removeFloatingPlayerHpPanel({ doc });

    if (typeof deps.finalizeRunOutcome === 'function') {
      deps.finalizeRunOutcome('defeat', { echoFragments: 2, abandoned: true });
    }

    clearActiveRunSave(deps);

    if (EndingScreenUI.showOutcome('abandon', deps)) {
      return;
    }
  },

  togglePause(deps = {}) {
    const gs = resolveGs(deps);
    if (!gs) return;

    const doc = getDoc(deps);
    const existingMenu = doc.getElementById('pauseMenu');
    _pauseOpen = isVisibleModal(existingMenu, doc);
    if (_pauseOpen) {
      closePauseMenu(doc);
      return;
    }

    _pauseOpen = true;
    const menu = createPauseMenu(doc, gs, deps, {
      onResume: () => this.togglePause(deps),
      onOpenDeck: () => {
        if (typeof deps.showDeckView === 'function') deps.showDeckView();
        this.togglePause(deps);
      },
      onOpenCodex: () => {
        if (typeof deps.openCodex === 'function') deps.openCodex();
        this.togglePause(deps);
      },
      onOpenSettings: () => {
        this.togglePause(deps);
        if (typeof deps.openSettings === 'function') deps.openSettings();
        else globalThis.GAME?.API?.openSettings?.();
      },
      onOpenHelp: () => {
        this.toggleHelp(deps);
        this.togglePause(deps);
      },
      onAbandon: () => this.abandonRun(deps),
      onReturnToTitle: () => this.confirmReturnToTitle(deps),
      onQuitGame: () => {
        if (typeof deps.quitGame === 'function') deps.quitGame();
      },
      onSetMasterVolume: (value) => {
        if (typeof deps.setMasterVolume === 'function') deps.setMasterVolume(value);
      },
      onSetSfxVolume: (value) => {
        if (typeof deps.setSfxVolume === 'function') deps.setSfxVolume(value);
      },
      onSetAmbientVolume: (value) => {
        if (typeof deps.setAmbientVolume === 'function') deps.setAmbientVolume(value);
      },
    });

    doc.body.appendChild(menu);
    if (typeof deps._syncVolumeUI === 'function') deps._syncVolumeUI();
  },

  bindGlobalHotkeys(deps = {}) {
    const doc = getDoc(deps);
    if (_hotkeysBound) return;
    _hotkeysBound = true;

    const self = this;
    doc.addEventListener('keydown', (e) => {
      const gs = resolveGs(deps);
      const keyPause = getKeybindingCode('pause', 'Escape');
      const keyHelp = getKeybindingCode('help', 'Slash');
      const keyDeckView = getKeybindingCode('deckView', 'KeyD');
      const keyCodex = getKeybindingCode('codex', 'KeyC');
      const keyEchoSkill = getKeybindingCode('echoSkill', 'KeyE');
      const keyDrawCard = getKeybindingCode('drawCard', 'KeyQ');
      const keyEndTurn = getKeybindingCode('endTurn', 'Enter');
      const keyNextTarget = getKeybindingCode('nextTarget', 'Tab');
      const isEscapeKey = e.key === 'Escape' || e.key === 'Esc';
      const isPauseKey = eventMatchesCode(e, keyPause);
      const isSettingsRebinding = Boolean(doc.querySelector?.('.settings-keybind-btn.listening'));

      if (isSettingsRebinding) return;

      if (isEscapeKey || isPauseKey) {
        if (e.repeat) return;

        const pauseMenu = doc.getElementById('pauseMenu');
        if (isVisibleModal(pauseMenu, doc)) {
          swallowEscape(e);
          self.togglePause(deps);
          return;
        }

        const fullMapOverlay = doc.getElementById('fullMapOverlay');
        if (isVisibleModal(fullMapOverlay, doc)) {
          swallowEscape(e);
          if (typeof fullMapOverlay._closeFullMap === 'function') fullMapOverlay._closeFullMap();
          else fullMapOverlay.remove();
          return;
        }

        const battleChronicle = doc.getElementById('battleChronicleOverlay');
        if (isVisibleModal(battleChronicle, doc)) {
          swallowEscape(e);
          if (typeof deps.closeBattleChronicle === 'function') deps.closeBattleChronicle();
          else if (globalThis.GAME?.API?.closeBattleChronicle) globalThis.GAME.API.closeBattleChronicle();
          return;
        }

        const returnTitleConfirm = doc.getElementById('returnTitleConfirm');
        if (returnTitleConfirm) {
          swallowEscape(e);
          returnTitleConfirm.remove();
          return;
        }

        const abandonConfirm = doc.getElementById('abandonConfirm');
        if (abandonConfirm) {
          swallowEscape(e);
          abandonConfirm.remove();
          return;
        }

        const helpMenu = doc.getElementById('helpMenu');
        if (helpMenu && helpMenu.style.display !== 'none') {
          swallowEscape(e);
          self.toggleHelp(deps);
          return;
        }

        const inGame = isInGame(gs) || isCombatOverlayActive(doc);
        const isTitle = gs?.currentScreen === 'title';

        const deckModal = doc.getElementById('deckViewModal');
        const codexModal = doc.getElementById('codexModal');
        const runSettingsModal = doc.getElementById('runSettingsModal');
        const settingsModal = doc.getElementById('settingsModal');

        if (isVisibleModal(deckModal, doc)) {
          swallowEscape(e);
          if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
          return;
        }

        if (isVisibleModal(codexModal, doc)) {
          swallowEscape(e);
          if (typeof deps.closeCodex === 'function') deps.closeCodex();
          return;
        }

        if (isVisibleModal(runSettingsModal, doc)) {
          swallowEscape(e);
          if (typeof deps.closeRunSettings === 'function') deps.closeRunSettings();
          return;
        }

        if (isVisibleModal(settingsModal, doc)) {
          swallowEscape(e);
          if (typeof deps.closeSettings === 'function') deps.closeSettings();
          else globalThis.GAME?.API?.closeSettings?.();
          return;
        }

        if (inGame && !self.isHelpOpen()) {
          swallowEscape(e);
          self.togglePause(deps);
          return;
        }

        if (isTitle) return;
      }

      const inGame = isInGame(gs) || isCombatOverlayActive(doc);

      if (eventMatchesCode(e, keyHelp) && inGame) {
        e.preventDefault();
        self.toggleHelp(deps);
      }

      if (eventMatchesCode(e, keyDeckView) && inGame && !_helpOpen) {
        const modal = doc.getElementById('deckViewModal');
        if (modal?.classList.contains('active')) {
          if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
        } else if (typeof deps.showDeckView === 'function') {
          deps.showDeckView();
        }
      }

      if (eventMatchesCode(e, keyCodex) && inGame && !_helpOpen) {
        const modal = doc.getElementById('codexModal');
        if (isVisibleModal(modal, doc)) {
          if (typeof deps.closeCodex === 'function') deps.closeCodex();
        } else if (typeof deps.openCodex === 'function') {
          deps.openCodex();
        } else if (globalThis.GAME?.API?.openCodex) {
          globalThis.GAME.API.openCodex();
        }
      }

      if (eventMatchesCode(e, keyEchoSkill) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        if (typeof deps.useEchoSkill === 'function') deps.useEchoSkill();
      }

      if (eventMatchesCode(e, keyDrawCard) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        e.preventDefault();
        if (typeof deps.drawCard === 'function') deps.drawCard();
        deps.buttonFeedback?.triggerDrawButton?.();
      }

      if (eventMatchesCode(e, keyEndTurn) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        e.preventDefault();
        if (typeof deps.endPlayerTurn === 'function') deps.endPlayerTurn();
      }

      if (inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        const numKey = e.key === '0' ? 10 : parseInt(e.key, 10);
        if (!Number.isNaN(numKey) && numKey >= 1 && numKey <= 10) {
          const idx = numKey - 1;
          if (gs?.player?.hand?.[idx] && typeof gs?.playCard === 'function') {
            gs.playCard(gs.player.hand[idx], idx);
          }
        }
      }

      if (eventMatchesCode(e, keyNextTarget) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        e.preventDefault();
        const enemies = gs?.combat?.enemies || [];
        const aliveIndices = enemies.map((enemy, idx) => (enemy.hp > 0 ? idx : -1)).filter((idx) => idx >= 0);
        if (aliveIndices.length > 1) {
          const cur = aliveIndices.indexOf(gs._selectedTarget ?? -1);
          gs._selectedTarget = aliveIndices[(cur + 1) % aliveIndices.length];
          if (typeof gs?.addLog === 'function') {
            gs.addLog(`🎯 대상: ${enemies[gs._selectedTarget].name}`, 'system');
          }
          if (typeof deps.renderCombatEnemies === 'function') {
            deps.renderCombatEnemies();
          }
        }
      }
    }, true);
  },
};
