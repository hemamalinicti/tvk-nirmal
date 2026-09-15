/**
 * TVK Digital Portal - Dedicated Tamil & English Translator
 * Allows 1-click full page switching between Tamil (தமிழ்) and English with zero badge clipping.
 */

// Helper to set or clear translation cookies
function applyLanguageCookie(langCode) {
  const hostname = window.location.hostname;
  const cookiePath = "; path=/;";
  const domainPath = hostname ? "; domain=" + hostname + "; path=/;" : "; path=/;";
  
  if (langCode === 'en') {
    // Clear / reset to English
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC" + cookiePath;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC" + domainPath;
    document.cookie = "googtrans=/en/en" + cookiePath;
    document.cookie = "googtrans=/en/en" + domainPath;
  } else {
    // Set Tamil target
    document.cookie = "googtrans=/en/ta" + cookiePath;
    document.cookie = "googtrans=/en/ta" + domainPath;
  }
}

// Global language switcher function called by UI buttons
window.setPageLanguage = function(langCode) {
  const isEn = langCode === 'en';
  applyLanguageCookie(isEn ? 'en' : 'ta');
  
  // Try triggering Google Translate select element if loaded
  const selectElem = document.querySelector('.goog-te-combo');
  if (selectElem) {
    selectElem.value = isEn ? '' : 'ta';
    selectElem.dispatchEvent(new Event('change'));
  }
  
  // Reload page to apply clean translation across all DOM nodes & dynamic sections
  window.location.reload();
};

// Check current active language from cookie
function getCurrentLang() {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/i);
  if (match && match[1].toLowerCase() === 'ta') {
    return 'ta';
  }
  return 'en';
}

// Continuously remove top Google Translate banner frame & body displacement
function suppressGoogleBanner() {
  document.body.style.setProperty('top', '0px', 'important');
  document.body.style.setProperty('position', 'static', 'important');
  document.body.style.setProperty('margin-top', '0px', 'important');
  document.documentElement.style.setProperty('top', '0px', 'important');

  const frames = document.querySelectorAll('.goog-te-banner-frame, iframe[id*="goog"], .goog-te-banner');
  frames.forEach(f => {
    f.style.setProperty('display', 'none', 'important');
    f.style.setProperty('visibility', 'hidden', 'important');
    f.style.setProperty('height', '0px', 'important');
    f.style.setProperty('width', '0px', 'important');
    f.style.setProperty('opacity', '0', 'important');
    f.style.setProperty('pointer-events', 'none', 'important');
  });

  const skiptranslates = document.querySelectorAll('body > .skiptranslate');
  skiptranslates.forEach(el => {
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('height', '0px', 'important');
  });
}

// Enforce exact Tamil spelling for TVK Hero Heading ("தமிழக வெற்றி கழகம்") without auto-translation error
function fixTamilHeroTitle(isTamil) {
  if (!isTamil) return;
  
  const topElem = document.querySelector('.hero-title-top');
  const vettriElem = document.querySelector('.hero-vettri');
  const kazhagamElem = document.querySelector('.hero-kazhagam');

  if (topElem) {
    topElem.textContent = 'தமிழக';
    topElem.classList.add('notranslate');
    topElem.setAttribute('translate', 'no');
  }
  if (vettriElem) {
    vettriElem.textContent = 'வெற்றி';
    vettriElem.classList.add('notranslate');
    vettriElem.setAttribute('translate', 'no');
  }
  if (kazhagamElem) {
    kazhagamElem.textContent = 'கழகம்';
    kazhagamElem.classList.add('notranslate');
    kazhagamElem.setAttribute('translate', 'no');
  }

  // Observe DOM in case Google Translate attempts to overwrite
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const observer = new MutationObserver(() => {
      if (topElem && topElem.textContent !== 'தமிழக') {
        topElem.textContent = 'தமிழக';
      }
      if (vettriElem && vettriElem.textContent !== 'வெற்றி') {
        vettriElem.textContent = 'வெற்றி';
      }
      if (kazhagamElem && kazhagamElem.textContent !== 'கழகம்') {
        kazhagamElem.textContent = 'கழகம்';
      }
    });
    observer.observe(heroTitle, { childList: true, subtree: true, characterData: true });
  }
}

