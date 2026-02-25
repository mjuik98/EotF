# ECHO OF THE FALLEN — 코드 리뷰 보고서

**프로젝트**: Roguelike Deckbuilder Game  
**리뷰 일자**: 2026 년 2 월 25 일  
**리뷰 범위**: 전체 코드베이스 (아키텍처, 성능, 보안, 유지보수성)

---

## 📋 목차

1. [executive-summary](#executive-summary)
2. [아키텍처-및-구조](#아키텍처 - 및 - 구조)
3. [코드-품질-및-가독성](#코드-품질 - 및 -가독성)
4. [성능-최적화](#성능 - 최적화)
5. [보안-취약점](#보안 - 취약점)
6. [유지보수성](#유지보수성)
7. [구체적-리팩토링-제안](#구체적 - 리팩토링 - 제안)
8. [종합-평가](#종합 - 평가)
9. [액션-플랜](#액션 - 플랜)

---

## Executive Summary

본 프로젝트는 **매우 잘 구조화된 Roguelike 덱빌딩 게임**으로, 모듈화된 UI 아키텍처와 중앙 상태 관리 패턴을 올바르게 적용하고 있습니다. 그러나 프로덕션 레벨로 향상시키기 위해 해결해야 할 몇 가지 중요한 문제점이 있습니다.

### 핵심 발견사항

| 항목 | 상태 | 우선순위 |
|------|------|----------|
| 아키텍처 | 🟡 양호 | 높음 |
| 코드 품질 | 🟡 보통 | 중간 |
| 성능 | 🟢 양호 | 낮음 |
| 보안 | 🔴 주의 필요 | **매우 높음** |
| 유지보수성 | 🟡 보통 | 중간 |
| 확장성 | 🟢 양호 | 낮음 |

**종합 점수: 6.3 / 10**

---

## 아키텍처 및 구조

### ✅ 잘한 점

#### 1. 모듈화된 UI 아키텍처
```
game/
├── combat_ui.js          # 전투 UI 전담
├── card_ui.js            # 카드 렌더링 전담
├── echo_skill_ui.js      # Echo 스킬 전담
├── hud_update_ui.js      # HUD 갱신 전담
└── ... (40+ 개 모듈)
```
각 모듈이 **단일 책임 원칙 (SRP)**을 잘 따르고 있습니다.

#### 2. 중앙 상태 관리
```javascript
// game_state.js
export const GS = {
  currentScreen: 'title',
  meta: { /* 메타 데이터 */ },
  player: { /* 플레이어 상태 */ },
  combat: { /* 전투 상태 */ }
};
```
`GS` 객체를 통한 **단일 진실 공급원 (Single Source of Truth)** 구현.

#### 3. 의존성 주입 패턴
```javascript
// main.js
function renderCombatCards(deps = {}) {
  const gs = deps.gs || window.GS;
  const data = deps.data || window.DATA;
  // ...
}
```
모듈 간 결합도를 낮추는 **의존성 주입 (DI)** 적용.

### ⚠️ 개선 필요 사항

#### 1. 전역 함수 노출 문제 🔴

**현재 상태:**
```javascript
// main.js - 50+ 개 전역 함수 노출
window.renderCombatCards = renderCombatCards;
window.handleCardDragStart = handleCardDragStart;
window.showIntentTooltip = showIntentTooltip;
window.selectTarget = selectTarget;
// ...
```

**문제점:**
- 전역 스코프 오염으로 인한 **변수 충돌 위험**
- **의존 관계 파악 어려움**
- **테스트 작성困難**

**개선안:**
```javascript
// GAME 객체로 통합
const GAME = {
  Modules: {},
  
  register(moduleName, moduleObj) {
    this.Modules[moduleName] = moduleObj;
  },
  
  require(moduleName) {
    const mod = this.Modules[moduleName];
    if (!mod) throw new Error(`Missing: ${moduleName}`);
    return mod;
  }
};

// 사용
GAME.register('CombatCards', {
  render: () => { /* ... */ },
  handleDragStart: (e, id, idx) => { /* ... */ }
});
```

---

#### 2. 순환 참조 가능성 🟡

**현재 상태:**
```
main.js 
  → combat_ui.js 
    → game_state_core_methods.js 
      → main.js (window 함수 호출)
```

**문제점:**
- 모듈 간 **의존 사이클** 발생 가능
- **초기화 순서**에 민감해짐

**개선안:**
```javascript
// 의존성 방향을 단방향으로
game_state.js (상태만)
    ↓
game_methods.js (로직)
    ↓
ui_modules.js (UI)
    ↓
main.js (조정자)
```

---

#### 3. God Object 문제 🟡

**현재 상태:**
```javascript
// game_state_core_methods.js - 742 줄
export const GameStateCoreMethods = {
  dealDamage() { /* 150 줄 */ },
  playCard() { /* 120 줄 */ },
  takeDamage() { /* 100 줄 */ },
  // ... 30+ 개 메서드
};
```

**문제점:**
- **단일 파일에 로직 집중**
- **병합 충돌** 발생 확률 증가
- **테스트 어려움**

**개선안:**
```javascript
// 기능별 분할
export const CombatMethods = {
  dealDamage() { /* ... */ },
  takeDamage() { /* ... */ },
  applyStatus() { /* ... */ }
};

export const CardMethods = {
  playCard() { /* ... */ },
  drawCards() { /* ... */ },
  discardCards() { /* ... */ }
};

export const PlayerMethods = {
  heal() { /* ... */ },
  addBuff() { /* ... */ },
  addGold() { /* ... */ }
};
```

---

## 코드 품질 및 가독성

### ✅ 잘한 점

#### 1. 일관된 네이밍 컨벤션
```javascript
// UI 모듈: *UI 접미사
CombatUI, CardUI, EchoSkillUI, HudUpdateUI

// 상수: 대문자 스네이크케이스
CONSTANTS, TRIGGER, NODE_META
```

#### 2. 키워드 하이라이팅 시스템
```javascript
// description_utils.js
highlight(text) {
  return text
    .replace(/(\d+) 피해/g, '<span class="kw-dmg">$1 피해</span>')
    .replace(/방어막 (\d+)/g, '방어막 <span class="kw-shield">$1</span>');
}
```

#### 3. 상세한 한국어 주석
```javascript
// ═══════════════════════════════════════════════
//  ECHO OF THE FALLEN v2 — 완전 통합 코드베이스
//  모든 Phase 1~4 기능을 단일 아키텍처로 통합
// ═══════════════════════════════════════════════
```

### ⚠️ 개선 필요 사항

#### 1. 방어적 코딩 과다

**현재 상태:**
```javascript
// 50+ 곳에서 반복
if (typeof window.HudUpdateUI !== 'undefined' && 
    typeof window.HudUpdateUI.triggerDeckShufflePulse === 'function') {
  window.HudUpdateUI.triggerDeckShufflePulse();
}
```

**개선안:**
```javascript
// 안전한 접근 패턴
GAME.API.triggerDeckShufflePulse?.();

// 또는
const api = GAME.API;
if (api.triggerDeckShufflePulse) {
  api.triggerDeckShufflePulse();
}
```

---

#### 2. 일관성 없는 Export 패턴

**현재 상태:**
```javascript
// 패턴 1: export const
export const CombatUI = { /* ... */ };

// 패턴 2: window 직접 할당
window.renderCombatCards = renderCombatCards;

// 패턴 3: default export 없음
export default CombatUI; // 일부만 해당
```

**개선안:**
```javascript
// 통일된 패턴 적용
export const CombatUI = { /* ... */ };
export const CardUI = { /* ... */ };

// 또는
export default {
  CombatUI,
  CardUI,
  // ...
};
```

---

#### 3. JSDoc 문서화 부재

**현재 상태:**
```javascript
// 주석 없음
playCard(cardId, handIdx) {
  // ...
}
```

**개선안:**
```javascript
/**
 * 카드를 사용하고 효과를 발동합니다.
 * 
 * @param {string} cardId - 사용할 카드의 식별자
 * @param {number} handIdx - 손패에서의 카드 인덱스
 * @returns {boolean} 카드 사용 성공 여부
 * 
 * @example
 * GS.playCard('strike', 0); // 첫 번째 카드로 '강타' 사용
 * 
 * @throws {Error} 에너지가 부족한 경우
 */
playCard(cardId, handIdx) {
  // ...
}
```

---

## 성능 최적화

### ✅ 잘한 점

#### 1. 부분 DOM 업데이트
```javascript
// combat_ui.js
function updateEnemyHpUI(idx, enemy) {
  const fill = document.getElementById(`enemy_hpfill_${idx}`);
  const txt = document.getElementById(`enemy_hptext_${idx}`);
  // HP 바와 텍스트만 선택적 갱신
}
```

#### 2. 조건부 렌더링
```javascript
// combat_ui.js
const needsFullRender = existing.length !== expectedCount;

if (needsFullRender) {
  // 전체 렌더링
} else {
  // 개별 업데이트만
}
```

#### 3. requestAnimationFrame 활용
```javascript
// game_loop.js
function gameLoop(timestamp) {
  WorldRenderLoopUI.gameLoop(timestamp, deps);
  requestAnimationFrame(gameLoop);
}
```

### ⚠️ 개선 필요 사항

#### 1. 매 프레임 DOM 쿼리 🟡

**현재 상태:**
```javascript
// gameLoop 에서 매 프레임 실행
function renderGameWorld(dt, ctx, w, h) {
  const zone = document.getElementById('enemyZone');
  const cards = document.getElementById('combatHandCards');
  // ...
}
```

**개선안:**
```javascript
// 참조 캐싱
const DOMCache = {
  enemyZone: null,
  combatHandCards: null,
  
  init() {
    this.enemyZone = document.getElementById('enemyZone');
    this.combatHandCards = document.getElementById('combatHandCards');
  }
};

// 사용
function renderGameWorld(dt, ctx, w, h) {
  const zone = DOMCache.enemyZone;
  // ...
}
```

---

#### 2. 메모리 누수 위험 🟡

**현재 상태:**
```javascript
// 이벤트 리스너 제거 없음
element.addEventListener('click', handler);

// setTimeout 정리 없음
setTimeout(() => { /* ... */ }, 1000);
```

**개선안:**
```javascript
// 클린업 함수 제공
const CombatUI = {
  listeners: [],
  timeouts: [],
  
  init() {
    element.addEventListener('click', handler);
    this.listeners.push({ element, event: 'click', handler });
    
    const id = setTimeout(() => { /* ... */ }, 1000);
    this.timeouts.push(id);
  },
  
  destroy() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.timeouts.forEach(id => clearTimeout(id));
  }
};
```

---

#### 3. Canvas 리플로우 해킹 🟡

**현재 상태:**
```javascript
// Reflow 강제
void element.offsetWidth;
element.style.animation = 'none';
```

**문제점:**
- 브라우저 최적화 우회
- 성능 저하 가능성

**개선안:**
```javascript
// CSS 클래스 토글
element.classList.remove('hit');
requestAnimationFrame(() => {
  element.classList.add('hit');
});
```

---

## 보안 취약점

### 🔴 심각: XSS 취약점

#### 1. innerHTML 직접 사용

**현재 상태:**
```javascript
// event_ui.js
el.innerHTML = `
  <div class="event-desc">${event.desc}</div>
  <div class="event-choices">${event.choices}</div>
`;

// combat_ui.js
el.innerHTML = `
  <div class="enemy-name">${e.name}</div>
`;
```

**위험성:**
```javascript
// 악의적인 이벤트 데이터 주입 가능
{
  desc: '<img src=x onerror="alert(\'XSS\')">',
  name: '<script>stealSaveData()</script>'
}
```

**개선안:**
```javascript
// 텍스트 노드 사용
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

el.innerHTML = `
  <div class="event-desc">${escapeHtml(event.desc)}</div>
`;

// 또는
const descEl = document.createElement('div');
descEl.className = 'event-desc';
descEl.textContent = event.desc; // 자동 이스케이프
el.appendChild(descEl);
```

---

#### 2. localStorage 무결성 검증 부재

**현재 상태:**
```javascript
// save_adapter.js
save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
},

load(key) {
  return JSON.parse(localStorage.getItem(key));
}
```

**위험성:**
- **데이터 변조** 가능
- **타입 불일치**로 인한 크래시

**개선안:**
```javascript
// 스키마 검증 추가
const SaveSchema = {
  player: {
    hp: 'number',
    maxHp: 'number',
    deck: 'array',
    // ...
  }
};

function validateSaveData(data) {
  if (!data.player || typeof data.player.hp !== 'number') {
    throw new Error('Invalid save data');
  }
  // 추가 검증...
  return true;
}

save(key, data) {
  if (!validateSaveData(data)) {
    console.error('Invalid save data');
    return;
  }
  localStorage.setItem(key, JSON.stringify(data));
},

load(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    validateSaveData(data);
    return data;
  } catch (e) {
    console.error('Save data corrupted:', e);
    return null;
  }
}
```

---

#### 3. onclick 문자열 생성

**현재 상태:**
```javascript
// combat_ui.js
el.innerHTML = `
  <button onclick="selectTarget(${i})">Target</button>
`;
```

**개선안:**
```javascript
// 이벤트 리스너 직접 바인딩
const button = document.createElement('button');
button.textContent = 'Target';
button.addEventListener('click', () => selectTarget(i));
el.appendChild(button);
```

---

## 유지보수성

### ✅ 잘한 점

#### 1. 데이터 기반 설계
```javascript
// game_data.js
cards: {
  strike: {
    id: 'strike',
    name: '강타',
    cost: 1,
    type: 'ATTACK',
    desc: '9 피해',
    effect(gs) { gs.dealDamage(9); }
  }
}
```
새 카드 추가가 **데이터 추가만**으로 가능합니다.

#### 2. 기능별 디렉토리 분리
```
game/
├── constants/      # 상수 정의
├── engine/         # 코어 엔진
└── game/           # 게임 로직
    ├── combat_*.js # 전투 관련
    ├── card_*.js   # 카드 관련
    └── map_*.js    # 맵 관련
```

### ⚠️ 개선 필요 사항

#### 1. 하드코딩된 값

**현재 상태:**
```javascript
// 지역 ID 직접 사용
if (getBaseRegionIndex(this.currentRegion) === 1) {
  // 침묵의 도시 로직
}

// 수치 하드코딩
if (this.player.silenceGauge >= 10) {
  // ...
}
```

**개선안:**
```javascript
// constants.js
export const REGION_IDS = {
  FOREST: 0,
  SILENT_CITY: 1,
  VOID_REALM: 2
};

export const SILENCE = {
  MAX_GAUGE: 10,
  GUARDIAN_SPAWN_THRESHOLD: 10
};

// 사용
if (getBaseRegionIndex(this.currentRegion) === REGION_IDS.SILENT_CITY) {
  // ...
}
```

---

#### 2. 교차 모듈 의존성

**현재 상태:**
```javascript
// CombatTurnUI 가 의존하는 모듈 (10+)
import { GS } from './game_state.js';
import { DATA } from '../data/game_data.js';
// window.AudioEngine, window.ParticleSystem, window.ScreenShake...
```

**개선안:**
```javascript
// 의존성을 deps 로 명시
export const CombatTurnUI = {
  enemyTurn(deps) {
    const { gs, data, audio, particles, screenShake } = deps;
    // 명시적 의존성
  }
};
```

---

#### 3. 테스트 코드 부재

**권장 사항:**
```javascript
// tests/unit/card_cost.test.js
import { CardCostUtils } from '../../game/card_cost_utils.js';

describe('CardCostUtils', () => {
  describe('calcEffectiveCost', () => {
    it('할인이 없을 경우 원래 비용을 반환한다', () => {
      const card = { cost: 2 };
      const player = { costDiscount: 0 };
      expect(CardCostUtils.calcEffectiveCost('test', card, player)).toBe(2);
    });
    
    it('할인이 적용된 비용을 계산한다', () => {
      const card = { cost: 3 };
      const player = { costDiscount: 1 };
      expect(CardCostUtils.calcEffectiveCost('test', card, player)).toBe(2);
    });
  });
});
```

---

## 구체적 리팩토링 제안

### 우선순위 1: 전역 상태 관리 개선 🔴

#### 현재 문제
```javascript
// 50+ 개 전역 함수
window.renderCombatCards = renderCombatCards;
window.handleCardDragStart = handleCardDragStart;
window.showIntentTooltip = showIntentTooltip;
// ...
```

#### 리팩토링 계획

**Step 1: GAME 객체 정의**
```javascript
// game/core.js
export const GAME = {
  State: null,
  Data: null,
  Modules: {},
  API: {},
  
  init(global) {
    this.State = GS;
    this.Data = DATA;
    global.GAME = this;
  },
  
  register(name, module) {
    this.Modules[name] = module;
    if (module.api) {
      Object.assign(this.API, module.api);
    }
  },
  
  getDeps() {
    return {
      gs: this.State,
      data: this.Data,
      audio: AudioEngine,
      particles: ParticleSystem,
      api: this.API
    };
  }
};
```

**Step 2: 모듈 등록**
```javascript
// combat_ui.js
export const CombatUI = {
  renderEnemies(deps) { /* ... */ },
  updateHp(deps) { /* ... */ },
  
  api: {
    renderEnemies: CombatUI.renderEnemies,
    updateHp: CombatUI.updateHp
  }
};

// main.js
GAME.register('CombatUI', CombatUI);
```

**Step 3: 사용처 변경**
```javascript
// ❌ 이전
window.renderCombatCards();

// ✅ 이후
GAME.API.renderEnemies(GAME.getDeps());
```

---

### 우선순위 2: GS 객체 분할 🟡

#### 현재 문제
```javascript
// 742 줄 God Object
export const GameStateCoreMethods = {
  dealDamage() { /* 150 줄 */ },
  playCard() { /* 120 줄 */ },
  takeDamage() { /* 100 줄 */ },
  // ... 30+ 개 메서드
};
```

#### 리팩토링 계획

**Step 1: 상태와 로직 분리**
```javascript
// game_state.js - 순수 상태만
export const GS = {
  currentScreen: 'title',
  player: {
    class: 'swordsman',
    hp: 80,
    maxHp: 80,
    // ...
  },
  combat: {
    active: false,
    enemies: [],
    // ...
  }
};
```

**Step 2: 기능별 로직 분할**
```javascript
// methods/combat_methods.js
export const CombatMethods = {
  dealDamage(amount, targetIdx = null) {
    // ...
  },
  
  takeDamage(amount) {
    // ...
  },
  
  applyStatus(target, status, duration) {
    // ...
  }
};

// methods/card_methods.js
export const CardMethods = {
  playCard(cardId, handIdx) {
    // ...
  },
  
  drawCards(count = 1) {
    // ...
  },
  
  discardCards(count) {
    // ...
  }
};
```

**Step 3: GS 에 바인딩**
```javascript
// game_state.js
import { CombatMethods } from './methods/combat_methods.js';
import { CardMethods } from './methods/card_methods.js';

Object.assign(GS, CombatMethods, CardMethods);

export { GS };
```

---

### 우선순위 3: 타입 안전성 추가 🟡

#### JSDoc 적용
```javascript
/**
 * @typedef {Object} Player
 * @property {string} class - 플레이어 클래스
 * @property {number} hp - 현재 체력
 * @property {number} maxHp - 최대 체력
 * @property {number} energy - 현재 에너지
 * @property {string[]} hand - 손패 카드 ID 목록
 */

/**
 * @typedef {Object} Card
 * @property {string} id - 카드 식별자
 * @property {string} name - 카드 이름
 * @property {number} cost - 에너지 비용
 * @property {'ATTACK'|'SKILL'|'POWER'} type - 카드 타입
 * @property {string} desc - 카드 설명
 * @property {(gs: GS) => void} effect - 카드 효과 함수
 */

/**
 * 카드를 사용하고 효과를 발동합니다.
 * 
 * @param {string} cardId - 사용할 카드의 식별자
 * @param {number} handIdx - 손패에서의 카드 인덱스
 * @returns {boolean} 카드 사용 성공 여부
 * 
 * @example
 * GS.playCard('strike', 0); // 첫 번째 카드로 '강타' 사용
 */
playCard(cardId, handIdx) {
  // ...
}
```

---

### 우선순위 4: 에러 핸들링 🟡

#### 현재 문제
```javascript
// 에러를 무시
try {
  action = enemy.ai(gs.combat.turn);
} catch (e) {
  // 아무것도 안 함
}
```

#### 개선안
```javascript
// game/error_handler.js
export const ErrorHandler = {
  context: 'unknown',
  
  setContext(ctx) {
    this.context = ctx;
  },
  
  handle(error, fallback = null) {
    console.error(`[Error:${this.context}]`, error);
    
    // 프로덕션에서는 사용자에게 친리적 메시지
    if (process.env.NODE_ENV === 'production') {
      // 사용자 알림 로직
    }
    
    return fallback;
  }
};

// 사용
try {
  ErrorHandler.setContext('CombatTurn.enemyAction');
  action = enemy.ai(gs.combat.turn);
} catch (e) {
  action = ErrorHandler.handle(e, { 
    type: 'strike', 
    intent: `공격 ${enemy.atk}`, 
    dmg: enemy.atk 
  });
}
```

---

## 종합 평가

| 항목 | 점수 | 코멘트 |
|------|------|--------|
| **아키텍처** | 7/10 | 모듈화는 우수하나 전역 의존성 문제 |
| **코드 품질** | 6/10 | 가독성은 좋으나 중복 코드 많음 |
| **성능** | 7/10 | 부분 최적화 되어있으나 개선 여지 있음 |
| **보안** | 5/10 | XSS 및 입력 검증 취약점 존재 |
| **유지보수성** | 6/10 | 분리는 되어있으나 문서화/테스트 부재 |
| **확장성** | 7/10 | 데이터 기반 설계로 확장 용이 |

### 📊 총점: 6.3 / 10

**평가**: 기능적으로 완성되었으나, 프로덕션 레벨로 향상하려면 리팩토링 필요

---

## 액션 플랜

### Phase 1 (즉시 — 1 주) 🔴

| 작업 | 예상 시간 | 우선순위 |
|------|----------|----------|
| 전역 함수를 `GAME.API` 로 통합 | 8 시간 | **매우 높음** |
| `innerHTML` 사용처에 이스케이프 함수 적용 | 4 시간 | **매우 높음** |
| JSDoc 주석 추가 (핵심 함수부터) | 12 시간 | 높음 |
| localStorage 검증 로직 추가 | 4 시간 | 높음 |

**체크리스트:**
- [ ] `GAME` 코어 객체 구현
- [ ] 주요 모듈 `GAME.register()` 로 이전
- [ ] `escapeHtml()` 유틸리티 함수 추가
- [ ] 모든 `innerHTML` 사용처 검토
- [ ] SaveSystem 검증 로직 구현
- [ ] 핵심 함수 20 개에 JSDoc 추가

---

### Phase 2 (단기 — 2-4 주) 🟡

| 작업 | 예상 시간 | 우선순위 |
|------|----------|----------|
| `GS` 객체 기능별 분할 | 16 시간 | 높음 |
| 단위 테스트 프레임워크 도입 | 12 시간 | 중간 |
| 빌드 파이프라인 추가 | 8 시간 | 중간 |
| 에러 핸들링 시스템 구축 | 8 시간 | 중간 |

**체크리스트:**
- [ ] Vitest 또는 Jest 설치
- [ ] `GameStateCoreMethods` 분할
- [ ] Vite 또는 Webpack 설정
- [ ] `ErrorHandler` 유틸리티 구현
- [ ] 핵심 유틸리티 테스트 작성 (카드 비용, 확률 등)
- [ ] CI 파이프라인 설정 (GitHub Actions)

---

### Phase 3 (중기 — 1-2 개월) 🟢

| 작업 | 예상 시간 | 우선순위 |
|------|----------|----------|
| TypeScript 전환 검토 | 40 시간 | 낮음 |
| 상태 관리 라이브러리 도입 | 16 시간 | 낮음 |
| CI/CD 파이프라인 구축 | 12 시간 | 낮음 |
| 성능 프로파일링 및 최적화 | 16 시간 | 낮음 |

**체크리스트:**
- [ ] TypeScript 전환 타당성 검토
- [ ] Zustand 또는 Redux 도입 검토
- [ ] GitHub Actions CI/CD 설정
- [ ] Lighthouse 성능 측정
- [ ] 번들 사이즈 최적화
- [ ] 코드 스플리팅 적용

---

### Phase 4 (장기 — 3 개월+) 🟢

| 작업 | 예상 시간 | 우선순위 |
|------|----------|----------|
| E2E 테스트 도입 | 24 시간 | 낮음 |
| 성능 모니터링 시스템 | 16 시간 | 낮음 |
| 자동화 문서화 | 12 시간 | 낮음 |
| 플러그인 아키텍처 검토 | 20 시간 | 낮음 |

---

## 부록: 유용한 스크립트

### 1. 전역 함수 검색 스크립트
```bash
# Windows PowerShell
Get-ChildItem -Recurse -Filter *.js | 
  Select-String -Pattern "window\." | 
  Select-Object -First 50
```

### 2. XSS 취약점 검색
```bash
# innerHTML 사용처 검색
grep -r "innerHTML" --include="*.js" ./game/ ./engine/
```

### 3. 코드 메트릭스 (권장)
```bash
# ESLint 설치 및 실행
npm install -D eslint
npx eslint ./game/ ./engine/
```

---

## 참고 자료

- [MDN Web Docs — XSS](https://developer.mozilla.org/ko/docs/Glossary/Cross-site_scripting)
- [JavaScript Info — Modules](https://javascript.info/modules)
- [Refactoring Guru](https://refactoring.guru/)
- [Eloquent JavaScript](https://eloquentjavascript.net/)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026 년 2 월 25 일  
**작성자**: AI Code Reviewer
