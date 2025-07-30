function initThemeToggle() {
  // inject theme stylesheet if not present
  if (!document.getElementById('themeStyles')) {
    const link = document.createElement('link');
    link.id = 'themeStyles';
    link.rel = 'stylesheet';
    link.href = 'assets/css/theme.css';
    document.head.appendChild(link);
  }
  const existing = document.getElementById('themeToggle');
  if (existing) return; // prevent duplicates

  const toggle = document.createElement('button');
  toggle.id = 'themeToggle';
  toggle.className = 'theme-toggle';
  toggle.style.display = 'none';
  toggle.style.position = 'fixed';
  toggle.style.bottom = '10px';
  toggle.style.right = '10px';
  toggle.style.zIndex = '1001';
  document.body.appendChild(toggle);

  function apply(theme) {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(theme);
    toggle.textContent = theme === 'dark-mode' ? '🌞' : '🌚';
  }

  const saved = localStorage.getItem('theme') || 'dark-mode';
  apply(saved);

  fetch('/current_user').then(r => r.ok ? r.json() : null).then(user => {
    if (user) {
      toggle.style.display = 'block';
    }
  }).catch(() => {});

  toggle.addEventListener('click', () => {
    const theme = document.body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
    apply(theme);
    localStorage.setItem('theme', theme);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
  initThemeToggle();
}
