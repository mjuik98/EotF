import { ACHIEVEMENTS } from '../../../meta_progression/ports/public_achievement_capabilities.js';
import { getContentLabel } from '../../../meta_progression/ports/public_unlock_application_capabilities.js';

const RANKS = [
  { min: 200, glyph: 'S', color: '#f0d472', glow: 'rgba(240,212,114,.55)', title: '전설의 정복자', label: 'LEGENDARY' },
  { min: 120, glyph: 'A', color: '#c084fc', glow: 'rgba(192,132,252,.5)', title: '숙련된 공명자', label: 'MASTER' },
  { min: 60, glyph: 'B', color: '#4af3cc', glow: 'rgba(74,243,204,.45)', title: '루프의 항해자', label: 'EXPERT' },
  { min: 0, glyph: 'C', color: '#9b8ab8', glow: 'rgba(155,138,184,.35)', title: '생존한 잔향', label: 'SURVIVOR' },
];

const REGIONS = ['rgba(74,243,204,', 'rgba(155,127,232,', 'rgba(74,120,243,', 'rgba(232,121,200,', 'rgba(240,212,114,'];

export const ROOT_ID = 'endingScreen';
export const STYLE_ID = 'ending-screen-styles';
export const FRAGMENT_CHOICES = [
  { icon: '⚡', name: '잔향 강화', desc: '다음 런 시작 시 잔향 +30', effect: 'echo_boost' },
  { icon: '🛡️', name: '회복력', desc: '최대 체력 +10', effect: 'resilience' },
  { icon: '🍀', name: '행운', desc: '시작 골드 +25', effect: 'fortune' },
];

export const docOf = (deps) => deps?.doc || document;
export const winOf = (deps) => deps?.win || window;
export const rafOf = (deps) => deps?.requestAnimationFrame?.bind(deps) || winOf(deps).requestAnimationFrame.bind(winOf(deps));
export const cafOf = (deps) => deps?.cancelAnimationFrame?.bind(deps) || winOf(deps).cancelAnimationFrame.bind(winOf(deps));

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const fmt = (value) => Math.max(0, Math.floor(num(value, 0))).toLocaleString('ko-KR');
const CARD_RARITY_LABELS = Object.freeze({
  common: '일반',
  uncommon: '고급',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
});
const CARD_TYPE_LABELS = Object.freeze({
  attack: '공격',
  skill: '스킬',
  power: '파워',
});
const CONTENT_TYPE_LABELS = Object.freeze({
  curse: '저주',
  relic: '유물',
  card: '카드',
});
const CLASS_LABELS = Object.freeze({
  swordsman: '검사',
  mage: '마법사',
  hunter: '사냥꾼',
  paladin: '성기사',
  berserker: '광전사',
  guardian: '수호자',
  rogue: '도적',
});
const tfmt = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(num(ms, 0) / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
};
const insLv = (gs, id) => {
  const value = gs?.meta?.inscriptions?.[id];
  return typeof value === 'boolean' ? (value ? 1 : 0) : Math.max(0, Math.floor(num(value, 0)));
};
const rankOf = (score) => RANKS.find((rank) => score >= rank.min) || RANKS[RANKS.length - 1];

function describeUnlockedContent(entry) {
  if (!entry) return null;
  const contentType = entry.contentType || entry.type || '';
  const contentId = entry.contentId || entry.id || '';
  return {
    ...entry,
    label: `${CONTENT_TYPE_LABELS[contentType] || contentType} 해금 · ${getContentLabel({ type: contentType, id: contentId })}`,
  };
}

function describeUnlockedAchievement(achievementId) {
  const definition = ACHIEVEMENTS?.[achievementId];
  if (!definition) return null;
  return {
    id: definition.id || achievementId,
    icon: String(definition.icon || '✦'),
    title: String(definition.title || achievementId),
    description: String(definition.description || ''),
  };
}

function getEndingClassLabel(classId) {
  return CLASS_LABELS[String(classId || '')] || String(classId || '').trim();
}

