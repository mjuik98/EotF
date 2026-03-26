import { DescriptionUtils } from '../../../ui/ports/public_feature_support_capabilities.js';

export function openCharacterSkillModal({
  skill,
  accent,
  state,
  resolveById,
  onClose,
} = {}) {
  if (!skill || !resolveById) return;

  if (state) state.activeSkill = skill;
  const isEcho = !!skill.echoCost;
  const tiers = (skill.tree || []).map((tier, index) => `
    <div style="padding:16px 20px;border:1px solid ${index === 0 ? `${accent}55` : `${accent}1a`};border-radius:10px;background:${index === 0 ? `${accent}0f` : 'transparent'};display:flex;align-items:flex-start;gap:16px;animation:fadeInUp .3s ease ${index * 0.07}s both">
      <div style="width:28px;height:28px;flex-shrink:0;border-radius:50%;border:2px solid ${index === 0 ? accent : `${accent}44`};display:flex;align-items:center;justify-content:center;font-size:12px;color:${index === 0 ? accent : `${accent}55`};font-family:'Share Tech Mono',monospace;font-weight:bold">${tier.tier}</div>
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
          <span style="font-size:15px;color:${index === 0 ? '#fff' : '#555'};letter-spacing:1px">${tier.name}</span>
          <span style="padding:2px 10px;border-radius:12px;font-size:11px;background:${accent}1a;color:${accent};font-family:'Share Tech Mono',monospace;border:1px solid ${accent}33">${tier.bonus}</span>
        </div>
        <p class="character-skill-tier-desc ${index === 0 ? 'is-active' : 'is-muted'}">${DescriptionUtils.highlight(tier.desc || '')}</p>
      </div>
    </div>
  `).join('');

  const modalBox = resolveById('modalBox');
  if (!modalBox) return;
  modalBox.style.border = `1px solid ${accent}33`;
  modalBox.style.boxShadow = `0 0 80px ${accent}22,0 30px 80px rgba(0,0,0,.8)`;
  modalBox.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      <span style="font-size:32px">${skill.icon}</span>
      <div>
        <p style="font-size:10px;letter-spacing:5px;color:#444;font-family:'Share Tech Mono',monospace;margin:0">${isEcho ? '잔향 기술 계보' : '기술 계보'}</p>
        <h3 style="font-size:20px;color:#fff;margin:0;letter-spacing:1.5px">${skill.name}</h3>
        ${isEcho ? `<span style="font-size:10px;color:${accent};font-family:'Share Tech Mono',monospace">${skill.echoCost}</span>` : ''}
      </div>
      <button id="modalClose" type="button" aria-label="닫기" class="character-skill-modal-close">x</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">${tiers}</div>
    <p style="font-size:11px;color:#222;text-align:center;font-family:'Share Tech Mono',monospace;margin:20px 0 0">ESC로 닫기</p>
  `;

  const modal = resolveById('skillModal');
  if (!modal) return;
  modal.classList.add('open');
  resolveById('modalClose')?.addEventListener('click', onClose);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) onClose?.();
  }, { once: true });
}

export function closeCharacterSkillModal({
  state,
  resolveById,
} = {}) {
  if (state) state.activeSkill = null;
  resolveById?.('skillModal')?.classList.remove('open');
}
