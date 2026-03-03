// ══════════════════════════════════════════════════════════
//  CharacterSelectUI
//  game/ui/title/character_select_ui.js
//
//  HTML 프로토타입(character-select-v4.html)을 프로젝트
//  아키텍처에 맞게 변환한 ES 모듈입니다.
//
//  의존성 방향: game/ui/* (아키텍처 규칙 준수)
//  사용처: game/core/init_sequence.js 또는 bindings에서 주입
//
//  NOTE: CHARS 데이터는 현재 이 파일에 포함되어 있지만
//        data/classes.js 또는 game/data/ 로 이동을 권장합니다.
// ══════════════════════════════════════════════════════════

// ── 헬퍼 ──────────────────────────────────────────────────
function _getDoc(deps) {
  return deps?.doc || document;
}

function _$(id, deps) {
  return _getDoc(deps).getElementById(id);
}

// ══════════════════════════════════════════════════════════
// CHARACTER DATA
// 권장: data/classes.js 로 이동 후 deps.data.classes 로 주입
// ══════════════════════════════════════════════════════════
const CHARS = [
  {
    id: 0, name: "잔향검사", title: "SWORDSMAN", emoji: "🗡️",
    difficulty: "★★★☆☆", color: "#1A6B9A", glow: "#5DADE2", accent: "#55AAFF",
    tags: ["리듬형", "연속 공격", "입문 추천"],
    stats: { HP: 80, ATK: 75, DEF: 60, ECH: 85, RHY: 65, RES: 70 },
    traitName: "공명", traitTitle: "공명 (Resonance)",
    traitDesc: "전투의 리듬을 지배합니다. 카드를 사용할 때마다 검의 진동이 중첩되어 다음 공격의 위력이 점진적으로 상승합니다.",
    skills: [
      {
        name: "공명 (고유 특성)", icon: "🗡️", desc: "카드 사용마다 피해 +3 중첩. 최대 +30 피해.", tree: [
          { tier: 1, name: "공명 Lv.1", bonus: "최대 +10 피해", desc: "검의 진동이 3회 누적될 때마다 터진다." },
          { tier: 2, name: "공명 Lv.2", bonus: "최대 +20 피해", desc: "진동의 공명이 더 오래, 더 깊게 울린다." },
          { tier: 3, name: "공명 Lv.3", bonus: "최대 +30 피해", desc: "공명이 극에 달해 검격이 파동을 일으킨다." },
        ]
      },
      {
        name: "칼날 춤", icon: "💫", desc: "연속 2회 공격. 각 타 피해 8.", tree: [
          { tier: 1, name: "칼날 춤", bonus: "2타 × 8", desc: "빠른 검격 2회 연속 발동." },
          { tier: 2, name: "칼날 춤+", bonus: "2타 × 11", desc: "타격 사이 공명 스택이 1 추가된다." },
          { tier: 3, name: "공명 폭쇄", bonus: "2타 + 폭발", desc: "2타 후 공명 스택이 즉시 폭발한다." },
        ]
      },
      {
        name: "잔향 검격", icon: "⚡", desc: "피해 9. 잔향 20 충전.", tree: [
          { tier: 1, name: "잔향 검격", bonus: "피해 9 + 잔향 20", desc: "검에 잔향을 실어 강타." },
          { tier: 2, name: "잔향 검격+", bonus: "피해 13 + 잔향 28", desc: "검기의 밀도가 짙어진다." },
          { tier: 3, name: "공명 검기", bonus: "피해 × 공명 배율", desc: "공명 스택만큼 피해가 급증한다." },
        ]
      },
    ],
    echoSkill: {
      name: "공명 폭풍", icon: "🌊", desc: "쌓인 공명 스택을 해방하여 전장을 공명파로 뒤덮는다.", echoCost: 80, tree: [
        { tier: 1, name: "공명 폭풍 Lv.1", bonus: "공명 스택 × 4 피해", desc: "잔향이 검에서 폭풍으로 바뀐다." },
        { tier: 2, name: "공명 폭풍 Lv.2", bonus: "공명 스택 × 6 + 스택 유지", desc: "공명이 소멸하지 않고 계속 울린다." },
        { tier: 3, name: "절명 공명파", bonus: "공명 스택 × 8 + 기절", desc: "검기의 파동이 적의 혼을 흔들어 기절시킨다." },
      ]
    },
    startDeck: ["strike ×2", "defend", "charge", "echo_strike", "heavy_blow", "blade_dance"],
    startRelic: { icon: "🔪", name: "무딘 검", desc: "오래된 전쟁에서 살아남은 검. 공명 스택이 1 추가로 쌓인다.", passive: "공명 적층 속도 +1" },
    story: "검이 울렸다...\n그 울림은 전장을 가득 채웠다.\n공명은 끝나지 않는다.", particle: "ember",
  },
  {
    id: 1, name: "메아리술사", title: "MAGE", emoji: "🪄",
    difficulty: "★★★★☆", color: "#7D3C98", glow: "#C39BD3", accent: "#BB77FF",
    tags: ["흐름 왜곡", "카드 비용", "고화력"],
    stats: { HP: 50, ATK: 95, DEF: 30, ECH: 90, RHY: 70, RES: 80 },
    traitName: "메아리", traitTitle: "메아리 (Echo)",
    traitDesc: "카드를 3번 사용할 때마다 손패의 무작위 카드 1장의 비용이 1 감소합니다.",
    skills: [
      {
        name: "메아리 (고유 특성)", icon: "🪄", desc: "카드 3회 사용 시 무작위 카드 비용 -1.", tree: [
          { tier: 1, name: "메아리 Lv.1", bonus: "3회마다 비용 -1", desc: "울림이 패에 스며들어 비용을 깎는다." },
          { tier: 2, name: "메아리 Lv.2", bonus: "2회마다 비용 -1", desc: "메아리가 더 빠르게 패에 공명한다." },
          { tier: 3, name: "메아리 Lv.3", bonus: "0비용 카드 추가 발동", desc: "비용 0 카드 사용 시 잔향 스킬이 자동 발동." },
        ]
      },
      {
        name: "시간 왜곡", icon: "⏳", desc: "【지속】 매 턴 에너지 +1 획득.", tree: [
          { tier: 1, name: "시간 왜곡", bonus: "매 턴 에너지 +1", desc: "시간의 흐름을 비틀어 에너지를 창출." },
          { tier: 2, name: "시간 왜곡+", bonus: "에너지 +1 + 드로우 1", desc: "왜곡이 심화되어 카드도 끌어당긴다." },
          { tier: 3, name: "시공간 왜곡", bonus: "에너지 +2", desc: "현실 자체가 굴절된다." },
        ]
      },
      {
        name: "공허 거울", icon: "🪞", desc: "방어막 8. 방어막 동안 피해 반사.", tree: [
          { tier: 1, name: "공허 거울", bonus: "방어막 8 + 반사", desc: "공허의 거울이 공격을 돌려보낸다." },
          { tier: 2, name: "공허 거울+", bonus: "방어막 12 + 반사", desc: "반사 피해가 증폭된다." },
          { tier: 3, name: "차원 거울", bonus: "방어막 × 반사 2배", desc: "거울이 차원을 가로질러 반사한다." },
        ]
      },
    ],
    echoSkill: {
      name: "메아리 연쇄", icon: "🔮", desc: "손패의 모든 카드를 0비용으로 만들고 카드 1장 추가 드로우.", echoCost: 90, tree: [
        { tier: 1, name: "메아리 연쇄 Lv.1", bonus: "패 전체 비용 0 (1턴)", desc: "메아리가 모든 패에 동시에 스며든다." },
        { tier: 2, name: "메아리 연쇄 Lv.2", bonus: "패 전체 비용 0 + 드로우 2", desc: "울림이 패를 더 깊이 채운다." },
        { tier: 3, name: "시공 메아리", bonus: "패 비용 0 + 소멸 카드 귀환", desc: "메아리가 시간을 거슬러 카드를 불러온다." },
      ]
    },
    startDeck: ["strike ×2", "defend", "prediction", "foresight", "void_mirror", "time_warp"],
    startRelic: { icon: "🔷", name: "공허의 파편", desc: "공허에서 건져올린 파편. 시작 시 손패 중 카드 1장의 비용이 0이 된다.", passive: "시작 시 패 1장 비용 0" },
    story: "메아리는 결코 사라지지 않는다...\n카드 한 장 한 장이 울림을 남긴다.\n패가 울리는 순간, 전장이 무너진다.", particle: "orb",
  },
  {
    id: 2, name: "침묵사냥꾼", title: "HUNTER", emoji: "🏹",
    difficulty: "★★★★★", color: "#1A6B3C", glow: "#58D68D", accent: "#44FF88",
    tags: ["침묵 게이지", "은신", "숙련자용"],
    stats: { HP: 65, ATK: 85, DEF: 45, ECH: 60, RHY: 95, RES: 65 },
    traitName: "정적", traitTitle: "정적 (Dead Silence)",
    traitDesc: "같은 적을 5번 공격할 때마다 독(3)을 부여하고, 자신은 1턴 동안 은신 상태가 됩니다.",
    skills: [
      {
        name: "정적 (고유 특성)", icon: "🏹", desc: "5번 공격마다 독(3) + 은신 1턴.", tree: [
          { tier: 1, name: "정적 Lv.1", bonus: "5타마다 독(3) + 은신", desc: "소음을 지우며 독을 심는다." },
          { tier: 2, name: "정적 Lv.2", bonus: "4타마다 발동", desc: "침묵의 임계치가 낮아진다." },
          { tier: 3, name: "사신의 정적", bonus: "3타마다 + 처형표식", desc: "3회 공격마다 독 + 처형 표식 부여." },
        ]
      },
      {
        name: "가속", icon: "💨", desc: "【지속】 매 턴 카드 추가 드로우 1.", tree: [
          { tier: 1, name: "가속", bonus: "매 턴 드로우 +1", desc: "몸이 바람처럼 가볍다." },
          { tier: 2, name: "가속+", bonus: "드로우 +1 + 에너지 +1", desc: "가속과 에너지가 동시에 흘러넘친다." },
          { tier: 3, name: "극가속", bonus: "드로우 +2 + 속도 버프", desc: "사냥꾼의 속도가 한계를 넘어선다." },
        ]
      },
      {
        name: "환영 발걸음", icon: "👣", desc: "은신 1. 카드 1장 드로우.", tree: [
          { tier: 1, name: "환영 발걸음", bonus: "은신 + 드로우 1", desc: "그림자 속으로 사라진다." },
          { tier: 2, name: "환영 발걸음+", bonus: "은신 + 드로우 2", desc: "더 빠르게, 더 깊은 어둠으로." },
          { tier: 3, name: "허상 이동", bonus: "은신 + 이동 + 드로우 2", desc: "순간이동과 함께 어둠에 잠긴다." },
        ]
      },
    ],
    echoSkill: {
      name: "잔향 포획", icon: "🎯", desc: "은신 중 발동 시 치명 피해. 독 중첩을 두 배로 만든다.", echoCost: 70, tree: [
        { tier: 1, name: "잔향 포획 Lv.1", bonus: "피해 25 + 독 × 2", desc: "침묵 속에서 사냥감을 완전히 제압한다." },
        { tier: 2, name: "잔향 포획 Lv.2", bonus: "피해 35 + 독 × 2 + 은신", desc: "일격 후 다시 어둠 속으로 사라진다." },
        { tier: 3, name: "사신의 잔향", bonus: "처형표식 + 독 × 3", desc: "잔향이 죽음의 낫이 된다." },
      ]
    },
    startDeck: ["strike ×2", "defend", "acceleration", "tempo_strike", "quick_step", "phantom_step"],
    startRelic: { icon: "🗺️", name: "여행자의 지도", desc: "세계 각지의 사냥터가 기록된 지도. 매 전투 시작 시 카드 1장을 추가 드로우한다.", passive: "전투 시작 드로우 +1" },
    story: "소리가 죽는 그 순간...\n사냥꾼은 이미 사라진 후였다.\n침묵이 곧 죽음이다.", particle: "smoke",
  },
  {
    id: 3, name: "찬송기사", title: "PALADIN", emoji: "⚜️",
    difficulty: "★★☆☆☆", color: "#9A7D0A", glow: "#F9E79F", accent: "#FFD700",
    tags: ["치유형", "역공 특성", "파티 핵심"],
    stats: { HP: 85, ATK: 65, DEF: 80, ECH: 70, RHY: 55, RES: 90 },
    traitName: "성가", traitTitle: "성가 (Sacred Hymn)",
    traitDesc: "체력을 회복할 때마다 회복량만큼 무작위 적 하나에게 피해를 입혀 응징합니다.",
    skills: [
      {
        name: "성가 (고유 특성)", icon: "⚜️", desc: "회복량만큼 무작위 적에게 피해.", tree: [
          { tier: 1, name: "성가 Lv.1", bonus: "회복 → 피해 1:1", desc: "치유의 빛이 심판으로 바뀐다." },
          { tier: 2, name: "성가 Lv.2", bonus: "회복 → 피해 1:1.5", desc: "신성한 응징의 힘이 강화된다." },
          { tier: 3, name: "신성 심판", bonus: "회복 → 피해 1:2", desc: "빛이 강렬해져 심판이 두 배가 된다." },
        ]
      },
      {
        name: "신성 공격", icon: "✝️", desc: "피해 8. 체력 3 회복.", tree: [
          { tier: 1, name: "신성 공격", bonus: "피해 8 + 회복 3", desc: "빛으로 적을 베고 자신을 치유한다." },
          { tier: 2, name: "신성 공격+", bonus: "피해 11 + 회복 5", desc: "심판과 자비가 동시에 쏟아진다." },
          { tier: 3, name: "천벌", bonus: "피해 15 + 광역 회복", desc: "천상의 심판이 전장에 내려앉는다." },
        ]
      },
      {
        name: "신의 은총", icon: "💛", desc: "체력 8 회복. 방어막 5.", tree: [
          { tier: 1, name: "신의 은총", bonus: "회복 8 + 방어막 5", desc: "신의 손길이 상처를 감싸 안는다." },
          { tier: 2, name: "신의 은총+", bonus: "회복 12 + 방어막 8", desc: "은총이 더욱 깊고 넓게 퍼진다." },
          { tier: 3, name: "성스러운 부활", bonus: "완전 회복 + 방어막 15", desc: "죽음의 문턱에서 기적이 일어난다." },
        ]
      },
    ],
    echoSkill: {
      name: "성가 잔향", icon: "✨", desc: "잔향의 빛으로 완전 회복. 회복량의 2배를 적에게 피해.", echoCost: 100, tree: [
        { tier: 1, name: "성가 잔향 Lv.1", bonus: "완전 회복 + 회복량 × 1 피해", desc: "신성한 잔향이 상처를 완전히 치유한다." },
        { tier: 2, name: "성가 잔향 Lv.2", bonus: "완전 회복 + 회복량 × 1.5 피해", desc: "응징의 힘이 더욱 강해진다." },
        { tier: 3, name: "신성 잔향파", bonus: "완전 회복 + 회복량 × 2 + 광역", desc: "성가가 전장에 울려 퍼지며 모든 적을 응징한다." },
      ]
    },
    startDeck: ["strike", "defend", "holy_strike ×2", "divine_grace ×2", "blessing_of_light"],
    startRelic: { icon: "📿", name: "부서진 목걸이", desc: "신성한 기운이 남아있는 목걸이 파편. 회복 효과가 10% 증가한다.", passive: "회복 효과 +10%" },
    story: "신은 그에게 단 한 가지를 가르쳤다...\n치유는 곧 응징이라는 것을.\n빛이 닿는 곳에서 적은 쓰러진다.", particle: "holy",
  },
  {
    id: 4, name: "파음전사", title: "BERSERKER", emoji: "🪓",
    difficulty: "★★★★★", color: "#922B21", glow: "#EC7063", accent: "#FF4444",
    tags: ["고위험", "역전형", "고화력"],
    stats: { HP: 90, ATK: 98, DEF: 40, ECH: 55, RHY: 75, RES: 60 },
    traitName: "불협화음", traitTitle: "불협화음 (Cacophony)",
    traitDesc: "현재 잃은 체력에 비례하여 공격 피해량이 최대 50%까지 증폭됩니다.",
    skills: [
      {
        name: "불협화음 (고유 특성)", icon: "🪓", desc: "잃은 HP 비례 피해 최대 +50%.", tree: [
          { tier: 1, name: "불협화음 Lv.1", bonus: "피해 최대 +25%", desc: "상처에서 분노가 터져 나온다." },
          { tier: 2, name: "불협화음 Lv.2", bonus: "피해 최대 +40%", desc: "피투성이가 될수록 더 위험해진다." },
          { tier: 3, name: "파멸의 음률", bonus: "피해 최대 +50%", desc: "죽음 직전, 파음전사는 가장 강하다." },
        ]
      },
      {
        name: "피의 분노", icon: "🩸", desc: "피해 14. 체력 4 소모.", tree: [
          { tier: 1, name: "피의 분노", bonus: "피해 14 + HP -4", desc: "자신을 대가로 강력한 일격을 날린다." },
          { tier: 2, name: "피의 분노+", bonus: "피해 20 + HP -3", desc: "고통의 대가가 줄어들면서 위력은 커진다." },
          { tier: 3, name: "파멸의 분노", bonus: "피해 28 + 연쇄 3", desc: "분노가 연쇄로 폭발한다." },
        ]
      },
      {
        name: "무모한 일격", icon: "💥", desc: "피해 11. 방어막 0으로.", tree: [
          { tier: 1, name: "무모한 일격", bonus: "피해 11 + 방어막 파괴", desc: "모든 방어를 버리고 전력으로 타격." },
          { tier: 2, name: "무모한 일격+", bonus: "피해 16 + 방어막 파괴", desc: "더 크고 무거운 일격이 작렬한다." },
          { tier: 3, name: "파음 폭발", bonus: "피해 × (1 + 잃은HP%)", desc: "불협화음과 결합하여 임계 피해 발생." },
        ]
      },
    ],
    echoSkill: {
      name: "파음 해방", icon: "💢", desc: "잃은 HP만큼 피해. 이후 방어막 20 획득.", echoCost: 75, tree: [
        { tier: 1, name: "파음 해방 Lv.1", bonus: "잃은 HP × 1 피해", desc: "고통을 무기로, 파음이 폭발한다." },
        { tier: 2, name: "파음 해방 Lv.2", bonus: "잃은 HP × 1.5 + 방어막 20", desc: "파괴 후 강인함이 찾아온다." },
        { tier: 3, name: "절규 파음파", bonus: "잃은 HP × 2 + 연쇄 2", desc: "한계를 넘어선 파음이 연쇄 폭발한다." },
      ]
    },
    startDeck: ["strike ×2", "defend", "blood_fury ×2", "reckless_swing ×2"],
    startRelic: { icon: "🍷", name: "핏빛 파편", desc: "전투의 핏빛으로 물든 파편. HP가 30% 이하일 때 에너지 +1을 추가로 얻는다.", passive: "HP 30% 이하 시 에너지 +1" },
    story: "상처는 그를 죽이지 못했다...\n오히려 더 날카롭게 만들었다.\n고통이 곧 파괴의 선율이다.", particle: "ember",
  },
  {
    id: 5, name: "무음수호자", title: "GUARDIAN", emoji: "🛡️",
    difficulty: "★★☆☆☆", color: "#1F3A52", glow: "#85C1E9", accent: "#6BB8E8",
    tags: ["방어형", "잔영 갑주", "지속전"],
    stats: { HP: 75, ATK: 50, DEF: 98, ECH: 80, RHY: 45, RES: 85 },
    traitName: "잔영 갑주", traitTitle: "잔영 갑주 (Echo Armor)",
    traitDesc: "턴이 종료되어도 방어막의 50%가 메아리처럼 남아 다음 턴까지 유지됩니다.",
    skills: [
      {
        name: "잔영 갑주 (고유 특성)", icon: "🛡️", desc: "턴 종료 시 방어막 50% 유지.", tree: [
          { tier: 1, name: "잔영 갑주 Lv.1", bonus: "방어막 50% 유지", desc: "방어막의 절반이 메아리처럼 남는다." },
          { tier: 2, name: "잔영 갑주 Lv.2", bonus: "방어막 65% 유지", desc: "잔영이 더 짙게 스며든다." },
          { tier: 3, name: "영구 갑주", bonus: "방어막 80% + 피해 반사", desc: "방어막이 영구적 방어막으로 진화한다." },
        ]
      },
      {
        name: "철벽 방어", icon: "⛏️", desc: "방어막 15. 다음 턴 지속.", tree: [
          { tier: 1, name: "철벽 방어", bonus: "방어막 15", desc: "단단한 철벽이 몸을 감싼다." },
          { tier: 2, name: "철벽 방어+", bonus: "방어막 21", desc: "방어막의 밀도가 더욱 높아진다." },
          { tier: 3, name: "철옹성", bonus: "방어막 30 + 반격", desc: "난공불락. 방어막이 반격을 유발한다." },
        ]
      },
      {
        name: "방패 강타", icon: "🔰", desc: "피해 8. 방어막 8.", tree: [
          { tier: 1, name: "방패 강타", bonus: "피해 8 + 방어막 8", desc: "방패로 공격과 방어를 동시에." },
          { tier: 2, name: "방패 강타+", bonus: "피해 11 + 방어막 11", desc: "방패의 밀도와 강도가 올라간다." },
          { tier: 3, name: "공진 강타", bonus: "방어막 × 피해", desc: "방어막이 높을수록 타격이 강해진다." },
        ]
      },
    ],
    echoSkill: {
      name: "잔영 공명", icon: "🔵", desc: "현재 방어막을 3배로 강화하고 1턴 동안 무적 상태가 된다.", echoCost: 85, tree: [
        { tier: 1, name: "잔영 공명 Lv.1", bonus: "방어막 × 2 + 피해 반사", desc: "잔영이 공명하며 방어막을 두텁게 만든다." },
        { tier: 2, name: "잔영 공명 Lv.2", bonus: "방어막 × 3 + 무적 1턴", desc: "완벽한 방어 속에 공명이 완성된다." },
        { tier: 3, name: "영원한 잔영", bonus: "방어막 × 3 + 무적 + 반격", desc: "잔영이 영구적으로 전장을 뒤덮는다." },
      ]
    },
    startDeck: ["strike", "defend ×2", "iron_defense ×2", "shield_slam", "unbreakable_wall"],
    startRelic: { icon: "💍", name: "균열의 부적", desc: "균열된 방어의 기운을 담은 부적. 매 턴 방어막 +2를 자동으로 획득한다.", passive: "매 턴 방어막 +2" },
    story: "소리조차 그를 뚫지 못했다...\n방벽은 무너지지 않는다.\n침묵 속에서 수호자는 영원히 선다.", particle: "smoke",
  },
];

