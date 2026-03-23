import { CONSTANTS } from '../../ports/presentation/public_combat_runtime_support_capabilities.js';

export function buildEchoSkillTooltipTiers(gs) {
  const cls = gs?.player?.class;
  const echo = gs?.player?.echo || 0;

  return [1, 2, 3].map((tier) => {
    const skill = CONSTANTS.ECHO_SKILLS[cls]?.[tier];
    let desc = skill?.desc || '';

    if (typeof gs?.calculatePotentialDamage === 'function') {
      if (skill?.dmg) {
        const potential = gs.calculatePotentialDamage(skill.dmg, true);
        desc = desc.replace(/피해 \d+/, `피해 ${potential}`);
      }
      if (skill?.aoedmg) {
        const potential = gs.calculatePotentialDamage(skill.aoedmg, true);
        desc = desc.replace(/피해 \d+/, `피해 ${potential}`);
      }
    }

    return {
      stars: '★'.repeat(tier),
      cost: skill?.cost || 0,
      active: echo >= (skill?.cost || 0),
      desc,
    };
  });
}

export function showEchoSkillTooltip(doc, win, event, gs) {
  if (!gs?.player) return false;

  const tooltip = doc.getElementById('echoSkillTooltip');
  const content = doc.getElementById('echoSkillTtContent');
  const target = event?.target;
  if (!tooltip || !content || typeof target?.getBoundingClientRect !== 'function') return false;

  content.textContent = '';
  buildEchoSkillTooltipTiers(gs).forEach((tier) => {
    const tierElement = doc.createElement('div');
    tierElement.className = `echo-skill-tt-tier${tier.active ? ' active' : ''}`;

    const inner = doc.createElement('div');
    const stars = doc.createElement('div');
    stars.className = 'echo-skill-tt-stars';
    stars.textContent = `${tier.stars} `;

    const cost = doc.createElement('span');
    cost.className = 'echo-skill-tt-cost';
    cost.textContent = `(${tier.cost} 잔향)`;
    stars.appendChild(cost);

    const desc = doc.createElement('div');
    desc.className = 'echo-skill-tt-desc';
    desc.textContent = tier.desc;

    inner.appendChild(stars);
    inner.appendChild(desc);
    tierElement.appendChild(inner);
    content.appendChild(tierElement);
  });

  const rect = target.getBoundingClientRect();
  tooltip.style.left = `${Math.min(rect.left, win.innerWidth - 240)}px`;
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
  tooltip.classList.add('visible');

  const scheduleFrame = typeof win?.requestAnimationFrame === 'function'
    ? win.requestAnimationFrame.bind(win)
    : ((callback) => setTimeout(callback, 16));
  scheduleFrame(() => {
    const height = tooltip.offsetHeight;
    const top = rect.top - height - 10;
    tooltip.style.top = `${top < 10 ? rect.bottom + 10 : top}px`;
  });

  return true;
}

export function hideEchoSkillTooltip(doc) {
  const tooltip = doc.getElementById('echoSkillTooltip');
  if (!tooltip) return false;
  tooltip.classList.remove('visible');
  return true;
}

export function showTurnBanner(doc, win, type) {
  const banner = doc.getElementById('turnBanner');
  if (!banner) return false;

  banner.className = type === 'player' ? 'player' : 'enemy';
  banner.textContent = type === 'player' ? '⚡ 플레이어 턴' : '💢 적의 턴';
  banner.style.display = 'block';
  banner.style.animation = 'none';
  void banner.offsetWidth;
  banner.style.animation = 'turnBannerIn 1.2s ease forwards';
  win.clearTimeout(banner._hideTimer);
  banner._hideTimer = win.setTimeout(() => {
    banner.style.display = 'none';
  }, 1200);

  return true;
}
