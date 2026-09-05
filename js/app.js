// Coffee Code Reflection: authored entertainment mapping, not an MBTI assessment.
(function() {
  'use strict';
  const AXES = ['EI', 'SN', 'TF', 'JP'];
  const QUESTIONS = [
    { key: 'q1', axis: 'EI' }, { key: 'q2', axis: 'SN' }, { key: 'q3', axis: 'TF' }, { key: 'q4', axis: 'JP' },
    { key: 'q5', axis: 'EI' }, { key: 'q6', axis: 'SN' }, { key: 'q7', axis: 'TF' }, { key: 'q8', axis: 'JP' }
  ];
  const COFFEE_BY_CODE = {
    INTJ: 'espresso', ENFP: 'caramelMacchiato', ISTJ: 'americano', INFP: 'lavenderLatte', ENTP: 'doubleShotFlatWhite', ISFJ: 'vanillaLatte', ENTJ: 'coldBrew', INFJ: 'chaiLatte',
    ESTP: 'icedAmericano', ISFP: 'matchaLatte', ESTJ: 'dripCoffee', INTP: 'turkishCoffee', ESFP: 'frappuccino', ISTP: 'longBlack', ESFJ: 'cappuccino', ENFJ: 'mocha'
  };
  const scores = Object.fromEntries(AXES.flatMap(axis => [...axis].map(letter => [letter, 0])));
  const emitted = new Set();
  let current = 0, transitioning = false, completed = false, lastCode = '';

  window.CoffeeCodeContract = Object.freeze({ questions: QUESTIONS.map(item => ({ ...item })), optionPoints: [2, 1, 2, 1], tiePreference: AXES.map(axis => axis[0]), coffeeByCode: { ...COFFEE_BY_CODE } });
  const $ = id => document.getElementById(id);
  const t = (key, fallback) => window.i18n?.t ? window.i18n.t(key, fallback) : (fallback || key);
  function trackOnce(name) { if (!emitted.has(name)) { emitted.add(name); if (typeof gtag === 'function') gtag('event', name); } }
  function showScreen(id) { document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active')); $(id)?.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function resetScores() { Object.keys(scores).forEach(key => { scores[key] = 0; }); }
  function startReflection() { current = 0; transitioning = false; completed = false; lastCode = ''; resetScores(); showScreen('question-screen'); renderQuestion(); trackOnce('coffee_reflection_start'); }

  function renderQuestion() {
    const question = QUESTIONS[current];
    $('progress-text').textContent = `${current + 1} / ${QUESTIONS.length}`;
    $('progress-bar').style.width = `${(current / QUESTIONS.length) * 100}%`;
    $('question-title').textContent = t(`questions.${question.key}.text`, `Question ${current + 1}`);
    const options = $('options'); options.innerHTML = '';
    for (let index = 0; index < 4; index += 1) {
      const button = document.createElement('button'); button.className = 'option-btn';
      const icon = document.createElement('span'); icon.className = 'option-icon'; icon.textContent = t(`questions.${question.key}.options.${index}.icon`, '');
      const label = document.createElement('span'); label.textContent = t(`questions.${question.key}.options.${index}.text`, `Option ${index + 1}`);
      button.append(icon, label); button.addEventListener('click', () => acceptAnswer(index, button)); options.appendChild(button);
    }
  }

  function acceptAnswer(index, selected) {
    if (transitioning) return;
    transitioning = true;
    document.querySelectorAll('.option-btn').forEach(button => { button.disabled = true; button.classList.toggle('selected', button === selected); });
    const axis = QUESTIONS[current].axis, side = index < 2 ? axis[0] : axis[1];
    scores[side] += index === 0 || index === 2 ? 2 : 1;
    setTimeout(() => { current += 1; transitioning = false; if (current === 4) trackOnce('coffee_reflection_halfway'); if (current >= QUESTIONS.length) showResult(); else renderQuestion(); }, 250);
  }

  function calculateCode() { return AXES.map(axis => scores[axis[0]] >= scores[axis[1]] ? axis[0] : axis[1]).join(''); }
  function showResult() { completed = true; lastCode = calculateCode(); renderResult(); showScreen('result-screen'); trackOnce('coffee_reflection_complete'); }
  function renderResult() {
    if (!lastCode) return;
    const coffee = t(`results.${lastCode}.name`, COFFEE_BY_CODE[lastCode]);
    $('result-code').textContent = lastCode; $('result-coffee').textContent = coffee;
    $('result-description').textContent = t('result.mapping', 'In this authored café game, {code} maps to {coffee}.').replace('{code}', lastCode).replace('{coffee}', coffee);
  }

  async function shareReflection() {
    const data = { title: t('app.title', 'Coffee Code Reflection'), text: t('share.text', 'Try this eight-scenario coffee-code reflection.'), url: 'https://dopabrain.com/mbti-coffee/' };
    try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(`${data.text} ${data.url}`); $('share-status').textContent = t('share.success', 'Link copied.'); trackOnce('coffee_share_success'); }
    catch (error) { if (error?.name !== 'AbortError') $('share-status').textContent = t('share.unavailable', 'Sharing is unavailable.'); }
  }
  function sanitizeUrl() { const allowed = ['ko','en','zh','hi','ru','ja','es','pt','id','tr','de','fr'], url = new URL(location.href), lang = url.searchParams.get('lang'), query = allowed.includes(lang) ? `?lang=${lang}` : ''; if (location.search !== query || location.hash) history.replaceState(null, '', `${location.pathname}${query}`); }
  function syncActions() { const lang = window.i18n?.currentLang || 'en'; $('next-mbti-guide')?.setAttribute('href', `/portal/mbti/?lang=${lang}`); $('next-mbti-love')?.setAttribute('href', `/mbti-love/?lang=${lang}`); }
  window.onLanguageChange = function() { window.i18n?.applyTranslations(); syncActions(); if ($('question-screen')?.classList.contains('active') && !transitioning) renderQuestion(); renderResult(); };

  function init() {
    $('start-btn')?.addEventListener('click', startReflection); $('share-reflection')?.addEventListener('click', shareReflection);
    $('lang-select')?.addEventListener('change', event => window.i18n?.switchLang(event.target.value));
    $('next-mbti-guide')?.addEventListener('click', () => trackOnce('coffee_mbti_guide_click')); $('next-mbti-love')?.addEventListener('click', () => trackOnce('coffee_mbti_love_click'));
    $('retry-btn')?.addEventListener('click', () => { if (!completed) return; completed = false; trackOnce('coffee_reflection_retry'); showScreen('start-screen'); });
    const started = Date.now(); const wait = setInterval(() => { if (window.i18n?.initialized || Date.now() - started > 2000) { clearInterval(wait); sanitizeUrl(); syncActions(); const loader = $('app-loader'); if (loader) { loader.classList.add('hidden'); setTimeout(() => { loader.style.display = 'none'; }, 400); } document.body.dataset.coffeeAppReady = 'true'; } }, 50);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
