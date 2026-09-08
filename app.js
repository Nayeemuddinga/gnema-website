document.getElementById("year").textContent = new Date().getFullYear();

// Remove decorative sequence numbers from the UI while keeping
// meaningful business metrics, dates, prices and benchmark values.
document.querySelectorAll(".section-label").forEach(function(label) {
  label.textContent = label.textContent.replace(/^\s*\d+\s*\/\s*/, "");
});

document.querySelectorAll(".number, .cap-list > div > b, .industry-grid > div > span").forEach(function(el) {
  el.remove();
});

document.querySelectorAll(".card .icon").forEach(function(el) {
  el.style.marginTop = "20px";
});

document.querySelectorAll(".industry-grid h3").forEach(function(el) {
  el.style.marginTop = "20px";
});

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("formMessage").textContent =
      "Thank you. Your enquiry form is ready for integration with Formspree, Cloudflare Workers, or your email service.";
  });
}
