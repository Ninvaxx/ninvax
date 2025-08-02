const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const btn = document.getElementById('theme-toggle');

if (isLoggedIn) btn.hidden = false;

btn.addEventListener('click', () => {
  if (document.body.classList.contains('light-mode')) {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
});

const saved = localStorage.getItem('theme');
if (saved === 'light') {
  document.body.classList.add('light-mode');
} else if (saved === 'dark') {
  document.body.classList.add('dark-mode');
}
