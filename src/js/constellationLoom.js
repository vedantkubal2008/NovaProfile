/**
 * The Constellation Loom — Tier 3 Interactive Showcase Toy
 * An interactive celestial canvas where visitors drag and weave glowing
 * starlight threads between floating stars, triggering procedural harp chords.
 */

import { sounds } from './audio.js';
import { awardBadge } from './achievements.js';

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
  let userLines = [];
  let secretTriangleFound = false;
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

  function routeSnapshot(name = '') {
    return {
      name,
      stars: stars.map((star) => ({
        x: star.x / width,
        y: star.y / height,
        baseRadius: star.baseRadius,
        pulseOffset: star.pulseOffset,
        noteIndex: star.noteIndex
      })),
      lines: lines.map((line) => ({ ...line }))
    };
  }

  function applyRoute(route) {
    if (!Array.isArray(route?.stars) || route.stars.length !== starCount || !Array.isArray(route.lines)) return false;
    stars = route.stars.map((star, id) => ({
      id,
      x: Math.max(0, Math.min(1, Number(star.x))) * width,
      y: Math.max(0, Math.min(1, Number(star.y))) * height,
      baseRadius: Number(star.baseRadius) || 5,
      pulseOffset: Number(star.pulseOffset) || 0,
      name: `Star ${id + 1}`,
      noteIndex: Number(star.noteIndex) || id % 8
    }));
    lines = route.lines.filter((line) => Number.isInteger(line.from) && Number.isInteger(line.to) && line.from < starCount && line.to < starCount);
    userLines = [];
    return true;
  }

  function formsTriangle(edges) {
    const adjacent = new Map();
    edges.forEach(({ from, to }) => {
      if (!adjacent.has(from)) adjacent.set(from, new Set());
      if (!adjacent.has(to)) adjacent.set(to, new Set());
      adjacent.get(from).add(to);
      adjacent.get(to).add(from);
    });
    for (const [first, neighbors] of adjacent) {
      for (const second of neighbors) {
        for (const third of adjacent.get(second) || []) {
          if (third !== first && adjacent.get(third)?.has(first)) return true;
        }
      }
    }
    return false;
  }

  const routeNameInput = document.getElementById('loom-route-name');
  const savedRoutes = document.getElementById('loom-saved-routes');
  const feedback = document.getElementById('loom-feedback');

  function readSavedRoutes() {
    try {
      const routes = JSON.parse(localStorage.getItem('nova-saved-routes') || '[]');
      return Array.isArray(routes) ? routes : [];
    } catch {
      return [];
    }
  }

  function renderSavedRoutes() {
    if (!savedRoutes) return;
    savedRoutes.replaceChildren();
    readSavedRoutes().forEach((route) => {
      const button = document.createElement('button');
      button.className = 'saved-route-btn';
      button.type = 'button';
      button.textContent = route.name;
      button.addEventListener('click', () => {
        if (applyRoute(route)) {
          if (routeNameInput) routeNameInput.value = route.name;
          if (feedback) feedback.textContent = `Loaded ${route.name}`;
        }
      });
      savedRoutes.append(button);
    });
  }

  try {
    const sharedRoute = new URLSearchParams(window.location.search).get('route');
    if (sharedRoute) {
      const route = JSON.parse(sharedRoute);
      if (applyRoute(route) && routeNameInput) routeNameInput.value = String(route.name || '').slice(0, 32);
    }
  } catch {}
  renderSavedRoutes();

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
        userLines.push({ from: draggingFrom.id, to: targetStar.id });
        sounds.playHarp(targetStar.noteIndex);
        sounds.playTwinkle();

        if (!secretTriangleFound && formsTriangle(userLines)) {
          secretTriangleFound = true;
          awardBadge('secret');
          window.dispatchEvent(new CustomEvent('nova:secret-discovered'));
          if (feedback) feedback.textContent = 'Hidden constellation found · Secret Starfinder badge earned';
        }

        if (feedback && !secretTriangleFound) {
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
      userLines = [];
      secretTriangleFound = false;
      if (feedback) feedback.innerText = 'Drag between stars to weave your own constellation!';
    });
  }

  const shuffleBtn = document.getElementById('loom-shuffle-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      sounds.playTwinkle();
      initStars();
      userLines = [];
      secretTriangleFound = false;
      if (feedback) feedback.innerText = '✨ Sky rearranged with fresh starlight nodes!';
    });
  }

  const saveButton = document.getElementById('loom-save-btn');
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const routes = readSavedRoutes();
      const name = (routeNameInput?.value || '').trim().slice(0, 32) || `Star route ${routes.length + 1}`;
      const route = routeSnapshot(name);
      const saved = [route, ...routes.filter((entry) => entry.name !== name)].slice(0, 8);
      try {
        localStorage.setItem('nova-saved-routes', JSON.stringify(saved));
        renderSavedRoutes();
        awardBadge('route');
        if (feedback) feedback.textContent = `${name} saved`;
      } catch {
        if (feedback) feedback.textContent = 'This browser could not save the route';
      }
    });
  }

  const shareButton = document.getElementById('loom-share-btn');
  const shareOutput = document.getElementById('loom-share-url');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      const route = routeSnapshot((routeNameInput?.value || '').trim());
      const url = new URL(window.location.href);
      url.searchParams.set('route', JSON.stringify(route));
      if (shareOutput) {
        shareOutput.value = url.toString();
        shareOutput.hidden = false;
        shareOutput.focus();
        shareOutput.select();
      }
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url.toString())
          .then(() => { if (feedback) feedback.textContent = 'Route link copied'; })
          .catch(() => { if (feedback) feedback.textContent = 'Route link ready to copy'; });
      } else if (feedback) {
        feedback.textContent = 'Route link ready to copy';
      }
    });
  }

  const imageButton = document.getElementById('loom-image-btn');
  if (imageButton) {
    imageButton.addEventListener('click', () => {
      const fileName = (routeNameInput?.value || 'nova-star-route').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nova-star-route';
      canvas.toBlob((blob) => {
        if (!blob) return;
        const download = document.createElement('a');
        const imageUrl = URL.createObjectURL(blob);
        download.href = imageUrl;
        download.download = `${fileName}.png`;
        document.body.append(download);
        download.click();
        download.remove();
        window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
      }, 'image/png');
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
