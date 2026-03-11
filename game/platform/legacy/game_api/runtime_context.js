import { GAME } from '../global_bridge.js';

export function getRuntimeDeps() {
  return getRunRuntimeDeps();
}

export function getRunRuntimeDeps() {
  return GAME.getRunDeps?.() || {};
}

export function getCombatRuntimeDeps() {
  return GAME.getCombatDeps?.() || {};
}

export function getUiRuntimeDeps() {
  return GAME.getUiDeps?.() || {};
}

export function getModule(name) {
  return GAME.Modules?.[name];
}

export function getCurrentCard(cardId) {
  return GAME.Data?.cards?.[cardId];
}

export function getAudioEngine() {
  return GAME.Audio;
}

export function getDefaultState() {
  return GAME.State;
}
