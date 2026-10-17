/**
 * Hidden Easter Egg (Hackathon Core Requirement)
 * Triggered by:
 * 1. Triple-clicking the acorn brooch in the hero/footer
 * 2. Typing the secret Konami-style code "BABY"
 */

import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/+esm';
import { sounds } from './audio.js';
import { awardBadge, getEarnedBadges, renderBadges } from './achievements.js';

export function initEasterEgg() {
  const triggerBtn = document.getElementById('easter-egg-trigger');
  const modal = document.getElementById('easter-egg-modal');
  const closeBtn = document.getElementById('close-modal-btn');

  let clickCount = 0;
  let clickTimeout = null;
  let typedBuffer = '';
  let konamiIndex = 0;
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // 1. Triple click on acorn badge
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      sounds.playPop();
      launchNovaShip();
      clickCount++;

      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        clickCount = 0;
      }, 700);

      if (clickCount >= 3) {
        unlockEasterEgg();
        clickCount = 0;
      }
    });
  }

  // 2. Keyboard code: "BABY"
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLElement && e.target.matches('input, textarea, select, [contenteditable="true"]')) return;

    typedBuffer += e.key.toUpperCase();
    if (typedBuffer.length > 10) {
      typedBuffer = typedBuffer.slice(-10);
    }
    if (typedBuffer.endsWith('BABY')) {
      unlockEasterEgg();
      typedBuffer = '';
    }

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiIndex = key === konamiCode[konamiIndex] ? konamiIndex + 1 : key === konamiCode[0] ? 1 : 0;
    if (konamiIndex === konamiCode.length) {
      unlockEasterEgg();
      konamiIndex = 0;
    }
  });

  window.addEventListener('nova:secret-discovered', unlockEasterEgg);

  function unlockEasterEgg() {
    awardBadge('secret');
    renderBadges();
    sounds.playChime(1046.50, 0.3); // High C6
    setTimeout(() => sounds.playTwinkle(), 150);

    // Confetti explosion using haX.baby palette
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd166', '#ff8066', '#56dfbe', '#65dcf2', '#f2fcff', '#9bbac5']
    });

    if (modal) {
      modal.hidden = false;
      modal.classList.add('is-open');
    }
  }

  const downloadButton = document.getElementById('download-license-btn');
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const context = canvas.getContext('2d');
      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      background.addColorStop(0, '#071722');
      background.addColorStop(1, '#173847');
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#ffd166';
      context.lineWidth = 12;
      context.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
      context.textAlign = 'center';
      context.fillStyle = '#ffd166';
      context.font = 'bold 72px Georgia, serif';
      context.fillText('COSMIC COSMONAUT LICENSE', canvas.width / 2, 190);
      context.fillStyle = '#effbff';
      context.font = '36px Georgia, serif';
      context.fillText('Honorary Intergalactic Flight Commander', canvas.width / 2, 280);
      context.fillStyle = '#9bbac5';
      context.font = 'bold 28px Arial, sans-serif';
      context.fillText('MISSION BADGES', canvas.width / 2, 390);

      const labels = {
        giggle: 'Nova’s Giggle',
        nebula: 'Nebula Mixer',
        route: 'Star Cartographer',
        guestbook: 'Mission Friend',
        dodge: 'Asteroid Ace',
        secret: 'Secret Starfinder'
      };
      const earned = getEarnedBadges();
      context.fillStyle = '#effbff';
      context.font = '32px Arial, sans-serif';
      const rows = earned.length ? earned.map((id) => `✦  ${labels[id]}`) : ['Your first badge is waiting among the stars.'];
      rows.forEach((label, index) => context.fillText(label, canvas.width / 2, 460 + index * 54));
      context.fillStyle = '#ffd166';
      context.font = '24px Arial, sans-serif';
      context.fillText(`Issued ${new Date().toLocaleDateString()}`, canvas.width / 2, 810);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        const imageUrl = URL.createObjectURL(blob);
        link.href = imageUrl;
        link.download = 'nova-cosmonaut-license.png';
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
      }, 'image/png');
    });
  }

  function launchNovaShip() {
    const ship = document.createElement('span');
    ship.className = 'nova-ship-flight';
    ship.setAttribute('aria-hidden', 'true');
    ship.textContent = '🚀';
    ship.addEventListener('animationend', () => ship.remove(), { once: true });
    document.body.append(ship);
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      sounds.playPop();
      modal.classList.remove('is-open');
      setTimeout(() => (modal.hidden = true), 250);
    });
  }
}
