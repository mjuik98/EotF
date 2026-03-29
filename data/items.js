/*
 * items.js — 아이템/유물 데이터
 *
 * desc 작성 규칙
 *
 * [목적]
 * - 플레이어가 유물 효과를 한눈에 이해할 수 있도록 짧고 일관된 문장으로 작성한다
 * - desc는 코드 로직 설명문이 아니라 플레이어용 효과 설명문으로 작성한다
 * - 같은 유형의 효과는 항상 같은 문장 구조와 용어를 사용한다
 * - 짧더라도 발동 조건, 대상, 수치 중 핵심 정보는 반드시 남긴다
 * - 세트 정보는 효과 본문과 분리하여 보이도록 작성한다
 *
 * ─────────────────────────────────────
 * 1. 기본 원칙
 * ─────────────────────────────────────
 * 1) desc는 짧고 즉시 이해 가능해야 한다
 * 2) 구현 방식이 아니라 플레이 결과를 기준으로 작성한다
 * 3) 한 문장에는 가능한 한 하나의 규칙만 담는다
 * 4) 복합 효과는 문장을 늘이지 말고 ' / ' 로 구분한다
 * 5) 실제 코드 동작과 다른 과장 표현을 금지한다
 * 6) 플레이 판단에 필요 없는 내부 처리 설명은 생략한다
 * 7) 세트 아이템은 효과와 세트 소속을 한 줄에 섞지 않는다
 *
 * ─────────────────────────────────────
 * 2. 기본 형식
 * ─────────────────────────────────────
 * 기본 형식: [조건 또는 시점]: [효과]
 *
 * 예시
 * - 전투 시작: 카드 1장 드로우
 * - 턴 시작: 체력 2 회복
 * - 적 처치 시: 잔향 10 충전
 * - 체력이 25% 이하일 때: 주는 피해 25% 증가
 *
 * ─────────────────────────────────────
 * 3. 효과 분류별 형식
 * ─────────────────────────────────────
 * 1) 획득 즉시 적용 효과
 *    형식: 획득: [효과]
 *    예: 획득: 최대 체력 +20
 *
 * 2) 상시 지속 효과
 *    형식: 상시: [효과]
 *    예: 상시: 엘리트 및 보스에게 주는 피해 50% 증가
 *
 * 3) 특정 시점 발동 효과
 *    형식: [시점]: [효과]
 *    예: 전투 시작: 방어막 5 획득
 *
 * 4) 조건부 효과
 *    형식: [조건]일 때: [효과]
 *    예: 체력이 25% 이하일 때: 주는 피해 25% 증가
 *
 * 5) 확률 효과
 *    형식: [행동] 시 [확률]% 확률: [효과]
 *    예: 카드 사용 시 10% 확률: 잔향 10 충전
 *
 * 6) 누적/주기 효과
 *    주기형: [행동] [횟수]회마다: [효과]
 *    누적형: [행동]: [카운트 변화] / [횟수]회 누적 시: [효과]
 *    예: 카드 10장 사용할 때마다: 잔향 15 충전
 *    예: 타격 시: 집계 +1 / 5회 누적 시: 방어막 12 획득 후 초기화
 *
 * 7) 제한 횟수 효과
 *    형식: [범위] [횟수]회: [효과]
 *    예: 전투당 1회: 처음 소멸한 카드를 덱 맨 위로 되돌림
 *    예: 게임당 1회: 사망 시 체력 50% 회복 후 부활
 *
 * 8) 세트 유물
 *    형식:
 *    [효과 설명]
 *    [세트: 세트명]
 *
 *    예:
 *    전투 시작: 모든 적에게 독 2 부여
 *    [세트: 독사의 시선]
 *
 * 9) 효과 없는 세트 구성품
 *    형식:
 *    세트 구성품
 *    [세트: 세트명]
 *
 *    예:
 *    세트 구성품
 *    [세트: 철옹성]
 *
 * ─────────────────────────────────────
 * 4. 복합 효과 작성 규칙
 * ─────────────────────────────────────
 * 1) 서로 다른 효과가 함께 있으면 ' / ' 로 구분한다
 * 2) 서로 다른 발동 조건도 ' / ' 로 구분한다
 * 3) 한 desc에 구분자는 최대 2개까지를 권장한다
 * 4) 너무 길어지면 핵심 효과만 남기고 세부 제약은 상세 설명으로 분리한다
 * 5) 세트 정보는 복합 효과 구분자와 섞지 않고 반드시 별도 줄에 둔다
 *
 * 예시
 * - 획득: 최대 체력 +20 / 전투 시작: 최대 에너지 +1
 * - 상시: 손패 제한 -1 / 카드 5장 사용할 때마다: 카드 2장 드로우
 *
 * ─────────────────────────────────────
 * 5. 표현 우선순위
 * ─────────────────────────────────────
 * desc는 아래 순서로 정보를 배치한다
 * 1) 언제 발동하는가
 * 2) 무엇이 대상인가
 * 3) 어떤 효과가 발생하는가
 * 4) 횟수/확률/제한은 뒤에 붙인다
 * 5) 세트 소속은 마지막 줄에 따로 표기한다
 *
 * 좋은 예
 * - 전투 시작: 모든 적에게 독 2 부여
 *   [세트: 독사의 시선]
 * - 카드 사용 시 10% 확률: 잔향 10 충전
 *
 * 나쁜 예
 * - [독사의 시선] 전투 시작: 모든 적에게 독 2 부여
 * - 독 2를 모든 적에게 전투 시작 시 부여
 * - 10% 확률로 카드 사용 시 잔향 10 충전
 *
 * ─────────────────────────────────────
 * 6. 트리거 표현 통일
 * ─────────────────────────────────────
 * 아래 표현만 사용한다
 *
 * - 전투 시작:
 * - 전투 종료:
 * - 턴 시작:
 * - 턴 종료:
 * - 층 이동:
 * - 카드 사용 시:
 * - 공격 카드 사용 시:
 * - 피해를 줄 때:
 * - 적 처치 시:
 * - 사망 시:
 * - 보스 전투 승리 시:
 * - 휴식에서 카드 강화 시:
 * - 첫 턴 시작:
 * - 전투당 1회:
 * - 게임당 1회:
 * - 턴당 1회:
 *
 * 금지 예시
 * - 매 전투 시작 시
 * - 매 턴 시작 시
 * - ~할 경우
 * - ~하면
 * - ~마다 발동
 *
 * 허용 예외
 * - '일 때'가 더 자연스러운 조건형은 허용
 *   예: 체력이 25% 이하일 때: 주는 피해 25% 증가
 *
 * ─────────────────────────────────────
 * 7. 용어 통일
 * ─────────────────────────────────────
 * 1) 카드 관련
 * - 드로우는 '카드 N장 드로우'로 통일
 * - 임시 획득은 '카드 N장 임시 획득'으로 통일
 * - 복사 생성은 '복사본 N장을 손패에 추가'로 통일
 *
 * 2) 수치 관련
 * - 증가/감소는 +N, -N 형식 사용
 * - 비율은 N% 증가, N% 감소 형식 사용
 * - 비용 증감은 비용 -1, 비용 +1 형식 사용
 *
 * 3) 방어/회복 관련
 * - 방어막은 '방어막 N 획득'으로 통일
 * - 체력 회복은 '체력 N 회복'으로 통일
 * - 에너지 회복은 '에너지 N 회복'으로 통일
 *
 * 4) 상태이상 관련
 * - 단일 대상: 대상에게 [상태] N 부여
 * - 전체 적: 모든 적에게 [상태] N 부여
 * - 자신 버프: [버프명] N 획득
 *
 * 5) 자주 쓰는 표현
 * - 원래 수치로 되돌림 → 원래 수치로 복원
 * - 비용을 0으로 만듦 → 비용 0
 * - 에너지를 소모하지 않음 → 에너지 소모 없음
 *
 * ─────────────────────────────────────
 * 8. 상태이상/버프 명칭 표준
 * ─────────────────────────────────────
 * desc에서 사용하는 상태이상/버프 명칭은 아래 표기를 기준으로 통일한다
 *
 * - poisoned → 독
 * - weakened → 약화
 * - vulnerable → 취약
 * - stunned → 기절
 * - dodge → 회피
 * - shield → 방어막
 * - energy → 에너지
 *
 * 주의
 * - 같은 상태를 독 / 중독 / 포이즌처럼 혼용하지 않는다
 * - 같은 버프를 회피 / 회피율처럼 혼용하지 않는다
 *
 * ─────────────────────────────────────
 * 9. 지속 시간 / 제한 표기 규칙
 * ─────────────────────────────────────
 * 1) 지속 범위가 중요하면 desc에 반드시 포함한다
 * 2) 지속/제한 정보는 효과 뒤에 괄호로 붙인다
 * 3) 괄호 표기는 짧고 고정된 형식으로 유지한다
 *
 * 사용 형식
 * - (이번 턴)
 * - (이번 전투)
 * - (영구)
 * - (최대 N)
 * - (전투당 1회)
 * - (게임당 1회)
 *
 * 예시
 * - 턴 시작: 무작위 카드 1장의 비용 0(이번 턴)
 * - 전투 시작: 무작위 카드 3장의 비용 -1(이번 전투)
 * - 턴 종료: 남은 에너지 이월(최대 3)
 *
 * 주의
 * - 지속/제한 정보가 효과 이해에 중요하지 않다면 반복 표기를 줄일 수 있다
 * - 패널티, 횟수 제한, 지속 범위는 가능하면 생략하지 않는다
 *
 * ─────────────────────────────────────
 * 10. 상시 / 획득 / 조건 효과 구분 규칙
 * ─────────────────────────────────────
 * 1) 아이템을 얻는 즉시 영구 적용되면 '획득:' 사용
 *    예: 획득: 최대 체력 +50
 *
 * 2) 별도 트리거 없이 항상 적용되면 '상시:' 사용
 *    예: 상시: 적 방어도 무시
 *
 * 3) 전투 중에만 유지되면 반드시 조건을 명시한다
 *    예: 전투 시작: 최대 에너지 +1 / 전투 종료: 원래 수치로 복원
 *
 * 4) 코드상 onAcquire라도 플레이어가 체감하는 효과가 전투 중 한정이면
 *    '획득:' 대신 전투 조건을 우선 표기한다
 *
 * ─────────────────────────────────────
 * 11. 세트 표기 규칙
 * ─────────────────────────────────────
 * 1) setId가 있는 아이템은 desc 마지막 줄에 반드시 세트 태그를 넣는다
 * 2) 세트 태그는 항상 아래 형식으로 통일한다
 *    [세트: 세트명]
 * 3) 세트 태그는 효과 본문과 같은 줄에 쓰지 않는다
 * 4) 세트가 없는 일반 유물에는 세트 태그를 넣지 않는다
 * 5) 실제 문자열에는 줄바꿈 문자 \n 으로 분리한다
 *
 * 예시
 * - '전투 시작: 모든 적에게 독 2 부여\n[세트: 독사의 시선]'
 * - '세트 구성품\n[세트: 철옹성]'
 *
 * ─────────────────────────────────────
 * 12. 작성 금지 표현
 * ─────────────────────────────────────
 * 아래 표현은 desc에서 사용하지 않는다
 *
 * - 마침표
 * - 불필요한 조사 남용
 * - "~합니다", "~됩니다" 같은 서술형 종결
 * - "더 자세히", "강화하는", "건강해진 느낌" 같은 모호한 표현
 * - 코드 구현 관점 표현
 *   예: 상태 초기화, 변수 저장, 내부 플래그 활성화
 * - 세트명과 효과를 같은 줄에 섞는 표현
 *   예: [독사의 시선] 전투 시작: 모든 적에게 독 2 부여
 *
 * 예시
 * - 나쁨: 세트 효과를 강화하는 부적입니다
 * - 좋음: 세트 구성품
 *   [세트: 독사의 시선]
 *
 * - 나쁨: 적의 다음 행동을 더 자세히 분석
 * - 좋음: 턴 시작: 적 공격 의도 10% 감소
 *
 * ─────────────────────────────────────
 * 13. 축약 규칙
 * ─────────────────────────────────────
 * 1) 설명이 길어질 경우, 플레이 판단에 중요한 정보만 남긴다
 * 2) 구현상 자동 복원/초기화가 당연한 경우 반복 설명을 줄인다
 * 3) 단, 패널티/제한/횟수 제한은 생략하지 않는다
 * 4) 세트 아이템도 세트명 설명문을 길게 늘이지 말고 세트 태그만 유지한다
 *
 * 예시
 * - 좋음: 전투당 1회: 처음 소멸한 카드를 덱 맨 위로 되돌림
 * - 나쁨: 전투 중 처음 소모한 카드를 덱 맨 위로 되돌림 (전투당 1회)
 *
 * ─────────────────────────────────────
 * 14. 우선 표기해야 하는 정보
 * ─────────────────────────────────────
 * 아래 요소는 가능하면 반드시 desc에 포함한다
 *
 * 1) 발동 시점
 * 2) 대상
 * 3) 수치
 * 4) 확률
 * 5) 횟수 제한
 * 6) 패널티
 * 7) 지속 범위(이번 턴, 이번 전투, 영구 등)
 * 8) 세트 소속(setId가 있는 경우)
 *
 * 예시
 * - 전투 시작: 무작위 카드 3장의 비용 -1(이번 전투)
 * - 상시: 손패 제한 -1 / 카드 5장 사용할 때마다: 카드 2장 드로우
 * - 전투 시작: 모든 적에게 독 2 부여
 *   [세트: 독사의 시선]
 *
 * ─────────────────────────────────────
 * 15. 설명 우선 / 구현 후순위 원칙
 * ─────────────────────────────────────
 * 1) desc는 내부 구현 방식보다 플레이어가 체감하는 결과를 우선 설명한다
 * 2) 내부 처리 과정은 플레이 판단에 필요할 때만 최소한으로 드러낸다
 * 3) 코드상 복잡한 처리라도 플레이어 기준으로 단순하게 요약한다
 * 4) 세트 정보는 효과 설명의 일부가 아니라 분류 정보로 취급한다
 *
 * 예시
 * - 나쁨: 소멸된 카드를 exhausted에서 제거하고 덱으로 되돌림
 * - 좋음: 전투당 1회: 처음 소멸한 카드를 덱 맨 위로 되돌림
 *
 * - 나쁨: 적 intent value를 10% 감소
 * - 좋음: 턴 시작: 적 공격 의도 10% 감소
 *
 * ─────────────────────────────────────
 * 16. 권장 예시 패턴
 * ─────────────────────────────────────
 * - 전투 시작: 카드 1장 드로우
 * - 턴 시작: 체력 2 회복
 * - 카드 사용 시 10% 확률: 잔향 10 충전
 * - 적 처치 시: 최대 체력 +2
 * - 상시: 엘리트 및 보스에게 주는 피해 50% 증가
 * - 획득: 최대 체력 +20
 * - 전투당 1회: 처음 소멸한 카드를 덱 맨 위로 되돌림
 * - 턴 시작: 체력 3 회복
 *   [세트: 생명의 성배]
 * - 세트 구성품
 *   [세트: 철옹성]
 */
