export function initMilkRoutes() {
  const path = document.getElementById('milk-route-path');
  const orbitCount = document.getElementById('orbit-count');
  const dreamCount = document.getElementById('dream-count');
  if (!path || !orbitCount || !dreamCount) return;

  const routeLength = path.getTotalLength();
  const satellites = [...path.ownerSVGElement.querySelectorAll('.route-satellite')].map((element) => ({
    element,
    progress: Number(element.dataset.phase) || 0,
    speed: Number(element.dataset.speed) || 0
  }));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function placeSatellites() {
    satellites.forEach((satellite) => {
      const distance = satellite.progress * routeLength;
      const point = path.getPointAtLength(distance);
      satellite.element.setAttribute('transform', `translate(${point.x} ${point.y})`);
    });
  }

  if (prefersReducedMotion) {
    placeSatellites();
  } else {
    let previousTime = 0;
    const animate = (time) => {
      const delta = previousTime ? Math.min(50, time - previousTime) : 0;
      previousTime = time;
      const motionScale = document.documentElement.classList.contains('bedtime-mode') ? 0.3 : 1;
      satellites.forEach((satellite) => {
        satellite.progress = (satellite.progress + delta * satellite.speed * motionScale) % 1;
      });
      placeSatellites();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  let orbits = 48;
  let dreams = 11400;
  window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    dreams += 8 + Math.floor(Math.random() * 18);
    if (orbits < 60 && Math.random() > 0.65) orbits += 1;
    orbitCount.textContent = String(orbits);
    dreamCount.textContent = `${(dreams / 1000).toFixed(1)}k`;
  }, 2600);
}
