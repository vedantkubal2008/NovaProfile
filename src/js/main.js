/**
 * Master Controller: Nova, The Pocket Cosmonaut
 * Orchestrates all interactive toys, space sound synthesis, theme shifts, and side quests.
 */

import { sounds } from './audio.js';
import { initSpaceBackground } from './spaceBackground.js';
import { initSparkleTrail } from './sparkles.js';
import { initEyeTracker } from './eyeTracker.js';
import { initConstellationLoom } from './constellationLoom.js';
import { initAuroraJar } from './auroraJar.js';
import { initStoryScroll } from './storyScroll.js';
import { initGuestbook } from './guestbook.js?v=runtime-env-fix-4f6d000';
import { initHitCounter } from './odometer.js';
import { initChaosMode } from './chaosMode.js?v=0182b7d';
import { initEasterEgg } from './easterEgg.js';
import { initMilkRoutes } from './milkRoutes.js';
import { renderBadges } from './achievements.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const menuButton = document.getElementById('nav-menu-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const bedtimeButton = document.getElementById('bedtime-toggle-btn');
  const bedtimeCompanion = document.getElementById('bedtime-companion');
  const bedtimeNova = document.getElementById('bedtime-mini-nova');
  let bedtimeStartedLullaby = false;

  function closeNavigation() {
    if (!menuButton || !primaryNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    menuButton.title = 'Open navigation';
    menuButton.innerHTML = '<span aria-hidden="true">☰</span><span class="nav-menu-label">Menu</span>';
    primaryNav.classList.remove('is-open');
  }

  if (menuButton && primaryNav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      menuButton.title = isOpen ? 'Close navigation' : 'Open navigation';
      menuButton.innerHTML = isOpen
        ? '<span aria-hidden="true">×</span><span class="nav-menu-label">Close</span>'
        : '<span aria-hidden="true">☰</span><span class="nav-menu-label">Menu</span>';
      primaryNav.classList.toggle('is-open', isOpen);
    });
    primaryNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeNavigation();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeNavigation();
        menuButton.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeNavigation();
    });
  }

  function applyLocalSky() {
    const hour = new Date().getHours();
    root.dataset.skyTime = hour >= 7 && hour < 19 ? 'day' : 'night';
  }

  applyLocalSky();
  window.setInterval(applyLocalSky, 60 * 60 * 1000);

  if (bedtimeButton) {
    bedtimeButton.addEventListener('click', () => {
      const isBedtime = !root.classList.contains('bedtime-mode');
      root.classList.toggle('bedtime-mode', isBedtime);
      bedtimeButton.setAttribute('aria-pressed', String(isBedtime));
      bedtimeButton.innerHTML = isBedtime ? '☀️ <span class="btn-text">Wake Nova</span>' : '🌙 <span class="btn-text">Bedtime</span>';
      if (bedtimeCompanion) bedtimeCompanion.hidden = !isBedtime;
      if (isBedtime && bedtimeNova && !bedtimeNova.firstChild) {
        const avatar = document.querySelector('.astro-character-svg')?.cloneNode(true);
        if (avatar) {
          const ids = new Map();
          avatar.querySelectorAll('[id]').forEach((node) => {
            const originalId = node.id;
            node.id = `bedtime-${originalId}`;
            ids.set(originalId, node.id);
          });
          avatar.querySelectorAll('*').forEach((node) => {
            ['fill', 'stroke', 'filter', 'clip-path', 'mask'].forEach((attribute) => {
              const value = node.getAttribute(attribute);
              if (!value) return;
              ids.forEach((newId, oldId) => {
                node.setAttribute(attribute, value.replaceAll(`url(#${oldId})`, `url(#${newId})`));
              });
            });
          });
          avatar.setAttribute('aria-hidden', 'true');
          avatar.removeAttribute('role');
          avatar.classList.add('bedtime-mini-avatar-art');
          bedtimeNova.append(avatar);
        }
      }

      if (isBedtime && !sounds.lullabyPlaying) {
        bedtimeStartedLullaby = sounds.toggleLullaby();
      } else if (!isBedtime && bedtimeStartedLullaby && sounds.lullabyPlaying) {
        sounds.toggleLullaby();
        bedtimeStartedLullaby = false;
      }
      updateSoundBtnUI(sounds.isMuted);
    });
  }

  // 1. Launch Interactive Deep Space Animated Starfield
  initSpaceBackground();

  // 2. Initialize Audio Engine & Mute Button (+3 pts side quest)
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  if (soundToggleBtn) {
    updateSoundBtnUI(sounds.isMuted);

    soundToggleBtn.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      updateSoundBtnUI(isMuted);
    });
  }

  function updateSoundBtnUI(isMuted) {
    if (!soundToggleBtn) return;
    if (isMuted) {
      soundToggleBtn.setAttribute('aria-label', 'Space sound effects off. Click to enable');
      soundToggleBtn.setAttribute('aria-pressed', 'false');
      soundToggleBtn.innerHTML = '🔇 <span class="btn-text">Unmute sounds</span>';
    } else {
      soundToggleBtn.setAttribute('aria-label', 'Space sound effects on. Click to mute');
      soundToggleBtn.setAttribute('aria-pressed', 'true');
      soundToggleBtn.innerHTML = '📡 <span class="btn-text">Comms ON</span>';
    }
  }

  // Bind pop sounds to all buttons and links
  document.querySelectorAll('button, a.btn-pill, .interactive-click').forEach((el) => {
    el.addEventListener('click', () => {
      sounds.playPop();
    });
  });

  // 3. Theme Toggle: Deep Cosmos <-> Lunar Base
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    const savedTheme = localStorage.getItem('nova_theme') || 'cosmos';
    if (savedTheme === 'lunar') {
      document.documentElement.setAttribute('data-theme', 'lunar');
      themeToggleBtn.innerHTML = '🌌 <span class="btn-text">Cosmos Mode</span>';
    }

    themeToggleBtn.addEventListener('click', () => {
      sounds.playPop();
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'lunar' ? 'cosmos' : 'lunar';
      
      if (nextTheme === 'lunar') {
        document.documentElement.setAttribute('data-theme', 'lunar');
        themeToggleBtn.innerHTML = '🌌 <span class="btn-text">Cosmos Mode</span>';
        sounds.playChime(659.25);
      } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '🌕 <span class="btn-text">Lunar Station</span>';
        sounds.playChime(880.00);
      }
      localStorage.setItem('nova_theme', nextTheme);
    });
  }

  // 4. Ambient Space Lullaby Synthesizer
  const lullabyBtn = document.getElementById('lullaby-toggle-btn');
  if (lullabyBtn) {
    lullabyBtn.addEventListener('click', () => {
      sounds.playPop();
      const isPlaying = sounds.toggleLullaby();
      updateSoundBtnUI(sounds.isMuted);

      if (isPlaying) {
        lullabyBtn.classList.add('is-playing');
        lullabyBtn.innerHTML = '⭐ Stop Nova\'s Lullaby';
      } else {
        lullabyBtn.classList.remove('is-playing');
        lullabyBtn.innerHTML = '🎶 Play Nova\'s Fav Lullaby';
      }
    });
  }

  // 5. Initialize Interactive Toys & Side Quests
  initSparkleTrail();      // +2 pts Sparkle cursor trail
  initEyeTracker();        // Interactive eye-tracking, visor glare, & zero-g avatar
  initConstellationLoom(); // Tier 3 interactive stellar navigation canvas
  initAuroraJar();         // Interactive Nebula Capsule Laboratory
  initMilkRoutes();        // Moving satellites and live route statistics
  initStoryScroll();       // Interactive 4-scene bedtime astronaut origin scroll
  initGuestbook();         // +2 pts Live space logbook wall
  initHitCounter();        // +1 pt Vintage mission odometer ticker
  initChaosMode();         // +5 pts Responsive Retro 90s Space Chaos Mode
  initEasterEgg();         // Hidden Easter egg & Cosmic Flight License
  renderBadges();
});
