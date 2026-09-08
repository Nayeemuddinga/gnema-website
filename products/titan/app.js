document.getElementById('year').textContent = new Date().getFullYear();

// Use the supplied G-NeMa brand identity in the TITAN header/footer.
const gnemaLogo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 102" role="img" aria-label="G-NeMa — Galactic Nexus of Machines"><circle cx="51" cy="51" r="49" fill="#292727"/><circle cx="51" cy="51" r="45" fill="none" stroke="#b8ff19" stroke-width="1.5"/><text x="51" y="77" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="82" font-weight="900" fill="#b8ff19">G</text><text x="102" y="62" font-family="Arial,sans-serif" font-size="54" font-weight="800" fill="#292727">-NeMa</text><text x="103" y="87" font-family="Arial,sans-serif" font-size="11" letter-spacing="3.4" fill="#55585a">GALACTIC NEXUS OF MACHINES</text></svg>';
document.querySelectorAll('.brand').forEach(function(brand) {
  brand.innerHTML = gnemaLogo;
  brand.style.width = '190px';
  brand.style.height = '54px';
  brand.style.display = 'block';
});
document.querySelectorAll('.brand svg').forEach(function(svg) {
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.display = 'block';
});

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

const form = document.getElementById('titanForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = document.getElementById('formMessage');
    message.textContent = 'Thank you. Your TITAN assessment request has been captured. We will respond with the next step.';
    form.reset();
  });
}