function buildEndingProgressionSummary(gs) {
  const items = [];
  const classLabel = getEndingClassLabel(gs?.player?.class);
  const ascension = Math.max(0, Math.floor(num(gs?.runConfig?.ascension, 0)));

  if (classLabel) items.push(`${classLabel} · A${ascension}`);
  if (gs?.runConfig?.endless) items.push('무한 모드');

  const unlockCount = Array.isArray(gs?.runOutcomeUnlocks) ? gs.runOutcomeUnlocks.length : 0;
  if (unlockCount > 0) items.push(`새 해금 ${unlockCount}건`);

  const achievementCount = Array.isArray(gs?.runOutcomeAchievements) ? gs.runOutcomeAchievements.length : 0;
  if (achievementCount > 0) items.push(`업적 ${achievementCount}건`);

  return items;
}

export function buildEndingRegions(gs, data) {
  const regions = [];
  const defs = Array.isArray(data?.regions) ? data.regions : [];

  for (let i = 0; i <= Math.max(0, Math.floor(num(gs?.currentRegion))); i += 1) {
    const route = gs?.regionRoute?.[String(i)];
    const id = Number.isFinite(Number(route)) ? Number(route) : i;
    const def = defs.find((entry) => Number(entry?.id) === id) || defs[i] || {};
    regions.push({
      name: String(def.name || `지역 ${i + 1}`),
      icon: String(def.icon || def.emoji || ['🌲', '⛰', '🌀', '🕯', '💀'][i] || '✦'),
      accent: String(def.accentBase || REGIONS[i] || 'rgba(155,127,232,'),
      time: tfmt(gs?.stats?.regionClearTimes?.[i]),
      boss: i === Math.max(0, Math.floor(num(gs?.currentRegion))),
    });
  }

  return regions;
}

export function buildEndingDeckPreview(gs, data) {
  const cards = data?.cards || {};
  return (Array.isArray(gs?.player?.deck) ? gs.player.deck : []).slice(0, 14).map((id, index) => {
    const card = cards[id] || {};
    const rarity = String(card.rarity || 'common');
    return {
      id: String(id),
      icon: String(card.icon || card.emoji || ['⚡', '🕯', '🗡', '🌀', '💧', '☄'][index % 6]),
      title: String(card.name || id),
      desc: String(card.desc || ''),
      typeLabel: CARD_TYPE_LABELS[String(card.type || '').toLowerCase()] || '카드',
      rarityLabel: CARD_RARITY_LABELS[rarity] || '일반',
      costText: card.cost == null ? '-' : String(card.cost),
      cls: rarity === 'legendary' ? 'l' : ((rarity === 'epic' || rarity === 'rare' || rarity === 'uncommon') ? 'r' : ''),
    };
  });
}

export function buildEndingInscriptions(gs, data) {
  return Object.keys(gs?.meta?.inscriptions || {}).map((id) => ({
    id,
    level: insLv(gs, id),
    icon: String(data?.inscriptions?.[id]?.icon || '✦'),
    name: String(data?.inscriptions?.[id]?.name || id),
  })).filter((entry) => entry.level > 0);
}

export function buildEndingStatItems(gs, storyCount, storyTotal) {
  const blocked = [gs?.stats?.damageBlocked, gs?.stats?.shieldGained, gs?.stats?.blockGained, gs?.stats?.totalBlocked, gs?.stats?.damageTaken]
    .find((value) => Number.isFinite(Number(value)));

  return [
    { id: 'sv0', icon: '⚔', label: '처치 수', value: num(gs?.player?.kills), tip: `처치 x 3 = ${fmt(num(gs?.player?.kills) * 3)}pt` },
    { id: 'sv1', icon: '⚡', label: '최고 체인', value: num(gs?.stats?.maxChain), tip: `체인 x 5 = ${fmt(num(gs?.stats?.maxChain) * 5)}pt` },
    { id: 'sv2', icon: '✹', label: '총 피해', value: num(gs?.stats?.damageDealt), tip: `피해 / 100 = ${fmt(Math.floor(num(gs?.stats?.damageDealt) / 100))}pt` },
    { id: 'sv3', icon: '🛡', label: '총 방어', value: num(blocked), tip: '최종 방어 누적량' },
    { id: 'sv4', icon: '🃏', label: '사용 카드', value: num(gs?.stats?.cardsPlayed), tip: '이번 런 카드 사용 수' },
    { id: 'sv5', icon: '🜂', label: '스토리', value: `${storyCount}/${storyTotal}`, tip: '스토리 조각 수집 현황', static: true },
  ];
}

