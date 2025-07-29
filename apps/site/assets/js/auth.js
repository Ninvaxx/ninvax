document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.getElementById('loginLink');
  const adminLink = document.getElementById('adminLink');
  const logoutLink = document.getElementById('logoutLink');

  async function updateLinks() {
    const res = await fetch('/current_user');
    const user = res.ok ? await res.json() : null;
    const isAdmin = user && (user.isAdmin || user.isApproved);
    if (isAdmin) {
      if (adminLink) adminLink.style.display = 'inline';
      if (logoutLink) logoutLink.style.display = 'inline';
      if (loginLink) loginLink.style.display = 'none';
    } else if (user) {
      if (adminLink) adminLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'inline';
      if (loginLink) loginLink.style.display = 'none';
    } else {
      if (adminLink) adminLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'none';
      if (loginLink) loginLink.style.display = 'inline';
    }
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/logout', { method: 'POST' });
      updateLinks();
    });
  }

  updateLinks();
});
