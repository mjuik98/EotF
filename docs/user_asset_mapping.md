# 사용자 제공 에셋 매핑 리스트

사용자님께서 제공해주신 고품질 이미지들을 게임 내 데이터와 다음과 같이 매핑하고자 합니다. 
이미지들을 각각의 파일명으로 `assets/images/` 폴더에 저장해주시면 즉시 반영이 가능합니다.

## 1. 개별 강조 이미지 (High-Quality Singles)
| 제공 이미지 컨셉 | 제안 파일명 | 대상 데이터 (ID) |
| :--- | :--- | :--- |
| **피 흐르는 송곳니** | `relic_void_fang.png` | 유물: 공허의 송곳니 |
| **부식된 해골 전사** | `enemy_cursed_paladin.png` | 적: 저주받은 팔라딘 |
| **빛나는 푸른 방패** | `card_defend_standard.png` | 카드: 방어 (기본) |

## 2. 아이콘 그리드 (Icon Grid) 분석 및 매핑
### 카드 (Cards)
- `fire_blast` -> `card_flame_slash.png` (화염 검격)
- `ice_block` -> `card_echo_shield.png` (메아리 방어막)
- `poison_dart` -> `card_poison_blade.png` (독 바른 칼날)
- `radiant_heal` -> `card_sanctuary.png` (성소)
- `blood_strike` -> `card_desperate_strike.png` (필사의 일격)
- `whirlwind` -> `card_blade_dance.png` (검무)
- `time_warp` -> `card_time_warp.png` (시간 왜곡)
- `soul_drain` -> `card_soul_harvest.png` (영혼 수확)

### 적 (Enemies)
- `ancient_tree` -> `enemy_ancient_tree.png` (고대 나무)
- `lichen_king` (Lich King) -> `enemy_elite_memory_lich.png` (기억의 리치)
- `shadow_assassin` -> `enemy_silent_shade.png` (침묵의 그림자)
- `crystal_golem` -> `enemy_moss_golem.png` (이끼 골렘 - 크리스탈 변종)
- `demon_lord` -> `enemy_elite_fallen_deity.png` (타락한 신 - 엘리트)

### 유물 (Relics)
- `lucky_coin` -> `relic_worn_pouch.png` (낡은 주머니)
- `crystal_shard` -> `relic_surge_crystal.png` (과부하 크리스탈)
- `phoenix_feather` -> `relic_echo_heart.png` (메아리의 심장)
- `ancient_compass` -> `relic_void_compass.png` (공허의 나침반)
- `time_hourglass` -> `relic_temporal_lens.png` (시간의 렌즈)

---
> [!TIP]
> 위 리스트대로 파일을 준비해주시면, 제가 수동으로 생성하려던 Phase 4의 상당수 항목을 사용자님의 훨씬 더 높은 퀄리티 에셋으로 대체할 수 있습니다. 
> 파일들을 `assets/images/`에 해당 이름으로 덮어쓰기 해주시면 감사하겠습니다.