import { LogUtils } from '../game/utils/log_utils.js';
import { CARDS, UPGRADE_MAP } from './cards.js';
import { Trigger } from '../game/data/triggers.js';
import { CONSTANTS } from '../game/data/constants.js';
import {
    clearHandScopedCostTargets,
    getHandScopedCostTargets,
    reindexHandScopedRuntimeState,
    registerCardDiscovered,
    registerItemFound,
    setHandScopedCostTarget,
} from './runtime_shared_support.js';

const ITEM_ACTIONS = Object.freeze({
    CARD_DISCARD: 'card:discard',
    PLAYER_ENERGY: 'player:energy',
    PLAYER_ENERGY_SET: 'player:energy-set',
});

function getCardCost(cardId) {
    return CARDS?.[cardId]?.cost ?? 0;
}

function getTriggeredAmount(data) {
    if (typeof data === 'number' && Number.isFinite(data)) return data;
    if (data && typeof data === 'object' && Number.isFinite(data.amount)) return data.amount;
    return null;
}

function withTriggeredAmount(data, amount) {
    if (!Number.isFinite(amount)) return data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return { ...data, amount };
    }
    return amount;
}

function resolveTriggeredTargetIdx(gs, data) {
    if (Number.isInteger(data?.targetIdx) && data.targetIdx >= 0) return data.targetIdx;
    if (Number.isInteger(gs?._selectedTarget) && gs._selectedTarget >= 0) return gs._selectedTarget;
    return (gs?.combat?.enemies || []).findIndex((enemy) => (enemy?.hp || 0) > 0);
}

function upgradeDeckCard(gs, cardId, upgradedId) {
    const deck = gs?.player?.deck;
    if (!Array.isArray(deck) || !cardId || !upgradedId) return false;
    const idx = deck.indexOf(cardId);
    if (idx < 0) return false;
    deck[idx] = upgradedId;
    registerCardDiscovered(gs, upgradedId);
    gs.markDirty?.('deck');
    return true;
}

function getCombatDrawPile(gs) {
    return Array.isArray(gs?.player?.drawPile) ? gs.player.drawPile : null;
}

