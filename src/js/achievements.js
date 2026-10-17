const STORAGE_KEY = 'nova-earned-badges';

const BADGES = {
  giggle: { icon: '☺', name: 'Nova’s Giggle', detail: 'Met Nova face to face' },
  nebula: { icon: '✦', name: 'Nebula Mixer', detail: 'Tried every nebula sample' },
  route: { icon: '✧', name: 'Star Cartographer', detail: 'Saved a woven route' },
  guestbook: { icon: '✉', name: 'Mission Friend', detail: 'Signed Nova’s logbook' },
  dodge: { icon: '☄', name: 'Asteroid Ace', detail: 'Set a new flight record' },
  secret: { icon: '★', name: 'Secret Starfinder', detail: 'Found a hidden signal' }
};

export function getEarnedBadges() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return [...new Set(saved)].filter((id) => BADGES[id]);
  } catch {
    return [];
  }
}

export function awardBadge(id) {
  if (!BADGES[id]) return false;
  const badges = getEarnedBadges();
  if (badges.includes(id)) return false;

  badges.push(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  } catch {}
  renderBadges();
  document.dispatchEvent(new CustomEvent('nova:badge-earned', { detail: { id, badge: BADGES[id] } }));
  return true;
}

export function renderBadges() {
  const list = document.getElementById('earned-badge-list');
  if (!list) return;

  const earned = getEarnedBadges();
  list.replaceChildren();
  if (!earned.length) {
    const empty = document.createElement('li');
    empty.className = 'badge-empty';
    empty.textContent = 'Your first badge is waiting among the stars.';
    list.append(empty);
    return;
  }

  earned.forEach((id) => {
    const badge = BADGES[id];
    const item = document.createElement('li');
    item.className = 'earned-badge';
    item.textContent = `${badge.icon} ${badge.name} · ${badge.detail}`;
    list.append(item);
  });
}
