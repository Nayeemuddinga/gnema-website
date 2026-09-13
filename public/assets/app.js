(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Shared accessibility safeguards for the static site.
  const a11yStyle = document.createElement('style');
  a11yStyle.textContent = `:focus-visible{outline:3px solid #8fc31f;outline-offset:3px} @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}`;
  document.head.appendChild(a11yStyle);

  const menu = $('.menu');
  const nav = $('.nav');
  const navId = nav?.id || 'primary-navigation';
  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const isMobile = () => mobileQuery.matches;

  if (nav) {
    nav.id = navId;
    nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Primary navigation');
  }

  if (menu && nav) {
    menu.setAttribute('aria-controls', navId);
    menu.setAttribute('aria-expanded', menu.getAttribute('aria-expanded') || 'false');
    menu.setAttribute('type', 'button');

    const setMenuState = (open, returnFocus = false) => {
      const mobile = isMobile();
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
      nav.style.display = mobile ? (open ? 'flex' : 'none') : '';
      if (open && mobile) $('#primary-navigation a')?.focus();
      if (returnFocus) menu.focus();
    };

    setMenuState(menu.getAttribute('aria-expanded') === 'true');
    menu.addEventListener('click', () => setMenuState(menu.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenuState(false, true);
    });
    document.addEventListener('click', (event) => {
      if (isMobile() && menu.getAttribute('aria-expanded') === 'true' && !nav.contains(event.target) && !menu.contains(event.target)) setMenuState(false);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a') && isMobile()) setMenuState(false);
    });
    const syncMenu = () => setMenuState(false);
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncMenu); else mobileQuery.addListener(syncMenu);
  }

  // Remove placeholder social destinations instead of sending visitors to generic platforms.
  const placeholderSocialHosts = new Set(['https://www.youtube.com/','https://x.com/','https://www.instagram.com/','https://www.facebook.com/','https://www.gnema.in/']);
  $$('a[href]').forEach((link) => {
    if (placeholderSocialHosts.has(link.getAttribute('href'))) {
      const item = link.closest('.social-item');
      if (item) item.remove(); else link.remove();
    }
  });

  // Defer non-critical imagery and decode asynchronously.
  const images = $$('img');
  images.forEach((img, index) => {
    img.decoding = img.decoding || 'async';
    if (index > 0 && !img.loading) img.loading = 'lazy';
  });
  const firstContentImage = images.find((img) => !img.closest('header, footer'));
  if (firstContentImage) firstContentImage.loading = 'eager';

  document.querySelectorAll('[data-contact]').forEach((a) => a.addEventListener('click', () => { location.href = '/contact.html'; }));

  window.gnemaAnalytics = window.gnemaAnalytics || {
    track(name, data = {}) {
      const event = { event: name, ...data, page: location.pathname, ts: new Date().toISOString() };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(event);
      window.dispatchEvent(new CustomEvent('gnema:conversion', { detail: event }));
    }
  };

  $$('[data-track]').forEach((el) => el.addEventListener('click', () => window.gnemaAnalytics.track(el.dataset.track, { href: el.getAttribute('href') || '' })));
  $$('form').forEach((form) => form.addEventListener('submit', () => {
    const path = location.pathname;
    const type = path.includes('/assessment/') ? 'titan_assessment_submit' : path.includes('contact') ? 'contact_submit' : 'form_submit';
    window.gnemaAnalytics.track(type, { form_action: form.getAttribute('action') || '' });
  }));

  if (location.pathname === '/' || location.pathname === '/index.html') {
    if (nav && !nav.querySelector('a[href="/architecture/"]')) {
      const researchLink = $$('a', nav).find((a) => a.getAttribute('href') === 'research/index.html');
      const architectureLink = document.createElement('a');
      architectureLink.href = '/architecture/'; architectureLink.textContent = 'Architecture'; architectureLink.dataset.track = 'header_architecture';
      if (researchLink) researchLink.insertAdjacentElement('afterend', architectureLink); else nav.insertBefore(architectureLink, nav.querySelector('.btn') || null);
    }
    const actions = $('.hero .actions');
    if (actions && !actions.querySelector('a[href="/architecture/"]')) {
      const architectureCta = document.createElement('a'); architectureCta.className = 'btn btn-dark'; architectureCta.href = '/architecture/'; architectureCta.textContent = 'Explore the Intelligence Architecture →'; architectureCta.dataset.track = 'hero_architecture'; actions.appendChild(architectureCta);
    }
  }
})();
