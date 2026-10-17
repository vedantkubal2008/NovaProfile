/**
 * Vintage Hit Counter Odometer (Bonus Side Quest: +1 pt)
 * Real mechanical-style rotating digit reels with persistent counter increment.
 */

export function initHitCounter() {
  const container = document.getElementById('odometer-display');
  if (!container) return;

  const baseVisitors = 11082;
  let count = baseVisitors;

  try {
    const saved = localStorage.getItem('loomi_visitor_count');
    if (saved) {
      count = parseInt(saved, 10) + 1;
    } else {
      count = baseVisitors + Math.floor(Math.random() * 30);
    }
    localStorage.setItem('loomi_visitor_count', count.toString());
  } catch (e) {
    count = baseVisitors + 1;
  }

  const padded = count.toString().padStart(6, '0');
  container.innerHTML = '';

  padded.split('').forEach((digit) => {
    const reel = document.createElement('div');
    reel.className = 'odometer-reel';
    reel.innerHTML = `<span class="odometer-digit">${digit}</span>`;
    container.appendChild(reel);
  });
}
