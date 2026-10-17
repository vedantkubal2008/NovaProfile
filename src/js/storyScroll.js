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
  const readButton = document.getElementById('story-read-toggle');
  const readStatus = document.getElementById('story-read-status');

  if (!sceneElements.length) return;

  const sceneTitles = [
    'Scene 1: The Crib on Apollo-99',
    'Scene 2: Floating Outside the Air-Lock',
    'Scene 3: The Starlight Repair Station',
    'Scene 4: Bedtime in Zero Gravity'
  ];

  const narration = [...sceneElements].flatMap((scene, sceneIndex) => {
    const paragraph = scene.querySelector('.scene-text');
    if (!paragraph) return [];
    const sentences = paragraph.textContent.trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph.textContent.trim()];
    paragraph.replaceChildren();
    return sentences.map((sentence) => {
      const span = document.createElement('span');
      span.className = 'story-sentence';
      span.textContent = sentence.trim();
      paragraph.append(span, document.createTextNode(' '));
      return { span, scene, sceneIndex };
    });
  });

  let narrationIndex = 0;
  let isReading = false;

  function stopNarration(finished = false) {
    isReading = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    narration.forEach(({ span, scene }) => {
      span.classList.remove('is-speaking');
      scene.classList.remove('is-reading');
    });
    if (readButton) {
      readButton.setAttribute('aria-pressed', 'false');
      readButton.textContent = 'Read to me';
    }
    if (readStatus) readStatus.textContent = finished ? 'Story complete' : '';
  }

  function readNextSentence() {
    if (!isReading) return;
    if (narrationIndex >= narration.length) {
      stopNarration(true);
      return;
    }
    const item = narration[narrationIndex];
    item.span.classList.add('is-speaking');
    item.scene.classList.add('is-reading');
    if (readStatus) readStatus.textContent = `Scene ${item.sceneIndex + 1} of 4`;

    const utterance = new SpeechSynthesisUtterance(item.span.textContent);
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.startsWith('en'));
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      item.span.classList.remove('is-speaking');
      item.scene.classList.remove('is-reading');
      narrationIndex += 1;
      readNextSentence();
    };
    utterance.onerror = () => stopNarration();
    window.speechSynthesis.speak(utterance);
  }

  if (readButton) {
    if (!('speechSynthesis' in window)) {
      readButton.disabled = true;
      if (readStatus) readStatus.textContent = 'Speech unavailable in this browser';
    } else {
      readButton.addEventListener('click', () => {
        if (isReading) {
          stopNarration();
          return;
        }
        narrationIndex = 0;
        isReading = true;
        readButton.setAttribute('aria-pressed', 'true');
        readButton.textContent = 'Stop reading';
        window.speechSynthesis.cancel();
        readNextSentence();
      });
    }
  }

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
