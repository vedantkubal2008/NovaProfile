import { initSpaceBackground } from './spaceBackground.js';

document.addEventListener('DOMContentLoaded', () => {
  initSpaceBackground();

  const canvas = document.getElementById('game-canvas');
  const context = canvas.getContext('2d');
  const arena = canvas.parentElement;
  const intro = document.getElementById('launch-screen');
  const introAvatar = document.getElementById('launch-avatar');
  const startButton = document.getElementById('start-button');
  const avatarStatus = document.getElementById('avatar-status');
  const stateOverlay = document.getElementById('state-overlay');
  const overlayKicker = document.getElementById('overlay-kicker');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayCopy = document.getElementById('overlay-copy');
  const overlayAction = document.getElementById('overlay-action');
  const scoreValue = document.getElementById('score-value');
  const bestValue = document.getElementById('best-value');
  const timeValue = document.getElementById('time-value');
  const levelValue = document.getElementById('level-value');
  const livesValue = document.getElementById('lives-value');
  const launchBest = document.getElementById('launch-best');
  const status = document.getElementById('game-status');
  const soundButton = document.getElementById('sound-button');
  const pauseButton = document.getElementById('pause-button');
  const moveButtons = document.querySelectorAll('[data-move]');
  const playerSprite = new Image();
  const keys = { left: false, right: false };
  const bestKey = 'nova_asteroid_best';

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];
  let rocks = [];
  let frameId = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let bonusScore = 0;
  let level = 1;
  let lives = 3;
  let spawnClock = 0;
  let invulnerableUntil = 0;
  let soundEnabled = true;
  let audioContext = null;
  let bestScore = Number(localStorage.getItem(bestKey)) || 0;
  let pointerActive = false;
  let pointerTarget = null;
  let screenShakeUntil = 0;
  let state = 'ready';
  let overlayActionHandler = () => {};

  pauseButton.disabled = true;

  const player = { x: 0, y: 0, speed: 410 };

  bestValue.textContent = formatScore(bestScore);
  launchBest.textContent = formatScore(bestScore);

  function formatScore(value) {
    return String(Math.max(0, Math.floor(value))).padStart(4, '0');
  }

  function formatTime(seconds) {
    const total = Math.floor(seconds);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  async function loadNova() {
    try {
      const response = await fetch('/index.html');
      if (!response.ok) throw new Error('Homepage artwork unavailable');
      const markup = await response.text();
      const homeDocument = new DOMParser().parseFromString(markup, 'text/html');
      const artwork = homeDocument.querySelector('.astro-character-svg');
      if (!artwork) throw new Error('Nova artwork not found');

      const clone = document.importNode(artwork, true);
      clone.setAttribute('aria-label', 'Nova, ready to dodge asteroids');
      introAvatar.replaceChildren(clone);

      const imageUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(artwork)], { type: 'image/svg+xml' }));
      playerSprite.src = imageUrl;
      await playerSprite.decode();
      startButton.disabled = false;
      startButton.textContent = 'Play with me!  →';
      avatarStatus.textContent = 'Bubble helmet: snug. Snack supply: questionable.';
    } catch (error) {
      avatarStatus.textContent = 'Nova’s helmet is taking a moment. Refresh to try again.';
      startButton.disabled = true;
      console.error(error);
    }
  }

  function resizeCanvas() {
    const bounds = arena.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    player.y = height - 76;
    player.x = Math.min(width - 42, Math.max(42, player.x || width / 2));
    stars = Array.from({ length: Math.max(45, Math.round(width * height / 5200)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.35,
      speed: Math.random() * 26 + 10,
      phase: Math.random() * Math.PI * 2
    }));
    drawScene(performance.now());
  }

  function createAudio() {
    if (audioContext) {
      if (audioContext.state === 'suspended') audioContext.resume();
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }

  function playTone(startFrequency, endFrequency, duration = 0.14, type = 'sine', when = 0, volume = 0.08) {
    if (!soundEnabled) return;
    createAudio();
    if (!audioContext) return;

    const startAt = audioContext.currentTime + when;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, endFrequency), startAt + duration);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(volume, startAt + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  function playLaunchSound() {
    [523, 659, 784, 1047].forEach((frequency, index) => playTone(frequency, frequency * 1.12, 0.18, 'triangle', index * 0.09, 0.07));
  }

  function playDodgeSound() {
    playTone(920, 1320, 0.11, 'sine', 0, 0.045);
  }

  function playHitSound() {
    playTone(190, 48, 0.38, 'sawtooth', 0, 0.11);
    playTone(104, 55, 0.28, 'square', 0, 0.06);
  }

  function updateHud(now = performance.now()) {
    const score = Math.floor(elapsed * 10) + bonusScore;
    scoreValue.textContent = formatScore(score);
    timeValue.textContent = formatTime(elapsed);
    levelValue.textContent = String(level).padStart(2, '0');
    livesValue.textContent = `${'♥'.repeat(lives)}${'♡'.repeat(3 - lives)}`;
    livesValue.parentElement.setAttribute('aria-label', `${lives} ${lives === 1 ? 'life' : 'lives'} remaining`);
    if (now >= invulnerableUntil) livesValue.classList.remove('is-flashing');
  }

  function makeRock() {
    const radius = 13 + Math.random() * Math.min(18, 8 + level * 1.4);
    const points = Array.from({ length: 9 }, () => 0.76 + Math.random() * 0.34);
    const craters = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * radius * 0.48,
      size: radius * (0.08 + Math.random() * 0.12)
    }));
    return {
      x: radius + Math.random() * Math.max(1, width - radius * 2),
      y: -radius - 4,
      radius,
      speed: Math.min(620, 245 + (level - 1) * 38 + Math.random() * 70),
      drift: (Math.random() - 0.5) * (34 + level * 4),
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 2.4,
      points,
      craters,
      color: ['#607983', '#8c6f59', '#54717a', '#99725b'][Math.floor(Math.random() * 4)],
      passed: false
    };
  }

  function drawRock(rock) {
    context.save();
    context.translate(rock.x, rock.y);
    context.rotate(rock.angle);
    context.beginPath();
    rock.points.forEach((scale, index) => {
      const angle = (index / rock.points.length) * Math.PI * 2;
      const x = Math.cos(angle) * rock.radius * scale;
      const y = Math.sin(angle) * rock.radius * scale;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fillStyle = rock.color;
    context.fill();
    context.strokeStyle = 'rgba(101, 220, 242, 0.48)';
    context.lineWidth = 1.3;
    context.stroke();
    rock.craters.forEach((crater) => {
      const craterX = Math.cos(crater.angle) * crater.distance;
      const craterY = Math.sin(crater.angle) * crater.distance;
      context.beginPath();
      context.arc(craterX, craterY, crater.size, 0, Math.PI * 2);
      context.fillStyle = 'rgba(26, 18, 34, 0.28)';
      context.fill();
      context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      context.lineWidth = 1;
      context.stroke();
    });
    context.restore();
  }

  function drawScene(now) {
    if (!context || !width || !height) return;
    context.clearRect(0, 0, width, height);
    const backdrop = context.createLinearGradient(0, 0, 0, height);
    backdrop.addColorStop(0, '#0c2937');
    backdrop.addColorStop(0.55, '#06121d');
    backdrop.addColorStop(1, '#071925');
    context.fillStyle = backdrop;
    context.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      const shimmer = 0.42 + Math.sin(now * 0.0015 + star.phase) * 0.28;
      context.globalAlpha = shimmer;
      context.fillStyle = star.size > 1.25 ? '#a9eaff' : '#fff4d8';
      context.fillRect(star.x, star.y, star.size, star.size);
      context.globalAlpha = 1;
    });

    rocks.forEach(drawRock);

    if (playerSprite.complete && playerSprite.naturalWidth) {
      const bob = state === 'playing' ? Math.sin(now * 0.006) * 3 : 0;
      const flashing = now < invulnerableUntil && Math.floor(now / 90) % 2 === 0;
      if (!flashing) {
        context.save();
        context.translate(player.x, player.y + bob);
        context.rotate((keys.right ? 0.12 : 0) - (keys.left ? 0.12 : 0));
        context.shadowColor = 'rgba(255, 192, 56, 0.6)';
        context.shadowBlur = 20;
        context.drawImage(playerSprite, -34, -34, 68, 68);
        context.restore();
      }
      if (now < invulnerableUntil) {
        context.beginPath();
        context.arc(player.x, player.y, 36 + Math.sin(now * 0.02) * 3, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(112, 214, 255, 0.72)';
        context.lineWidth = 2;
        context.stroke();
      }
    }
  }

  function setOverlay(kind, title, copy, buttonText, handler) {
    overlayKicker.textContent = kind;
    overlayTitle.textContent = title;
    overlayCopy.textContent = copy;
    overlayAction.textContent = buttonText;
    overlayActionHandler = handler;
    stateOverlay.hidden = false;
  }

  function startGame() {
    createAudio();
    elapsed = 0;
    bonusScore = 0;
    level = 1;
    lives = 3;
    spawnClock = 0;
    invulnerableUntil = 0;
    rocks = [];
    player.x = width / 2;
    state = 'playing';
    intro.hidden = true;
    stateOverlay.hidden = true;
    pauseButton.disabled = false;
    pauseButton.setAttribute('aria-label', 'Pause flight');
    status.textContent = 'Flight started. Asteroids incoming.';
    updateHud();
    playLaunchSound();
    lastFrame = performance.now();
    if (!frameId) frameId = requestAnimationFrame(gameFrame);
  }

  function pauseGame() {
    if (state !== 'playing') return;
    state = 'paused';
    keys.left = false;
    keys.right = false;
    pauseButton.setAttribute('aria-label', 'Resume flight');
    setOverlay('Flight paused', 'Taking a space-breath', 'Even a cosmonaut needs a snack break.', 'Resume flight', resumeGame);
    status.textContent = 'Flight paused.';
  }

  function resumeGame() {
    if (state !== 'paused') return;
    state = 'playing';
    stateOverlay.hidden = true;
    pauseButton.setAttribute('aria-label', 'Pause flight');
    lastFrame = performance.now();
    status.textContent = 'Flight resumed.';
    if (!frameId) frameId = requestAnimationFrame(gameFrame);
  }

  function endGame() {
    state = 'over';
    keys.left = false;
    keys.right = false;
    const finalScore = Math.floor(elapsed * 10) + bonusScore;
    if (finalScore > bestScore) {
      bestScore = finalScore;
      localStorage.setItem(bestKey, String(bestScore));
      bestValue.textContent = formatScore(bestScore);
      launchBest.textContent = formatScore(bestScore);
    }
    pauseButton.disabled = true;
    setOverlay('Mission complete', 'I got bonked!', `I scored ${formatScore(finalScore)} points. Those rocks were extremely impolite.`, 'Fly again', startGame);
    status.textContent = `Game over. Final score ${finalScore}. Best score ${bestScore}.`;
  }

  function gameFrame(now) {
    if (state !== 'playing') {
      frameId = 0;
      return;
    }
    const delta = Math.max(0, Math.min((now - lastFrame) / 1000, 0.05));
    lastFrame = now;
    elapsed += delta;
    level = 1 + Math.floor(elapsed / 12);

    const direction = Number(keys.right) - Number(keys.left);
    if (direction) player.x += direction * player.speed * delta;
    if (pointerTarget !== null) player.x += (pointerTarget - player.x) * Math.min(1, delta * 15);
    player.x = Math.max(34, Math.min(width - 34, player.x));

    const spawnInterval = Math.max(0.23, 0.78 - (level - 1) * 0.075);
    spawnClock += delta;
    while (spawnClock >= spawnInterval) {
      spawnClock -= spawnInterval;
      rocks.push(makeRock());
      if (level >= 4 && Math.random() < Math.min(0.72, (level - 2) * 0.08)) rocks.push(makeRock());
    }

    const survivors = [];
    let tookHit = false;
    rocks.forEach((rock) => {
      rock.y += rock.speed * delta;
      rock.x += rock.drift * delta;
      rock.angle += rock.spin * delta;
      if (rock.x < rock.radius || rock.x > width - rock.radius) rock.drift *= -1;

      const distance = Math.hypot(rock.x - player.x, rock.y - player.y);
      if (!tookHit && now >= invulnerableUntil && distance < rock.radius + 23) {
        tookHit = true;
        lives -= 1;
        invulnerableUntil = now + 1400;
        screenShakeUntil = now + 260;
        rock.y = height + rock.radius + 1;
        playHitSound();
        updateHud(now);
        if (lives <= 0) endGame();
      }

      if (rock.y - rock.radius > player.y + 24 && !rock.passed) {
        rock.passed = true;
        bonusScore += 25;
        playDodgeSound();
      }
      if (rock.y - rock.radius <= height + 4) survivors.push(rock);
    });
    rocks = survivors;

    if (state === 'playing') {
      updateHud(now);
      drawScene(now);
    }
    if (now < screenShakeUntil) arena.classList.add('is-shaking');
    else arena.classList.remove('is-shaking');
    frameId = state === 'playing' ? requestAnimationFrame(gameFrame) : 0;
  }

  function setSoundButton() {
    soundButton.textContent = soundEnabled ? '♫' : '×';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', soundEnabled ? 'Mute game sounds' : 'Enable game sounds');
    soundButton.title = soundEnabled ? 'Mute game sounds' : 'Enable game sounds';
  }

  function updatePointer(event) {
    const bounds = canvas.getBoundingClientRect();
    pointerTarget = (event.clientX - bounds.left) * (width / bounds.width);
  }

  startButton.addEventListener('click', startGame);
  overlayAction.addEventListener('click', () => overlayActionHandler());
  pauseButton.addEventListener('click', () => state === 'playing' ? pauseGame() : resumeGame());
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    setSoundButton();
    if (soundEnabled) playTone(700, 1050, 0.12, 'triangle');
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowleft', 'arrowright', ' '].includes(key) && state === 'playing') event.preventDefault();
    if (key === 'arrowleft' || key === 'a') keys.left = true;
    if (key === 'arrowright' || key === 'd') keys.right = true;
    if ((key === 'p' || key === 'escape') && state === 'playing') pauseGame();
    else if ((key === 'p' || key === 'escape') && state === 'paused') resumeGame();
    if (key === ' ' && state === 'ready' && !startButton.disabled) startGame();
  });

  document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') keys.left = false;
    if (key === 'arrowright' || key === 'd') keys.right = false;
  });

  window.addEventListener('blur', () => {
    keys.left = false;
    keys.right = false;
    pointerActive = false;
    pointerTarget = null;
    if (state === 'playing') pauseGame();
  });

  canvas.addEventListener('pointerdown', (event) => {
    pointerActive = true;
    updatePointer(event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (pointerActive) updatePointer(event);
  });
  const stopPointer = () => {
    pointerActive = false;
    pointerTarget = null;
  };
  canvas.addEventListener('pointerup', stopPointer);
  canvas.addEventListener('pointercancel', stopPointer);

  moveButtons.forEach((button) => {
    const direction = button.dataset.move;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      keys[direction] = true;
      button.setPointerCapture(event.pointerId);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach((eventName) => {
      button.addEventListener(eventName, () => { keys[direction] = false; });
    });
  });

  overlayActionHandler = resumeGame;
  setSoundButton();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  loadNova();
});