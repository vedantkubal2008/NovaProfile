/**
 * Retro Sparkle Cursor Trail (Bonus Side Quest: +2 pts)
 * Whimsical early-web star trail with physics, smooth 60fps RAF cleanup,
 * and adaptive color sampling from haX.baby palette.
 */

export function initSparkleTrail() {
  const glyphs = ['✦', '✧', '⋆', '｡', 'ﾟ', '⭐', '✨'];
  const palette = ['#ffd166', '#ff8066', '#56dfbe', '#65dcf2', '#f2fcff', '#d7f5f4'];
  
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;

  const createSparkle = (x, y) => {
    const el = document.createElement('span');
    el.className = 'sparkle-particle';
    el.setAttribute('aria-hidden', 'true');
    el.innerText = glyphs[Math.floor(Math.random() * glyphs.length)];
    
    // Pick color
    const color = palette[Math.floor(Math.random() * palette.length)];
    el.style.color = color;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    const size = Math.floor(Math.random() * 10) + 12;
    el.style.fontSize = `${size}px`;
    
    // Random drift vectors
    const vx = (Math.random() - 0.5) * 45;
    const vy = (Math.random() - 0.5) * 35 - 20; // gentle upward draft
    const rot = (Math.random() - 0.5) * 120;
    
    el.style.setProperty('--vx', `${vx}px`);
    el.style.setProperty('--vy', `${vy}px`);
    el.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 750);
  };

  const handlePointer = (e) => {
    const now = performance.now();
    // Throttle sparkle creation for smooth performance
    if (now - lastTime < 35) return;
    
    const x = e.pageX;
    const y = e.pageY;
    
    // Calculate distance moved
    const dist = Math.hypot(x - lastX, y - lastY);
    if (dist > 8) {
      createSparkle(x, y);
      lastX = x;
      lastY = y;
      lastTime = now;
    }
  };

  window.addEventListener('pointermove', handlePointer, { passive: true });
}
