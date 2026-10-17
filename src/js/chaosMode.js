/**
 * Responsive Chaos Mode (Bonus Side Quest: +5 pts)
 * Unleashes a nostalgic, playful early-2000s GeoCities explosion:
 * 1. Retro marquee ticker
 * 2. Spinning 88x31 badges
 * 3. Bouncing sticker badges
 * 4. Quirky rainbow animations
 */

import { sounds } from './audio.js';

export function initChaosMode() {
  const toggleBtn = document.getElementById('chaos-toggle-btn');
  const banner = document.getElementById('chaos-marquee');
  if (!toggleBtn) return;

  let isChaos = false;

  toggleBtn.addEventListener('click', () => {
    isChaos = !isChaos;
    sounds.playPop();

    if (isChaos) {
      document.body.classList.add('chaos-mode-active');
      sounds.playTwinkle();
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.innerHTML = '✨ Exit Chaos Mode';
      if (banner) banner.hidden = false;
      spawnFloatingBadges();
    } else {
      document.body.classList.remove('chaos-mode-active');
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.innerHTML = '🌀 Chaos Mode (+5 pts)';
      if (banner) banner.hidden = true;
      removeFloatingBadges();
    }
  });
}

function spawnFloatingBadges() {
  const badges = [
    '⭐ BEST VIEWED IN NETSCAPE 4.0 ⭐',
    '🧶 100% ORGANIC STARLIGHT SILK',
    '💤 SLEEP APPROVED BY MIDNIGHT NURSERY',
    '🍼 BABY\'S FIRST WEBSITE WINNER'
  ];

  badges.forEach((text, i) => {
    const el = document.createElement('div');
    el.className = 'chaos-floating-badge';
    el.innerText = text;
    el.style.top = `${15 + i * 20}%`;
    el.style.left = `${(i % 2 === 0 ? 5 : 82)}%`;
    el.style.animationDelay = `${i * 0.4}s`;
    document.body.appendChild(el);
  });
}

function removeFloatingBadges() {
  const existing = document.querySelectorAll('.chaos-floating-badge');
  existing.forEach((el) => el.remove());
}
