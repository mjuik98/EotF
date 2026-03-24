import { ensureRunConfigMeta } from '../../state/run_config_state_commands.js';
import { CURSES } from '../../domain/run_rules_curses.js';

export function getDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function getMeta(gs) {
  return gs?.meta || null;
}

export const ensureRunConfig = ensureRunConfigMeta;

export function getInscriptionLevel(meta, runConfig, id) {
  if (!meta?.inscriptions) return 0;
  if (runConfig?.disabledInscriptions?.includes(id)) return 0;
  const val = meta.inscriptions[id];
  if (typeof val === 'boolean') return val ? 1 : 0;
  return Math.max(0, Math.floor(Number(val) || 0));
}

export function getActiveSynergies(meta, runConfig, data) {
  if (!data?.synergies) return [];
  const active = [];
  outer: for (const [id, syn] of Object.entries(data.synergies)) {
    for (const req of id.split('+')) {
      if (getInscriptionLevel(meta, runConfig, req) < 1) continue outer;
    }
    active.push({ id, syn });
  }
  return active;
}

const DIFF_LEVELS = [
  { max: 0, label: '일반', color: '#778899', desc: '안정적인 여정' },
  { max: 15, label: '도전', color: '#ffcc00', desc: '약간의 긴장감' },
  { max: 30, label: '고난', color: '#ff8800', desc: '전략적 운영 필요' },
  { max: 50, label: '극한', color: '#ff3344', desc: '실수가 치명적' },
  { max: 999, label: '지옥', color: '#cc33ff', desc: '숙련자 전용' },
];

export function calcDiffScore(runRules, gs) {
  if (typeof runRules?.getDifficultyScore === 'function') return runRules.getDifficultyScore(gs);
  const cfg = gs?.runConfig || {};
  const asc = runRules?.getAscension?.(gs) || 0;
  let score = asc * 15;
  if (cfg.endless || cfg.endlessMode) score += 10;
  score += (runRules?.curses?.[cfg.curse || 'none'] || CURSES[cfg.curse || 'none'] || CURSES.none).difficultyWeight || 0;
  score += runRules?.getInscriptionScoreAdjustment?.(gs) || 0;
  return Math.max(0, score);
}

export function getDiffLevel(score) {
  return DIFF_LEVELS.find((item) => score <= item.max) || DIFF_LEVELS[DIFF_LEVELS.length - 1];
}

export function reducedMotion(deps = {}) {
  const win = deps?.win || deps?.doc?.defaultView || null;
  return !!win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}

export function cloneRunConfig(cfg) {
  return {
    ascension: Math.max(0, Math.floor(Number(cfg?.ascension) || 0)),
    endless: !!cfg?.endless,
    curse: String(cfg?.curse || 'none'),
    disabledInscriptions: Array.isArray(cfg?.disabledInscriptions)
      ? [...new Set(cfg.disabledInscriptions.map((id) => String(id)))]
      : [],
  };
}

export function getPresetSlots(meta) {
  return Array.from({ length: 4 }, (_, idx) => ({
    index: idx,
    preset: Array.isArray(meta?.runConfigPresets) ? meta.runConfigPresets[idx] || null : null,
  }));
}

export function escapeAttr(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function getActiveInscriptionCount(meta, cfg) {
  const earned = Object.entries(meta?.inscriptions || {}).filter(([, value]) => Number(value) > 0);
  const disabled = new Set(cfg?.disabledInscriptions || []);
  return earned.filter(([id]) => !disabled.has(id)).length;
}

export function getEarnedInscriptionCount(meta) {
  return Object.values(meta?.inscriptions || {}).filter((value) => Number(value) > 0).length;
}

export function getInscriptionEffectText(def, lvl) {
  const levelDef = def?.levels?.[Math.max(0, lvl - 1)];
  return String(levelDef?.desc || def?.desc || '효과 정보 없음');
}
