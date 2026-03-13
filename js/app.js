// MBTI Coffee Test - Main Application
(function() {
  'use strict';

  // MBTI axis scores: E/I, S/N, T/F, J/P
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  let currentQuestion = 0;
  const totalQuestions = 8;

  // Questions mapped to MBTI axes
  // Each answer adds to one side of an axis
  const questions = [
    { key: 'q1', axis: 'EI' },   // ordering style -> E/I
    { key: 'q2', axis: 'SN' },   // cafe vibe -> S/N
    { key: 'q3', axis: 'TF' },   // choosing coffee -> T/F
    { key: 'q4', axis: 'JP' },   // coffee routine -> J/P
    { key: 'q5', axis: 'EI' },   // who to drink with -> E/I
    { key: 'q6', axis: 'SN' },   // new menu reaction -> S/N
    { key: 'q7', axis: 'TF' },   // friend's bad coffee -> T/F
    { key: 'q8', axis: 'JP' },   // travel cafe -> J/P
  ];

  // Coffee results for each MBTI type
  const coffeeResults = {
    INTJ: { icon: '&#9749;', coffee: 'espresso', traits: ['intense', 'efficient', 'bold'] },
    ENFP: { icon: '&#127849;', coffee: 'caramelMacchiato', traits: ['sweet', 'colorful', 'energetic'] },
    ISTJ: { icon: '&#9749;', coffee: 'americano', traits: ['classic', 'stable', 'consistent'] },
    INFP: { icon: '&#127800;', coffee: 'lavenderLatte', traits: ['unique', 'dreamy', 'gentle'] },
    ENTP: { icon: '&#9749;', coffee: 'doubleShotFlatWhite', traits: ['bold', 'experimental', 'sharp'] },
    ISFJ: { icon: '&#127846;', coffee: 'vanillaLatte', traits: ['warm', 'comforting', 'caring'] },
    ENTJ: { icon: '&#129380;', coffee: 'coldBrew', traits: ['powerful', 'goalDriven', 'clean'] },
    INFJ: { icon: '&#127861;', coffee: 'chaiLatte', traits: ['deep', 'complex', 'mystical'] },
    ESTP: { icon: '&#129371;', coffee: 'icedAmericano', traits: ['cool', 'energetic', 'spontaneous'] },
    ISFP: { icon: '&#127861;', coffee: 'matchaLatte', traits: ['artistic', 'natural', 'sensory'] },
    ESTJ: { icon: '&#9749;', coffee: 'dripCoffee', traits: ['practical', 'traditional', 'leader'] },
    INTP: { icon: '&#9749;', coffee: 'turkishCoffee', traits: ['intellectual', 'unique', 'profound'] },
    ESFP: { icon: '&#127848;', coffee: 'frappuccino', traits: ['party', 'glamorous', 'joyful'] },
    ISTP: { icon: '&#9749;', coffee: 'longBlack', traits: ['minimal', 'independent', 'functional'] },
    ESFJ: { icon: '&#9749;', coffee: 'cappuccino', traits: ['social', 'warm', 'harmonious'] },
    ENFJ: { icon: '&#127851;', coffee: 'mocha', traits: ['passionate', 'inclusive', 'sweetStrong'] },
  };

  function t(key, fallback) {
    return window.i18n ? window.i18n.t(key, fallback) : (fallback || key);
  }

  // Create steam effect
  function createSteam() {
    const container = document.getElementById('steam-container');
    if (!container) return;
    for (let i = 0; i < 8; i++) {
      const steam = document.createElement('div');
      steam.className = 'steam';
      steam.style.left = (10 + Math.random() * 80) + '%';
      steam.style.animationDelay = (Math.random() * 4) + 's';
      steam.style.animationDuration = (3 + Math.random() * 3) + 's';
      container.appendChild(steam);
    }
  }

  // Update coffee cup fill level
  function updateCoffeeFill() {
    const fill = document.getElementById('coffee-fill');
    if (!fill) return;
    const pct = (currentQuestion / totalQuestions) * 50; // max height 50 out of ~53 available
    fill.setAttribute('height', pct);
    fill.setAttribute('y', 78 - pct);
  }

  // Show a specific screen
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
  }

  // Render current question
  function renderQuestion() {
    const q = questions[currentQuestion];
    const container = document.getElementById('question-container');
    const progressText = document.getElementById('progress-text');
    if (!container) return;

    progressText.textContent = `${currentQuestion + 1} / ${totalQuestions}`;

    // Add numeric progress label
    const progressContainer = document.querySelector('.progress-container');
    let progressLabel = progressContainer.querySelector('.progress-label');
    if (!progressLabel) {
      progressLabel = document.createElement('div');
      progressLabel.className = 'progress-label';
      progressContainer.insertBefore(progressLabel, progressContainer.firstChild);
    }
    progressLabel.textContent = `${t('app.questionLabel', 'Question')} ${currentQuestion + 1} ${t('app.ofLabel', 'of')} ${totalQuestions}`;
    updateCoffeeFill();

    const qText = t(`questions.${q.key}.text`, `Question ${currentQuestion + 1}`);
    const options = [];
    for (let i = 0; i < 4; i++) {
      options.push({
        text: t(`questions.${q.key}.options.${i}.text`, `Option ${i + 1}`),
        icon: t(`questions.${q.key}.options.${i}.icon`, ''),
        // first two options map to first side of axis, last two to second side
        axis: q.axis,
        side: i < 2 ? q.axis[0] : q.axis[1],
        weight: (i === 0 || i === 2) ? 2 : 1
      });
    }

    container.innerHTML = `
      <div class="question-number">${t('app.questionLabel', 'Question')} ${currentQuestion + 1}</div>
      <div class="question-text">${qText}</div>
      <div class="options">
        ${options.map((opt, idx) => `
          <button class="option-btn" data-idx="${idx}" data-side="${opt.side}" data-weight="${opt.weight}">
            <span class="option-icon">${opt.icon}</span>
            <span>${opt.text}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Re-apply class for animation
    container.classList.remove('question-card');
    void container.offsetWidth;
    container.classList.add('question-card');

    // Bind option clicks
    container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn));
    });
  }

  // Handle answer selection
  function handleAnswer(btn) {
    const side = btn.dataset.side;
    const weight = parseInt(btn.dataset.weight, 10);
    scores[side] += weight;

    // Visual feedback
    btn.classList.add('selected');

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion >= totalQuestions) {
        showResult();
      } else {
        renderQuestion();
      }
    }, 300);
  }

  // Calculate MBTI type from scores
  function calculateMBTI() {
    const ei = scores.E >= scores.I ? 'E' : 'I';
    const sn = scores.S >= scores.N ? 'S' : 'N';
    const tf = scores.T >= scores.F ? 'T' : 'F';
    const jp = scores.J >= scores.P ? 'J' : 'P';
    return ei + sn + tf + jp;
  }

  // Show result
  function showResult() {
    showScreen('result-screen');
    const mbti = calculateMBTI();
    const result = coffeeResults[mbti];
    const container = document.getElementById('result-container');
    if (!container || !result) return;

    const coffeeName = t(`results.${mbti}.name`, mbti);
    const coffeeTagline = t(`results.${mbti}.tagline`, '');
    const coffeeDesc = t(`results.${mbti}.description`, '');
    const traits = result.traits.map(tr => t(`traits.${tr}`, tr));

    container.innerHTML = `
      <div class="result-coffee-icon">${result.icon}</div>
      <div class="result-mbti">${mbti}</div>
      <div class="result-coffee-name">${coffeeName}</div>
      <div class="result-tagline">${coffeeTagline}</div>
      <div class="card">
        <div class="result-description">${coffeeDesc}</div>
        <div class="result-traits">
          ${traits.map(tr => `<span class="trait-tag">${tr}</span>`).join('')}
        </div>
      </div>

      <div class="share-section">
        <h3 data-i18n="share.title">${t('share.title', 'Share Your Results')}</h3>
        <div class="share-buttons">
          <button class="share-btn kakao" id="share-kakao" aria-label="KakaoTalk">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.21 4.65 6.6l-1.18 4.33c-.1.37.33.66.65.44l5.19-3.42c.23.02.45.05.69.05 5.52 0 10-3.58 10-7.9S17.52 3 12 3z"/></svg>
            <span>KakaoTalk</span>
          </button>
          <button class="share-btn twitter" id="share-twitter" aria-label="X/Twitter">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span>X</span>
          </button>
          <button class="share-btn facebook" id="share-facebook" aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>Facebook</span>
          </button>
          <button class="share-btn copy-link" id="share-copy" aria-label="Copy Link">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            <span>${t('share.copyLink', 'Copy Link')}</span>
          </button>
        </div>
      </div>

      <p class="participant-stat" id="participant-stat"></p>

      <button id="retry-btn" class="btn btn-secondary">${t('app.retryBtn', 'Try Again')}</button>
    `;

    // Participant count
    const participantEl = document.getElementById('participant-stat');
    if (participantEl) {
      const counts = { INFP: 2847, ENFP: 3102, INTJ: 1893, ENTJ: 1654, INFJ: 2156, ENFJ: 2498, INTP: 1987, ENTP: 2234, ISFP: 1876, ESFP: 2345, ISTJ: 1723, ESTJ: 1891, ISFJ: 2012, ESFJ: 2567, ISTP: 1654, ESTP: 1998 };
      const count = counts[mbti] || 2000;
      participantEl.innerHTML = `☕ <strong>${count.toLocaleString()}+</strong> ${t('result.participants', 'people matched this coffee')}`;
    }

    // Bind share buttons
    bindShareButtons(mbti, coffeeName);

    // Bind retry
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', resetQuiz);
    }

    // GA4 event
    if (typeof gtag === 'function') {
      gtag('event', 'quiz_complete', {
        event_category: 'mbti_coffee',
        event_label: mbti,
        value: 1
      });
    }
  }

  // Share functionality
  function bindShareButtons(mbti, coffeeName) {
    const shareText = t('share.text', 'My MBTI coffee is {coffee} ({mbti})!')
      .replace('{coffee}', coffeeName)
      .replace('{mbti}', mbti);
    const shareUrl = 'https://dopabrain.com/mbti-coffee/';
    const fullText = shareText + ' ' + t('share.cta', 'Find yours!');

    const kakaoBtn = document.getElementById('share-kakao');
    const twitterBtn = document.getElementById('share-twitter');
    const facebookBtn = document.getElementById('share-facebook');
    const copyBtn = document.getElementById('share-copy');

    if (kakaoBtn) {
      kakaoBtn.addEventListener('click', () => {
        const url = `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullText)}`;
        window.open(url, '_blank', 'width=600,height=400');
      });
    }
    if (twitterBtn) {
      twitterBtn.addEventListener('click', () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      });
    }
    if (facebookBtn) {
      facebookBtn.addEventListener('click', () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullText)}`;
        window.open(url, '_blank', 'width=600,height=400');
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          const span = copyBtn.querySelector('span');
          if (span) {
            const orig = span.textContent;
            span.textContent = t('share.copied', 'Copied!');
            setTimeout(() => { span.textContent = orig; }, 2000);
          }
        }).catch(() => {});
      });
    }
  }

  // Reset quiz
  function resetQuiz() {
    currentQuestion = 0;
    Object.keys(scores).forEach(k => scores[k] = 0);
    showScreen('start-screen');
    updateCoffeeFill();
  }

  // Hide app loader
  function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => { loader.style.display = 'none'; }, 400);
    }
  }

  // Init
  function init() {
    createSteam();

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        showScreen('question-screen');
        renderQuestion();
      });
    }

    // Language selector
    const langSelect = document.getElementById('lang-select');
    if (langSelect && window.i18n) {
      langSelect.value = window.i18n.currentLang || 'ko';
      langSelect.addEventListener('change', (e) => {
        if (window.i18n) {
          window.i18n.switchLang(e.target.value);
          // Re-render current screen if quiz is in progress
          if (currentQuestion > 0 && currentQuestion < totalQuestions) {
            renderQuestion();
          }
        }
      });
    }

    // Wait for i18n to be ready before hiding loader
    const startTime = Date.now();
    const waitForI18n = setInterval(() => {
      if ((window.i18n && window.i18n.initialized) || Date.now() - startTime > 2000) {
        clearInterval(waitForI18n);
        hideLoader();
      }
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait a tick for i18n to initialize
      setTimeout(init, 100);
    });
  } else {
    setTimeout(init, 100);
  }
})();
