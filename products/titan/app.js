document.getElementById('year').textContent = new Date().getFullYear();

// Official G-NeMa artwork: DG1 for header and DG3 for footer.
const headerLogo = '<img src="/assets/logos/DG1.png" alt="G-NeMa — Galactic Nexus of Machines">';
const footerLogo = '<img src="/assets/logos/DG3.png" alt="G-NeMa — Galactic Nexus of Machines">';
document.querySelectorAll('header .brand').forEach(function(brand) {
  brand.innerHTML = headerLogo;
  brand.style.width = '220px';
  brand.style.height = '62px';
  brand.style.display = 'block';
});
document.querySelectorAll('footer .brand').forEach(function(brand) {
  brand.innerHTML = footerLogo;
  brand.style.width = '220px';
  brand.style.height = '62px';
  brand.style.display = 'block';
});
document.querySelectorAll('.brand img').forEach(function(img) {
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.style.objectPosition = 'left center';
  img.style.display = 'block';
});

// Official G-NeMa Dot1 mark for browser tabs and installed shortcuts.
if (!document.querySelector('link[rel="icon"]')) {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = '/assets/logos/Dot1.png';
  document.head.appendChild(favicon);
}
if (!document.querySelector('link[rel="apple-touch-icon"]')) {
  const touchIcon = document.createElement('link');
  touchIcon.rel = 'apple-touch-icon';
  touchIcon.href = '/assets/logos/Dot1.png';
  document.head.appendChild(touchIcon);
}

document.querySelectorAll('.section-label').forEach(function(label) {
  label.textContent = label.textContent.replace(/^\s*\d+\s*\/\s*/, '');
});

const eyebrow = document.querySelector('.eyebrow');
if (eyebrow) {
  eyebrow.innerHTML = eyebrow.innerHTML.replace(/PRODUCT\s+\d+\s*[·•]\s*/i, 'PRODUCT · ');
}

document.querySelectorAll('.flow article > span, .cap-grid article > span, .security-list > div > b').forEach(function(el) {
  el.remove();
});

document.querySelectorAll('.flow article b').forEach(function(el) {
  el.style.marginTop = '20px';
});

document.querySelectorAll('.cap-grid h3').forEach(function(el) {
  el.style.marginTop = '20px';
});

// International pricing is displayed in USD across the public TITAN page.
const usdPrices = ['$599', '$2,499', '$1,499'];
document.querySelectorAll('.price-card .price').forEach(function(price, index) {
  const amount = usdPrices[index];
  if (!amount) return;
  const small = price.querySelector('small');
  price.textContent = amount + ' ';
  if (small) {
    price.appendChild(small);
  }
});
document.querySelectorAll('.price-card .usd').forEach(function(el) {
  el.remove();
});

const form = document.getElementById('titanForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = document.getElementById('formMessage');
    message.textContent = 'Thank you. Your TITAN assessment request has been captured. We will respond with the next step.';
    form.reset();
  });
}
