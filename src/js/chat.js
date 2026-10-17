/**
 * Cadet Nova Space Chatbot Logic
 * - 100% First-Person Perspective ("I", "my", "me")
 * - Space-only guardrail (answers only space/astronomy/station topics)
 * - Native Web Speech API voice synthesis for Nova's cute baby voice
 * - Procedural sound effects & typing indicator
 */

import { sounds } from './audio.js';
import { initSpaceBackground } from './spaceBackground.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize space background
  initSpaceBackground();

  const chatFeed = document.getElementById('chat-messages-feed');
  const chatForm = document.getElementById('chat-input-form');
  const chatInput = document.getElementById('chat-text-input');
  const typingIndicator = document.getElementById('chat-typing-row');
  const topicChips = document.querySelectorAll('.chat-pill-btn');

  // Space Knowledge Base (First-Person, Cute Toddler Cosmonaut Voice)
  function getNovaResponse(userText) {
    const text = userText.toLowerCase().trim();

    // Space filter check
    const spaceKeywords = [
      'space', 'star', 'planet', 'moon', 'sun', 'mars', 'saturn', 'jupiter', 'earth', 'venus', 
      'mercury', 'neptune', 'uranus', 'pluto', 'alien', 'comet', 'asteroid', 'meteor', 
      'black hole', 'galaxy', 'milky way', 'orbit', 'rocket', 'astronaut', 'cosmonaut', 
      'helmet', 'suit', 'zero-g', 'zero gravity', 'weightless', 'milk', 'sleep', 'bedtime', 
      'lullaby', 'telescope', 'satellite', 'apollo', 'nova', 'solar', 'nebula', 'constellation', 
      'universe', 'gravity', 'sky', 'night', 'twinkle', 'hax', 'fly', 'flight'
    ];

    const isSpaceRelated = spaceKeywords.some(keyword => text.includes(keyword));

    // Off-topic guardrail: Nova gently declines non-space topics
    if (!isSpaceRelated) {
      return {
        speech: "Aww, my little baby brain only knows about space, stars, and planets! Can you ask me about the Moon, Saturn's rings, or how I float in zero-g?",
        display: "Aww, my little baby brain only knows about space, stars, and planets! 🍼✨ Can you ask me about the Moon, Saturn's rings, or how I sleep in zero gravity? 🪐🚀"
      };
    }

    const moonCounts = {
      earth: 'Earth has 1 natural moon.',
      mars: 'Mars has 2 moons: Phobos and Deimos.',
      jupiter: 'Jupiter has 95 known moons.',
      saturn: 'Saturn has 146 known moons.',
      uranus: 'Uranus has 27 known moons.',
      neptune: 'Neptune has 14 known moons.',
      pluto: 'Pluto has 5 known moons.',
      venus: 'Venus has no moons.',
      mercury: 'Mercury has no moons.'
    };

    const moonQuestion = /how many|number of|count.*moon|moons.*(earth|mars|jupiter|saturn|uranus|neptune|pluto|venus|mercury)/i;
    const planetMatch = text.match(/\b(earth|mars|jupiter|saturn|uranus|neptune|pluto|venus|mercury)\b/);

    if (moonQuestion.test(text) && planetMatch) {
      const planet = planetMatch[1].toLowerCase();
      const fact = moonCounts[planet];
      if (fact) {
        return {
          speech: fact,
          display: `${fact} 🪐`
        };
      }
    }

    // Contextual Space Responses
    if (text.includes('who are you') || text.includes('your name') || text.includes('about you')) {
      return {
        speech: "Hi! I am Nova, the pocket cosmonaut! I live in Orbit Station ninety-nine in my bear-ear helmet, mapping starry routes so everyone on Earth sleeps tight!",
        display: "Hi! I'm Nova, the pocket cosmonaut! 👶🚀 I live at Orbit Station-99 in my bear-ear helmet, mapping starry routes so everyone on Earth sleeps tight! ✨"
      };
    }

    if (text.includes('sleep') || text.includes('bedtime') || text.includes('night') || text.includes('tired')) {
      return {
        speech: "I sleep tucked into a tethered floating sleeping cocoon so I do not bump into my rocket controls! Earth glows outside like a big blue nightlight!",
        display: "I sleep inside a tethered floating sleeping cocoon so I don't bump into the rocket buttons! 🌙💤 Earth glows right outside my window like a big blue nightlight! 🌍✨"
      };
    }

    if (text.includes('lullaby') || text.includes('twinkle') || text.includes('song') || text.includes('music')) {
      return {
        speech: "My favorite song is Twinkle Twinkle Little Star! I sing it into my helmet radio whenever shooting stars zoom past my spaceship!",
        display: "My favorite tune is Twinkle, Twinkle, Little Star! 🎶⭐ I sing it into my helmet radio whenever shooting stars zoom past my spaceship window! 🌌📻"
      };
    }

    if (text.includes('jupiter')) {
      return {
        speech: "Jupiter is the biggest planet in our solar system! It is a giant gas world with stripes of storms, and I think its Great Red Spot is the coolest planet weather ever!",
        display: "Jupiter is the biggest planet in our solar system! 🪐✨ It is a giant gas world with huge storms, and I think the Great Red Spot is the coolest planet weather ever! 🌩️"
      };
    }

    if (text.includes('saturn') || text.includes('ring')) {
      return {
        speech: "Saturn has the prettiest rings ever! They look like glowing hula hoops made of shiny ice rocks! I pretend they are tracks for my rocket!",
        display: "Saturn has the prettiest rings ever! 🪐✨ They look like glowing hula hoops made of shiny ice crystals and stardust. I pretend they are racetracks for my rocket! 🚀"
      };
    }

    if (text.includes('moon') || text.includes('lunar')) {
      return {
        speech: "The Moon is my giant playground! When I kick my magnetic booties, I float way high into the sky! Plus, it looks like a giant yummy cracker!",
        display: "The Moon is my giant bouncy playground! 🌕 When I kick with my magnetic booties, I float way high into the sky! And it looks like a giant yummy cheese cracker! 🧀😋"
      };
    }

    if (text.includes('mars') || text.includes('red planet')) {
      return {
        speech: "Mars is super red and dusty! I tried building a stardust sandcastle there with my pink mittens, but my cocoa got cold so I flew back up!",
        display: "Mars is super red and dusty! 🔴 I tried building a stardust sandcastle there with my pink mittens, but it got chilly so I flew back up to my spaceship! 🚀"
      };
    }

    if (text.includes('black hole')) {
      return {
        speech: "Ooh! Black holes are cosmic vacuum cleaners! I always steer my spaceship far away so my space pacifier does not get sucked in!",
        display: "Ooh, black holes are like cosmic vacuum cleaners! 🕳️⭐ I always steer my spaceship far away so my space pacifier doesn't get sucked in! 🛸💨"
      };
    }

    if (text.includes('alien') || text.includes('monster')) {
      return {
        speech: "I have not seen scary aliens, only friendly little star-sprites that giggle and help me untangle comet ribbons!",
        display: "I haven't seen any scary aliens, only friendly little star-sprites that giggle and help me untangle comet ribbons! 👽👋✨"
      };
    }

    if (text.includes('sun') || text.includes('solar')) {
      return {
        speech: "The Sun is a giant golden heater! It is so bright that my glass visor automatically turns dark so my little baby eyes do not squint!",
        display: "The Sun is our giant golden heater! ☀️ It's so bright that my glass visor automatically shades itself so my little eyes don't squint! 😎✨"
      };
    }

    if (text.includes('milk') || text.includes('eat') || text.includes('food') || text.includes('bottle')) {
      return {
        speech: "Drinking warm milk in zero gravity is so fun! The milk floats in round hover bubbles and I catch them in my mouth! Gulp!",
        display: "Drinking warm milk in zero gravity is so funny! 🥛 Floating milk forms round little hover-bubbles and I catch them in my mouth! Gulp! 😋🍼"
      };
    }

    if (text.includes('zero-g') || text.includes('zero gravity') || text.includes('float') || text.includes('weightless')) {
      return {
        speech: "Floating in zero gravity feels like being wrapped in a giant fluffy cloud! I can do twelve somersaults without touching the floor!",
        display: "Floating in zero-g feels like being wrapped in a fluffy cloud! ☁️ I can do twelve somersaults in a row without touching the floor! 🤸‍♀️💫"
      };
    }

    if (text.includes('helmet') || text.includes('suit') || text.includes('mitten')) {
      return {
        speech: "My space helmet has cute bear ears and an antenna that glows yellow! And my puffy pink mittens keep my fingers warm when I touch comets!",
        display: "My space helmet has cute bear ears and an antenna with a glowing star! 🐻⭐ And my puffy pink mittens keep my fingers warm when I pet comets! 🧤💖"
      };
    }

    if (text.includes('earth')) {
      return {
        speech: "Earth is the prettiest planet of all! From up here, it looks like a soft blue and white marble glowing in the dark. I can see your lights right now!",
        display: "Earth is the prettiest planet of all! 🌍 From up here, it looks like a soft blue and white marble glowing in the dark. I can see your city lights right now! ✨"
      };
    }

    if (text.includes('star') || text.includes('shooting star') || text.includes('constellation')) {
      return {
        speech: "Stars are my best friends! When shooting stars zoom past, I catch their golden threads and weave them into bedtime blankets!",
        display: "Stars are my best friends! 🌟 When shooting stars zoom past, I catch their golden threads with my mittens and weave them into bedtime blankets! 🌠🧶"
      };
    }

    // Default friendly space answer with a factual anchor
    const fallbackFacts = [
      'Jupiter is the largest planet in our solar system.',
      'The Moon is Earth’s only natural satellite.',
      'Saturn’s rings are made mostly of ice and rock.',
      'The Sun is a star, and it is the center of our solar system.'
    ];
    const fallbackFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];

    return {
      speech: `${fallbackFact} Space is the biggest, most magical playground ever! I love charting cosmic airpaths and watching over you from my spaceship!`,
      display: `${fallbackFact} 🌌🚀 I love charting cosmic airpaths and watching over you from my little station! 💖✨`
    };
  }

  // Add Message to Feed
  function appendMessage(sender, text, isNova = false) {
    const row = document.createElement('div');
    row.className = `chat-msg-row ${isNova ? 'from-nova' : 'from-user'}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    row.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-sender-name">
          <span>${isNova ? '🚀 Cadet Nova' : '👨‍🚀 You (Ground Control)'}</span>
          <span>${time}</span>
        </div>
        <div class="msg-body">${text}</div>
      </div>
    `;

    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // Handle User Submission
  function handleUserMessage(msgText) {
    if (!msgText.trim()) return;

    sounds.playPop();
    appendMessage('You', msgText, false);
    chatInput.value = '';

    // Show typing indicator
    if (typingIndicator) typingIndicator.hidden = false;
    chatFeed.scrollTop = chatFeed.scrollHeight;

    // Simulate Nova thinking and typing
    setTimeout(() => {
      if (typingIndicator) typingIndicator.hidden = true;

      const response = getNovaResponse(msgText);
      sounds.playChime(1046.50, 0.18); // Transmission chime
      appendMessage('Nova', response.display, true);
    }, 700);
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserMessage(chatInput.value);
    });
  }

  // Quick prompt chips
  topicChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt') || chip.innerText;
      handleUserMessage(prompt);
    });
  });
});
