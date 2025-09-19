'use strict';

/* ---- JS flag ---- */
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

(function () {
  const d = document;
  const root = d.documentElement;
  const THEME_KEY = 'lokan-theme';

  /* ---- Theme ---- */
  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);

    // Icons: show sun in dark mode, moon in light mode
    const sun = d.getElementById('iconSun');
    const moon = d.getElementById('iconMoon');
    if (sun && moon) {
      if (mode === 'dark') { sun.classList.remove('hidden'); moon.classList.add('hidden'); }
      else { sun.classList.add('hidden'); moon.classList.remove('hidden'); }
    }

    // Swap logos via data-light-src / data-dark-src
    const swap = (id) => {
      const img = d.getElementById(id);
      if (!img) return;
      const light = img.getAttribute('data-light-src');
      const dark = img.getAttribute('data-dark-src');
      const next = mode === 'dark' ? dark : light;
      if (next) {
        const abs = new URL(next, location.href).href;
        if (img.src !== abs) img.src = abs;
      }
    };
    swap('heroLogoWordmark');
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  let saved;
  try { saved = localStorage.getItem(THEME_KEY); } catch (_) { saved = null; }
  const startTheme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(startTheme);

  const toggle = d.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
      applyTheme(next);
    });
  }

  // React to OS theme changes if user has not set a preference
  if (!saved && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener?.('change', (e) => applyTheme(e.matches ? 'dark' : 'light'));
  }

  /* ---- Mobile menu ---- */
  const btn = d.getElementById('menuBtn');
  const menu = d.getElementById('mobileMenu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isHidden = menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isHidden));
    });
    menu.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', () => {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---- Footer year ---- */
  const yEl = d.getElementById('y');
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* ---- Reveal on scroll ---- */
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    d.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    d.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  /* ---- Contact form ---- */
  d.querySelector('#contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const msg = d.getElementById('formMsg');
    const err = d.getElementById('formError');

    const payload = {
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      message: f.message.value.trim()
    };

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (r.ok) {
        if (msg) { msg.classList.remove('hidden'); err?.classList.add('hidden'); }
        else alert('Sent');
        f.reset();
      } else {
        const t = await r.text().catch(() => '');
        if (err) { err.textContent = t || 'Failed to send.'; err.classList.remove('hidden'); msg?.classList.add('hidden'); }
        else alert('Failed');
      }
    } catch {
      if (err) { err.textContent = 'Network error.'; err.classList.remove('hidden'); msg?.classList.add('hidden'); }
      else alert('Network error');
    }
  });
})();
