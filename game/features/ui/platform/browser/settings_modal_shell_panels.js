export function buildSettingsModalTabsMarkup() {
  return `
<div class="settings-tabs">
  <button class="settings-tab-btn active" data-tab="sound">
    <span class="settings-tab-icon">🔊</span>사운드
  </button>
  <button class="settings-tab-btn" data-tab="visual">
    <span class="settings-tab-icon">✨</span>화면 효과
  </button>
  <button class="settings-tab-btn" data-tab="accessibility">
    <span class="settings-tab-icon">♿</span>접근성
  </button>
  <button class="settings-tab-btn" data-tab="keybindings">
    <span class="settings-tab-icon">⌨️</span>키 설정
  </button>
</div>
`.trim();
}

export function buildSettingsModalPanelsMarkup() {
  return `
<div class="settings-tab-panel" data-tab="sound">
  <div class="settings-vol-row">
    <span id="settings-vol-master-icon" class="settings-vol-icon">🔊</span>
    <label class="settings-vol-label">마스터 볼륨</label>
    <span id="settings-vol-master-val" class="settings-vol-val">80%</span>
  </div>
  <input type="range" id="settings-vol-master-slider" class="settings-slider settings-slider-master" min="0" max="100" value="80">

  <div class="settings-vol-row">
    <span id="settings-vol-sfx-icon" class="settings-vol-icon">🔊</span>
    <label class="settings-vol-label">효과음</label>
    <span id="settings-vol-sfx-val" class="settings-vol-val">80%</span>
  </div>
  <input type="range" id="settings-vol-sfx-slider" class="settings-slider settings-slider-sfx" min="0" max="100" value="80">

  <div class="settings-vol-row">
    <span id="settings-vol-ambient-icon" class="settings-vol-icon">🔊</span>
    <label class="settings-vol-label">배경음</label>
    <span id="settings-vol-ambient-val" class="settings-vol-val">40%</span>
  </div>
  <input type="range" id="settings-vol-ambient-slider" class="settings-slider settings-slider-ambient" min="0" max="100" value="40">

  <div class="settings-info-box">
    슬라이더를 움직이면 즉시 적용됩니다.
  </div>
</div>

<div class="settings-tab-panel" data-tab="visual" style="display:none;">
  <div class="settings-row">
    <div>
      <div class="settings-row-label">파티클 효과</div>
      <div class="settings-row-desc">전투 중 파티클 이펙트 표시</div>
    </div>
    <label class="settings-toggle-wrap">
      <input type="checkbox" id="settings-visual-particles" checked>
      <span class="settings-toggle-track" data-toggle-for="settings-visual-particles"></span>
    </label>
  </div>
  <div class="settings-row">
    <div>
      <div class="settings-row-label">화면 흔들림</div>
      <div class="settings-row-desc">강한 타격 시 카메라 흔들림 효과</div>
    </div>
    <label class="settings-toggle-wrap">
      <input type="checkbox" id="settings-visual-screenShake" checked>
      <span class="settings-toggle-track" data-toggle-for="settings-visual-screenShake"></span>
    </label>
  </div>
  <div class="settings-row">
    <div>
      <div class="settings-row-label">히트스톱</div>
      <div class="settings-row-desc">타격 순간 멈춤 연출 효과</div>
    </div>
    <label class="settings-toggle-wrap">
      <input type="checkbox" id="settings-visual-hitStop" checked>
      <span class="settings-toggle-track" data-toggle-for="settings-visual-hitStop"></span>
    </label>
  </div>
  <div class="settings-row">
    <div>
      <div class="settings-row-label">모션 줄이기</div>
      <div class="settings-row-desc">전환 애니메이션 강도를 낮춥니다</div>
    </div>
    <label class="settings-toggle-wrap">
      <input type="checkbox" id="settings-visual-reducedMotion">
      <span class="settings-toggle-track" data-toggle-for="settings-visual-reducedMotion"></span>
    </label>
  </div>
</div>

<div class="settings-tab-panel" data-tab="accessibility" style="display:none;">
  <div class="settings-row">
    <div>
      <div class="settings-row-label">폰트 크기</div>
      <div class="settings-row-desc">게임 텍스트 크기를 조절합니다</div>
    </div>
    <div class="settings-font-btns">
      <button class="settings-font-btn" data-font-size="small">소</button>
      <button class="settings-font-btn active" data-font-size="normal">중</button>
      <button class="settings-font-btn" data-font-size="large">대</button>
    </div>
  </div>
  <div class="settings-row">
    <div>
      <div class="settings-row-label">고대비 모드</div>
      <div class="settings-row-desc">텍스트와 UI 요소의 명암 대비를 높입니다</div>
    </div>
    <label class="settings-toggle-wrap">
      <input type="checkbox" id="settings-access-highContrast">
      <span class="settings-toggle-track" data-toggle-for="settings-access-highContrast"></span>
    </label>
  </div>
  <div class="settings-row">
    <div>
      <div class="settings-row-label">툴팁 즉시 표시</div>
      <div class="settings-row-desc">호버 지연 없이 툴팁을 즉시 표시합니다</div>
    </div>
    <label class="settings-toggle-wrap">
      <input type="checkbox" id="settings-access-tooltipDwell">
      <span class="settings-toggle-track" data-toggle-for="settings-access-tooltipDwell"></span>
    </label>
  </div>
  <div class="settings-info-box">
    접근성 설정은 적용 즉시 반영됩니다.
  </div>
</div>

<div class="settings-tab-panel" data-tab="keybindings" style="display:none;">
  <div id="settings-conflict-banner" class="settings-conflict-banner" style="display:none;">
    단축키 충돌이 있습니다. 버튼을 눌러 다시 지정하세요.
  </div>
  <div class="settings-info-box" style="margin-bottom:14px;">
    버튼 클릭 후 새 키를 입력하세요. ESC는 취소입니다.
  </div>

  <div class="settings-keybind-group-label">전투</div>
  <div class="settings-row">
    <div class="settings-row-label">턴 종료</div>
    <button class="settings-keybind-btn" data-keybind="endTurn">ENTER</button>
  </div>
  <div class="settings-row">
    <div class="settings-row-label">에코 스킬</div>
    <button class="settings-keybind-btn" data-keybind="echoSkill">E</button>
  </div>
  <div class="settings-row">
    <div class="settings-row-label">카드 드로우</div>
    <button class="settings-keybind-btn" data-keybind="drawCard">Q</button>
  </div>
  <div class="settings-row">
    <div class="settings-row-label">다음 대상</div>
    <button class="settings-keybind-btn" data-keybind="nextTarget">TAB</button>
  </div>

  <div class="settings-keybind-group-label" style="margin-top:16px;">시스템</div>
  <div class="settings-row">
    <div class="settings-row-label">일시정지</div>
    <button class="settings-keybind-btn" data-keybind="pause">ESC</button>
  </div>
  <div class="settings-row">
    <div class="settings-row-label">도움말</div>
    <button class="settings-keybind-btn" data-keybind="help">?</button>
  </div>
  <div class="settings-row">
    <div class="settings-row-label">덱 보기</div>
    <button class="settings-keybind-btn" data-keybind="deckView">D</button>
  </div>
  <div class="settings-row">
    <div class="settings-row-label">도감</div>
    <button class="settings-keybind-btn" data-keybind="codex">C</button>
  </div>
</div>
`.trim();
}
