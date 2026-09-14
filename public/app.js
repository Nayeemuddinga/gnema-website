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

  // Put the four intelligence domains on a single orbital track so they
  // visibly travel around the globe rather than sitting in fixed corners.
  var ring = document.createElement('div');
  ring.className = 'gnema-label-orbit';
  var labels = Array.prototype.slice.call(orbit.querySelectorAll('.tag'));
  var dots = Array.prototype.slice.call(orbit.querySelectorAll('.orbit-dot'));
  labels.forEach(function(label) { ring.appendChild(label); });
  dots.forEach(function(dot) { ring.appendChild(dot); });
  orbit.appendChild(ring);

  var globeStyle = document.createElement('style');
  globeStyle.textContent = '.gnema-globe{background:radial-gradient(circle at 34% 26%,#f5ffd0 0%,#dfff6d 17%,#c8ff20 40%,#91bd18 72%,#526c10 100%)!important}.globe-surface{position:absolute;inset:0;border-radius:50%;overflow:hidden;transform:rotate(-8deg)}.globe-surface:before{content:"";position:absolute;inset:-8%;border-radius:50%;background:repeating-linear-gradient(90deg,transparent 0 38px,rgba(12,24,8,.18) 39px 40px,transparent 41px 78px);animation:gnema-globe-drift 12s linear infinite}.globe-surface:after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 68% 30%,rgba(255,255,255,.35),transparent 23%),linear-gradient(90deg,rgba(0,0,0,.14),transparent 42%,rgba(0,0,0,.18))}.globe-line{position:absolute;border:1px solid rgba(10,25,8,.22);border-radius:50%;pointer-events:none}.globe-line-a{left:-8%;top:12%;width:116%;height:32%}.globe-line-b{left:-8%;top:34%;width:116%;height:42%}.globe-line-c{left:-8%;bottom:12%;width:116%;height:32%}.globe-node{position:absolute;width:9px;height:9px;border-radius:50%;background:#efffb2;box-shadow:0 0 18px #efffb2;animation:gnema-node-pulse 2.4s ease-in-out infinite;z-index:3}.globe-node-a{left:29%;top:34%}.globe-node-b{left:62%;top:25%;animation-delay:.5s}.globe-node-c{left:57%;top:64%;animation-delay:1s}.globe-node-d{left:23%;top:65%;animation-delay:1.5s}.gnema-label-orbit{position:absolute;inset:-34px;border-radius:50%;animation:gnema-label-orbit 18s linear infinite;z-index:8;pointer-events:none}.gnema-label-orbit .tag{transform-origin:center center;animation:gnema-label-counter 18s linear infinite reverse;white-space:nowrap}.gnema-label-orbit .t1{top:0;left:50%;transform:translateX(-50%)}.gnema-label-orbit .t2{top:50%;right:0;transform:translateY(-50%)}.gnema-label-orbit .t3{bottom:0;left:50%;transform:translateX(-50%)}.gnema-label-orbit .t4{top:50%;left:0;transform:translateY(-50%)}.gnema-label-orbit .d1{top:10%;left:18%}.gnema-label-orbit .d2{right:10%;top:18%}.gnema-label-orbit .d3{left:10%;bottom:18%}.gnema-label-orbit .d4{right:18%;bottom:10%}.gnema-globe .core{z-index:10}.gnema-globe .orbit-dot{z-index:9}@keyframes gnema-globe-drift{from{background-position:0 0}to{background-position:156px 0}}@keyframes gnema-node-pulse{0%,100%{transform:scale(.75);opacity:.72}50%{transform:scale(1.35);opacity:1}}@keyframes gnema-label-orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes gnema-label-counter{from{rotate:0deg}to{rotate:-360deg}}@media(max-width:620px){.gnema-label-orbit{inset:-22px}.gnema-label-orbit .tag{padding:8px 10px}.gnema-label-orbit .tag small{display:none}}@media(prefers-reduced-motion:reduce){.globe-surface:before,.globe-node,.gnema-label-orbit,.gnema-label-orbit .tag{animation:none!important}}';
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

