document.getElementById('year').textContent = new Date().getFullYear();

// Keep the website clean and product-focused: remove decorative numbering
// while preserving meaningful business metrics such as pricing and benchmarks.
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
