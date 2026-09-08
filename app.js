document.getElementById("year").textContent = new Date().getFullYear();

// Use the official supplied G-NeMa artwork without modifying the image.
const gnemaLogo = '<img src="/assets/logos/Banner.png" alt="G-NeMa — Galactic Nexus of Machines">';
document.querySelectorAll('.brand').forEach(function(brand) {
  brand.innerHTML = gnemaLogo;
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

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("formMessage").textContent =
      "Thank you. Your enquiry form is ready for integration with Formspree, Cloudflare Workers, or your email service.";
  });
}
