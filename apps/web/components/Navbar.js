import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', background: '#333' }}>
      <Link href="/" style={{ color: '#fff', fontWeight: 'bold', marginRight: '1rem' }}>
        Ninvax
      </Link>
      <Link href="/products" style={{ color: '#fff', marginRight: '1rem' }}>Products</Link>
      <Link href="/contact" style={{ color: '#fff', marginRight: '1rem' }}>Contact</Link>
      <Link href="/favorites" style={{ color: '#fff', marginRight: '1rem' }}>Favorites</Link>
      <Link href="/notes" style={{ color: '#fff' }}>Notes</Link>
    </nav>
  );
}
