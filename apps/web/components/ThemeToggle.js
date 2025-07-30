import { useEffect } from 'react';

export default function ThemeToggle({ loggedIn }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.dataset.theme = localStorage.getItem('theme') || 'light';
  }, []);

  function toggle() {
    const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = next;
    localStorage.setItem('theme', next);
  }

  if (!loggedIn) return null;
  return <button onClick={toggle}>Toggle Theme</button>;
}
