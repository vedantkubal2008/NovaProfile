/**
 * Interactive Deep Space Canvas Background
 * Features:
 * 1. Multi-layered twinkling starfield with parallax depth
 * 2. Subtle cosmic nebula dust clouds
 * 3. Occasional gentle shooting stars/meteors streaking across the sky
 * 4. Cursor gentle gravitational drift
 */

export function initSpaceBackground() {
  const canvas = document.createElement('canvas');
  canvas.id = 'space-bg-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.9';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  window.addEventListener('pointermove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }, { passive: true });

  // Generate 3 layers of stars (near, mid, deep)
  let stars = [];
  const starCount = Math.min(220, Math.floor((width * height) / 6000));

  function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.6,
        layer: Math.random() * 3 + 1, // 1 to 4
        baseAlpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        color: getRandomStarColor()
      });
    }
  }

  function getRandomStarColor() {
    const colors = [
      '#f2fcff',
      '#d7f5f4',
      '#ffd166',
      '#65dcf2',
      '#ff8066',
      '#56dfbe'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  initStars();

  // Shooting stars system
  let shootingStars = [];

  function spawnShootingStar() {
    if (shootingStars.length >= 2) return;
    const startX = Math.random() * width * 0.8;
    const startY = Math.random() * (height * 0.4);
    const speed = Math.random() * 6 + 7;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // diagonal downward

    shootingStars.push({
      x: startX,
      y: startY,
      length: Math.random() * 80 + 60,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: '#ffd166'
    });
  }

  // Periodic random shooting stars (every 4-7 seconds)
  setInterval(() => {
    if (Math.random() > 0.3) {
      spawnShootingStar();
    }
  }, 4500);

  // Animation Loop
  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, width, height);

    // Smooth cursor follow for gentle parallax
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;
    const offsetX = (mouseX - width / 2) * 0.025;
    const offsetY = (mouseY - height / 2) * 0.025;

    // Render twinkling stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const px = (s.x - offsetX * s.layer + width) % width;
      const py = (s.y - offsetY * s.layer + height) % height;

      // Twinkle calculation
      const twinkle = Math.sin(frame * s.twinkleSpeed + s.twinklePhase);
      const alpha = Math.max(0.1, s.baseAlpha + twinkle * 0.35);

      ctx.beginPath();
      ctx.arc(px, py, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Extra 4-point sparkle for larger stars
      if (s.size > 2 && twinkle > 0.4) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(px - s.size * 2, py);
        ctx.lineTo(px + s.size * 2, py);
        ctx.moveTo(px, py - s.size * 2);
        ctx.lineTo(px, py + s.size * 2);
        ctx.stroke();
      }
    }

    // Render shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.alpha -= 0.016;

      if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
        shootingStars.splice(i, 1);
        continue;
      }

      ctx.save();
      const grad = ctx.createLinearGradient(
        ss.x, ss.y,
        ss.x - ss.vx * 6,
        ss.y - ss.vy * 6
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, ss.color);
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = ss.alpha;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - ss.vx * 6, ss.y - ss.vy * 6);
      ctx.stroke();
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animate);
  }

  animate();
}
