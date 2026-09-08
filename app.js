document.getElementById("year").textContent = new Date().getFullYear();

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("formMessage").textContent =
      "Thank you. Your enquiry form is ready for integration with Formspree, Cloudflare Workers, or your email service.";
  });
}
