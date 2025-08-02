fetch('/components/nav.html')
  .then(res => res.text())
  .then(html => {
    const el = document.getElementById('nav');
    if (el) {
      el.innerHTML = html;
      const toggle = el.querySelector('.menu-toggle');
      const menu = el.querySelector('.menu');
      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          menu.classList.toggle('open');
        });
      }
    }
  });
