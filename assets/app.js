(() => {
  'use strict';

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav');
  const navId = nav?.id || 'primary-navigation';
  if (nav && !nav.id) nav.id = navId;
  if (nav) nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Primary navigation');

  const setMenuState = (open) => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
    if (window.matchMedia('(max-width: 900px)').matches) nav.style.display = open ? 'flex' : 'none';
    else nav.style.display = '';
  };

  menu?.addEventListener('click', () => setMenuState(menu.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setMenuState(false); menu.focus(); } });
  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) setMenuState(false);
  });
  window.addEventListener('resize', () => { if (!window.matchMedia('(max-width: 900px)').matches) setMenuState(false); });

  document.querySelectorAll('[data-contact]').forEach((a) => a.addEventListener('click', () => { location.href = '/contact.html'; }));

  window.gnemaAnalytics = window.gnemaAnalytics || {
    track(name, data = {}) {
      const event = { event: name, ...data, page: location.pathname, ts: new Date().toISOString() };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(event);
      window.dispatchEvent(new CustomEvent('gnema:conversion', { detail: event }));
    }
  };

  document.querySelectorAll('[data-track]').forEach((el) => el.addEventListener('click', () => {
    window.gnemaAnalytics.track(el.dataset.track, { href: el.getAttribute('href') || '' });
  }));

  document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', () => {
    const path = location.pathname;
    const type = path.includes('/assessment/') ? 'titan_assessment_submit' : path.includes('contact') ? 'contact_submit' : 'form_submit';
    window.gnemaAnalytics.track(type, { form_action: form.getAttribute('action') || '' });
  }));

  // Progressive enhancement only: critical navigation and CTAs live in HTML.
  // Legacy homepage builds that lack Architecture links are upgraded here.
  if (location.pathname === '/' || location.pathname === '/index.html') {
    if (nav && !nav.querySelector('a[href="/architecture/"]')) {
      const researchLink = Array.from(nav.querySelectorAll('a')).find((a) => a.getAttribute('href') === 'research/index.html');
      const architectureLink = document.createElement('a');
      architectureLink.href = '/architecture/';
      architectureLink.textContent = 'Architecture';
      architectureLink.dataset.track = 'header_architecture';
      if (researchLink) researchLink.insertAdjacentElement('afterend', architectureLink);
      else nav.insertBefore(architectureLink, nav.querySelector('.btn') || null);
    }
    const actions = document.querySelector('.hero .actions');
    if (actions && !actions.querySelector('a[href="/architecture/"]')) {
      const architectureCta = document.createElement('a');
      architectureCta.className = 'btn btn-dark';
      architectureCta.href = '/architecture/';
      architectureCta.textContent = 'Explore the Intelligence Architecture →';
      architectureCta.dataset.track = 'hero_architecture';
      actions.appendChild(architectureCta);
    }
  }
})();
