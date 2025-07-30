import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    setLoggedIn(document.cookie.includes('auth='));
  }, []);
  return [loggedIn, () => {
    document.cookie = 'auth=; Max-Age=0; path=/';
    setLoggedIn(false);
  }];
}

export default function Navbar() {
  const [loggedIn, logout] = useAuth();
  return (
    <nav style={{ padding: '1rem', background: '#333' }}>
      <Link href="/" style={{ color: '#fff', fontWeight: 'bold', marginRight: '1rem' }}>
        Ninvax
      </Link>
      <Link href="/products" style={{ color: '#fff', marginRight: '1rem' }}>Products</Link>
      <Link href="/contact" style={{ color: '#fff', marginRight: '1rem' }}>Contact</Link>
      <Link href="/favorites" style={{ color: '#fff', marginRight: '1rem' }}>Favorites</Link>
      <Link href="/notes" style={{ color: '#fff', marginRight: '1rem' }}>Notes</Link>
      {loggedIn ? (
        <>
          <Link href="/dashboard" style={{ color: '#fff', marginRight: '1rem' }}>Dashboard</Link>
          <button onClick={logout} style={{ marginRight: '1rem' }}>Logout</button>
        </>
      ) : (
        <Link href="/login" style={{ color: '#fff', marginRight: '1rem' }}>Login</Link>
      )}
      <ThemeToggle loggedIn={loggedIn} />
    </nav>
  );
}
