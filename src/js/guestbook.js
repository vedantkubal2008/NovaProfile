/**
 * Live Guestbook Wall (Bonus Side Quest: +2 pts)
 * Visitors can sign their name, pick an animated sticker, and leave a cozy note.
 * Stored in the shared SQLite mission log, with local storage as an offline fallback.
 */

import { sounds } from './audio.js';
import { awardBadge } from './achievements.js';

export function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const wall = document.getElementById('guestbook-wall');
  const status = document.getElementById('guestbook-status');
  const stickerPicker = document.getElementById('sticker-picker');
  if (!form || !wall) return;

  const initialEntries = [
    {
      name: 'Commander Pip the Skull Baby',
      message: 'Nova! Your orbital radio beacon came through loud and clear. Midnight Nursery is asleep under your stars! 🚀',
      sticker: '🚀',
      date: 'Orbit #104'
    },
    {
      name: 'Major Barnaby (Lunar Base)',
      message: 'Hoo-hoo! The Stellar Loom navigation path guided our lunar lander safely past the asteroid belt.',
      sticker: '🪐',
      date: 'Orbit #101'
    },
    {
      name: 'Luna the Space Pup',
      message: 'Bork! I caught a floating star-biscuit in zero-g! Best spacewalk ever. 🐾',
      sticker: '⭐',
      date: 'Orbit #98'
    }
  ];

  let selectedSticker = '🚀';

  // Sticker selection
  if (stickerPicker) {
    const stickerBtns = stickerPicker.querySelectorAll('.sticker-opt');
    stickerBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sounds.playPop();
        stickerBtns.forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectedSticker = btn.getAttribute('data-sticker') || '⭐';
      });
    });
  }

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

  function readLocalEntries() {
    try {
      const data = localStorage.getItem('loomi_guestbook_entries');
      const entries = data ? JSON.parse(data) : initialEntries;
      return Array.isArray(entries) ? entries : initialEntries;
    } catch (e) {
      return initialEntries;
    }
  }

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }

  async function fetchEntries() {
    const response = await fetch(`${apiBaseUrl}/api/guestbook`);
    if (!response.ok) throw new Error('Mission log could not be loaded.');
    return response.json();
  }

  async function saveEntry(entry) {
    const response = await fetch(`${apiBaseUrl}/api/guestbook`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error('Message could not be saved.');
    return response.json();
  }

  async function migrateLocalEntries(entries) {
    if (localStorage.getItem('loomi_guestbook_migrated_v1') === 'true') return entries;

    const localEntries = readLocalEntries();
    const knownEntries = new Set(entries.map((entry) => `${entry.name}\n${entry.message}\n${entry.sticker}`));
    for (const entry of localEntries.slice(0, 100).reverse()) {
      const key = `${entry.name}\n${entry.message}\n${entry.sticker}`;
      if (knownEntries.has(key)) continue;
      await saveEntry(entry);
      knownEntries.add(key);
    }
    localStorage.setItem('loomi_guestbook_migrated_v1', 'true');
    return fetchEntries();
  }

  async function loadEntries() {
    setStatus('Connecting to the shared mission log...');
    try {
      const entries = await migrateLocalEntries(await fetchEntries());
      renderEntries(entries);
      setStatus('Messages are shared with every visitor.');
    } catch (error) {
      renderEntries(readLocalEntries());
      setStatus('Shared log is offline. New notes will stay on this device for now.', true);
    }
  }

  function renderEntries(entries) {
    wall.innerHTML = '';
    entries.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'guestbook-card';
      card.innerHTML = `
        <div class="guestbook-header">
          <span class="guestbook-sticker">${escapeHtml(entry.sticker)}</span>
          <div class="guestbook-author">
            <strong>${escapeHtml(entry.name)}</strong>
            <small>${escapeHtml(entry.date)}</small>
          </div>
        </div>
        <p class="guestbook-body">${escapeHtml(entry.message)}</p>
      `;
      wall.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // Handle new submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    sounds.playChime(783.99, 0.25); // G5 chime

    const nameInput = document.getElementById('guest-name');
    const msgInput = document.getElementById('guest-msg');

    const name = nameInput.value.trim() || 'A Curious Traveler';
    const message = msgInput.value.trim() || 'Left a warm pocket of starlight in your guestbook!';
    awardBadge('guestbook');

    const newEntry = {
      name,
      message,
      sticker: selectedSticker
    };

    try {
      await saveEntry(newEntry);
      const entries = await fetchEntries();
      renderEntries(entries);
      setStatus('Your note is saved in the shared mission log.');
      try {
        localStorage.setItem('loomi_guestbook_entries', JSON.stringify(entries));
        localStorage.setItem('loomi_guestbook_migrated_v1', 'true');
      } catch (err) {}
    } catch (error) {
      const entries = readLocalEntries();
      entries.unshift({ ...newEntry, date: 'Saved on this device' });
      try {
        localStorage.setItem('loomi_guestbook_entries', JSON.stringify(entries));
        localStorage.removeItem('loomi_guestbook_migrated_v1');
      } catch (err) {}
      renderEntries(entries);
      setStatus('Could not reach the shared log. Your note is saved on this device.', true);
    }

    // Reset inputs
    nameInput.value = '';
    msgInput.value = '';

    // Play celebration twinkle
    sounds.playTwinkle();
  });

  loadEntries();
}