export function buildEndingChips(gs, storyCount, storyTotal) {
  return [
    !num(gs?.stats?.deathCount) ? '노 데스' : '',
    storyCount >= storyTotal ? '풀 스토리' : '',
    gs?.worldMemory?.surveyorsRequiemSeen ? '조사 완결' : '',
    !gs?.worldMemory?.surveyorsRequiemSeen && gs?.worldMemory?.routeTriangulated ? '항로 개척' : '',
    `${Math.max(1, Math.floor(num(gs?.meta?.runCount, 1)))}회차`,
  ].filter(Boolean);
}

export function getEndingOutcomeDecoration(outcome = 'victory') {
  if (outcome === 'abandon') {
    return {
      title: '멈춘 메아리',
      subtitle: '스스로 닫힌 귀환',
      eyebrow: '포기한 런의 기록',
      quote: '"끝까지 닿지 못했더라도\n이 선택 또한 하나의 흔적이다.\n멈춘 자리의 메아리가 다음 길을 비춘다."',
      chip: '런 포기',
    };
  }

  if (outcome === 'defeat') {
    return {
      title: '무너진 메아리',
      subtitle: '부서진 귀환',
      eyebrow: '패배한 런의 기록',
      quote: '"메아리는 꺾였지만\n기억은 여기서 끝나지 않는다.\n남은 잔향이 다시 길을 만든다."',
      chip: '패배',
    };
  }

  return null;
}

export function buildEndingPayload(gs, data) {
  const storyCount = Array.isArray(gs?.meta?.storyPieces) ? gs.meta.storyPieces.length : 0;
  const storyTotal = Array.isArray(data?.storyFragments) ? data.storyFragments.length : 10;
  const score = (num(gs?.player?.kills) * 3) + (num(gs?.stats?.maxChain) * 5) + Math.floor(num(gs?.stats?.damageDealt) / 100);
  const rank = rankOf(score);

  return {
    score,
    rank,
    title: '메아리의 근원 정복',
    subtitle: '공명하는 승리자.',
    eyebrow: '엔딩 기록 · 공명하는 승리자',
    quote: '"잔향자는 에코의 핵심을 돌파했다.\n하지만 루프는 아직 끝나지 않았다.\n진실을 알기에는 아직 이르다."',
    storyText: `${storyCount}/${storyTotal}`,
    clear: tfmt(gs?.stats?.clearTimeMs),
    stats: buildEndingStatItems(gs, storyCount, storyTotal),
    chips: buildEndingChips(gs, storyCount, storyTotal),
    regions: buildEndingRegions(gs, data),
    deck: buildEndingDeckPreview(gs, data),
    inscriptions: buildEndingInscriptions(gs, data),
    progressionSummary: buildEndingProgressionSummary(gs),
    unlocks: Array.isArray(gs?.runOutcomeUnlocks)
      ? gs.runOutcomeUnlocks.map(describeUnlockedContent).filter(Boolean)
      : [],
    achievements: Array.isArray(gs?.runOutcomeAchievements)
      ? gs.runOutcomeAchievements.map(describeUnlockedAchievement).filter(Boolean)
      : [],
  };
}

export function decorateEndingPayloadForOutcome(payload, outcome = 'victory') {
  const decoration = getEndingOutcomeDecoration(outcome);
  if (!payload || !decoration) return payload;

  payload.title = decoration.title;
  payload.subtitle = decoration.subtitle;
  payload.eyebrow = decoration.eyebrow;
  payload.quote = decoration.quote;
  payload.chips = Array.from(new Set([decoration.chip, ...(payload.chips || [])]));
  return payload;
}

export function findRankIndexByGlyph(glyph) {
  return RANKS.findIndex((rank) => rank.glyph === glyph);
}

export function getEndingRanks() {
  return RANKS;
}

export {
  appendEndingFragmentChoices,
  applyEndingRank,
  buildEndingScreenDOM,
  ensureEndingScreenStyle,
  populateEndingMeta,
} from './ending_screen_render_helpers.js';
