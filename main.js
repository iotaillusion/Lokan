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
  const successMessage = document.getElementById('formMsg');
  const errorMessage = document.getElementById('formError');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const defaultButtonText = submitButton ? submitButton.textContent : '';

  const resetMessages = () => {
    if (successMessage) {
      successMessage.classList.add('hidden');
    }
    if (errorMessage) {
      errorMessage.classList.add('hidden');
      errorMessage.textContent = '';
    }
  };

  const setError = (message) => {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.remove('hidden');
    }
  };

  const setSuccess = (message) => {
    if (successMessage) {
      successMessage.textContent = message;
      successMessage.classList.remove('hidden');
    }
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetMessages();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    if (formData.get('company_website')) {
      contactForm.reset();
      return;
    }

    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      source: 'lokan-contact-form'
    };

    if (!payload.name || !payload.email || !payload.message) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(payload.email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
      submitButton.setAttribute('aria-busy', 'true');
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        data = null;
      }

      if (!response.ok) {
        const message = data && data.error ? data.error : 'We could not send your message. Please try again.';
        throw new Error(message);
      }

      contactForm.reset();
      const message = data && data.message ? data.message : 'Thanks for reaching out! We will be in touch shortly.';
      setSuccess(message);
    } catch (error) {
      console.error(error);
      setError(error && error.message ? error.message : 'We could not submit your request. Please try again in a moment.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
        submitButton.removeAttribute('aria-busy');
      }
    }
  });
}