function pushCardToCombatDrawPile(gs, cardId) {
    const drawPile = getCombatDrawPile(gs);
    if (drawPile) {
        drawPile.push(cardId);
        gs.markDirty?.('hand');
        return true;
    }
    return false;
}

function addPlayerDrawCount(gs, amount) {
    if (!gs?.player || !Number.isFinite(amount) || amount === 0) return 0;
    const current = Math.max(0, Math.floor(Number(gs.player.drawCount || 0)));
    const next = Math.max(0, current + Math.floor(amount));
    gs.player.drawCount = next;
    return next;
}

function addPlayerEnergy(gs, amount) {
    if (!gs?.player || !Number.isFinite(amount) || amount === 0) return Number(gs?.player?.energy || 0);
    const delta = Math.floor(amount);
    if (delta === 0) return Number(gs?.player?.energy || 0);

    if (typeof gs.dispatch === 'function') {
        const result = gs.dispatch(ITEM_ACTIONS.PLAYER_ENERGY, { amount: delta });
        if (result?.energyAfter !== undefined) return result.energyAfter;
    }

    gs.player.energy = Math.max(0, Math.floor(Number(gs.player.energy || 0)) + delta);
    gs.markDirty?.('hud');
    return gs.player.energy;
}

function setPlayerEnergy(gs, amount) {
    if (!gs?.player || !Number.isFinite(amount)) return Number(gs?.player?.energy || 0);
    const next = Math.max(0, Math.floor(amount));

    if (typeof gs.dispatch === 'function') {
        const result = gs.dispatch(ITEM_ACTIONS.PLAYER_ENERGY_SET, { amount: next });
        if (result?.energyAfter !== undefined) return result.energyAfter;
    }

    gs.player.energy = Math.min(Math.max(0, Math.floor(Number(gs.player.maxEnergy || 0))), next);
    gs.markDirty?.('hud');
    return gs.player.energy;
}

function withCardCostDelta(data, delta) {
    if (!Number.isFinite(delta)) return data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return { ...data, costDelta: Math.floor(Number(data.costDelta || 0)) + Math.floor(delta) };
    }
    return Math.floor(delta);
}

function matchesHandScopedCard(data, targetIndex) {
    return Number.isInteger(data?.handIndex)
        && Number.isInteger(targetIndex)
        && data.handIndex === targetIndex;
}

function pickRandomHandIndex(hand, excludedIndexes = []) {
    if (!Array.isArray(hand) || hand.length <= 0) return null;
    const excluded = new Set((excludedIndexes || []).filter((idx) => Number.isInteger(idx) && idx >= 0));
    if (excluded.size >= hand.length) return null;

    let pick = Math.floor(Math.random() * hand.length);
    while (excluded.has(pick)) pick = Math.floor(Math.random() * hand.length);
    return pick;
}

function exhaustHandCard(gs, handIdx) {
    const hand = gs?.player?.hand;
    if (!Array.isArray(hand) || handIdx < 0 || handIdx >= hand.length) return null;

    const cardId = hand[handIdx];
    if (typeof gs?.dispatch === 'function') {
        hand.splice(handIdx, 1);
        reindexHandScopedRuntimeState(gs, handIdx);
        gs.dispatch(ITEM_ACTIONS.CARD_DISCARD, {
            cardId,
            exhaust: true,
            skipHandRemove: true,
        });
        return cardId;
    }

    hand.splice(handIdx, 1);
    reindexHandScopedRuntimeState(gs, handIdx);
    if (Array.isArray(gs?.player?.exhausted)) {
        gs.player.exhausted.push(cardId);
    }
    gs.triggerItems?.(Trigger.CARD_EXHAUST, { cardId });
    gs.markDirty?.('hand');
    return cardId;
}

function discardDrawnCard(gs, cardId, sourceName) {
    const hand = gs?.player?.hand;
    if (!Array.isArray(hand)) return false;
    const idx = hand.lastIndexOf(cardId);
    if (idx < 0) return false;
    hand.splice(idx, 1);
    reindexHandScopedRuntimeState(gs, idx);
    if (!Array.isArray(gs.player.graveyard)) gs.player.graveyard = [];
    gs.player.graveyard.push(cardId);
    gs.markDirty?.('hand');
    if (sourceName) gs.addLog?.(LogUtils.formatItem(sourceName, `${CARDS?.[cardId]?.name || cardId} 버림`), 'item');
    return true;
}

function exhaustDrawnCard(gs, cardId, sourceName) {
    const hand = gs?.player?.hand;
    if (!Array.isArray(hand)) return false;
    const idx = hand.lastIndexOf(cardId);
    if (idx < 0) return false;
    hand.splice(idx, 1);
    reindexHandScopedRuntimeState(gs, idx);
    if (!Array.isArray(gs.player.exhausted)) gs.player.exhausted = [];
    gs.player.exhausted.push(cardId);
    gs.markDirty?.('hand');
    const exhaustResult = gs.triggerItems?.(Trigger.CARD_EXHAUST, { cardId });
    if (exhaustResult === true) {
        const exIdx = gs.player.exhausted.lastIndexOf(cardId);
        if (exIdx >= 0) gs.player.exhausted.splice(exIdx, 1);
        if (!Array.isArray(gs.player.graveyard)) gs.player.graveyard = [];
        gs.player.graveyard.push(cardId);
        if (sourceName) gs.addLog?.(LogUtils.formatItem(sourceName, `${CARDS?.[cardId]?.name || cardId} 소멸 방지`), 'item');
        return true;
    }
    if (sourceName) gs.addLog?.(LogUtils.formatItem(sourceName, `${CARDS?.[cardId]?.name || cardId} 소멸`), 'item');
    return true;
}

function getSpecialRelicProgress(gs) {
    if (!gs?.player) return {};
    const current = gs.player._specialRelicProgress;
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
        gs.player._specialRelicProgress = {};
    }
    return gs.player._specialRelicProgress;
}

function advanceSpecialRelicAwakening(gs, {
    dormantId,
    awakenedId,
    awakenedName = null,
    requiredCombats,
    sourceName,
}) {
    if (!gs?.player || !dormantId || !awakenedId) return false;
    const idx = gs.player.items?.indexOf?.(dormantId) ?? -1;
    if (idx < 0) return false;

    const progress = getSpecialRelicProgress(gs);
    const current = Number(progress[dormantId]) || 0;
    const next = Math.min(requiredCombats, current + 1);
    progress[dormantId] = next;

    if (next < requiredCombats) {
        gs.addLog?.(`🌱 ${sourceName}: 개화 진행 ${next}/${requiredCombats}`, 'echo');
        return false;
    }

    gs.player.items[idx] = awakenedId;
    delete progress[dormantId];
    registerItemFound(gs, awakenedId);
    gs.addLog?.(`🌌 ${sourceName} 개화: ${awakenedName || awakenedId}`, 'item');
    return true;
}

