/**
 * Hidden Easter Egg (Hackathon Core Requirement)
 * Triggered by:
 * 1. Triple-clicking the acorn brooch in the hero/footer
 * 2. Typing the secret Konami-style code "BABY"
 */

import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/+esm';
import { sounds } from './audio.js';

export function initEasterEgg() {
  const triggerBtn = document.getElementById('easter-egg-trigger');
  const modal = document.getElementById('easter-egg-modal');
  const closeBtn = document.getElementById('close-modal-btn');

  let clickCount = 0;
  let clickTimeout = null;

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
  let typedBuffer = '';
  window.addEventListener('keydown', (e) => {
    typedBuffer += e.key.toUpperCase();
    if (typedBuffer.length > 10) {
      typedBuffer = typedBuffer.slice(-10);
    }
    if (typedBuffer.endsWith('BABY')) {
      unlockEasterEgg();
      typedBuffer = '';
    }
  });

  function unlockEasterEgg() {
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
