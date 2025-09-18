'use strict';

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

(function () {
  const KEY = 'lokan-theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem(KEY);
  const startTheme = saved || (prefersDark ? 'dark' : 'light');
  const root = document.documentElement;

  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);
    const small = document.getElementById('logoSmall');
    const big = document.getElementById('logoBig');
    if (small) small.src = mode === 'light' ? '1to1transparentlight.png' : '1to1transparentdark.png';
    if (big) big.src = mode === 'light' ? 'logotransparentlight.png' : 'logotransparentdark.png';
    const sun = document.getElementById('iconSun');
    const moon = document.getElementById('iconMoon');
    if (sun && moon) {
      if (mode === 'light') {
        sun.classList.remove('hidden');
        moon.classList.add('hidden');
      } else {
        moon.classList.remove('hidden');
        sun.classList.add('hidden');
      }
    }
  }

  applyTheme(startTheme);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      localStorage.setItem(KEY, next);
      applyTheme(next);
    });
  }
})();

const btn = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');
if (btn && menu) {
  btn.addEventListener('click', () => {
    const isHidden = menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!isHidden));
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => menu.classList.add('hidden'))
  );
}

const yEl = document.getElementById('y');
if (yEl) yEl.textContent = new Date().getFullYear();

const io =
  'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 })
    : null;

if (io) {
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else {
  document
    .querySelectorAll('.reveal')
    .forEach((el) => el.classList.add('visible'));
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactForm.reset();
    const message = document.getElementById('formMsg');
    if (message) {
      message.classList.remove('hidden');
    }
  });
}
