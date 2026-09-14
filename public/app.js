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

// Lightweight animated G-NeMa globe for the homepage hero.
var orbit = document.querySelector('.orbit');
if (orbit) {
  orbit.classList.add('gnema-globe');
  orbit.setAttribute('role', 'img');
  orbit.setAttribute('aria-label', 'G-NeMa intelligence globe connecting AI, agents, data, automation, space, robotics and cybersecurity');
  var surface = document.createElement('div');
  surface.className = 'globe-surface';
  surface.innerHTML = '<span class="globe-line globe-line-a"></span><span class="globe-line globe-line-b"></span><span class="globe-line globe-line-c"></span><span class="globe-node globe-node-a"></span><span class="globe-node globe-node-b"></span><span class="globe-node globe-node-c"></span><span class="globe-node globe-node-d"></span>';
  orbit.prepend(surface);
  var globeStyle = document.createElement('style');
  globeStyle.textContent = '.gnema-globe{background:radial-gradient(circle at 34% 26%,#f5ffd0 0%,#dfff6d 17%,#c8ff20 40%,#91bd18 72%,#526c10 100%)!important}.globe-surface{position:absolute;inset:0;border-radius:50%;overflow:hidden;transform:rotate(-8deg)}.globe-surface:before{content:"";position:absolute;inset:-8%;border-radius:50%;background:repeating-linear-gradient(90deg,transparent 0 38px,rgba(12,24,8,.18) 39px 40px,transparent 41px 78px);animation:gnema-globe-drift 12s linear infinite}.globe-surface:after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 68% 30%,rgba(255,255,255,.35),transparent 23%),linear-gradient(90deg,rgba(0,0,0,.14),transparent 42%,rgba(0,0,0,.18))}.globe-line{position:absolute;border:1px solid rgba(10,25,8,.22);border-radius:50%;pointer-events:none}.globe-line-a{left:-8%;top:12%;width:116%;height:32%}.globe-line-b{left:-8%;top:34%;width:116%;height:42%}.globe-line-c{left:-8%;bottom:12%;width:116%;height:32%}.globe-node{position:absolute;width:9px;height:9px;border-radius:50%;background:#efffb2;box-shadow:0 0 18px #efffb2;animation:gnema-node-pulse 2.4s ease-in-out infinite;z-index:3}.globe-node-a{left:29%;top:34%}.globe-node-b{left:62%;top:25%;animation-delay:.5s}.globe-node-c{left:57%;top:64%;animation-delay:1s}.globe-node-d{left:23%;top:65%;animation-delay:1.5s}.gnema-globe .core,.gnema-globe .tag,.gnema-globe .orbit-dot{z-index:6}@keyframes gnema-globe-drift{from{background-position:0 0}to{background-position:156px 0}}@keyframes gnema-node-pulse{0%,100%{transform:scale(.75);opacity:.72}50%{transform:scale(1.35);opacity:1}}@media(prefers-reduced-motion:reduce){.globe-surface:before,.globe-node{animation:none!important}}';
  document.head.appendChild(globeStyle);
}

var meta = document.querySelector('.hero-meta');
if (meta && !document.querySelector('.hero-signal')) {
  var signal = document.createElement('div');
  signal.className = 'hero-signal';
  signal.innerHTML = '<span class="signal-pulse"></span><b>G-NeMa Intelligence Network</b><span class="signal-text">Enterprise AI · Autonomous Agents · Data Intelligence · Space · Robotics · Cybersecurity</span>';
  meta.insertAdjacentElement('afterend', signal);
  var signalStyle = document.createElement('style');
  signalStyle.textContent = '.hero-signal{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:20px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#566066}.hero-signal b{color:#151a1c}.signal-pulse{width:7px;height:7px;border-radius:50%;background:#c8ff20;box-shadow:0 0 12px #c8ff20;animation:gnema-signal-pulse 1.8s ease-in-out infinite}.signal-text{color:#778087}@keyframes gnema-signal-pulse{50%{transform:scale(1.5);opacity:.55}}@media(prefers-reduced-motion:reduce){.signal-pulse{animation:none}}';
  document.head.appendChild(signalStyle);
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("formMessage").textContent =
      "Thank you. Your enquiry has been captured and is ready for G-NeMa follow-up.";
  });
}
