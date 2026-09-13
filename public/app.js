document.getElementById("year").textContent = new Date().getFullYear();

// Use the official supplied G-NeMa artwork without modifying the image.
// DG1 is the header logo; DG3 is the footer logo.
document.querySelectorAll('header .brand').forEach(function(brand) {
  brand.innerHTML = '<img src="/assets/logos/DG1.png" alt="G-NeMa — Galactic Nexus of Machines">';
  brand.style.width = '220px';
  brand.style.height = '62px';
  brand.style.display = 'block';
});
document.querySelectorAll('footer .brand').forEach(function(brand) {
  brand.innerHTML = '<img src="/assets/logos/DG3.png" alt="G-NeMa — Galactic Nexus of Machines">';
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
