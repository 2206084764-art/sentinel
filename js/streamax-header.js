document.addEventListener('DOMContentLoaded', () => {
 const menu=document.querySelector('.s5-mobile-menu');
 const nav=document.getElementById('s5-main-nav');
 const globe=document.querySelector('.s5-globe');
 const lang=document.querySelector('.s5-lang');
 menu?.addEventListener('click',()=>{const open=nav.classList.toggle('s5-open');menu.setAttribute('aria-expanded',String(open));});
 globe?.addEventListener('click',()=>{const open=lang.classList.toggle('is-open');globe.setAttribute('aria-expanded',String(open));});
 document.addEventListener('click',e=>{if(lang&&!lang.contains(e.target)){lang.classList.remove('is-open');globe?.setAttribute('aria-expanded','false');}});
});
