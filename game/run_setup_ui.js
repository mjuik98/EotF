'use strict';

import { AudioEngine } from '../engine/audio.js';
import { DATA } from '../data/game_data.js';
import { RunRules } from './run_rules.js';



  const CLASS_CONFIGS = {
    swordsman: { maxHp: 80, startEcho: 0 },
    mage: { maxHp: 50, startEcho: 20 },
    hunter: { maxHp: 65, startEcho: 10 },
    paladin: { maxHp: 85, startEcho: 5 },
    berserker: { maxHp: 90, startEcho: 0 },
    shielder: { maxHp: 75, startEcho: 0 },
  };

  const CLASS_START_ITEMS = {
    swordsman: 'dull_blade',
    mage: 'void_shard',
    hunter: 'travelers_map',
    paladin: 'rift_talisman',
    berserker: 'blood_shard',
    shielder: 'phantom_cloak',
  };

  export const RunSetupUI = {
    startGame(deps = {}) {
      const selectedClass = deps.getSelectedClass?.();
      if (!selectedClass) return;

      const gs = deps.gs;
      const data = deps.data || DATA;
      const runRules = deps.runRules || RunRules;
      const audioEngine = deps.audioEngine || AudioEngine;
      if (!gs || !data?.startDecks || !runRules || !audioEngine) return;

      audioEngine.init?.();
      audioEngine.resume?.();
      runRules.ensureMeta?.(gs.meta);

      const cfg = CLASS_CONFIGS[selectedClass];
      if (!cfg) return;

      const inscriptions = gs.meta.inscriptions || {};
      gs.runConfig = {
        ascension: gs.meta.runConfig.ascension || 0,
        endless: !!gs.meta.runConfig.endless,
        endlessMode: !!gs.meta.runConfig.endless,
        blessing: gs.meta.runConfig.blessing || 'none',
        curse: gs.meta.runConfig.curse || 'none',
      };
      gs._runOutcomeCommitted = false;

      gs.player = {
        class: selectedClass,
        hp: cfg.maxHp + (inscriptions.resilience ? 10 : 0),
        maxHp: cfg.maxHp + (inscriptions.resilience ? 10 : 0),
        shield: 0,
        echo: cfg.startEcho + (inscriptions.echo_boost ? 30 : 0),
        maxEcho: 100,
        echoChain: 0,
        energy: 3,
        maxEnergy: 3,
        gold: inscriptions.fortune ? 30 : 10,
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
    },
  };