// ══════════════════════════════════════════════════════════
// SOUND ENGINE
// deps.audioEngine 이 있으면 우선 사용하고, 없으면 Web Audio API 폴백
// ══════════════════════════════════════════════════════════
let _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  }
  return _audioCtx;
}

function _tone(f, d, type = 'sine', v = 0.06, delay = 0) {
  try {
    const c = _getAudioCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(f, c.currentTime + delay);
    o.frequency.exponentialRampToValueAtTime(f * 1.35, c.currentTime + delay + d * 0.7);
    g.gain.setValueAtTime(0.001, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(v, c.currentTime + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + d);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + d + 0.05);
  } catch (_e) { /* 오디오 컨텍스트 미지원 환경에서 무시 */ }
}

const _SFX = {
  nav: () => { _tone(360, 0.1, 'triangle', 0.06); _tone(520, 0.1, 'triangle', 0.05, 0.09); },
  hover: () => _tone(900, 0.035, 'sine', 0.022),
  select: () => [261, 329, 392, 523, 659, 880].forEach((f, i) => _tone(f, 0.8, 'triangle', 0.05, i * 0.065)),
  skill: () => { _tone(500, 0.12, 'triangle', 0.05); _tone(700, 0.1, 'sine', 0.04, 0.1); },
  compare: () => { _tone(440, 0.1, 'sine', 0.05); _tone(660, 0.15, 'triangle', 0.05, 0.09); },
  echo: () => { _tone(300, 0.15, 'sine', 0.05); _tone(600, 0.2, 'triangle', 0.04, 0.12); _tone(900, 0.15, 'sine', 0.03, 0.25); },
};

