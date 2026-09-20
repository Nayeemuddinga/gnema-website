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
      const nextOpen = Boolean(open && mobile);
      menu.setAttribute('aria-expanded', String(nextOpen));
      menu.setAttribute('aria-label', nextOpen ? 'Close navigation' : 'Open navigation');
      menu.setAttribute('aria-controls', navId);
      nav.classList.toggle('is-open', nextOpen);
      nav.style.display = mobile ? (nextOpen ? 'flex' : 'none') : '';
      document.documentElement.classList.toggle('nav-open', nextOpen);
      document.body.classList.toggle('nav-open', nextOpen);
      if (nextOpen && mobile) requestAnimationFrame(() => $('#primary-navigation a')?.focus());
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

  // Intelligent navigation layer: fast site search, active route, reveal, and low-cost performance telemetry.
  const main = $('main');
  if (main) {
    main.id = main.id || 'main-content';
    if (!document.querySelector('.skip-link')) {
      const skip = document.createElement('a');
      skip.className = 'skip-link'; skip.href = '#main-content'; skip.textContent = 'Skip to main content';
      document.body.prepend(skip);
    }
  }

  if (nav) {
    const current = location.pathname.replace(/\\/$/, '') || '/';
    $('a[href]', nav).forEach((link) => {
      const raw = link.getAttribute('href') || '';
      if (!raw || raw.startsWith('#') || raw.startsWith('http')) return;
      const target = new URL(raw, location.href).pathname.replace(/\\/$/, '') || '/';
      if (target === current) link.setAttribute('aria-current', 'page');
    });
  }

  const siteIndex = [
    ['G-NeMa Home','Enterprise AI, autonomous agents and intelligent systems','/'],
    ['Products','TITAN, Multi-Agent Organization, Causal World Simulation and product portfolio','/products/'],
    ['TITAN','Autonomous Database Intelligence and Protection','/products/titan/'],
    ['Multi-Agent Organization','Coordinated AI agents for enterprise operations','/products/multi-agent-organization.html'],
    ['Causal World Simulation','Causal reasoning, simulation and scenario intelligence','/products/causal-world-simulation.html'],
    ['BankAI Nexus','Secure and scalable banking architecture','/products/bankai-nexus.html'],
    ['Enterprise AI Operating Layer','Governed multi-agent enterprise infrastructure','/products/enterprise-ai-operating-layer.html'],
    ['Knowledge Distillation & SFT','Smaller, efficient and enterprise-ready AI models','/products/knowledge-distillation.html'],
    ['Solutions','Enterprise AI, automation, data and intelligent operations','/solutions/'],
    ['Industries','Industry-specific intelligent systems','/industries/'],
    ['Research','G-NeMa research and architecture thinking','/research/'],
    ['Beyond AI','Autonomous intelligence, quantum, BCI, synthetic biology and frontier research','/beyond-ai.html'],
    ['Autonomous Intelligence','Goal-driven agents, planning, execution and adaptation','/beyond/autonomous-intelligence.html'],
    ['Agency Economy','Multi-agent coordination and machine-mediated workflows','/beyond/agency-economy.html'],
    ['Quantum Computing','Quantum-classical computation and error correction','/beyond/quantum-computing.html'],
    ['Neuromorphic Computing','Event-driven and brain-inspired computing','/beyond/neuromorphic-computing.html'],
    ['Brain-Computer Interfaces','Neural interfaces, decoding and human-machine interaction','/beyond/brain-computer-interfaces.html'],
    ['Cognitive Augmentation','Human-AI complementarity and decision support','/beyond/cognitive-augmentation.html'],
    ['Synthetic Biology','AI-assisted biological design and autonomous experimentation','/beyond/synthetic-biology.html'],
    ['DNA Data Storage','Molecular information storage and retrieval','/beyond/dna-data-storage.html'],
    ['Bioconvergence','AI, biology, materials, nanotechnology and robotics','/beyond/bioconvergence.html'],
    ['Engagement','Assessment, pilot, managed and enterprise engagement models','/pricing.html'],
    ['About G-NeMa','Company, mission and operating model','/about.html'],
    ['Contact G-NeMa','Start a conversation with G-NeMa','/contact.html']
  ];

  const searchOpen = () => {
    if ($('.search-layer')) return;
    const layer = document.createElement('div');
    layer.className = 'search-layer';
    layer.innerHTML = '<div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search G-NeMa"><div class="search-head"><span aria-hidden="true">⌕</span><input class="search-input" type="search" autocomplete="off" placeholder="Search G-NeMa..." aria-label="Search G-NeMa"><button class="search-close" type="button" aria-label="Close search">×</button></div><div class="search-results"></div></div>';
    document.body.appendChild(layer);
    const input = $('.search-input', layer), results = $('.search-results', layer);
    const render = (q='') => {
      const terms = q.toLowerCase().trim().split(/\\s+/).filter(Boolean);
      const ranked = siteIndex.map((item, i) => {
        const hay = item.join(' ').toLowerCase();
        let score = terms.reduce((s,t) => s + (hay.includes(t) ? (item[0].toLowerCase().startsWith(t) ? 5 : 2) : 0), 0);
        return {item,i,score};
      }).filter(x => !terms.length || x.score > 0).sort((a,b)=>b.score-a.score || a.i-b.i).slice(0,10);
      results.innerHTML = ranked.length ? ranked.map(x => '<a class="search-result" href="'+x.item[2]+'"><strong>'+x.item[0]+'</strong><span>'+x.item[1]+'</span></a>').join('') : '<div class="search-empty">No matching G-NeMa destination found.</div>';
    };
    const close = () => { layer.remove(); };
    render();
    input.focus();
    input.addEventListener('input', () => render(input.value));
    layer.addEventListener('click', e => { if(e.target === layer || e.target.closest('.search-close')) close(); });
    input.addEventListener('keydown', e => { if(e.key === 'Escape') close(); if(e.key === 'Enter'){ const first=$('.search-result',layer); if(first) location.href=first.href; }});
  };

  if (nav && !$('.site-search-trigger')) {
    const trigger = document.createElement('button');
    trigger.className='site-search-trigger'; trigger.type='button'; trigger.setAttribute('aria-label','Search G-NeMa');
    trigger.innerHTML='Search <kbd>⌘K</kbd>';
    trigger.addEventListener('click', searchOpen);
    nav.insertBefore(trigger, nav.querySelector('.btn') || null);
  }
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); searchOpen(); }
  });

  const revealTargets = $$('.section,.page-hero,.dossier,.papers,.cta,.global,.poster-feature,.content-block,.card');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach((el,i)=>{ if(i>1) el.classList.add('reveal'); });
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    }), {rootMargin:'0px 0px -8% 0px',threshold:.08});
    $('.reveal').forEach(el=>io.observe(el));
  }

  if (!$('.to-top')) {
    const top = document.createElement('button');
    top.className='to-top'; top.type='button'; top.setAttribute('aria-label','Back to top'); top.textContent='↑';
    top.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    document.body.appendChild(top);
    const syncTop=()=>top.classList.toggle('is-visible',window.scrollY>700);
    window.addEventListener('scroll',syncTop,{passive:true}); syncTop();
  }

  // Measure Core Web Vitals when supported; keep telemetry local to the existing dataLayer.
  const vitals = {};
  const reportVitals = () => {
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) vitals.ttfb = Math.round(navEntry.responseStart);
    if (window.gnemaAnalytics && Object.keys(vitals).length) window.gnemaAnalytics.track('performance_snapshot', vitals);
  };
  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver(list => { const e=list.getEntries().at(-1); if(e) vitals.lcp=Math.round(e.startTime); }).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(list => { vitals.cls=Number(list.getEntries().reduce((s,e)=>s+(e.hadRecentInput?0:e.value),0).toFixed(4)); }).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver(list => { const e=list.getEntries().at(-1); if(e) vitals.inp=Math.round(e.duration); }).observe({type:'event',buffered:true,durationThreshold:40});
    } catch (_) {}
  }
  window.addEventListener('load', () => setTimeout(reportVitals, 0), {once:true});

})();
