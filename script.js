// =========================================================
// B2J — interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu after clicking a link (mobile)
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Cookie consent ----
  const CONSENT_KEY = 'b2j_cookie_consent';

  function readConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics) {
    const value = { necessary: true, analytics: !!analytics, date: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); } catch (e) { /* ignore */ }
    applyConsent(value);
    return value;
  }

  // Placeholder hook: turn real tracking scripts on/off here once one is added.
  function applyConsent(consent) {
    document.dispatchEvent(new CustomEvent('b2j:consent-updated', { detail: consent }));
  }

  const banner = document.getElementById('cookieBanner');
  const mainView = document.getElementById('cookieMain');
  const detailView = document.getElementById('cookieDetail');
  const analyticsToggle = document.getElementById('cookieAnalytics');
  const openBtn = document.getElementById('openCookieSettings');

  function showBanner(openToDetail) {
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-visible'));
    if (openToDetail) {
      mainView.hidden = true;
      detailView.hidden = false;
      const existing = readConsent();
      analyticsToggle.checked = existing ? existing.analytics : false;
    } else {
      mainView.hidden = false;
      detailView.hidden = true;
    }
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(() => { banner.hidden = true; }, 250);
  }

  if (banner) {
    const saved = readConsent();
    if (saved) {
      applyConsent(saved);
    } else {
      setTimeout(() => showBanner(false), 600);
    }

    document.getElementById('cookieAccept').addEventListener('click', () => {
      writeConsent(true);
      hideBanner();
    });
    document.getElementById('cookieReject').addEventListener('click', () => {
      writeConsent(false);
      hideBanner();
    });
    document.getElementById('cookieRejectAll2').addEventListener('click', () => {
      writeConsent(false);
      hideBanner();
    });
    document.getElementById('cookieCustomize').addEventListener('click', () => {
      showBanner(true);
    });
    document.getElementById('cookieSavePrefs').addEventListener('click', () => {
      writeConsent(analyticsToggle.checked);
      hideBanner();
    });
  }

  if (openBtn) {
    openBtn.addEventListener('click', () => showBanner(true));
  }

  // ---- Contact form ----
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = 'Merci de remplir les champs obligatoires.';
        status.classList.remove('ok');
        return;
      }

      // No backend wired up yet — build a mailto so the request
      // still reaches B2J directly from the visitor's own mail client.
      const service = form.service.options[form.service.selectedIndex].text;
      const phone = form.phone.value.trim();

      const subject = encodeURIComponent(`Demande de devis — ${service}`);
      const body = encodeURIComponent(
        `Nom : ${name}\nE-mail : ${email}\nTéléphone : ${phone || '—'}\nPrestation : ${service}\n\nMessage :\n${message}`
      );

      window.location.href = `mailto:contact@b2j-demenagement.ch?subject=${subject}&body=${body}`;

      status.textContent = 'Votre client mail va s\'ouvrir pour envoyer la demande.';
      status.classList.add('ok');
    });
  }

});
