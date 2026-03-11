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
const tfmt = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(num(ms, 0) / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
};
const insLv = (gs, id) => {
  const value = gs?.meta?.inscriptions?.[id];
  return typeof value === 'boolean' ? (value ? 1 : 0) : Math.max(0, Math.floor(num(value, 0)));
};
const rankOf = (score) => RANKS.find((rank) => score >= rank.min) || RANKS[RANKS.length - 1];

export function buildEndingPayload(gs, data) {
  const storyCount = Array.isArray(gs?.meta?.storyPieces) ? gs.meta.storyPieces.length : 0;
  const storyTotal = Array.isArray(data?.storyFragments) ? data.storyFragments.length : 10;
  const blocked = [gs?.stats?.damageBlocked, gs?.stats?.shieldGained, gs?.stats?.blockGained, gs?.stats?.totalBlocked, gs?.stats?.damageTaken]
    .find((value) => Number.isFinite(Number(value)));
  const score = (num(gs?.player?.kills) * 3) + (num(gs?.stats?.maxChain) * 5) + Math.floor(num(gs?.stats?.damageDealt) / 100);
  const rank = rankOf(score);
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

  const cards = data?.cards || {};
  const deck = (Array.isArray(gs?.player?.deck) ? gs.player.deck : []).slice(0, 14).map((id, index) => {
    const card = cards[id] || {};
    const rarity = String(card.rarity || 'common');
    return {
      id: String(id),
      icon: String(card.icon || card.emoji || ['⚡', '🕯', '🗡', '🌀', '💧', '☄'][index % 6]),
      title: String(card.name || id),
      cls: rarity === 'legendary' ? 'l' : ((rarity === 'epic' || rarity === 'rare' || rarity === 'uncommon') ? 'r' : ''),
    };
  });
  const inscriptions = Object.keys(gs?.meta?.inscriptions || {}).map((id) => ({
    id,
    level: insLv(gs, id),
    icon: String(data?.inscriptions?.[id]?.icon || '✦'),
    name: String(data?.inscriptions?.[id]?.name || id),
  })).filter((entry) => entry.level > 0);

  return {
    score,
    rank,
    title: '메아리의 근원 정복',
    subtitle: '공명하는 승리자.',
    eyebrow: '엔딩 기록 · 공명하는 승리자',
    quote: '"잔향자는 에코의 핵심을 돌파했다.\n하지만 루프는 아직 끝나지 않았다.\n진실을 알기에는 아직 이르다."',
    storyText: `${storyCount}/${storyTotal}`,
    clear: tfmt(gs?.stats?.clearTimeMs),
    stats: [
      { id: 'sv0', icon: '⚔', label: '처치 수', value: num(gs?.player?.kills), tip: `처치 x 3 = ${fmt(num(gs?.player?.kills) * 3)}pt` },
      { id: 'sv1', icon: '⚡', label: '최고 체인', value: num(gs?.stats?.maxChain), tip: `체인 x 5 = ${fmt(num(gs?.stats?.maxChain) * 5)}pt` },
      { id: 'sv2', icon: '✹', label: '총 피해', value: num(gs?.stats?.damageDealt), tip: `피해 / 100 = ${fmt(Math.floor(num(gs?.stats?.damageDealt) / 100))}pt` },
      { id: 'sv3', icon: '🛡', label: '총 방어', value: num(blocked), tip: '최종 방어 누적량' },
      { id: 'sv4', icon: '🃏', label: '사용 카드', value: num(gs?.stats?.cardsPlayed), tip: '이번 런 카드 사용 수' },
      { id: 'sv5', icon: '🜂', label: '스토리', value: `${storyCount}/${storyTotal}`, tip: '스토리 조각 수집 현황', static: true },
    ],
    chips: [
      !num(gs?.stats?.deathCount) ? '노 데스' : '',
      storyCount >= storyTotal ? '풀 스토리' : '',
      `${Math.max(1, Math.floor(num(gs?.meta?.runCount, 1)))}회차`,
    ].filter(Boolean),
    regions,
    deck,
    inscriptions,
  };
}

export function decorateEndingPayloadForOutcome(payload, outcome = 'victory') {
  if (!payload || outcome === 'victory') return payload;

  if (outcome === 'abandon') {
    payload.title = '멈춘 메아리';
    payload.subtitle = '스스로 닫힌 귀환';
    payload.eyebrow = '포기한 런의 기록';
    payload.quote = '"끝까지 닿지 못했더라도\n이 선택 또한 하나의 흔적이다.\n멈춘 자리의 메아리가 다음 길을 비춘다."';
    payload.chips = Array.from(new Set(['런 포기', ...payload.chips]));
    return payload;
  }

  payload.title = '무너진 메아리';
  payload.subtitle = '부서진 귀환';
  payload.eyebrow = '패배한 런의 기록';
  payload.quote = '"메아리는 꺾였지만\n기억은 여기서 끝나지 않는다.\n남은 잔향이 다시 길을 만든다."';
  payload.chips = Array.from(new Set(['패배', ...payload.chips]));
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
