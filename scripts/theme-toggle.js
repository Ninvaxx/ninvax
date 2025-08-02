const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const btn = document.getElementById('theme-toggle');

if (isLoggedIn) btn.hidden = false;

btn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}