const COMMON_ITEMS = {
    // ══════════════ [ 대분류: 일반 유물 ] ══════════════
    void_compass: {
        id: 'void_compass', name: '공허의 나침반', icon: '🧭', rarity: 'common',
        desc: '전투 시작: 카드 1장 드로우',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.drawCards(1, { name: '공허의 나침반', type: 'item' }); } }
    },
    void_shard: {
        id: 'void_shard', name: '공허의 파편', icon: '🔷', rarity: 'common',
        desc: '전투 시작: 잔향 50 이상일 때 방어막 5 획득 / 전투 종료: 잔향 20 충전',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && Number(gs.player.echo || 0) >= 50) {
                gs.addShield?.(5, { name: '공허의 파편', type: 'item' });
            }
            if (trigger === Trigger.COMBAT_END) {
                gs.addEcho(20, { name: '공허의 파편', type: 'item' });
            }
        }
    },
    cracked_amulet: {
        id: 'cracked_amulet', name: '부서진 목걸이', icon: '📿', rarity: 'common',
        desc: '전투 시작: 방어막 4 획득 / 턴 시작: 체력 2 회복',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addShield?.(4, { name: '부서진 목걸이', type: 'item' });
            }
            if (trigger === Trigger.TURN_START) {
                gs.heal(2, { name: '부서진 목걸이', type: 'item' });
            }
        }
    },
    worn_pouch: {
        id: 'worn_pouch', name: '낡은 주머니', icon: '💰', rarity: 'common',
        desc: '전투 시작: 골드 5 획득 / 층 이동: 골드 3 획득',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addGold(5, { name: '낡은 주머니', type: 'item' });
            }
            if (trigger === Trigger.FLOOR_START) {
                gs.addGold(3, { name: '낡은 주머니', type: 'item' });
            }
        }
    },
    dull_blade: {
        id: 'dull_blade', name: '무딘 검', icon: '🗡️', rarity: 'common',
        desc: '전투 시작: 잔향 5 충전 / 카드 사용 시 10% 확률: 잔향 10 충전',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addEcho(5, { name: '무딘 검', type: 'item' });
            }
            if (trigger === Trigger.CARD_PLAY && Math.random() < 0.1) {
                gs.addEcho(10, { name: '무딘 검', type: 'item' });
            }
        }
    },
    travelers_map: {
        id: 'travelers_map', name: '여행자의 지도', icon: '🗺️', rarity: 'common',
        desc: '층 이동: 체력 3 회복 / 골드 4 획득',
        passive(gs, trigger) {
            if (trigger === Trigger.FLOOR_START) {
                gs.heal(3, { name: '여행자의 지도', type: 'item' });
                gs.addGold?.(4, { name: '여행자의 지도', type: 'item' });
            }
        }
    },
    rift_talisman: {
        id: 'rift_talisman', name: '균열의 부적', icon: '🧿', rarity: 'common',
        desc: '전투 시작: 방어막 5 획득 / 잔향 5 충전',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addShield(5, { name: '균열의 부적', type: 'item' });
                gs.addEcho?.(5, { name: '균열의 부적', type: 'item' });
            }
        }
    },
    blood_shard: {
        id: 'blood_shard', name: '핏빛 파편', icon: '🩸', rarity: 'common',
        desc: '적 처치 시: 잔향 10 충전 / 체력 1 회복',
        passive(gs, trigger) {
            if (trigger === Trigger.ENEMY_KILL) {
                gs.addEcho(10, { name: '핏빛 파편', type: 'item' });
                gs.heal?.(1, { name: '핏빛 파편', type: 'item' });
            }
        }
    },
    morning_dew: {
        id: 'morning_dew', name: '아침 이슬', icon: '💧', rarity: 'common',
        desc: '전투 시작: 체력 2 회복 / 턴 시작: 방어막 3 획득',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.heal?.(2, { name: '아침 이슬', type: 'item' });
            }
            if (trigger === Trigger.TURN_START) {
                gs.addShield(3, { name: '아침 이슬', type: 'item' });
            }
        }
    },
    thin_codex: {
        id: 'thin_codex', name: '얇은 문서', icon: '📄', rarity: 'common',
        desc: '전투 시작: 덱 10장 이하일 때 카드 1장 드로우 / 방어막 4 획득',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && (gs.player.deck?.length || 0) <= 10) {
                gs.drawCards(1, { name: '얇은 문서', type: 'item' });
                gs.addShield?.(4, { name: '얇은 문서', type: 'item' });
            }
        }
    },
    tally_stone: {
        id: 'tally_stone', name: '집계석', icon: '🧮', rarity: 'common',
        desc: '피해를 줄 때: 집계 +1 / 5회 누적 시: 방어막 12 획득 후 초기화',
        passive(gs, trigger) {
            if (trigger === Trigger.DEAL_DAMAGE) {
                gs._tallyCount = (gs._tallyCount || 0) + 1;
                if (gs._tallyCount >= 5) {
                    gs._tallyCount = 0;
                    gs.addShield(12, { name: '집계석', type: 'item' });
                    gs.addLog('🧮 집계석: 방어막 12 생성!', 'item');
                }
            }
        }
    },
    echo_bell: {
        id: 'echo_bell', name: '잔향의 종', icon: '🔔', rarity: 'common',
        desc: '카드 5장 사용할 때마다: 잔향 5 충전 / 카드 10장 사용할 때마다: 잔향 15 충전',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_PLAY) {
                gs._bellCount = (gs._bellCount || 0) + 1;
                if (gs._bellCount % 10 === 5) {
                    gs.addEcho(5, { name: '잔향의 종', type: 'item' });
                }
                if (gs._bellCount % 10 === 0) {
                    gs.addEcho(15, { name: '잔향의 종', type: 'item' });
                }
            }
        }
    },
    lucky_coin: {
        id: 'lucky_coin', name: '행운의 주화', icon: '🪙', rarity: 'common',
        desc: '턴 시작 5% 확률: 에너지 1 회복 / 상점 구매 시: 골드 3 획득',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && Math.random() < 0.05) {
                addPlayerEnergy(gs, 1);
                gs.addLog?.('🪙 행운의 주화: 에너지 회복!', 'item');
            }
            if (trigger === Trigger.SHOP_BUY) {
                gs.addGold?.(3, { name: '행운의 주화', type: 'item' });
            }
        }
    },
    rusty_key: {
        id: 'rusty_key', name: '녹슨 열쇠', icon: '🔑', rarity: 'common',
        desc: '상시: 유물 가격 10% 감소',
        passive(gs, trigger, data) {
            if (trigger === Trigger.SHOP_PRICE_MOD && data?.type === 'relic') {
                return 0.9;
            }
        }
    },

    // 세트: 고대인의 유산
    ancient_handle: {
        id: 'ancient_handle', name: '고대인의 자루', icon: '🐻', rarity: 'common', setId: 'ancient_set',
        desc: '획득: 최대 체력 +5\n[세트: 고대인의 유산]',
        onAcquire(gs) { gs.player.maxHp += 5; gs.player.hp += 5; },
        passive() { }
    },
    ancient_leather: {
        id: 'ancient_leather', name: '고대인의 가죽', icon: '🐻‍❄️', rarity: 'common', setId: 'ancient_set',
        desc: '획득: 최대 체력 +5\n[세트: 고대인의 유산]',
        onAcquire(gs) { gs.player.maxHp += 5; gs.player.hp += 5; },
        passive() { }
    },
    ancient_belt: {
        id: 'ancient_belt', name: '고대인의 허리띠', icon: '🐼', rarity: 'common', setId: 'ancient_set',
        desc: '획득: 최대 체력 +5\n[세트: 고대인의 유산]',
        onAcquire(gs) { gs.player.maxHp += 5; gs.player.hp += 5; },
        passive() { }
    },
    ancient_cape: {
        id: 'ancient_cape', name: '고대인의 망토', icon: '🐨', rarity: 'common', setId: 'ancient_set',
        desc: '획득: 최대 체력 +5\n[세트: 고대인의 유산]',
        onAcquire(gs) { gs.player.maxHp += 5; gs.player.hp += 5; },
        passive() { }
    },
};

