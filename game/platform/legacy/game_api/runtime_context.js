import { createLegacyRuntimePorts } from '../adapters/create_legacy_runtime_ports.js';

const runtimePorts = createLegacyRuntimePorts();

export function getRuntimeDeps() {
  return runtimePorts.getRuntimeDeps();
}

export function getRunRuntimeDeps() {
  return runtimePorts.getRunRuntimeDeps();
}

export function getCombatRuntimeDeps() {
  return runtimePorts.getCombatRuntimeDeps();
}

export function getUiRuntimeDeps() {
  return runtimePorts.getUiRuntimeDeps();
}

export function getModule(name) {
  return runtimePorts.getModule(name);
}

export function getCurrentCard(cardId) {
  return runtimePorts.getCurrentCard(cardId);
}

export function getAudioEngine() {
  return runtimePorts.getAudioEngine();
}

export function getDefaultState() {
  return runtimePorts.getDefaultState();
}
