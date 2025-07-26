document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.getElementById('loginLink');
  const adminLink = document.getElementById('adminLink');
  const logoutLink = document.getElementById('logoutLink');

  function updateLinks() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      if (adminLink) adminLink.style.display = 'inline';
      if (logoutLink) logoutLink.style.display = 'inline';
      if (loginLink) loginLink.style.display = 'none';
    } else {
      if (adminLink) adminLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'none';
      if (loginLink) loginLink.style.display = 'inline';
    }
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('isAdmin');
      updateLinks();
    });
  }

  updateLinks();
});
