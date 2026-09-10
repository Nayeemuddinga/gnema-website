document.getElementById('year')?.appendChild(document.createTextNode(new Date().getFullYear()));
const menu=document.querySelector('.menu'), nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>{nav.style.display=nav.style.display==='flex'?'none':'flex';nav.style.position='absolute';nav.style.top='72px';nav.style.left='14px';nav.style.right='14px';nav.style.padding='18px';nav.style.background='#fff';nav.style.border='1px solid #dfe3df';nav.style.borderRadius='14px';nav.style.flexDirection='column';nav.style.zIndex='20'});
document.querySelectorAll('[data-contact]').forEach(a=>a.addEventListener('click',()=>{location.href='/contact.html'}));

// Provider-neutral conversion events. No analytics vendor or tracking ID is hard-coded.
window.gnemaAnalytics=window.gnemaAnalytics||{track(name,data={}){const event={event:name,...data,page:location.pathname,ts:new Date().toISOString()};window.dataLayer=window.dataLayer||[];window.dataLayer.push(event);window.dispatchEvent(new CustomEvent('gnema:conversion',{detail:event}));}};
document.querySelectorAll('[data-track]').forEach(el=>el.addEventListener('click',()=>window.gnemaAnalytics.track(el.dataset.track,{href:el.getAttribute('href')||''})));
document.querySelectorAll('form').forEach(form=>form.addEventListener('submit',()=>{const path=location.pathname;const type=path.includes('/assessment/')?'titan_assessment_submit':path.includes('contact')?'contact_submit':'form_submit';window.gnemaAnalytics.track(type,{form_action:form.getAttribute('action')||''});}));