const UNCOMMON_ITEMS = {
    // ══════════════ [ 대분류: 특별 유물 ] ══════════════
    serpent_fang_dagger: {
        id: 'serpent_fang_dagger', name: '독사의 단검', icon: '🗡️', rarity: 'uncommon', setId: 'serpents_gaze',
        desc: '전투 시작: 모든 적에게 독 2 부여\n[세트: 독사의 시선]',
        passive(gs, trigger) {
            if (trigger !== Trigger.COMBAT_START) return;
            (gs.combat?.enemies || []).forEach((_, idx) => {
                gs.applyEnemyStatus?.('poisoned', 2, idx, { name: '독사의 단검', type: 'item' });
            });
        }
    },
    acidic_vial: {
        id: 'acidic_vial', name: '산성 유리병', icon: '🧪', rarity: 'uncommon', setId: 'serpents_gaze',
        desc: '독이 있는 적에게 피해를 줄 때 20% 확률: 대상의 독 +1\n[세트: 독사의 시선]',
        passive(gs, trigger, data) {
            if (trigger !== Trigger.DEAL_DAMAGE || Math.random() >= 0.2) return;
            const targetIdx = resolveTriggeredTargetIdx(gs, data);
            const target = gs.combat?.enemies?.[targetIdx];
            if (!target?.statusEffects || (target.statusEffects.poisoned || 0) <= 0) return;
            target.statusEffects.poisoned += 1;
            target.statusEffects.poisonDuration = Math.max(1, target.statusEffects.poisonDuration || 3);
        }
    },
    cobra_scale_charm: {
        id: 'cobra_scale_charm', name: '코브라 비늘 부적', icon: '🐍', rarity: 'uncommon', setId: 'serpents_gaze',
        desc: '세트 구성품\n[세트: 독사의 시선]',
        passive() { }
    },
    monks_rosary: {
        id: 'monks_rosary', name: '수도사의 묵주', icon: '📿', rarity: 'uncommon', setId: 'holy_grail',
        desc: '턴 시작: 체력 3 회복\n[세트: 생명의 성배]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) gs.heal?.(3, { name: '수도사의 묵주', type: 'item' });
        }
    },
    fountain_essence: {
        id: 'fountain_essence', name: '샘물의 정수', icon: '💧', rarity: 'uncommon', setId: 'holy_grail',
        desc: '세트 구성품\n[세트: 생명의 성배]',
        passive() { }
    },
    life_bloom_seed: {
        id: 'life_bloom_seed', name: '생명의 개화 씨앗', icon: '🌱', rarity: 'uncommon', setId: 'holy_grail',
        desc: '세트 구성품\n[세트: 생명의 성배]',
        passive() { }
    },
    titans_belt: {
        id: 'titans_belt', name: '거인의 허리띠', icon: '🪢', rarity: 'uncommon', setId: 'titans_endurance',
        desc: '전투 시작: 최대 체력 +15 / 체력 15 회복 / 전투 종료: 원래 수치로 복원\n[세트: 거인의 인내]',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._titansBeltApplied) {
                gs._titansBeltApplied = 15;
                gs.player.maxHp += 15;
                if (typeof gs.heal === 'function') {
                    gs.heal(15, { name: '거인의 허리띠', type: 'item' });
                } else {
                    gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 15);
                }
                gs.markDirty?.('hud');
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._titansBeltApplied) {
                const bonus = gs._titansBeltApplied;
                gs.player.maxHp = Math.max(1, gs.player.maxHp - bonus);
                gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
                gs._titansBeltApplied = 0;
                gs.markDirty?.('hud');
            }
        }
    },
    endurance_medal: {
        id: 'endurance_medal', name: '인내의 메달', icon: '🎖️', rarity: 'uncommon', setId: 'titans_endurance',
        desc: '세트 구성품\n[세트: 거인의 인내]',
        passive() { }
    },
    ancient_heart_stone: {
        id: 'ancient_heart_stone', name: '고대 심장석', icon: '🫀', rarity: 'uncommon', setId: 'titans_endurance',
        desc: '세트 구성품\n[세트: 거인의 인내]',
        passive() { }
    },
    bastion_shield_plate: {
        id: 'bastion_shield_plate', name: '보루 방패판', icon: '🛡️', rarity: 'uncommon', setId: 'iron_fortress',
        desc: '턴 종료: 방어막 5 획득\n[세트: 철옹성]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END) gs.addShield?.(5, { name: '보루 방패판', type: 'item' });
        }
    },
    spiked_buckler: {
        id: 'spiked_buckler', name: '가시 버클러', icon: '🛡', rarity: 'uncommon', setId: 'iron_fortress',
        desc: '세트 구성품\n[세트: 철옹성]',
        passive() { }
    },
    fortified_gauntlet: {
        id: 'fortified_gauntlet', name: '강화 건틀릿', icon: '🥊', rarity: 'uncommon', setId: 'iron_fortress',
        desc: '세트 구성품\n[세트: 철옹성]',
        passive() { }
    },
    magnifying_glass: {
        id: 'magnifying_glass', name: '돋보기', icon: '🔍', rarity: 'uncommon',
        desc: '상시: 모든 적 공격 의도 10% 감소',
        passive(gs, trigger, data) {
            if (trigger === Trigger.ENEMY_INTENT && data?.action) {
                const baseDmg = Number(data.action.dmg || 0);
                if (baseDmg <= 0) return;
                const scaledDmg = Math.max(0, Math.floor(baseDmg * 0.9));
                const nextIntent = typeof data.action.intent === 'string'
                    ? data.action.intent.replace(new RegExp(`${baseDmg}(\\s*x\\d+)?$`), `${scaledDmg}$1`)
                    : data.action.intent;
                return {
                    action: {
                        ...data.action,
                        dmg: scaledDmg,
                        intent: nextIntent,
                    },
                };
            }
        }
    },
    echo_gauntlet: {
        id: 'echo_gauntlet', name: '잔향 건틀릿', icon: '🥊', rarity: 'uncommon',
        desc: '연쇄 5 도달 시: 무작위 적에게 기절 1 부여',
        passive(gs, trigger) {
            if (trigger !== Trigger.CHAIN_REACH_5) return;
            const aliveIndexes = (gs.combat?.enemies || [])
                .map((enemy, idx) => ((enemy?.hp || 0) > 0 ? idx : -1))
                .filter((idx) => idx >= 0);
            const targetIdx = aliveIndexes[Math.floor(Math.random() * aliveIndexes.length)];
            if (targetIdx >= 0) {
                gs.applyEnemyStatus?.('stunned', 1, targetIdx);
                gs.addLog?.('🥊 잔향 건틀릿: 무작위 적 기절!', 'item');
            }
        }
    },
    golden_feather: {
        id: 'golden_feather', name: '황금 깃털', icon: '🪶', rarity: 'uncommon',
        desc: '전투 시작: 회피 1 획득',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs.addBuff('dodge', 1, { name: '황금 깃털', type: 'item' });
        }
    },
    heavy_anvil: {
        id: 'heavy_anvil', name: '무거운 모루', icon: '⚙️', rarity: 'uncommon',
        desc: '휴식에서 카드 강화 시: 무작위 카드 1장 추가 강화',
        passive(gs, trigger, data) {
            if (trigger === Trigger.REST_UPGRADE) {
                const upgradeMap = data?.upgradeMap || UPGRADE_MAP;
                const upgradeable = (gs.player.deck || []).filter((cardId) => upgradeMap?.[cardId]);
                if (upgradeable.length > 0) {
                    const target = upgradeable[Math.floor(Math.random() * upgradeable.length)];
                    const upgradedId = upgradeMap[target];
                    if (upgradeDeckCard(gs, target, upgradedId)) {
                        gs.addLog?.(`⚙️ 무거운 모루: ${CARDS[target]?.name || target} 추가 강화!`, 'item');
                    }
                }
            }
        }
    },
    liquid_memory: {
        id: 'liquid_memory', name: '액체 기억', icon: '🧪', rarity: 'uncommon',
        desc: '전투당 1회: 처음 소멸한 카드를 덱 맨 위로 되돌림',
        passive(gs, trigger, data) {
            if (trigger === Trigger.CARD_EXHAUST && !gs._liquidMemoryUsed) {
                gs._liquidMemoryUsed = true;
                const idx = gs.player.exhausted.lastIndexOf(data.cardId);
                if (idx >= 0) {
                    gs.player.exhausted.splice(idx, 1);
                    if (!pushCardToCombatDrawPile(gs, data.cardId)) {
                        gs.player.deck.push(data.cardId);
                    }
                    gs.addLog?.(`🧪 액체 기억: ${CARDS[data.cardId]?.name}를 복구했습니다.`, 'item');
                }
            }
            if (trigger === Trigger.COMBAT_START) gs._liquidMemoryUsed = false;
        }
    },
    balanced_scale: {
        id: 'balanced_scale', name: '균형의 저울', icon: '⚖️', rarity: 'uncommon',
        desc: '턴 종료 시 에너지가 0일 때: 다음 턴 카드 1장 드로우',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END && gs.player.energy === 0) gs._scaleActive = true;
            if (trigger === Trigger.TURN_START && gs._scaleActive) {
                gs._scaleActive = false;
                addPlayerDrawCount(gs, 1);
                gs._scaleDrawReset = true;
                gs.addLog?.('⚖️ 균형의 저울: 추가 드로우!', 'item');
            }
            if ((trigger === Trigger.TURN_END || trigger === Trigger.COMBAT_END || trigger === 'death') && gs._scaleDrawReset) {
                addPlayerDrawCount(gs, -1);
                gs._scaleDrawReset = false;
            }
            if (trigger === Trigger.COMBAT_END || trigger === 'death') {
                gs._scaleActive = false;
                gs._scaleDrawReset = false;
            }
        }
    },
    vampiric_fang: {
        id: 'vampiric_fang', name: '흡혈귀의 송곳니', icon: '🧛', rarity: 'uncommon',
        desc: '적 처치 시: 체력 3 회복',
        passive(gs, trigger) {
            if (trigger === Trigger.ENEMY_KILL) gs.heal(3, { name: '흡혈귀의 송곳니', type: 'item' });
        }
    },
    crystal_ball: {
        id: 'crystal_ball', name: '수정구슬', icon: '🔮', rarity: 'uncommon',
        desc: '전투 시작: 무작위 카드 3종류의 비용 -1(이번 전투)',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START && gs.player.deck?.length > 0) {
                gs._crystalDiscounted = new Set();
                const uniqueCardIds = [...new Set(gs.player.deck)];
                const picks = new Set();
                while (picks.size < Math.min(3, uniqueCardIds.length)) {
                    picks.add(Math.floor(Math.random() * uniqueCardIds.length));
                }
                picks.forEach(r => {
                    const cardId = uniqueCardIds[r];
                    gs._crystalDiscounted.add(cardId);
                    gs.addLog?.(`🔮 수정구슬: ${CARDS[cardId]?.name} 비용 -1`, 'item');
                });
            }
            if (trigger === Trigger.BEFORE_CARD_COST && gs._crystalDiscounted?.has(data?.cardId)) {
                return withCardCostDelta(data, -1);
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._crystalDiscounted = null;
            }
        }
    },
    merchants_pendant: {
        id: 'merchants_pendant', name: '상인의 펜던트', icon: '📿', rarity: 'uncommon',
        desc: '상점 구매 시: 최대 체력 +1',
        passive(gs, trigger) {
            if (trigger === Trigger.SHOP_BUY) {
                gs.player.maxHp += 1;
                gs.player.hp += 1;
                gs.addLog?.('📿 상인의 펜던트: 건강해진 느낌!', 'item');
            }
        }
    },
    adrenaline_shot: {
        id: 'adrenaline_shot', name: '아드레날린 주사', icon: '💉', rarity: 'uncommon',
        desc: '체력이 25% 이하일 때: 주는 피해 25% 증가',
        passive(gs, trigger, data) {
            const amount = getTriggeredAmount(data);
            if (trigger === Trigger.DEAL_DAMAGE && amount !== null && gs.player.hp <= gs.player.maxHp * 0.25) {
                return withTriggeredAmount(data, Math.floor(amount * 1.25));
            }
        }
    },

    // 세트: 고대인의 유산
    ancient_blade: {
        id: 'ancient_blade', name: '고대인의 칼날', icon: '🗡️', rarity: 'uncommon', setId: 'ancient_set',
        desc: '피해를 줄 때: 피해 +1\n[세트: 고대인의 유산]',
        passive(gs, trigger, data) {
            const amount = getTriggeredAmount(data);
            if (trigger === Trigger.DEAL_DAMAGE && amount !== null) return withTriggeredAmount(data, amount + 1);
        }
    },
    ancient_scroll: {
        id: 'ancient_scroll', name: '고대인의 두루마리', icon: '📜', rarity: 'uncommon', setId: 'ancient_set',
        desc: '전투 시작: 무작위 카드 1장 임시 획득\n[세트: 고대인의 유산]',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                const allKeys = Object.keys(CARDS);
                const randomCard = allKeys[Math.floor(Math.random() * allKeys.length)];
                gs._scrollTempCard = randomCard;
                gs.player.hand.push(randomCard);
                gs.addLog?.(`📜 고대인의 두루마리: ${CARDS[randomCard]?.name} 임시 획득!`, 'item');
            }
            if (trigger === Trigger.COMBAT_END && gs._scrollTempCard) {
                const tempId = gs._scrollTempCard;
                gs._scrollTempCard = null;

                // 모든 영역에서 임시 카드 제거
                const hIdx = gs.player.hand?.lastIndexOf(tempId);
                if (hIdx >= 0) gs.player.hand.splice(hIdx, 1);

                const dIdx = gs.player.deck?.lastIndexOf(tempId);
                if (dIdx >= 0) gs.player.deck.splice(dIdx, 1);

                const gIdx = gs.player.graveyard?.lastIndexOf(tempId);
                if (gIdx >= 0) gs.player.graveyard.splice(gIdx, 1);

                const eIdx = gs.player.exhausted?.lastIndexOf(tempId);
                if (eIdx >= 0) gs.player.exhausted.splice(eIdx, 1);
            }
        }
    },
    dusk_mark: {
        id: 'dusk_mark', name: '황혼의 낙인', icon: '🌘', rarity: 'uncommon', setId: 'dusk_set',
        desc: '약화된 적에게 피해를 줄 때: 대상에게 약화 1 부여\n[세트: 황혼의 쌍인]',
        passive(gs, trigger, data) {
            if (trigger !== Trigger.DEAL_DAMAGE) return;
            const targetIdx = resolveTriggeredTargetIdx(gs, data);
            const target = gs.combat?.enemies?.[targetIdx];
            if ((target?.statusEffects?.weakened || 0) > 0) {
                gs.applyEnemyStatus?.('weakened', 1, targetIdx, { name: '황혼의 낙인', type: 'item' });
            }
        }
    },
    void_fang: {
        id: 'void_fang', name: '공허의 송곳니', icon: '🦷', rarity: 'uncommon', setId: 'void_set',
        desc: '세트 구성품\n[세트: 공허의 삼위일체]',
        passive() { }
    },
    void_eye: {
        id: 'void_eye', name: '공허의 눈', icon: '👁️', rarity: 'uncommon', setId: 'void_set',
        desc: '공격 카드 사용 시 20% 확률: 대상에게 약화 1 부여\n[세트: 공허의 삼위일체]',
        passive(gs, trigger, data) {
            if (trigger !== Trigger.CARD_PLAY || Math.random() >= 0.2) return;
            const cardType = String(CARDS?.[data?.cardId]?.type || '').toUpperCase();
            if (cardType !== 'ATTACK') return;
            const targetIdxs = [...new Set((Array.isArray(data?.targetIdxs) ? data.targetIdxs : [])
                .filter((idx) => Number.isInteger(idx) && idx >= 0))];
            if (targetIdxs.length > 0) {
                targetIdxs.forEach((targetIdx) => gs.applyEnemyStatus?.('weakened', 1, targetIdx));
                return;
            }
            const targetIdx = resolveTriggeredTargetIdx(gs, data);
            gs.applyEnemyStatus?.('weakened', 1, targetIdx);
        }
    },
    void_crown: {
        id: 'void_crown', name: '공허의 왕관', icon: '👑', rarity: 'uncommon', setId: 'void_set',
        desc: '비용 0인 카드 사용 시: 잔향 10 충전\n[세트: 공허의 삼위일체]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.CARD_PLAY && Number(data?.cost) === 0) {
                gs.addEcho?.(10, { name: '공허의 왕관', type: 'item' });
            }
        }
    },
    paradox_contract: {
        id: 'paradox_contract', name: '역설 계약', icon: '⏳', rarity: 'uncommon',
        desc: '전투 시작: 최대 에너지 +1 / 전투 종료: 원래 수치로 복원',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                if (gs._paradoxActive) return;
                gs._paradoxActive = true;
                gs._paradoxBaseMax = gs.player.maxEnergy;
                gs.player.maxEnergy += 1;
                gs.player.energy = Math.min(gs.player.maxEnergy, (gs.player.energy || 0) + 1);
                return;
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._paradoxActive) {
                gs.player.maxEnergy = Math.max(1, gs._paradoxBaseMax || gs.player.maxEnergy);
                gs.player.energy = Math.min(gs.player.energy || 0, gs.player.maxEnergy);
                gs._paradoxActive = false;
                delete gs._paradoxBaseMax;
            }
        }
    },
};

