/**
 * Showcase Project #2: The Aurora Lampworks
 * Interactive glowing jars with fluid turbulence particle animation
 * and switchable celestial essences.
 */

import { sounds } from './audio.js';

export function initAuroraJar() {
  const canvas = document.getElementById('aurora-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = 240);
  let height = (canvas.height = 300);

  const presets = {
    lavender: {
      c1: 'rgba(86, 223, 190, 0.85)',
      c2: 'rgba(101, 220, 242, 0.7)',
      c3: 'rgba(255, 209, 102, 0.9)',
      glow: '#56dfbe',
      note: 659.25
    },
    solargold: {
      c1: 'rgba(255, 209, 102, 0.85)',
      c2: 'rgba(255, 230, 145, 0.7)',
      c3: 'rgba(255, 128, 102, 0.85)',
      glow: '#ffd166',
      note: 783.99
    },
    glacier: {
      c1: 'rgba(101, 220, 242, 0.85)',
      c2: 'rgba(196, 249, 255, 0.7)',
      c3: 'rgba(8, 127, 154, 0.85)',
      glow: '#65dcf2',
      note: 880.00
    },
    twilight: {
      c1: 'rgba(19, 63, 78, 0.85)',
      c2: 'rgba(101, 220, 242, 0.75)',
      c3: 'rgba(86, 223, 190, 0.85)',
      glow: '#65dcf2',
      note: 523.25
    }
  };

  let currentPreset = presets.lavender;
  let particles = [];
  const particleCount = 28;

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 20 + 15,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.2 - 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        colorIndex: Math.floor(Math.random() * 3)
      });
    }
  }

  initParticles();

  // Preset buttons
  const buttons = document.querySelectorAll('.aurora-vial-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sounds.playPop();
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const type = btn.getAttribute('data-essence');
      if (presets[type]) {
        currentPreset = presets[type];
        sounds.playChime(currentPreset.note, 0.2);

        // Update CSS glow variable for parent card
        const card = document.getElementById('aurora-showcase-card');
        if (card) {
          card.style.setProperty('--jar-glow', currentPreset.glow);
        }
      }
    });
  });

  // Render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Render jar inner glow
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around within jar bounds
      if (p.y < 30) p.y = height - 40;
      if (p.x < 30) p.x = width - 40;
      if (p.x > width - 30) p.x = 30;

      const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
      const color = p.colorIndex === 0 ? currentPreset.c1 : p.colorIndex === 1 ? currentPreset.c2 : currentPreset.c3;
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.globalCompositeOperation = 'screen';
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(render);
  }

  render();
}
