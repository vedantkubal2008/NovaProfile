/**
 * Interactive Baby Astronaut Stage & Eye-Tracker for Nova
 * Features:
 * 1. 360-degree pupil gaze tracking inside bubble helmet
 * 2. Visor glass glare parallax following cursor
 * 3. Zero-G floating tilt & antenna radio pulse
 * 4. Padded mitten wave on hover
 * 5. Interactive helmet tapping / petting responses
 */

import { sounds } from './audio.js';
import { awardBadge } from './achievements.js';

export function initEyeTracker() {
  const avatarWrapper = document.getElementById('loomi-interactive-avatar');
  const pupils = document.querySelectorAll('.astro-pupil');
  const visorGlare = document.querySelector('.astro-visor-glare');
  const antennaLed = document.querySelector('.astro-antenna-led');
  const blushCheeks = document.querySelectorAll('.astro-blush');
  const wavingHand = document.querySelector('.astro-hand-wave');

  if (!avatarWrapper) return;

  // Window pointer tracker for gaze & zero-g parallax
  window.addEventListener('pointermove', (e) => {
    const rect = avatarWrapper.getBoundingClientRect();
    const avatarCenterX = rect.left + rect.width / 2;
    const avatarCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - avatarCenterX;
    const dy = e.clientY - avatarCenterY;
    const dist = Math.hypot(dx, dy);

    // Eye gaze direction (inside helmet)
    const maxPupilOffset = 9;
    const angle = Math.atan2(dy, dx);
    const pupilDist = Math.min(maxPupilOffset, dist / 20);

    const pupilX = Math.cos(angle) * pupilDist;
    const pupilY = Math.sin(angle) * pupilDist;

    pupils.forEach((pupil) => {
      pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    });

    // Parallax reflection on the curved glass visor
    if (visorGlare) {
      const glareX = -pupilX * 1.5;
      const glareY = -pupilY * 1.5;
      visorGlare.style.transform = `translate(${glareX}px, ${glareY}px)`;
    }

    // Zero-g 3D perspective tilt
    const tiltX = Math.max(-12, Math.min(12, -(dy / window.innerHeight) * 20));
    const tiltY = Math.max(-14, Math.min(14, (dx / window.innerWidth) * 24));
    avatarWrapper.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

    // Wiggle antenna when mouse moves nearby
    if (dist < 320 && antennaLed) {
      antennaLed.style.filter = `drop-shadow(0 0 12px #ffc038)`;
    }
  });

  // Waving mitten on card hover
  avatarWrapper.addEventListener('pointerenter', () => {
    if (wavingHand) {
      wavingHand.classList.add('is-waving');
    }
  });

  avatarWrapper.addEventListener('pointerleave', () => {
    if (wavingHand) {
      wavingHand.classList.remove('is-waving');
    }
  });

  // Speech Synthesis: Nova's Single Cute, Sharp & Soothing Baby Voice (100% First-Person)
  const novaQuotes = [
    { voice: "Hi! I am Nova! I love floating in space!", display: "Hi! I'm Nova! I love floating in space! 🚀✨" },
    { voice: "Look! My mittens caught a tiny shooting star!", display: "Look! My mittens caught a shooting star! 🌠👶" },
    { voice: "Earth looks so pretty and blue from my spaceship!", display: "Earth looks so pretty and blue from up here! 🌍🥰" },
    { voice: "Hehehe, space dust tickles my little helmet!", display: "Hehehe! Space dust tickles my helmet! ⭐✨" },
    { voice: "I am sending you my warmest starry hugs!", display: "I'm sending you my warmest starry hugs! 💖" },
    { voice: "Watch me do a happy flip in zero gravity!", display: "Watch me do a flip in zero-g! 🛸💫" },
    { voice: "I am ready for my bedtime milk, Ground Control!", display: "I'm ready for my bedtime milk! 🍼🪐" }
  ];

  let quoteIndex = 0;
  let isSpeaking = false;
  let selectedBabyVoice = null;

  // Cache and select the ideal soothing, sharp baby voice
  function findBestBabyVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;

    // 1. Strict priority for youthful, soothing, female/child English voices
    const preferredNames = ['zira', 'aria', 'jenny', 'samantha', 'victoria', 'karen', 'moira', 'google us english', 'natural'];
    for (const pref of preferredNames) {
      const match = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes(pref));
      if (match) return match;
    }

    // 2. Any English voice that is NOT an adult/elderly male voice
    const nonMaleVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const isEnglish = v.lang.startsWith('en');
      const isAdultMale = name.includes('david') || name.includes('mark') || name.includes('george') || name.includes('male') || name.includes('richard');
      return isEnglish && !isAdultMale;
    });

    if (nonMaleVoice) return nonMaleVoice;

    // 3. Fallback to any non-male voice
    return voices.find(v => !v.name.toLowerCase().includes('david') && !v.name.toLowerCase().includes('mark')) || voices[0];
  }

  // Pre-load voices on browser initialization
  if ('speechSynthesis' in window) {
    selectedBabyVoice = findBestBabyVoice();
    window.speechSynthesis.onvoiceschanged = () => {
      selectedBabyVoice = findBestBabyVoice();
    };
  }

  const normalEyes = avatarWrapper.querySelector('.astro-eyes-normal');
  const happyEyes = avatarWrapper.querySelector('.astro-eyes-happy');
  const normalMouth = avatarWrapper.querySelector('.astro-mouth-normal');
  const laughMouth = avatarWrapper.querySelector('.astro-mouth-laugh');
  const leftHand = avatarWrapper.querySelector('#astro-hand-left');
  const rightHand = avatarWrapper.querySelector('#astro-hand-right');
  const giggleBubble = document.getElementById('astro-giggle-bubble');

  function speakNova(quote, onComplete) {
    if (!('speechSynthesis' in window)) {
      setTimeout(onComplete, 1600);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(quote.voice);

      if (!selectedBabyVoice) {
        selectedBabyVoice = findBestBabyVoice();
      }

      if (selectedBabyVoice) {
        utterance.voice = selectedBabyVoice;
      }

      // Tuned parameters for a sweet, sharp, soothing baby cosmonaut voice
      utterance.pitch = 1.92; // Sweet, bright, sharp baby pitch
      utterance.rate = 1.02;  // Gentle, soothing toddler pacing (not rushed)
      utterance.volume = 1.0;

      utterance.onend = () => {
        onComplete();
      };

      utterance.onerror = () => {
        onComplete();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setTimeout(onComplete, 1600);
    }
  }

  avatarWrapper.addEventListener('click', (e) => {
    if (isSpeaking) return;
    awardBadge('giggle');
    isSpeaking = true;

    // 1. Play cute radio chirp & baby giggle intro
    sounds.playChime(1046.50, 0.15); // Radio connect chirp
    setTimeout(() => sounds.playBabyGiggle(), 120);

    const quote = novaQuotes[quoteIndex];
    quoteIndex = (quoteIndex + 1) % novaQuotes.length;

    // 2. Animate facial expression: eyes smile, mouth animates
    if (normalEyes) normalEyes.style.display = 'none';
    if (happyEyes) happyEyes.style.display = 'block';
    if (normalMouth) normalMouth.style.display = 'none';
    if (laughMouth) {
      laughMouth.style.display = 'block';
      laughMouth.classList.add('astro-mouth-talking');
    }

    // 3. Double wave with both cute hands
    if (leftHand) leftHand.classList.add('is-giggle-waving-left');
    if (rightHand) rightHand.classList.add('is-giggle-waving-right');

    // 4. Pop up speech bubble with the spoken words
    if (giggleBubble) {
      giggleBubble.innerText = quote.display;
      giggleBubble.classList.add('is-visible');
    }

    avatarWrapper.classList.add('is-petted');

    blushCheeks.forEach((blush) => {
      blush.classList.add('is-glowing');
    });

    // 5. Spawn floating hearts, stars, and space pacifiers
    spawnSpaceParticles(e.clientX, e.clientY);

    // 6. Speak out loud with Web Speech API
    speakNova(quote, () => {
      // Smoothly restore normal expression after speaking
      setTimeout(() => {
        if (normalEyes) normalEyes.style.display = 'block';
        if (happyEyes) happyEyes.style.display = 'none';
        if (normalMouth) normalMouth.style.display = 'block';
        if (laughMouth) {
          laughMouth.style.display = 'none';
          laughMouth.classList.remove('astro-mouth-talking');
        }

        if (leftHand) leftHand.classList.remove('is-giggle-waving-left');
        if (rightHand) rightHand.classList.remove('is-giggle-waving-right');
        if (giggleBubble) giggleBubble.classList.remove('is-visible');

        avatarWrapper.classList.remove('is-petted');
        blushCheeks.forEach((blush) => blush.classList.remove('is-glowing'));
        isSpeaking = false;
      }, 400);
    });
  });
}

function spawnSpaceParticles(x, y) {
  const icons = ['🚀', '🪐', '⭐', '✨', '🛸', '🛰️'];
  for (let i = 0; i < 7; i++) {
    const particle = document.createElement('span');
    particle.className = 'loomi-pet-reaction';
    particle.innerText = icons[i % icons.length];
    particle.style.left = `${x + (Math.random() * 50 - 25)}px`;
    particle.style.top = `${y + (Math.random() * 50 - 25)}px`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 900);
  }
}
