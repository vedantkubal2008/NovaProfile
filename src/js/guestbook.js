/**
 * Live Guestbook Wall (Bonus Side Quest: +2 pts)
 * Visitors can sign their name, pick an animated sticker, and leave a cozy note.
 * Persisted in localStorage and pre-seeded with friendly bedtime messages.
 */

import { sounds } from './audio.js';

export function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const wall = document.getElementById('guestbook-wall');
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

  // Load entries from localStorage
  function loadEntries() {
    let saved = [];
    try {
      const data = localStorage.getItem('loomi_guestbook_entries');
      if (data) {
        saved = JSON.parse(data);
      } else {
        saved = initialEntries;
        localStorage.setItem('loomi_guestbook_entries', JSON.stringify(saved));
      }
    } catch (e) {
      saved = initialEntries;
    }
    renderEntries(saved);
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sounds.playChime(783.99, 0.25); // G5 chime

    const nameInput = document.getElementById('guest-name');
    const msgInput = document.getElementById('guest-msg');

    const name = nameInput.value.trim() || 'A Curious Traveler';
    const message = msgInput.value.trim() || 'Left a warm pocket of starlight in your guestbook!';

    let entries = [];
    try {
      const data = localStorage.getItem('loomi_guestbook_entries');
      entries = data ? JSON.parse(data) : initialEntries;
    } catch (err) {
      entries = initialEntries;
    }

    const newEntry = {
      name,
      message,
      sticker: selectedSticker,
      date: 'Just now'
    };

    entries.unshift(newEntry);
    try {
      localStorage.setItem('loomi_guestbook_entries', JSON.stringify(entries));
    } catch (err) {}

    renderEntries(entries);

    // Reset inputs
    nameInput.value = '';
    msgInput.value = '';

    // Play celebration twinkle
    sounds.playTwinkle();
  });

  loadEntries();
}