const RARE_ITEMS = {
    // ══════════════ [ 대분류: 희귀 유물 ] ══════════════
    everlasting_oil: {
        id: 'everlasting_oil', name: '꺼지지 않는 기름', icon: '🕯️', rarity: 'rare',
        desc: '턴 시작: 무작위 카드 1장의 비용 0(이번 턴)',
        passive(gs, trigger, data) {
            const costTargets = getHandScopedCostTargets(gs);
            if (trigger === Trigger.TURN_DRAW_COMPLETE && gs.player.hand?.length > 0) {
                const h = gs.player.hand;
                const r = pickRandomHandIndex(h);
                setHandScopedCostTarget(gs, 'oilTargetIndex', r);
                gs.addLog?.(`🕯️ 꺼지지 않는 기름: ${CARDS[h[r]]?.name} 비용이 0이 되었습니다!`, 'item');
            }
            if (trigger === Trigger.BEFORE_CARD_COST && matchesHandScopedCard(data, costTargets?.oilTargetIndex)) {
                return withCardCostDelta(data, -99);
            }
            if (trigger === Trigger.TURN_END || trigger === Trigger.COMBAT_END) {
                clearHandScopedCostTargets(gs, ['oilTargetIndex']);
            }
        }
    },
    phoenix_feather: {
        id: 'phoenix_feather', name: '불사조의 깃털', icon: '🔥', rarity: 'rare',
        desc: '게임당 1회: 사망 시 체력 50% 회복 후 부활',
        passive(gs, trigger) {
            if (trigger === Trigger.PRE_DEATH && !gs.player._phoenixUsed) {
                gs.player._phoenixUsed = true;
                gs.player.hp = Math.floor(gs.player.maxHp * 0.5);
                gs.addLog?.('🔥 불사조의 깃털: 죽음에서 돌아왔습니다!', 'item');
                return true;
            }
        }
    },
    dimension_pocket: {
        id: 'dimension_pocket', name: '차원 주머니', icon: '🎒', rarity: 'rare',
        desc: '획득: 최대 에너지 +1 / 턴 시작: 덱에 [노이즈] 1장 추가',
        onAcquire(gs) { gs.player.maxEnergy += 1; },
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                if (!pushCardToCombatDrawPile(gs, 'curse_noise')) {
                    gs.player.deck.push('curse_noise');
                }
                gs.addLog?.('🎒 차원 주머니: 공간의 뒤틀림으로 노이즈가 유입됩니다.', 'echo');
            }
        }
    },
    mana_battery: {
        id: 'mana_battery', name: '마력 배터리', icon: '🔋', rarity: 'rare',
        desc: '턴 종료: 남은 에너지 이월(최대 3)',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END) gs._manaStored = Math.min(3, gs.player.energy);
            if (trigger === Trigger.TURN_START && gs._manaStored) {
                addPlayerEnergy(gs, gs._manaStored);
                gs.addLog?.(`🔋 마력 배터리: 에너지 ${gs._manaStored} 이월 완료.`, 'item');
                gs._manaStored = 0;
            }
            if (trigger === Trigger.COMBAT_END || trigger === 'death') {
                gs._manaStored = 0;
            }
        }
    },
    bloody_contract: {
        id: 'bloody_contract', name: '핏빛 계약', icon: '📜', rarity: 'rare',
        desc: '전투 시작: 체력 6 소모 / 카드 2장 드로우',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.player.hp = Math.max(1, gs.player.hp - 6);
                gs.drawCards(2, { name: '핏빛 계약', type: 'item' });
                gs.addLog?.('📜 핏빛 계약: 대가를 치르고 힘을 얻습니다.', 'item');
            }
        }
    },
    soul_magnet: {
        id: 'soul_magnet', name: '영혼 자석', icon: '🧲', rarity: 'rare',
        desc: '적 처치 시: 최대 체력 +2',
        passive(gs, trigger) {
            if (trigger === Trigger.ENEMY_KILL) {
                gs.player.maxHp += 2;
                gs.player.hp += 2;
                gs.addLog?.('🧲 영혼 자석: 생명력이 강화되었습니다.', 'item');
            }
        }
    },
    clockwork_butterfly: {
        id: 'clockwork_butterfly', name: '태엽 나비', icon: '🦋', rarity: 'rare',
        desc: '턴 시작 3회마다: 에너지 모두 회복',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs._butterflyCount = (gs._butterflyCount || 0) + 1;
                if (gs._butterflyCount >= 3) {
                    gs._butterflyCount = 0;
                    setPlayerEnergy(gs, gs.player.maxEnergy);
                    gs.addLog?.('🦋 태엽 나비: 시간을 가속하여 에너지를 보충합니다!', 'item');
                }
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._butterflyCount = 0;
            }
        }
    },
    energy_core: {
        id: 'energy_core', name: '에너지 핵', icon: '🔋', rarity: 'rare',
        desc: '보스 전투 승리 시: 최대 에너지 +1(최대 2)',
        passive(gs, trigger, data) {
            if (trigger !== Trigger.COMBAT_END || !data?.isBoss) return;
            const count = Number(gs.player._energyCoreCount || 0);
            if (count >= 2) return;
            gs.player._energyCoreCount = count + 1;
            gs.player.maxEnergy += 1;
            gs.player.energy = Math.min(gs.player.maxEnergy, (gs.player.energy || 0) + 1);
            gs.markDirty?.('hud');
            gs.addLog?.('🔋 에너지 핵: 최대 에너지 +1', 'echo');
        }
    },
    guardian_seal: {
        id: 'guardian_seal', name: '수호자의 인장', icon: '🪬', rarity: 'rare', setId: 'iron_fortress',
        desc: '세트 구성품\n[세트: 철옹성]',
        passive() { }
    },
    unyielding_fort: {
        id: 'unyielding_fort', name: '불굴의 성채', icon: '🏰', rarity: 'rare', setId: 'iron_fortress',
        desc: '세트 구성품\n[세트: 철옹성]',
        passive() { }
    },

    // 세트: 심연의 삼위일체
    abyssal_eye: {
        id: 'abyssal_eye', name: '심연의 눈', icon: '👁️', rarity: 'rare', setId: 'abyssal_set',
        desc: '상시: 적 방어막 무시\n[세트: 심연의 삼위일체]',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs._ignoreShield = true;
                gs.addLog?.('👁️ 심연의 눈: 적의 방어막이 무효화됩니다.', 'item');
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._ignoreShield = false;
            }
        }
    },
    abyssal_hand: {
        id: 'abyssal_hand', name: '심연의 손', icon: '🤚', rarity: 'rare', setId: 'abyssal_set',
        desc: '턴마다 처음 사용하는 카드: 2번 발동\n[세트: 심연의 삼위일체]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._abyssalUsed = false;
            if (trigger === Trigger.CARD_PLAY && !gs._abyssalUsed) {
                gs._abyssalUsed = true;
                return { doubleCast: true };
            }
        }
    },
    abyssal_heart: {
        id: 'abyssal_heart', name: '심연의 심장', icon: '🖤', rarity: 'rare', setId: 'abyssal_set',
        desc: '체력이 50% 이하일 때 턴 시작: 에너지 1 회복\n[세트: 심연의 삼위일체]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && gs.player.hp <= gs.player.maxHp * 0.5) {
                addPlayerEnergy(gs, 1);
                gs.addLog?.('🖤 심연의 심장: 고동소리가 빨라집니다.', 'item');
            }
        }
    },
};

