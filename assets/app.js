
document.getElementById('year')?.appendChild(document.createTextNode(new Date().getFullYear()));
const menu=document.querySelector('.menu'), nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>{nav.style.display=nav.style.display==='flex'?'none':'flex';nav.style.position='absolute';nav.style.top='72px';nav.style.left='14px';nav.style.right='14px';nav.style.padding='18px';nav.style.background='#fff';nav.style.border='1px solid #dfe3df';nav.style.borderRadius='14px';nav.style.flexDirection='column';nav.style.zIndex='20'});
document.querySelectorAll('[data-contact]').forEach(a=>a.addEventListener('click',()=>{location.href='/contact.html'}));
