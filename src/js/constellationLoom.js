/**
 * The Constellation Loom — Tier 3 Interactive Showcase Toy
 * An interactive celestial canvas where visitors drag and weave glowing
 * starlight threads between floating stars, triggering procedural harp chords.
 */

import { sounds } from './audio.js';

export function initConstellationLoom() {
  const canvas = document.getElementById('loom-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  let width = (canvas.width = container.clientWidth);
  let height = (canvas.height = container.clientHeight || 450);

  window.addEventListener('resize', () => {
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight || 450;
    initStars();
  });

  // Star nodes
  let stars = [];
  let lines = []; // connected pairs [ {from: starIndex, to: starIndex} ]
  let draggingFrom = null;
  let mousePos = { x: 0, y: 0 };
  let isDragging = false;

  const starCount = 14;

  function initStars() {
    stars = [];
    lines = [];
    const padding = 50;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        id: i,
        x: padding + Math.random() * (width - padding * 2),
        y: padding + Math.random() * (height - padding * 2),
        baseRadius: Math.random() * 3 + 4,
        pulseOffset: Math.random() * Math.PI * 2,
        name: `Star ${i + 1}`,
        noteIndex: i % 8
      });
    }

    // Connect a starter triangle
    lines.push({ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 });
  }

  initStars();

  // Pointer interactions
  function getNearestStar(x, y, maxDist = 28) {
    let nearest = null;
    let minDist = Infinity;
    stars.forEach((s) => {
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < minDist && d <= maxDist) {
        minDist = d;
        nearest = s;
      }
    });
    return nearest;
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left,
      y: (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    const pos = getCanvasCoords(e);
    mousePos = pos;
    const star = getNearestStar(pos.x, pos.y);

    if (star) {
      draggingFrom = star;
      isDragging = true;
      sounds.playHarp(star.noteIndex);
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const pos = getCanvasCoords(e);
    mousePos = pos;
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging || !draggingFrom) {
      isDragging = false;
      draggingFrom = null;
      return;
    }

    const pos = getCanvasCoords(e);
    const targetStar = getNearestStar(pos.x, pos.y);

    if (targetStar && targetStar.id !== draggingFrom.id) {
      // Check if line already exists
      const exists = lines.some(
        (l) =>
          (l.from === draggingFrom.id && l.to === targetStar.id) ||
          (l.from === targetStar.id && l.to === draggingFrom.id)
      );

      if (!exists) {
        lines.push({ from: draggingFrom.id, to: targetStar.id });
        sounds.playHarp(targetStar.noteIndex);
        sounds.playTwinkle();

        // Check milestone constellation
        const feedback = document.getElementById('loom-feedback');
        if (feedback) {
          const names = [
            '🚀 Woven: Apollo Orbital Rocket!',
            '🪐 Woven: Saturn\'s Glowing Rings!',
            '🛰️ Woven: Sputnik Starlight Relay!',
            '👨‍🚀 Woven: Nova\'s Cosmonaut Helmet!'
          ];
          feedback.innerText = names[lines.length % names.length];
        }
      }
    }

    isDragging = false;
    draggingFrom = null;
  });

  // Buttons
  const clearBtn = document.getElementById('loom-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      sounds.playPop();
      lines = [];
      const feedback = document.getElementById('loom-feedback');
      if (feedback) feedback.innerText = 'Drag between stars to weave your own constellation!';
    });
  }

  const shuffleBtn = document.getElementById('loom-shuffle-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      sounds.playTwinkle();
      initStars();
      const feedback = document.getElementById('loom-feedback');
      if (feedback) feedback.innerText = '✨ Sky rearranged with fresh starlight nodes!';
    });
  }

  // Animation render loop
  let time = 0;
  function render() {
    time += 0.03;
    ctx.clearRect(0, 0, width, height);

    // Subtle cosmic background glow
    const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 1.4);
    grad.addColorStop(0, 'rgba(101, 220, 242, 0.1)');
    grad.addColorStop(0.5, 'rgba(255, 209, 102, 0.05)');
    grad.addColorStop(1, 'rgba(239, 251, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw existing woven silk threads
    lines.forEach((line) => {
      const s1 = stars[line.from];
      const s2 = stars[line.to];
      if (!s1 || !s2) return;

      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#65dcf2';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    });

    // Draw active drag thread
    if (isDragging && draggingFrom) {
      ctx.beginPath();
      ctx.moveTo(draggingFrom.x, draggingFrom.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.strokeStyle = '#ff8066';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw stars
    stars.forEach((s) => {
      const pulse = Math.sin(time + s.pulseOffset) * 1.5;
      const radius = s.baseRadius + pulse;

      // Glow halo
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 184, 48, 0.2)';
      ctx.fill();

      // Star core
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Star sparkle cross
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x - radius * 1.8, s.y);
      ctx.lineTo(s.x + radius * 1.8, s.y);
      ctx.moveTo(s.x, s.y - radius * 1.8);
      ctx.lineTo(s.x, s.y + radius * 1.8);
      ctx.stroke();
    });

    requestAnimationFrame(render);
  }

  render();
}
