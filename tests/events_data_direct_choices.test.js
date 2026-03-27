import { afterEach, describe, expect, it, vi } from 'vitest';

import { EVENTS } from '../data/events_data.js';

function findChoice(eventId, choiceText) {
  const event = EVENTS.find((entry) => entry.id === eventId);
  return event?.choices?.find((choice) => String(choice?.text || '').includes(choiceText));
}

describe('events_data direct choice branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lets void_crack grant an obtainable item and codex registration', () => {
    const choice = findChoice('void_crack', '균열이 삼키는 대로 둔다');
    const services = {
      playItemGet: vi.fn(),
      showItemToast: vi.fn(),
    };
    const gs = {
      player: {
        hp: 50,
        items: [],
      },
      meta: {},
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = choice.effect(gs, services);

    expect(result).toEqual(expect.any(String));
    expect(gs.player.hp).toBe(30);
    expect(gs.player.items).toHaveLength(1);
    expect(gs.meta.codex.items.has(gs.player.items[0])).toBe(true);
    expect(services.playItemGet).toHaveBeenCalledTimes(1);
    expect(services.showItemToast).toHaveBeenCalledWith(expect.objectContaining({
      id: gs.player.items[0],
    }));
  });

  it('reroutes a future combat node when cartographer imprints the path', () => {
    const choice = findChoice('cartographer', '눈에 새긴다');
    const gs = {
      currentFloor: 1,
      mapNodes: [
        { id: 'n1', floor: 2, pos: 0, type: 'combat', visited: false },
      ],
      player: {
        gold: 0,
        echo: 0,
      },
      addGold(amount) {
        this.player.gold += amount;
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = choice.effect(gs);

    expect(gs.player.gold).toBe(20);
    expect(gs.player.echo).toBe(15);
    expect(gs.mapNodes[0].type).toBe('event');
    expect(result).toContain('2층 A 구역');
    expect(result).toContain('이벤트');
  });

  it('returns a structured failure when cartographer sync lacks gold', () => {
    const choice = findChoice('cartographer', '지도가 원하는 대로 얽힌다');
    const gs = {
      player: {
        gold: 10,
      },
      addEcho: vi.fn(),
    };

    const result = choice.effect(gs);

    expect(result).toEqual({
      resultText: '동기화에 필요한 것이 없다. 지도가 당신을 거부한다. 아직은.',
      isFail: true,
    });
    expect(gs.addEcho).not.toHaveBeenCalled();
  });

  it('turns a visible future node into a rest stop when lookout heals there', () => {
    const choice = findChoice('lookout', '고요에 삼켜진다');
    const gs = {
      currentFloor: 1,
      mapNodes: [
        { id: 'n2', floor: 2, pos: 1, type: 'event', visited: false },
      ],
      player: {
        hp: 22,
        maxHp: 40,
      },
      heal(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
      },
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = choice.effect(gs);

    expect(gs.player.hp).toBe(40);
    expect(gs.mapNodes[0].type).toBe('rest');
    expect(result).toContain('2층 B 구역');
    expect(result).toContain('휴식처');
  });

  it('trades gold for a card in echo_scale and triggers item acquisition audio', () => {
    const choice = findChoice('echo_scale', '랜덤 카드 추가');
    const services = {
      playItemGet: vi.fn(),
    };
    const gs = {
      player: {
        gold: 20,
        deck: [],
      },
      getRandomCard() {
        return 'strike';
      },
    };

    const result = choice.effect(gs, services);

    expect(gs.player.gold).toBe(5);
    expect(gs.player.deck).toEqual(['strike']);
    expect(result).toEqual({
      resultText: '금화 한 자루가 사라지고, 대신 빛바랜 타격 카드가 나타났다. 공정한 거래였다.',
      acquiredCard: 'strike',
    });
    expect(services.playItemGet).toHaveBeenCalledTimes(1);
  });

  it('adds a rare card when the silent pool swallows the player', () => {
    const choice = findChoice('silent_pool', '삼켜진다');
    const gs = {
      player: {
        hp: 40,
        deck: [],
      },
      getRandomCard(rarity) {
        expect(rarity).toBe('rare');
        return 'strike';
      },
    };

    const result = choice.effect(gs);

    expect(gs.player.hp).toBe(20);
    expect(gs.player.deck).toEqual(['strike']);
    expect(result).toEqual({
      resultText: '타격. 혀가 타는 것 같다. 하지만 손에 카드가 있다. 누군가의 기억을 마신 것이다.',
      acquiredCard: 'strike',
    });
  });

  it('reroutes two future nodes when cartographer sync fully succeeds', () => {
    const choice = findChoice('cartographer', '지도가 원하는 대로 얽힌다');
    const gs = {
      currentFloor: 1,
      mapNodes: [
        { id: 'n1', floor: 2, pos: 0, type: 'combat', visited: false },
        { id: 'n2', floor: 2, pos: 1, type: 'event', visited: false },
      ],
      player: {
        gold: 20,
        echo: 0,
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const result = choice.effect(gs);

    expect(gs.player.gold).toBe(5);
    expect(gs.player.echo).toBe(40);
    expect(gs.mapNodes[0].type).toBe('elite');
    expect(gs.mapNodes[1].type).toBe('shop');
    expect(result).toContain('2층 A 구역');
    expect(result).toContain('2층 B 구역');
    expect(result).toContain('정예 전투');
    expect(result).toContain('상점');
  });

  it('downgrades a visible elite node into combat through the lookout', () => {
    const choice = findChoice('lookout', '적들이 보이는 대로 기억한다');
    const gs = {
      currentFloor: 1,
      mapNodes: [
        { id: 'n3', floor: 2, pos: 2, type: 'elite', visited: false },
      ],
      player: {
        echo: 0,
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = choice.effect(gs);

    expect(gs.player.echo).toBe(20);
    expect(gs.mapNodes[0].type).toBe('combat');
    expect(result).toContain('2층 C 구역');
    expect(result).toContain('전투');
  });

  it('returns the max-health guard text when echo_scale healing is unavailable', () => {
    const choice = findChoice('echo_scale', '체력 15');
    const gs = {
      player: {
        hp: 30,
        maxHp: 30,
        gold: 40,
      },
      heal: vi.fn(),
    };

    const result = choice.effect(gs);

    expect(result).toBe('당신의 생명은 이미 가득 차 있다. 저울이 불균형하게 흔들리다 멈춘다.');
    expect(gs.player.gold).toBe(40);
    expect(gs.heal).not.toHaveBeenCalled();
  });

  it('applies gold and echo gain when lost_memory is consumed', () => {
    const choice = findChoice('lost_memory', '집어삼킨다');
    const gs = {
      player: {
        gold: 0,
        echo: 0,
      },
      addGold(amount) {
        this.player.gold += amount;
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    const result = choice.effect(gs);

    expect(gs.player.gold).toBe(25);
    expect(gs.player.echo).toBe(20);
    expect(result).toContain('남의 기억이 당신 안으로 들어온다');
  });

  it('lets the returned caravan reroute a future node after saving the merchant', () => {
    const choice = findChoice('merchant_caravan', '안전한 길');
    const gs = {
      currentFloor: 1,
      worldMemory: {
        savedMerchant: 1,
      },
      mapNodes: [
        { id: 'n4', floor: 2, pos: 0, type: 'combat', visited: false },
      ],
      player: {
        gold: 0,
        hp: 22,
        maxHp: 40,
      },
      heal(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
      },
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = choice.effect(gs);

    expect(gs.worldMemory.merchantCaravanMet).toBe(1);
    expect(gs.player.hp).toBe(30);
    expect(gs.mapNodes[0].type).toBe('shop');
    expect(result).toContain('상점');
  });

  it('forces a debt payment path after robbing the merchant', () => {
    const choice = findChoice('merchant_collectors', '빚을 갚는다');
    const gs = {
      worldMemory: {
        stoleFromMerchant: true,
      },
      player: {
        gold: 40,
      },
    };

    const result = choice.effect(gs);

    expect(gs.player.gold).toBe(15);
    expect(gs.worldMemory.merchantDebtResolved).toBe(1);
    expect(result).toContain('빚');
  });

  it('lets the ancient echo memorial convert boss memory into echo charge', () => {
    const choice = findChoice('ancient_echo_memorial', '잔향을 받아들인다');
    const gs = {
      worldMemory: {
        killed_ancient_echo: 1,
      },
      player: {
        echo: 5,
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    const result = choice.effect(gs);

    expect(gs.player.echo).toBe(45);
    expect(gs.worldMemory.ancientEchoMemorialSeen).toBe(1);
    expect(result).toContain('태고의 잔향');
  });

  it('opens a broker reroute event when merchant and boss memories overlap', () => {
    const choice = findChoice('memory_broker', '봉인 좌표를 산다');
    const gs = {
      currentFloor: 1,
      worldMemory: {
        savedMerchant: 1,
        killed_ancient_echo: 1,
      },
      mapNodes: [
        { id: 'n5', floor: 2, pos: 0, type: 'combat', visited: false },
      ],
      player: {
        gold: 40,
      },
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = choice.effect(gs);

    expect(gs.player.gold).toBe(15);
    expect(gs.worldMemory.memoryBrokerMet).toBe(1);
    expect(gs.mapNodes[0].type).toBe('event');
    expect(result).toContain('2층 A 구역');
  });

  it('unlocks a long-term triangulation event after cartographer and lookout memories overlap', () => {
    const event = EVENTS.find((entry) => entry.id === 'route_triangulation');
    const choice = findChoice('route_triangulation', '교차 좌표를 고정한다');
    const gs = {
      currentFloor: 1,
      worldMemory: {
        cartographerMarked: 1,
        lookoutWatched: 1,
      },
      mapNodes: [
        { id: 'n6', floor: 2, pos: 0, type: 'combat', visited: false },
        { id: 'n7', floor: 2, pos: 1, type: 'event', visited: false },
      ],
      player: {
        gold: 25,
        echo: 0,
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    expect(event?.isAvailable(gs)).toBe(true);

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const result = choice.effect(gs);

    expect(gs.player.gold).toBe(5);
    expect(gs.player.echo).toBe(35);
    expect(gs.worldMemory.routeTriangulated).toBe(1);
    expect(gs.mapNodes[0].type).toBe('elite');
    expect(gs.mapNodes[1].type).toBe('shop');
    expect(result).toContain('정예 전투');
    expect(result).toContain('상점');
  });

  it('lets the surveyors requiem cash out unlocked special relics from long-term world state', () => {
    const event = EVENTS.find((entry) => entry.id === 'surveyors_requiem');
    const choice = findChoice('surveyors_requiem', '조사품을 회수한다');
    const services = {
      playItemGet: vi.fn(),
      showItemToast: vi.fn(),
    };
    const gs = {
      worldMemory: {
        routeTriangulated: 1,
        killed_silent_tyrant: 1,
      },
      player: {
        gold: 0,
        items: [],
      },
      addGold(amount) {
        this.player.gold += amount;
      },
      meta: {
        contentUnlocks: {
          relics: {
            field_journal: { unlocked: true },
          },
          relicsByClass: {},
          cards: { shared: {} },
        },
      },
    };

    expect(event?.isAvailable(gs)).toBe(true);

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = choice.effect(gs, services);

    expect(gs.worldMemory.surveyorsRequiemSeen).toBe(1);
    expect(gs.player.gold).toBe(60);
    expect(gs.player.items).toEqual(['field_journal']);
    expect(result).toContain('현장 기록장');
    expect(services.playItemGet).toHaveBeenCalledTimes(1);
    expect(services.showItemToast).toHaveBeenCalledWith(expect.objectContaining({
      id: 'field_journal',
    }));
  });
});
