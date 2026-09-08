document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('titanForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = document.getElementById('formMessage');
    message.textContent = 'Thank you. Your TITAN assessment request has been captured. We will respond with the next step.';
    form.reset();
  });
}