const LEGENDARY_ITEMS = {
    // ══════════════ [ 대분류: 전설 유물 ] ══════════════
    eternity_core: {
        id: 'eternity_core', name: '영겁의 핵심', icon: '💎', rarity: 'legendary',
        desc: '턴 시작: 에너지 1 회복 / 카드 1장 드로우',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                addPlayerEnergy(gs, 1);
                gs.drawCards(1, { name: '영겁의 핵심', type: 'item' });
                gs.addLog?.('💎 영겁의 핵심: 시간이 가속됩니다.', 'item');
            }
        }
    },
    god_slayer_blade: {
        id: 'god_slayer_blade', name: '신살의 검', icon: '🗡️', rarity: 'legendary',
        desc: '상시: 엘리트 및 보스에게 주는 피해 50% 증가',
        passive(gs, trigger, data) {
            const amount = getTriggeredAmount(data);
            if (trigger === Trigger.DEAL_DAMAGE && amount !== null) {
                const targetIdx = resolveTriggeredTargetIdx(gs, data);
                const target = gs.combat?.enemies?.[targetIdx];
                if (target?.isElite || target?.isBoss) {
                    return withTriggeredAmount(data, Math.floor(amount * 1.5));
                }
            }
        }
    },
    infinite_loop: {
        id: 'infinite_loop', name: '무한의 루프', icon: '🌀', rarity: 'legendary',
        desc: '카드 3장 사용할 때마다: 손패의 무작위 카드 1장 소모 후 복사본 2장 추가',
        passive(gs, trigger, data) {
            if (trigger === Trigger.CARD_PLAY) {
                gs._loopCount = (gs._loopCount || 0) + 1;
                if (gs._loopCount % 3 === 0 && gs.player.hand?.length > 0) {
                    const h = gs.player.hand;
                    const r = Math.floor(Math.random() * h.length);
                    const card = exhaustHandCard(gs, r);
                    if (!card) return;
                    gs.player.hand.push(card, card);
                    gs.markDirty?.('hand');
                    gs.addLog?.(`🌀 무한의 루프: ${CARDS[card]?.name} 자가 증식!`, 'item');
                }
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._loopCount = 0;
            }
        }
    },
};

