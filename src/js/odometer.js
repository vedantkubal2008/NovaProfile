/**
 * Shared visitor counter and local best-score readout.
 */

export function initHitCounter() {
  const container = document.getElementById('odometer-display');
  const bestScore = document.getElementById('best-dodge-score');
  if (bestScore) {
    try {
      bestScore.textContent = String(Number(localStorage.getItem('nova_asteroid_best')) || 0).padStart(4, '0');
    } catch {
      bestScore.textContent = '0000';
    }
  }
  if (!container) return;

  function renderCount(count) {
    const padded = String(count).padStart(6, '0');
    container.replaceChildren();
    [...padded].forEach((digit) => {
      const reel = document.createElement('span');
      reel.className = 'odometer-reel';
      reel.textContent = digit;
      container.append(reel);
    });
    container.setAttribute('aria-label', `${count.toLocaleString()} total site visits`);
  }

  container.textContent = '······';
  fetch('https://api.visitorbadge.io/api/visitors?path=vedantkubal2008.NovaProfile&label=visitors&labelColor=%2306121d&countColor=%23ffd166&style=flat', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Visitor counter unavailable');
      return response.text();
    })
    .then((markup) => {
      const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').querySelector('svg');
      const label = svg?.getAttribute('aria-label') || svg?.querySelector('title')?.textContent || '';
      const count = Number(label.match(/[\d,]+/)?.[0].replaceAll(',', ''));
      if (!Number.isFinite(count)) throw new Error('Visitor count was not returned');
      renderCount(count);
    })
    .catch(() => {
      container.replaceChildren();
      const offline = document.createElement('span');
      offline.className = 'counter-offline';
      offline.textContent = 'offline';
      container.append(offline);
      container.setAttribute('aria-label', 'Shared visitor count unavailable');
    });
}
