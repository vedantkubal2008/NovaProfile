/**
 * Interactive Bedtime Story Scroll
 * Tells Loomi's origin across 4 atmospheric scenes (<150 words each)
 * with scroll-driven chapter activation and soothing audio cues.
 */

import { sounds } from './audio.js';

export function initStoryScroll() {
  const sceneElements = document.querySelectorAll('.story-scene');
  const trackerDots = document.querySelectorAll('.story-dot');
  const chapterLabel = document.getElementById('story-active-chapter');

  if (!sceneElements.length) return;

  const sceneTitles = [
    'Scene 1: The Crib on Apollo-99',
    'Scene 2: Floating Outside the Air-Lock',
    'Scene 3: The Starlight Repair Station',
    'Scene 4: Bedtime in Zero Gravity'
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-scene-index'), 10);
          
          // Mark active
          sceneElements.forEach((s) => s.classList.remove('is-active-scene'));
          entry.target.classList.add('is-active-scene');

          trackerDots.forEach((dot, dIdx) => {
            dot.classList.toggle('is-current', dIdx === index);
          });

          if (chapterLabel && sceneTitles[index]) {
            chapterLabel.innerText = sceneTitles[index];
          }

          // Subtle harmonic audio feedback
          sounds.playHarp(index + 2);
        }
      });
    },
    { threshold: 0.6 }
  );

  sceneElements.forEach((el) => observer.observe(el));

  // Dot click navigation
  trackerDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      sounds.playPop();
      if (sceneElements[idx]) {
        sceneElements[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}