const BOSS_ITEMS = {
    // ══════════════ [ 대분류: 보스 유물 ] ══════════════
    boss_soul_mirror: {
        id: 'boss_soul_mirror', name: '영혼 거울', icon: '🪞', rarity: 'boss',
        desc: '획득: 최대 체력 -15 / 전투당 1회: 사망 시 체력 25 회복 후 부활',
        onAcquire(gs) {
            gs.player.maxHp = Math.max(1, gs.player.maxHp - 15);
            gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
            gs.player._bossSoulMirrorPenaltyApplied = true;
        },
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                if (!gs.player._bossSoulMirrorPenaltyApplied) {
                    gs.player.maxHp = Math.max(1, gs.player.maxHp - 15);
                    gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
                    gs.player._bossSoulMirrorPenaltyApplied = true;
                }
                gs._bossSoulMirrorRevived = false;
                return;
            }
            if (trigger === Trigger.PRE_DEATH && !gs._bossSoulMirrorRevived) {
                gs._bossSoulMirrorRevived = true;
                gs.player.hp = Math.max(1, Math.min(gs.player.maxHp || 1, (gs.player.hp || 0) + 25));
                return true;
            }
        }
    },
    boss_black_lotus: {
        id: 'boss_black_lotus', name: '흑연꽃', icon: '🪷', rarity: 'boss',
        desc: '상시: 손패 제한 -1 / 카드 5장 사용할 때마다: 카드 2장 드로우',
        onAcquire(gs) {
            gs.player._handCapMinus = Math.max(0, Number(gs.player._handCapMinus || 0) + 1);
            gs.player._bossBlackLotusPenaltyApplied = true;
        },
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                if (!gs.player._bossBlackLotusPenaltyApplied) {
                    gs.player._handCapMinus = Math.max(0, Number(gs.player._handCapMinus || 0) + 1);
                    gs.player._bossBlackLotusPenaltyApplied = true;
                }
                gs._bossBlackLotusCardCount = 0;
                return;
            }
            if (trigger === Trigger.CARD_PLAY) {
                gs._bossBlackLotusCardCount = (gs._bossBlackLotusCardCount || 0) + 1;
                if (gs._bossBlackLotusCardCount % 5 === 0) {
                    gs.drawCards?.(2, { name: '흑연꽃', type: 'item' });
                }
                return;
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._bossBlackLotusCardCount = 0;
            }
        }
    },
    titan_heart: {
        id: 'titan_heart', name: '티탄의 심장', icon: '❤️', rarity: 'boss',
        desc: '획득: 최대 체력 +50 / 상시: 체력 회복 불가',
        onAcquire(gs) { gs.player.maxHp += 50; gs.player.hp += 50; },
        passive(gs, trigger) {
            if (trigger === Trigger.HEAL_AMOUNT) return 0;
        }
    },
    eye_of_storm: {
        id: 'eye_of_storm', name: '폭풍의 눈', icon: '🌀', rarity: 'boss',
        desc: '획득: 최대 에너지 +1 / 턴 시작: 모든 적에게 취약 1 부여',
        onAcquire(gs) { gs.player.maxEnergy += 1; },
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.combat?.enemies?.forEach((enemy, idx) => {
                    if ((enemy?.hp || 0) > 0) gs.applyEnemyStatus?.('vulnerable', 1, idx, { name: '폭풍의 눈', type: 'item' });
                });
                gs.addLog?.('🌀 폭풍의 눈: 폭풍이 몰아칩니다.', 'item');
            }
        }
    },
};

const SPECIAL_ITEMS = {
    // ══════════════ [ 대분류: 특수/이벤트 유물 ] ══════════════
    eternal_fragment: {
        id: 'eternal_fragment', name: '영원의 파편', icon: '💎', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '획득: 최대 체력 +20 / 전투 시작: 최대 에너지 +1 / 매 턴 드로우 +1 / 전투 종료: 원래 수치로 복원',
        onAcquire(gs) {
            gs.player.maxHp += 20;
            gs.player.hp += 20;
        },
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._fragmentActive) {
                gs._fragmentActive = true;
                gs._fragmentBaseMax = gs.player.maxEnergy;
                gs.player.maxEnergy += 1;
                gs.player.energy = Math.min(gs.player.maxEnergy, (gs.player.energy || 0) + 1);
                addPlayerDrawCount(gs, 1);
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._fragmentActive) {
                gs.player.maxEnergy = gs._fragmentBaseMax ?? Math.max(1, gs.player.maxEnergy - 1);
                gs.player.energy = Math.min(gs.player.energy || 0, gs.player.maxEnergy);
                addPlayerDrawCount(gs, -1);
                gs._fragmentActive = false;
                delete gs._fragmentBaseMax;
            }
        }
    },
    dimension_key: {
        id: 'dimension_key', name: '차원 열쇠', icon: '🔑', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '상시: 카드 보상 선택지 +1',
        passive(gs, trigger, data) {
            if (trigger === Trigger.REWARD_GENERATE && data?.type === 'card') {
                return (data.count || 3) + 1;
            }
        }
    },
    glitch_circuit: {
        id: 'glitch_circuit', name: '글리치 회로', icon: '📼', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '턴 시작: 무작위 카드 1장의 비용 0 / 다른 카드 1장의 비용 +1(이번 턴)',
        passive(gs, trigger, data) {
            const costTargets = getHandScopedCostTargets(gs);
            if (trigger === Trigger.TURN_DRAW_COMPLETE && gs.player.hand?.length >= 2) {
                const h = gs.player.hand;
                const r1 = pickRandomHandIndex(h);
                const r2 = pickRandomHandIndex(h, [r1]);
                setHandScopedCostTarget(gs, 'glitch0Index', r1);
                setHandScopedCostTarget(gs, 'glitchPlusIndex', r2);
                gs.addLog?.('📼 글리치 회로: 데이터 간섭 발생!', 'item');
            }
            if (trigger === Trigger.BEFORE_CARD_COST) {
                if (matchesHandScopedCard(data, costTargets?.glitch0Index)) return withCardCostDelta(data, -99); // 0으로 만듦
                if (matchesHandScopedCard(data, costTargets?.glitchPlusIndex)) return withCardCostDelta(data, 1); // +1
            }
            if (trigger === Trigger.TURN_END) {
                clearHandScopedCostTargets(gs, ['glitch0Index', 'glitchPlusIndex']);
            }
            if (trigger === Trigger.COMBAT_END || trigger === 'death') {
                clearHandScopedCostTargets(gs, ['glitch0Index', 'glitchPlusIndex']);
            }
        }
    },
    ancient_battery: {
        id: 'ancient_battery', name: '고대 배터리', icon: '🔋', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '층마다 처음 구매하는 물약: 비용 없음',
        passive(gs, trigger, data) {
            if (trigger === Trigger.ITEM_USE) {
                const itemId = String(data?.itemId || '');
                const kind = String(data?.kind || '');
                if (itemId !== 'potion' && kind !== 'potion') return;

                const currentFloor = Math.max(0, Math.floor(Number(gs?.currentFloor || 0)));
                const usedFloor = Number(gs?.player?._ancientBatteryUsedFloor);
                if (Number.isFinite(usedFloor) && usedFloor === currentFloor) return;

                gs.player._ancientBatteryUsedFloor = currentFloor;
                return { ...data, costFree: true };
            }
        }
    },
    memory_thread: {
        id: 'memory_thread', name: '기억의 실타래', icon: '🧵', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '획득: 최대 체력 +12 / 전투 시작: 방어막 8 획득',
        onAcquire(gs) {
            gs.player.maxHp += 12;
            gs.player.hp += 12;
        },
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addShield?.(8, { name: '기억의 실타래', type: 'item' });
            }
        }
    },
    field_journal: {
        id: 'field_journal', name: '현장 기록장', icon: '📓', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '획득: 골드 +35 / 층 이동: 체력 3 회복',
        onAcquire(gs) {
            gs.addGold?.(35, { name: '현장 기록장', type: 'item' });
        },
        passive(gs, trigger) {
            if (trigger === Trigger.FLOOR_START) {
                gs.heal?.(3, { name: '현장 기록장', type: 'item' });
            }
        }
    },
    curator_lantern: {
        id: 'curator_lantern', name: '큐레이터의 등불', icon: '🏮', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '획득: 최대 체력 +8 / 전투 시작: 잔향 10 충전',
        onAcquire(gs) {
            gs.player.maxHp += 8;
            gs.player.hp += 8;
        },
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addEcho?.(10, { name: '큐레이터의 등불', type: 'item' });
            }
        }
    },
    ink_reservoir: {
        id: 'ink_reservoir', name: '잉크 저장고', icon: '🖋', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '획득: 골드 +20 / 전투 시작: 방어막 6 획득',
        onAcquire(gs) {
            gs.addGold?.(20, { name: '잉크 저장고', type: 'item' });
        },
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addShield?.(6, { name: '잉크 저장고', type: 'item' });
            }
        }
    },
    specimen_case: {
        id: 'specimen_case', name: '표본 보관함', icon: '🧰', rarity: 'special',
        specialOffer: true, requiresUnlock: true, obtainableFrom: ['special_event'],
        desc: '획득: 최대 체력 +10 / 층 이동: 골드 8 획득',
        onAcquire(gs) {
            gs.player.maxHp += 10;
            gs.player.hp += 10;
        },
        passive(gs, trigger) {
            if (trigger === Trigger.FLOOR_START) {
                gs.addGold?.(8, { name: '표본 보관함', type: 'item' });
            }
        }
    },
};

export const ITEMS = {
    ...COMMON_ITEMS,
    ...UNCOMMON_ITEMS,
    ...RARE_ITEMS,
    ...LEGENDARY_ITEMS,
    ...BOSS_ITEMS,
    ...SPECIAL_ITEMS
};
