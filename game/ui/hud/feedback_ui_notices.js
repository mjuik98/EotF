import { DescriptionUtils } from '../../utils/description_utils.js';

const noticeQueue = [];
let noticeActive = false;

function getDoc(deps) {
  return deps?.doc || document;
}

export function showLegendaryAcquireOverlay(item, deps = {}) {
  const doc = getDoc(deps);
  const audioEngine = deps.audioEngine;
  const screenShake = deps.screenShake;
  if (!doc?.body || !item) return false;

  audioEngine?.playLegendary?.();
  screenShake?.shake?.(8, 0.6);

  const overlay = doc.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(3,2,12,0.0);pointer-events:all;cursor:pointer;';
  overlay.addEventListener('click', () => overlay.remove());

  const bg = doc.createElement('div');
  bg.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(192,132,252,0.18) 0%,transparent 70%);animation:fadeIn 0.8s ease both;';
  overlay.appendChild(bg);

  const rays = doc.createElement('div');
  rays.style.cssText = 'position:absolute;top:50%;left:50%;width:600px;height:600px;margin:-300px;pointer-events:none;';
  for (let i = 0; i < 8; i += 1) {
    const ray = doc.createElement('div');
    ray.style.cssText = `position:absolute;top:50%;left:50%;width:2px;height:280px;margin-left:-1px;transform-origin:top center;transform:rotate(${i * 45}deg);background:linear-gradient(to bottom,rgba(192,132,252,0.6),transparent);animation:legendaryRays 1.4s ease ${i * 0.05}s forwards;`;
    rays.appendChild(ray);
  }
  overlay.appendChild(rays);

  const card = doc.createElement('div');
  card.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;animation:legendaryReveal 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both;';

  const head = doc.createElement('div');
  head.style.cssText = "font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.6em;color:rgba(192,132,252,0.7);margin-bottom:16px;animation:fadeIn 0.5s ease 0.3s both;";
  head.textContent = '전설 아이템 획득';

  const body = doc.createElement('div');
  body.style.cssText = 'width:160px;background:rgba(15,8,35,0.97);border:2px solid rgba(192,132,252,0.7);border-radius:20px;padding:28px 20px;margin:0 auto 20px;box-shadow:0 0 60px rgba(192,132,252,0.4),0 0 120px rgba(192,132,252,0.15);position:relative;overflow:hidden;';

  const innerGlow = doc.createElement('div');
  innerGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at top,rgba(192,132,252,0.12),transparent 60%);pointer-events:none;';

  const icon = doc.createElement('div');
  icon.style.cssText = 'font-size:52px;margin-bottom:14px;filter:drop-shadow(0 0 16px rgba(192,132,252,0.8));';
  icon.textContent = item.icon;

  const name = doc.createElement('div');
  name.style.cssText = "font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:#c084fc;letter-spacing:0.05em;margin-bottom:8px;";
  name.textContent = item.name;

  const desc = doc.createElement('div');
  desc.style.cssText = 'font-size:11px;color:rgba(220,210,240,0.8);line-height:1.6;';
  desc.innerHTML = DescriptionUtils?.highlight?.(item.desc) || item.desc;

  body.append(innerGlow, icon, name, desc);

  const foot = doc.createElement('div');
  foot.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:rgba(192,132,252,0.6);animation:fadeIn 0.6s ease 0.6s both;";
  foot.textContent = '클릭하여 닫기';

  card.append(head, body, foot);

  for (let i = 0; i < 16; i += 1) {
    const particle = doc.createElement('div');
    const angle = (i / 16) * Math.PI * 2;
    const dist = 80 + Math.random() * 80;
    const cx = Math.cos(angle) * dist;
    const cy = Math.sin(angle) * dist;
    particle.style.cssText = `position:absolute;top:50%;left:50%;width:4px;height:4px;border-radius:50%;background:#c084fc;
      margin:-2px;transform:translate(${cx}px,${cy}px);
      animation:legendaryParticle ${0.8 + Math.random() * 0.6}s ease ${Math.random() * 0.4}s forwards;
      box-shadow:0 0 6px rgba(192,132,252,0.8);pointer-events:none;`;
    overlay.appendChild(particle);
  }

  overlay.appendChild(card);
  doc.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 5000);
  return true;
}

export function enqueueWorldMemoryNotice(text, deps = {}, flushFn) {
  const parts = String(text || '').split(' · ').map((entry) => entry.trim()).filter(Boolean);
  parts.forEach((part) => noticeQueue.push(part));
  if (!noticeActive) flushFn?.(deps);
}

export function flushWorldMemoryNoticeQueue(deps = {}, flushFn) {
  if (!noticeQueue.length) {
    noticeActive = false;
    return false;
  }

  noticeActive = true;
  const doc = getDoc(deps);
  const text = noticeQueue.shift();
  const el = doc.createElement('div');
  el.className = 'world-memory-notice';
  el.style.cssText = "position:fixed;top:68px;left:50%;transform:translateX(-50%);font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.2em;color:var(--cyan);background:rgba(0,20,18,0.96);border:1px solid rgba(0,255,204,0.3);border-radius:10px;padding:12px 28px;z-index:9000;box-shadow:0 4px 28px rgba(0,255,204,0.15);animation:worldNoticeIn 0.4s ease both;white-space:nowrap;pointer-events:none;text-align:center;max-width:90vw;";
  el.textContent = text;
  doc.body.appendChild(el);

  const showDuration = Math.max(2800, text.length * 60);
  setTimeout(() => {
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-10px)';
    setTimeout(() => {
      el.remove();
      flushFn?.(deps);
    }, 500);
  }, showDuration);

  return true;
}
