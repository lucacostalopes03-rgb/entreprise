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

      window.location.href = `contact@xxxxx.ch?subject=${subject}&body=${body}`;

      status.textContent = 'Votre client mail va s\'ouvrir pour envoyer la demande.';
      status.classList.add('ok');
    });
  }

});
