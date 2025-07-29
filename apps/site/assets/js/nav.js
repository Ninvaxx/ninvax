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
    });
});
