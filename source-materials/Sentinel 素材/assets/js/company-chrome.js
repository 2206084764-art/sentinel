
(() => {
  const header = document.getElementById('streamaxHeader');
  const mobile = matchMedia('(max-width:1200px)');
  const menu = header.querySelector('.nav_btn');
  const nav = header.querySelector('.nav_con');
  const language = header.querySelector('.change');
  const languageList = language.querySelector('.change_con');
  nav.id = 'streamax-navigation';
  languageList.id = 'streamax-languages';

  function makeToggle(node, label, controls) {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', label);
    node.setAttribute('aria-controls', controls);
    node.setAttribute('aria-expanded', 'false');
    node.addEventListener('keydown', (event) => {
      if (event.target === node && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        node.click();
      }
    });
  }

  function closeMenu() {
    header.classList.remove('is-open');
    menu.classList.remove('click');
    menu.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  makeToggle(menu, 'Toggle navigation', nav.id);
  makeToggle(language, 'Select language', languageList.id);
  menu.addEventListener('click', () => {
    const open = !header.classList.contains('is-open');
    header.classList.toggle('is-open', open);
    menu.classList.toggle('click', open);
    menu.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  language.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    const open = !language.classList.contains('is-open');
    language.classList.toggle('is-open', open);
    language.setAttribute('aria-expanded', String(open));
  });

  header.querySelectorAll('.TWnavBtn').forEach((toggle, index) => {
    const item = toggle.closest('li');
    const submenu = item.querySelector('.mo_nav');
    if (!submenu || !submenu.children.length) return;
    submenu.id = `streamax-submenu-${index}`;
    makeToggle(toggle, `Toggle ${item.querySelector('q').textContent} submenu`, submenu.id);
    toggle.addEventListener('click', () => {
      const open = !item.classList.contains('hover');
      item.classList.toggle('hover', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  });

  nav.addEventListener('click', (event) => {
    if (mobile.matches && event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!language.contains(event.target)) {
      language.classList.remove('is-open');
      language.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (header.classList.contains('is-open')) { closeMenu(); menu.focus(); }
    if (language.contains(document.activeElement)) language.focus();
    language.classList.remove('is-open');
    language.setAttribute('aria-expanded', 'false');
    header.querySelectorAll('.nav li.hover').forEach((item) => {
      item.classList.remove('hover');
      item.querySelector('.TWnavBtn')?.setAttribute('aria-expanded', 'false');
    });
  });
  function syncViewport() {
    document.body.classList.toggle('touch_body', mobile.matches);
    closeMenu();
  }
  mobile.addEventListener('change', syncViewport);
  syncViewport();
})();