// Flagship commercial positioning: elevate AI Value Engineering on the homepage
// without changing the existing portfolio markup or navigation structure.
var homeHero = document.querySelector('.hero');
if (homeHero && !document.querySelector('.aive-flagship')) {
  var flagship = document.createElement('section');
  flagship.className = 'aive-flagship';
  flagship.innerHTML = '<div class="container"><div class="aive-grid"><div><div class="aive-eyebrow">G-NeMa AI · Flagship Enterprise Platform</div><h2>AI Value Engineering</h2><p class="aive-lead">Design better AI. Prove the economics. Optimize continuously.</p><p class="aive-copy">Turn AI potential into measurable business value with a vendor-neutral platform that connects AI estate discovery, architecture economics, evaluation, optimization and production outcomes.</p><div class="aive-actions"><a class="btn btn-primary" href="products/ai-value-engineering.html" data-track="home_aive_primary">Explore AI Value Engineering →</a><a class="btn btn-ghost" href="contact.html" data-track="home_aive_contact">Discuss an enterprise programme</a></div></div><div class="aive-panel"><div class="aive-panel-top"><span>AI VALUE COMMAND CENTER</span><b>LIVE INTELLIGENCE</b></div><div class="aive-metrics"><div><strong>$5.14M</strong><span>AI spend</span></div><div><strong>$782K</strong><span>verified value</span></div><div><strong>86/100</strong><span>value score</span></div><div><strong>$1.42M</strong><span>optimization</span></div></div><div class="aive-flow"><span>ESTATE</span><i>→</i><span>ARCHITECTURE</span><i>→</i><span>ECONOMICS</span><i>→</i><span>OUTCOMES</span></div><div class="aive-bottom"><span>Cost / Successful Outcome</span><b>Quality · Risk · Latency aware</b></div></div></div></div>';
  homeHero.insertAdjacentElement('afterend', flagship);

  var flagshipStyle = document.createElement('style');
  flagshipStyle.textContent = '.aive-flagship{position:relative;overflow:hidden;background:#101315;color:#f4f7f4;padding:88px 0;border-top:1px solid rgba(200,255,32,.18);border-bottom:1px solid rgba(255,255,255,.08)}.aive-flagship:before{content:"";position:absolute;width:520px;height:520px;border-radius:50%;right:-180px;top:-230px;background:radial-gradient(circle,rgba(200,255,32,.16),transparent 68%);pointer-events:none}.aive-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center}.aive-eyebrow{font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#c8ff20;font-weight:800;margin-bottom:18px}.aive-flagship h2{font-size:clamp(42px,5vw,72px);line-height:.96;letter-spacing:-3px;margin:0 0 18px}.aive-lead{font-size:24px;line-height:1.3;margin:0 0 18px;color:#f2f6f1;font-weight:700}.aive-copy{font-size:17px;line-height:1.75;color:#aeb8b5;max-width:680px;margin:0}.aive-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.aive-panel{position:relative;border:1px solid rgba(255,255,255,.12);background:linear-gradient(145deg,#171c1e,#0c0f10);border-radius:24px;padding:26px;box-shadow:0 24px 80px rgba(0,0,0,.34)}.aive-panel-top{display:flex;justify-content:space-between;gap:15px;align-items:center;font-size:10px;letter-spacing:1.8px;color:#7e8987}.aive-panel-top b{color:#c8ff20;font-size:9px}.aive-metrics{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:25px 0;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden}.aive-metrics div{padding:21px;background:#121719}.aive-metrics strong{display:block;font-size:25px;letter-spacing:-1px;color:#f5f8f5}.aive-metrics span{display:block;margin-top:5px;color:#788481;font-size:11px;text-transform:uppercase;letter-spacing:1px}.aive-flow{display:flex;align-items:center;justify-content:space-between;gap:7px;flex-wrap:wrap;padding:16px;border-radius:14px;background:#0a0d0e;border:1px solid rgba(255,255,255,.07);font-size:9px;letter-spacing:1.1px;font-weight:800}.aive-flow span{color:#d5ddd9}.aive-flow i{font-style:normal;color:#c8ff20}.aive-bottom{display:flex;justify-content:space-between;gap:15px;margin-top:16px;font-size:11px;color:#7f8a87}.aive-bottom b{color:#dce4df;font-weight:700}@media(max-width:850px){.aive-grid{grid-template-columns:1fr;gap:40px}.aive-flagship{padding:65px 0}.aive-flagship h2{letter-spacing:-2px}.aive-panel{max-width:720px}}@media(max-width:560px){.aive-metrics{grid-template-columns:1fr 1fr}.aive-bottom{flex-direction:column}.aive-flow{justify-content:flex-start}}@media(prefers-reduced-motion:reduce){.aive-flagship *{scroll-behavior:auto}}';
  document.head.appendChild(flagshipStyle);
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("formMessage").textContent =
      "Thank you. Your enquiry has been captured and is ready for G-NeMa follow-up.";
  });
}
