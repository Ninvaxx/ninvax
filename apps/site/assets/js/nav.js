window.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;
  fetch('nav.html')
    .then(res => res.text())
    .then(html => {
      placeholder.innerHTML = html;
      const script = document.createElement('script');
      script.src = 'assets/js/auth.js';
      document.body.appendChild(script);

      const themeScript = document.createElement('script');
      themeScript.src = 'assets/js/theme.js';
      document.body.appendChild(themeScript);

      const navbarScript = document.createElement('script');
      navbarScript.src = 'assets/js/navbar.js';
      document.body.appendChild(navbarScript);
    });
});