// ══════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ══════════════════════════════════════════════════════════
function _hexRgb(h) {
  return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
}

class _Particle {
  constructor(t, a, W, H) { this.t = t; this.a = a; this.W = W; this.H = H; this.reset(); }
  reset() {
    const { t, W, H } = this;
    this.life = 0.6 + Math.random() * 0.4;
    this.decay = 0.004 + Math.random() * 0.005;
    if (t === 'ember') {
      this.x = W * 0.2 + Math.random() * W * 0.6; this.y = H + 5;
      this.vx = (Math.random() - 0.5) * 1.8; this.vy = -(Math.random() * 2.5 + 1); this.s = Math.random() * 3 + 1;
    } else if (t === 'orb') {
      this.angle = Math.random() * Math.PI * 2; this.r = 50 + Math.random() * 55;
      this.speed = (Math.random() * 0.01 + 0.004) * (Math.random() > 0.5 ? 1 : -1);
      this.s = Math.random() * 4 + 1.5;
      this.x = W / 2 + Math.cos(this.angle) * this.r; this.y = H / 2 + Math.sin(this.angle) * this.r;
    } else if (t === 'smoke') {
      this.x = W * 0.3 + Math.random() * W * 0.4; this.y = H * 0.6 + Math.random() * H * 0.4;
      this.vx = (Math.random() - 0.5) * 0.6; this.vy = -(Math.random() * 0.8 + 0.2); this.s = Math.random() * 7 + 3;
    } else if (t === 'holy') {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4; this.vy = -(Math.random() * 0.6 + 0.1);
      this.s = Math.random() * 2.5 + 0.5; this.pulse = Math.random() * Math.PI * 2;
    }
  }
  update() {
    this.life -= this.decay;
    if (this.t === 'orb') { this.angle += this.speed; this.x = this.W / 2 + Math.cos(this.angle) * this.r; this.y = this.H / 2 + Math.sin(this.angle) * this.r; }
    else if (this.t === 'smoke') { this.x += this.vx; this.y += this.vy; this.s += 0.04; }
    else if (this.t === 'holy') { this.pulse += 0.05; this.x += this.vx; this.y += this.vy; }
    else { this.x += this.vx; this.y += this.vy; }
    if (this.life <= 0) this.reset();
  }
  draw(ctx) {
    const rgb = _hexRgb(this.a), al = Math.max(0, this.life);
    ctx.save();
    if (this.t === 'smoke') {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.s);
      g.addColorStop(0, `rgba(${rgb},${al * 0.22})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fill();
    } else if (this.t === 'holy') {
      const ps = this.s * (1 + 0.3 * Math.sin(this.pulse));
      ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${rgb},.9)`;
      ctx.fillStyle = `rgba(${rgb},${al * 0.95})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, ps, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(${rgb},${al * 0.3})`; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(this.x - ps * 3, this.y); ctx.lineTo(this.x + ps * 3, this.y);
      ctx.moveTo(this.x, this.y - ps * 3); ctx.lineTo(this.x, this.y + ps * 3); ctx.stroke();
    } else {
      ctx.shadowBlur = 10; ctx.shadowColor = `rgba(${rgb},.8)`;
      ctx.fillStyle = `rgba(${rgb},${al * 0.88})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ══════════════════════════════════════════════════════════
// RADAR SVG BUILDER
// ══════════════════════════════════════════════════════════
const _STAT_LABELS = { HP: '체력', ATK: '공격', DEF: '방어', ECH: '잔향', RHY: '리듬', RES: '공명' };

function _buildRadar(stats, accent, cmp = null, size = 240) {
  const keys = Object.keys(stats), n = keys.length;
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 35;
  const ang = i => (i * 2 * Math.PI / n) - Math.PI / 2;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const toD = pts => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z';
  const sPts = keys.map((k, i) => pt(i, (stats[k] / 100) * maxR));
  const cPath = ''; // cmp 제거됨
  const fid = `glow${accent.replace('#', '')}`;
  const grids = [0.25, 0.5, 0.75, 1].map(lv =>
    `<polygon points="${keys.map((_, i) => { const [x, y] = pt(i, maxR * lv); return `${x},${y}`; }).join(' ')}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1.5"/>`
  ).join('');
  const axes = keys.map((_, i) => { const [x, y] = pt(i, maxR); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.05)" stroke-width="1.5"/>`; }).join('');
  const sPath = `<path d="${toD(sPts)}" fill="${accent}22" stroke="${accent}" stroke-width="2" filter="url(#${fid})"/>`;
  const dots = sPts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${accent}"/>`).join('');
  const lbls = keys.map((k, i) => { const [x, y] = pt(i, maxR + 22); return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="${accent}" font-family="'Courier New',monospace" font-weight="bold">${_STAT_LABELS[k] || k}</text>`; }).join('');
  return `<svg width="${size}" height="${size}" style="overflow:visible"><defs><filter id="${fid}"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${accent}" flood-opacity=".6"/></filter></defs>${grids}${axes}${cPath}${sPath}${dots}${lbls}</svg>`;
}



// ══════════════════════════════════════════════════════════
// PUBLIC EXPORT
// ══════════════════════════════════════════════════════════
export const CharacterSelectUI = {

  // 외부에서 직접 참조할 수 있도록 캐릭터 데이터 노출
  CHARS,

  /**
   * 캐릭터 선택 화면을 초기화하고 마운트합니다.
   *
   * @param {Object} deps
   * @param {Document}  [deps.doc]          - document 인스턴스 (테스트/멀티 윈도우용)
   * @param {Function}  [deps.onConfirm]    - 캐릭터 확정 시 콜백 (selectedChar) => void
   * @param {Function}  [deps.onBack]       - 뒤로가기 콜백 (선택 화면에서 타이틀로)
   * @param {Object}    [deps.audioEngine]  - 프로젝트 오디오 엔진 (있으면 _SFX 대신 사용)
   * @returns {{ destroy: Function }} - 이벤트 리스너 정리 함수 반환
   */
  mount(deps = {}) {
    const doc = _getDoc(deps);
    const S = { idx: 0, phase: 'select', activeSkill: null, typingTimer: null };
    const chars = CHARS;

    // ── 파티클 루프 참조 ───────────────────────────────
    let particles = [], pRaf = null;

    function initParticles(type, accent) {
      cancelAnimationFrame(pRaf);
      const cv = doc.getElementById('particleCanvas');
      if (!cv) return;
      const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
      particles = Array.from({ length: 40 }, () => new _Particle(type, accent, w, h));
      const loop = () => {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        pRaf = requestAnimationFrame(loop);
      };
      loop();
    }

    // ── SFX 래퍼 (deps.audioEngine 우선) ──────────────
    const SFX = {
      nav: () => deps.audioEngine?.playClick?.() ?? _SFX.nav(),
      hover: () => _SFX.hover(),
      select: () => _SFX.select(),
      skill: () => _SFX.skill(),
      skill: () => _SFX.skill(),
      echo: () => _SFX.echo(),
    };

    // ── 유틸리티 ──────────────────────────────────────
    function $(id) { return doc.getElementById(id); }
    function sLabel(txt, ac) {
      return `<span class="s-label" style="border-left:2px solid ${ac}44">${txt}</span>`;
    }

    // ── 모달 ──────────────────────────────────────────
    function openModal(skill, accent) {
      S.activeSkill = skill;
      const isEcho = !!skill.echoCost;
      const tiers = skill.tree.map((t, i) => `
        <div style="padding:16px 20px;border:1px solid ${i === 0 ? accent + '55' : accent + '1a'};border-radius:10px;background:${i === 0 ? accent + '0f' : 'transparent'};display:flex;align-items:flex-start;gap:16px;animation:fadeInUp .3s ease ${i * 0.07}s both">
          <div style="width:28px;height:28px;flex-shrink:0;border-radius:50%;border:2px solid ${i === 0 ? accent : accent + '44'};display:flex;align-items:center;justify-content:center;font-size:12px;color:${i === 0 ? accent : accent + '55'};font-family:'Courier New',monospace;font-weight:bold">${t.tier}</div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-size:15px;color:${i === 0 ? '#fff' : '#555'};letter-spacing:1px">${t.name}</span>
              <span style="padding:2px 10px;border-radius:12px;font-size:11px;background:${accent}1a;color:${accent};font-family:'Courier New',monospace;border:1px solid ${accent}33">${t.bonus}</span>
            </div>
            <p style="font-size:13px;color:${i === 0 ? '#aaa' : '#3a3a50'};margin:0;line-height:1.6">${t.desc}</p>
          </div>
        </div>`).join('');

      const modalBox = $('modalBox');
      if (!modalBox) return;
      modalBox.style.border = `1px solid ${accent}33`;
      modalBox.style.boxShadow = `0 0 80px ${accent}22,0 30px 80px rgba(0,0,0,.8)`;
      modalBox.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <span style="font-size:32px">${skill.icon}</span>
          <div>
            <p style="font-size:10px;letter-spacing:5px;color:#444;font-family:'Courier New',monospace;margin:0">${isEcho ? 'ECHO SKILL TREE' : 'SKILL TREE'}</p>
            <h3 style="font-size:20px;color:#fff;margin:0;letter-spacing:1.5px">${skill.name}</h3>
            ${isEcho ? `<span style="font-size:10px;color:${accent};font-family:'Courier New',monospace">ECH ${skill.echoCost} 소모</span>` : ''}
          </div>
          <button id="modalClose" style="margin-left:auto;background:none;border:none;color:#555;font-size:24px;cursor:pointer">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">${tiers}</div>
        <p style="font-size:11px;color:#222;text-align:center;font-family:'Courier New',monospace;margin:20px 0 0">클릭 또는 ESC로 닫기</p>`;

      $('skillModal').classList.add('open');
      $('modalClose').addEventListener('click', closeModal);
      $('skillModal').addEventListener('click', e => { if (e.target === $('skillModal')) closeModal(); }, { once: true });
    }

    function closeModal() {
      S.activeSkill = null;
      $('skillModal')?.classList.remove('open');
    }

    // ── 카드 렌더 ─────────────────────────────────────
    function renderCard() {
      const ch = chars[S.idx];
      const card = $('charCard');
      if (!card) return;

      card.style.border = `1px solid ${ch.accent}44`;
      card.style.background = `linear-gradient(158deg,${ch.color}18 0%,#060610 50%,${ch.color}08 100%)`;
      card.style.boxShadow = `0 0 65px ${ch.glow}22,inset 0 1px 0 ${ch.accent}18`;

      const cardTitle = $('cardTitle');
      if (cardTitle) { cardTitle.style.color = ch.accent; cardTitle.textContent = ch.title; }
      const cardEmoji = $('cardEmoji');
      if (cardEmoji) { cardEmoji.textContent = ch.emoji; cardEmoji.style.filter = `drop-shadow(0 0 28px ${ch.glow})`; }
      const cardName = $('cardName');
      if (cardName) { cardName.textContent = ch.name; cardName.style.textShadow = `0 0 20px ${ch.glow}`; }
      const cardDiff = $('cardDiff');
      if (cardDiff) cardDiff.textContent = ch.difficulty;
      const cardTraitBadge = $('cardTraitBadge');
      if (cardTraitBadge) {
        cardTraitBadge.textContent = `✦ ${ch.traitName}`;
        cardTraitBadge.style.cssText += `;border:1px solid ${ch.accent}33;color:${ch.accent};background:${ch.accent}0a;`;
      }
      const cardTags = $('cardTags');
      if (cardTags) {
        cardTags.innerHTML = ch.tags.map(t =>
          `<span style="padding:4px 10px;border:1px solid ${ch.accent}22;border-radius:12px;font-size:11px;color:${ch.accent}aa;font-family:'Courier New',monospace;background:${ch.accent}07">${t}</span>`
        ).join('');
      }
      const cardBottomGrad = $('cardBottomGrad');
      if (cardBottomGrad) cardBottomGrad.style.background = `linear-gradient(to top,${ch.color}44,transparent)`;
      const cardShimmer = $('cardShimmer');
      if (cardShimmer) cardShimmer.style.background = `linear-gradient(105deg,transparent 40%,${ch.accent}07 50%,transparent 60%)`;

      // 코너 장식
      card.querySelectorAll('.card-corner').forEach(c => c.remove());
      [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].forEach(([v, h]) => {
        const d = doc.createElement('div');
        d.className = 'card-corner';
        d.style[v] = '9px'; d.style[h] = '9px';
        d.style[`border${v[0].toUpperCase() + v.slice(1)}`] = `1px solid ${ch.accent}77`;
        d.style[`border${h[0].toUpperCase() + h.slice(1)}`] = `1px solid ${ch.accent}77`;
        card.appendChild(d);
      });
    }

    // ── 정보 패널 렌더 ────────────────────────────────
    function renderInfoPanel() {
      const ch = chars[S.idx];
      const panel = $('infoPanel');
      if (!panel) return;

      const rel = ch.startRelic;
      const skillBadges = ch.skills.map((s, si) => `
        <div class="skill-badge">
          <button class="skill-badge-btn" data-si="${si}" style="border:1px solid ${ch.accent}2a;color:${ch.accent};background:${ch.accent}08">${s.icon} ${s.name}</button>
          <div class="skill-tooltip" style="border:1px solid ${ch.accent}33">
            ${s.desc}
            <span style="display:block;font-size:8px;color:${ch.accent};margin-top:2px;font-family:'Courier New',monospace">클릭하여 스킬 트리 보기 →</span>
            <div class="tip-arrow" style="border-top:5px solid ${ch.accent}33"></div>
          </div>
        </div>`).join('');

      const ec = ch.echoSkill;
      panel.innerHTML = `
        <div style="padding:15px 18px;border:1px solid ${ch.accent}22;border-radius:10px;background:${ch.accent}06;margin-bottom:18px">
          ${sLabel('── 고유 특성 ──', ch.accent)}
          <p style="font-size:14px;color:${ch.accent};font-family:'Courier New',monospace;margin:0 0 5px;letter-spacing:1px">${ch.traitTitle}</p>
          <p style="font-size:13px;color:#888;margin:0;line-height:1.7">${ch.traitDesc}</p>
        </div>
        ${sLabel('SKILLS — 클릭 시 스킬 트리', ch.accent)}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:15px">${skillBadges}</div>
        ${sLabel('ECHO SKILL — 잔향 게이지 스킬', ch.accent)}
        <div style="margin-bottom:20px">
          <button id="echoBadge" class="echo-badge" style="background:linear-gradient(135deg,${ch.accent}0e,${ch.color}08);border:1px solid ${ch.accent}44;padding:12px 16px">
            <div style="width:36px;height:36px;flex-shrink:0;border-radius:8px;border:1px solid ${ch.accent}55;background:${ch.accent}14;display:flex;align-items:center;justify-content:center;font-size:18px">${ec.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;color:${ch.accent};font-family:'Courier New',monospace;letter-spacing:1px;margin-bottom:4px">◈ ${ec.name}</div>
              <div style="font-size:11px;color:#666;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ec.desc}</div>
            </div>
            <div style="flex-shrink:0;padding:4px 10px;border:1px solid ${ch.accent}33;border-radius:12px;font-size:10px;color:${ch.accent}99;font-family:'Courier New',monospace;background:${ch.accent}0a">ECH ${ec.echoCost}</div>
          </button>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div>
            ${sLabel('STATS', ch.accent)}
            ${_buildRadar(ch.stats, ch.accent)}
          </div>
            <div style="flex:1;min-width:0">
            ${sLabel('시작 유물', ch.accent)}
            <div style="margin-bottom:18px">
              <div class="relic-wrap">
                <div class="relic-inner" style="border:1px solid ${ch.accent}33;background:${ch.accent}08;padding:10px 16px">
                  <span style="font-size:24px">${rel.icon}</span>
                  <div>
                    <div style="font-size:13px;color:${ch.accent};font-family:'Courier New',monospace;letter-spacing:.5px">${rel.name}</div>
                    <div style="font-size:11px;color:${ch.accent}66;font-family:'Courier New',monospace">유물</div>
                  </div>
                </div>
                <div class="relic-tooltip" style="border:1px solid ${ch.accent}44; width: 220px; padding: 14px 18px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <span style="font-size:18px">${rel.icon}</span>
                    <span style="font-size:13px;color:${ch.accent};font-family:'Courier New',monospace">${rel.name}</span>
                  </div>
                  <div style="font-size:11px;color:#888;line-height:1.6;margin-bottom:10px">${rel.desc}</div>
                  <div style="padding:6px 10px;border:1px solid ${ch.accent}22;border-radius:6px;background:${ch.accent}0a">
                    <span style="font-size:10px;color:${ch.accent}bb;font-family:'Courier New',monospace">✦ 패시브 · ${rel.passive}</span>
                  </div>
                  <div class="tip-arrow" style="border-top:7px solid ${ch.accent}44"></div>
                </div>
              </div>
            </div>
            ${sLabel('시작 덱', ch.accent)}
            <div style="display:flex;flex-wrap:wrap;gap:6px">${ch.startDeck.map(c => `<span class="deck-card" style="border:1px solid ${ch.accent}1a;padding:4px 10px;font-size:11px">${c}</span>`).join('')}</div>
          </div>
        </div>`;

      // 스킬 배지 이벤트
      panel.querySelectorAll('.skill-badge-btn').forEach(btn => {
        const si = parseInt(btn.dataset.si), s = ch.skills[si];
        btn.addEventListener('mouseenter', () => { SFX.hover(); btn.style.borderColor = `${ch.accent}66`; btn.style.color = '#fff'; btn.style.background = `${ch.accent}1a`; btn.style.boxShadow = `0 0 14px ${ch.accent}44`; });
        btn.addEventListener('mouseleave', () => { btn.style.borderColor = `${ch.accent}2a`; btn.style.color = ch.accent; btn.style.background = `${ch.accent}08`; btn.style.boxShadow = 'none'; });
        btn.addEventListener('click', () => { SFX.skill(); openModal(s, ch.accent); });
      });
      // 에코 배지 이벤트
      const eb = $('echoBadge');
      if (eb) {
        eb.addEventListener('mouseenter', () => { SFX.hover(); eb.style.borderColor = `${ch.accent}aa`; eb.style.background = `linear-gradient(135deg,${ch.accent}1e,${ch.color}1a)`; eb.style.boxShadow = `0 0 16px ${ch.accent}33`; });
        eb.addEventListener('mouseleave', () => { eb.style.borderColor = `${ch.accent}44`; eb.style.background = `linear-gradient(135deg,${ch.accent}0e,${ch.color}08)`; eb.style.boxShadow = 'none'; });
        eb.addEventListener('click', () => { SFX.echo(); openModal(ch.echoSkill, ch.accent); });
      }
    }



    // ── 도트 네비게이션 렌더 ──────────────────────────
    function renderDots() {
      const ch = chars[S.idx];
      const dotsRow = $('dotsRow');
      if (!dotsRow) return;
      dotsRow.innerHTML = chars.map((_, i) =>
        `<button class="dot" data-i="${i}"
          style="width:${i === S.idx ? '24px' : '8px'};background:${i === S.idx ? ch.accent : '#151520'};
          box-shadow:${i === S.idx ? `0 0 12px ${ch.accent}66` : 'none'};cursor:${i === S.idx ? 'default' : 'pointer'}"></button>`
      ).join('');
      dotsRow.querySelectorAll('.dot').forEach(btn => {
        const i = parseInt(btn.dataset.i);
        btn.addEventListener('mouseenter', () => { if (i !== S.idx) btn.style.background = '#3a3a55'; });
        btn.addEventListener('mouseleave', () => { if (i !== S.idx) btn.style.background = '#151520'; });
        btn.addEventListener('click', () => jumpTo(i));
      });
    }

    // ── 버튼 렌더 ─────────────────────────────────────
    function renderButtons() {
      buttonsRow.innerHTML = `
        <button id="btnCfm" style="padding:10px 48px;border:1px solid ${ch.accent}55;border-radius:3px;background:linear-gradient(135deg,${ch.color}30,${ch.color}15);color:#fff;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-family:'Courier New',monospace;box-shadow:0 0 22px ${ch.accent}22;transition:all .25s ease">선택 확정 — ${ch.name}</button>`;

      const bf = $('btnCfm');
      bf.addEventListener('mouseenter', () => { SFX.hover(); bf.style.letterSpacing = '5px'; bf.style.boxShadow = `0 0 50px ${ch.accent}44`; bf.style.background = `linear-gradient(135deg,${ch.color}55,${ch.color}2a)`; });
      bf.addEventListener('mouseleave', () => { bf.style.letterSpacing = '3px'; bf.style.boxShadow = `0 0 22px ${ch.accent}22`; bf.style.background = `linear-gradient(135deg,${ch.color}30,${ch.color}15)`; });
      bf.addEventListener('click', handleConfirm);
    }

    // ── 페이즈 오버레이 렌더 ──────────────────────────
    function stopTyping() { if (S.typingTimer) { clearInterval(S.typingTimer); S.typingTimer = null; } }

    function renderPhase() {
      const ch = chars[S.idx];
      const ov = $('phaseOverlay'), ci = $('phaseCircle'), ct = $('phaseContent');
      if (!ov) return;
      ov.className = '';
      if (S.phase === 'select') { ov.style.display = 'none'; return; }
      if (S.phase === 'burst') {
        ov.style.display = 'flex'; ov.className = 'burst';
        ci.style.background = `radial-gradient(circle,${ch.accent}55 0%,${ch.color}22 35%,transparent 60%)`;
        ci.style.width = '0'; ci.style.height = '0'; ct.innerHTML = '';
        setTimeout(() => { ci.style.width = '250vw'; ci.style.height = '250vw'; }, 20);
        return;
      }
      if (S.phase === 'done') {
        ov.style.display = 'flex'; ov.className = 'done';
        ci.style.width = '250vw'; ci.style.height = '250vw';
        ci.style.background = `radial-gradient(circle,${ch.accent}55 0%,${ch.color}22 35%,transparent 60%)`;
        ct.innerHTML = `
          <div style="font-size:clamp(60px,12vw,100px);margin-bottom:15px;filter:drop-shadow(0 0 60px ${ch.glow});animation:float 3s ease-in-out infinite">${ch.emoji}</div>
          <p style="font-size:11px;letter-spacing:8px;color:#334;font-family:'Courier New',monospace;margin:0 0 8px">YOUR HERO</p>
          <h2 style="font-size:clamp(32px,7vw,58px);font-weight:900;letter-spacing:6px;margin:0 0 6px;text-shadow:0 0 60px ${ch.glow}">${ch.name}</h2>
          <p style="font-size:14px;letter-spacing:6px;color:${ch.accent};font-family:'Courier New',monospace;margin:0 0 8px">${ch.title}</p>
          <p style="font-size:13px;color:#445;font-family:'Courier New',monospace;margin:0 0 20px;letter-spacing:2px">고유 특성 · ${ch.traitName}</p>
          <div id="typedArea" style="font-size:clamp(12px,1.5vw,16px);color:#778;line-height:2.4;font-family:'Courier New',monospace;letter-spacing:1px;min-height:7em;margin-bottom:30px;white-space:pre-line"></div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:15px">${ch.tags.map(t => `<span style="padding:4px 16px;border:1px solid ${ch.accent}44;border-radius:24px;font-size:12px;color:${ch.accent};font-family:'Courier New',monospace;background:${ch.accent}0e">${t}</span>`).join('')}</div>
          <p style="font-size:13px;color:#556;font-family:'Courier New',monospace;margin:0 0 30px">시작 유물: ${ch.startRelic.icon} ${ch.startRelic.name}</p>
          <div style="display:flex;gap:20px;justify-content:center;margin-top:15px;">
            <button id="btnResel" style="padding:12px 32px;border:1px solid #1a1a28;border-radius:4px;background:transparent;color:#555;font-size:12px;letter-spacing:4px;font-family:'Courier New',monospace;cursor:pointer;transition:all .2s">← 다시 선택</button>
            <button id="btnRealStart" style="padding:12px 48px;border:1px solid ${ch.accent}55;border-radius:4px;background:linear-gradient(135deg,${ch.color}55,${ch.color}22);color:#fff;font-size:14px;letter-spacing:5px;font-family:'Courier New',monospace;cursor:pointer;box-shadow:0 0 30px ${ch.accent}33;transition:all .2s">여정 시작 →</button>
          </div>`;

        stopTyping();
        let i = 0;
        const txt = ch.story;
        S.typingTimer = setInterval(() => {
          const el = $('typedArea');
          if (!el) { stopTyping(); return; }
          i++;
          el.innerHTML = txt.slice(0, i).replace(/\n/g, '<br>') + `<span style="animation:blink 1s step-end infinite;color:${ch.accent}">█</span>`;
          if (i >= txt.length) stopTyping();
        }, 55);

        const rb = $('btnResel');
        if (rb) {
          rb.addEventListener('mouseenter', () => { rb.style.color = '#ccc'; rb.style.borderColor = '#555'; });
          rb.addEventListener('mouseleave', () => { rb.style.color = '#333'; rb.style.borderColor = '#1a1a28'; });
          rb.addEventListener('click', () => { S.phase = 'select'; stopTyping(); renderPhase(); });
        }
        const sb = $('btnRealStart');
        if (sb) {
          sb.addEventListener('mouseenter', () => { sb.style.boxShadow = `0 0 40px ${ch.accent}66`; sb.style.background = `linear-gradient(135deg,${ch.color}77,${ch.color}44)`; });
          sb.addEventListener('mouseleave', () => { sb.style.boxShadow = `0 0 20px ${ch.accent}33`; sb.style.background = `linear-gradient(135deg,${ch.color}55,${ch.color}22)`; });
          sb.addEventListener('click', () => {
            deps.onStart?.(chars[S.idx]);
          });
        }
      }
    }

    // ── 네비게이션 ────────────────────────────────────
    function setVisible(v, dir) {
      const card = $('charCard'), panel = $('infoPanel');
      if (!card || !panel) return;
      if (v) {
        card.style.opacity = '1'; card.style.transform = 'perspective(600px) scale(1)';
        panel.style.opacity = '1'; panel.style.transform = 'translateX(0)';
      } else {
        card.style.opacity = '0'; card.style.transform = `perspective(600px) translateX(${dir === 1 ? '-44px' : '44px'}) scale(.92)`;
        panel.style.opacity = '0'; panel.style.transform = 'translateX(16px)';
      }
    }

    function go(dir) {
      if (S.phase !== 'select') return;
      SFX.nav(); setVisible(false, dir);
      setTimeout(() => {
        S.idx = (S.idx + dir + chars.length) % chars.length;
        updateAll(); setVisible(true);
      }, 250);
    }

    function jumpTo(i) {
      if (i === S.idx || S.phase !== 'select') return;
      SFX.nav(); setVisible(false, 0);
      setTimeout(() => { S.idx = i; updateAll(); setVisible(true); }, 250);
    }



    function handleConfirm() {
      if (S.phase !== 'select') return;
      SFX.select(); S.phase = 'burst'; renderPhase();
      setTimeout(() => {
        S.phase = 'done'; renderPhase();
        deps.onConfirm?.(chars[S.idx]);
      }, 650);
    }

    function updateAll() {
      renderCard(); renderInfoPanel(); renderDots(); renderButtons();
      const bgGradient = $('bgGradient');
      if (bgGradient) bgGradient.style.background = `radial-gradient(ellipse 70% 65% at 50% 50%,${chars[S.idx].glow}10 0%,transparent 70%)`;
      const headerTitle = $('headerTitle');
      if (headerTitle) headerTitle.style.textShadow = `0 0 40px ${chars[S.idx].glow}44`;
      initParticles(chars[S.idx].particle, chars[S.idx].accent);
      updateArrows();
    }

    function updateArrows() {
      const ac = chars[S.idx].accent;
      ['btnLeft', 'btnRight'].forEach(id => {
        const b = $(id);
        if (!b) return;
        b.style.border = `1px solid ${ac}44`; b.style.background = `${ac}08`;
        b.style.boxShadow = `0 0 16px ${ac}22`; b.style.color = ac;
      });
    }

    // ── 카드 틸트 & 포일 ──────────────────────────────
    function initCardFX() {
      const card = $('charCard');
      if (!card) return;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
        const angle = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
        card.style.transform = `perspective(600px) rotateX(${((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -10}deg) rotateY(${((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 10}deg)`;
        const cardFoil = $('cardFoil');
        if (cardFoil) cardFoil.style.background = `conic-gradient(from ${angle}deg at ${x}% ${y}%,#ff000015,#ff7f0015,#ffff0015,#00ff0015,#0000ff15,#8b00ff15,#ff007f15,#ff000015)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
        const cardFoil = $('cardFoil');
        if (cardFoil) cardFoil.style.background = 'none';
      });
    }

    // ── 드래그 & 스와이프 ─────────────────────────────
    let dragX = null, touchX = null;
    function initDrag() {
      doc.addEventListener('mousedown', e => { if (!$('skillModal')?.classList.contains('open')) dragX = e.clientX; });
      doc.addEventListener('mouseup', e => {
        if (dragX === null) return; const dx = e.clientX - dragX; dragX = null;
        if (Math.abs(dx) > 80) go(dx < 0 ? 1 : -1);
      });
      doc.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
      doc.addEventListener('touchend', e => {
        if (touchX === null) return; const dx = e.changedTouches[0].clientX - touchX; touchX = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      });
    }

    // ── 키보드 ────────────────────────────────────────
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Enter' && S.phase === 'select' && !S.activeSkill) handleConfirm();
    }
    doc.addEventListener('keydown', onKeyDown);

    function initArrows() {
      const setup = (id, dir) => {
        const b = $(id);
        if (!b) return;
        b.addEventListener('click', () => go(dir));
        b.addEventListener('mouseenter', () => { SFX.hover(); const ac = chars[S.idx].accent; b.style.background = `${ac}22`; b.style.transform = 'scale(1.1)'; b.style.boxShadow = `0 0 30px ${ac}55`; });
        b.addEventListener('mouseleave', () => { const ac = chars[S.idx].accent; b.style.background = `${ac}08`; b.style.transform = 'scale(1)'; b.style.boxShadow = `0 0 16px ${ac}22`; });
      };
      setup('btnLeft', -1);
      setup('btnRight', 1);
    }

    updateAll();
    initCardFX();
    initDrag();
    initArrows();
    setTimeout(() => doc.querySelectorAll('.intro').forEach(el => el.classList.add('mounted')), 80);

    return {
      destroy() {
        doc.removeEventListener('keydown', onKeyDown);
        stopTyping();
        cancelAnimationFrame(pRaf);
      }
    };
  }
};
