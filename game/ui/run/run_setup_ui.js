import { AudioEngine } from '../../../engine/audio.js';
import { GS } from '../../core/game_state.js';
import { DATA } from '../../../data/game_data.js';


const CLASS_CONFIGS = {
  swordsman: { maxHp: 80, startEcho: 0 },
  mage: { maxHp: 50, startEcho: 0 },
  hunter: { maxHp: 65, startEcho: 0 },
  paladin: { maxHp: 85, startEcho: 0 },
  berserker: { maxHp: 90, startEcho: 0 },
  guardian: { maxHp: 75, startEcho: 0 },
};

const CLASS_START_ITEMS = {
  swordsman: 'dull_blade',
  mage: 'void_shard',
  hunter: 'travelers_map',
  paladin: 'cracked_amulet',
  berserker: 'blood_shard',
  guardian: 'rift_talisman',
};

function _getInscriptionLevel(gs, id) {
  if (!gs?.meta?.inscriptions) return 0;
  const disabled = gs.runConfig?.disabledInscriptions || gs.meta.runConfig?.disabledInscriptions || [];
  if (disabled.includes(id)) return 0;
  const val = gs.meta.inscriptions[id];
  if (typeof val === 'boolean') return val ? 1 : 0;
  return Math.max(0, Math.floor(Number(val) || 0));
}

function _getActiveInscriptions(gs, data) {
  if (!data?.inscriptions) return [];
  const active = [];
  for (const [id, def] of Object.entries(data.inscriptions)) {
    const level = _getInscriptionLevel(gs, id);
    if (level > 0) {
      active.push({ id, def, level: Math.min(level, def.maxLevel || 1) });
    }
  }
  return active;
}

function _getActiveSynergies(gs, data) {
  if (!data?.synergies) return [];
  const active = [];
  outer: for (const [id, syn] of Object.entries(data.synergies)) {
    const reqs = id.split('+');
    for (const req of reqs) {
      if (_getInscriptionLevel(gs, req) < 1) continue outer;
    }
    active.push({ id, syn });
  }
  return active;
}

function _applyStartBonuses(gs, data) {
  if (!gs || !data) return;
  const active = _getActiveInscriptions(gs, data);
  for (const item of active) {
    const levelIdx = item.level - 1;
    const levelDef = item.def.levels?.[levelIdx];
    if (levelDef && typeof levelDef.apply === 'function') {
      levelDef.apply(gs);
    }
  }

  const synergies = _getActiveSynergies(gs, data);
  for (const { syn } of synergies) {
    if (syn.trigger === 'passive' && typeof syn.effect === 'function') {
      syn.effect(gs);
    }
  }
}

export const RunSetupUI = {
  CLASS_START_ITEMS,
  startGame(deps = {}) {
    const selectedClass = deps.getSelectedClass?.();
    console.log('[RunSetupUI] startGame triggered. Selected class:', selectedClass);

    if (!selectedClass) {
      console.warn('[RunSetupUI] No class selected. Cannot start game.');
      return;
    }

    const gs = deps.gs;
    const data = deps.data;
    const runRules = deps.runRules;
    const audioEngine = deps.audioEngine;

    if (!gs || !data?.startDecks || !runRules || !audioEngine) {
      console.error('[RunSetupUI] Missing dependencies:', {
        gs: !!gs,
        data: !!data,
        startDecks: !!data?.startDecks,
        runRules: !!runRules,
        audioEngine: !!audioEngine
      });
      return;
    }

    audioEngine.init?.();
    audioEngine.resume?.();
    runRules.ensureMeta?.(gs.meta);

    const cfg = CLASS_CONFIGS[selectedClass];
    if (!cfg) {
      console.error('[RunSetupUI] Invalid class config for:', selectedClass);
      return;
    }

    const inscriptions = gs.meta.inscriptions || {};
    gs.runConfig = {
      ascension: gs.meta.runConfig.ascension || 0,
      endless: !!gs.meta.runConfig.endless,
      endlessMode: !!gs.meta.runConfig.endless,
      blessing: gs.meta.runConfig.blessing || 'none',
      curse: gs.meta.runConfig.curse || 'none',
      disabledInscriptions: gs.meta.runConfig.disabledInscriptions || [],
    };
    gs._runOutcomeCommitted = false;

    gs.player = {
      class: selectedClass,
      hp: cfg.maxHp,
      maxHp: cfg.maxHp,
      shield: 0,
      echo: cfg.startEcho,
      maxEcho: 100,
      echoChain: 0,
      energy: 3,
      maxEnergy: 3,
      gold: 10,
      kills: 0,
      deck: [...data.startDecks[selectedClass]],
      hand: [],
      graveyard: [],
      exhausted: [],
      items: [],
      buffs: {},
      silenceGauge: 0,
      zeroCost: false,
      _freeCardUses: 0,
      costDiscount: 0,
      _cascadeCards: new Map(),
      _traitCardDiscounts: {},
      _mageCastCounter: 0,
      _mageLastDiscountTarget: null,
      upgradedCards: new Set(),
      _cardUpgradeBonus: {},
    };

    if (!gs.meta.codex) gs.meta.codex = { enemies: new Set(), cards: new Set(), items: new Set() };
    gs.player.deck.forEach(id => gs.meta.codex.cards.add(id));

    const startItem = CLASS_START_ITEMS[selectedClass];
    if (startItem) {
      gs.player.items.push(startItem);
      gs.meta.codex.items.add(startItem);
    }

    _applyStartBonuses(gs, data);
    runRules.applyRunStart?.(gs);

    if (typeof deps.shuffleArray === 'function') deps.shuffleArray(gs.player.deck);
    gs.currentRegion = 0;
    gs.currentFloor = 0;
    gs.mapNodes = [];
    gs.currentNode = null;
    gs.visitedNodes = new Set();
    gs.worldMemory = { ...gs.meta.worldMemory };
    gs.stats = { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, maxChain: 0 };
    gs.combat = { active: false, enemies: [], turn: 0, playerTurn: true, log: [] };
    gs._heartUsed = false;
    gs._temporalTurn = 0;
    gs._bossAdvancePending = false;

    if (typeof deps.resetDeckModalFilter === 'function') deps.resetDeckModalFilter();
    if (typeof deps.enterRun === 'function') deps.enterRun();

    // 게임 시작 직후 HUD 즉시 갱신 (초기 상태와의 불일치 방지)
    if (typeof deps.updateUI === 'function') deps.updateUI();
    gs.markDirty('hud');
  },
};
