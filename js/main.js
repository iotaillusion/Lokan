document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isHidden = menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isHidden));
    });

    menu.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', () => menu.classList.add('hidden'))
    );
  }

  const yEl = document.getElementById('y');
  if (yEl) {
    yEl.textContent = new Date().getFullYear();
  }

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = document.getElementById('formMsg');
      if (status) {
        status.classList.remove('hidden');
      }
      form.reset();
    });
  }

  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('visible'));
  }
});