// Provide natural Tamil translations for badges and roles to avoid clipping and unnatural Google Translate phrasing
function enhanceTamilDOM(isTamil) {
  if (!isTamil) return;

  const badgeMap = [
    { selector: '.head-role-badge.president-badge', text: 'முதல்மைச்சர்' },
    { selector: '.president-star-tag', text: '★ தலைவர்' },
    { selector: '.exec-badge-pill.gold-badge', text: 'மாவட்டச் செயலாளர்' },
    { selector: '.exec-badge-pill.red-badge', text: 'பகுதிச் செயலாளர்' }
  ];

  badgeMap.forEach(item => {
    const elements = document.querySelectorAll(item.selector);
    elements.forEach(el => {
      el.textContent = item.text;
      el.classList.add('notranslate');
      el.setAttribute('translate', 'no');
    });
  });
}

export function initTranslator() {
  const currentLang = getCurrentLang();
  const isTamil = currentLang === 'ta';

  // Fix Hero Title & Enhance Tamil DOM badges
  fixTamilHeroTitle(isTamil);
  enhanceTamilDOM(isTamil);

  // Suppress top banner frame immediately and on interval
  suppressGoogleBanner();
  setInterval(suppressGoogleBanner, 200);

  // 1. Create hidden Google Translate element & load official script
  if (!document.getElementById('google_translate_element')) {
    const gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.display = 'none';
    document.body.appendChild(gtDiv);

    window.googleTranslateElementInit = function() {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'ta,en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      }
    };

    const gtScript = document.createElement('script');
    gtScript.id = 'google-translate-script';
    gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    gtScript.async = true;
    document.head.appendChild(gtScript);
  }

  // 2. Render Desktop Header Tamil / English Toggle Switch in .main-nav
  const mainNav = document.querySelector('.main-nav');
  if (mainNav && !document.getElementById('header-lang-switcher')) {
    const navSwitch = document.createElement('div');
    navSwitch.id = 'header-lang-switcher';
    navSwitch.className = 'lang-toggle-bar';
    navSwitch.innerHTML = `
      <button onclick="setPageLanguage('ta')" class="lang-pill-btn ${isTamil ? 'active' : ''}" title="தமிழ் மொழியில் படிக்க">
        <span class="flag-icon">🇮🇳</span> தமிழ்
      </button>
      <button onclick="setPageLanguage('en')" class="lang-pill-btn ${!isTamil ? 'active' : ''}" title="Switch to English">
        <span class="flag-icon">🇬🇧</span> English
      </button>
    `;
    mainNav.appendChild(navSwitch);
  }

  // 3. Render Mobile Navigation Language Switcher
  const mobNav = document.querySelector('.mobile-nav');
  if (mobNav && !document.getElementById('mob-lang-switcher')) {
    const mobLink = document.createElement('div');
    mobLink.id = 'mob-lang-switcher';
    mobLink.className = 'mob-lang-container';
    mobLink.innerHTML = `
      <div class="mob-lang-label">🌐 பக்கம் மொழி / Page Language:</div>
      <div class="mob-lang-btns">
        <button onclick="setPageLanguage('ta')" class="mob-lang-btn ${isTamil ? 'active' : ''}">
          🇮🇳 தமிழ் (Tamil)
        </button>
        <button onclick="setPageLanguage('en')" class="mob-lang-btn ${!isTamil ? 'active' : ''}">
          🇬🇧 English
        </button>
      </div>
    `;
    mobNav.appendChild(mobLink);
  }

  // 4. Render Accessible Floating Translator Pill (Bottom-Left)
  if (!document.getElementById('floating-translator-pill')) {
    const floatPill = document.createElement('div');
    floatPill.id = 'floating-translator-pill';
    floatPill.className = `floating-translator-pill ${isTamil ? 'active-ta' : ''}`;
    floatPill.innerHTML = `
      <button onclick="${isTamil ? "setPageLanguage('en')" : "setPageLanguage('ta')"}" class="float-trans-btn" title="Translate full page">
        <span class="float-trans-icon">🌐</span>
        <span class="float-trans-text">${isTamil ? 'English-க்கு மாறுக' : 'தமிழில் படிக்க (Translate to Tamil)'}</span>
      </button>
    `;
    document.body.appendChild(floatPill);
  }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTranslator);
} else {
  initTranslator();
}
