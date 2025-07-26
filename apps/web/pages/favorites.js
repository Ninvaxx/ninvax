import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StrainCard from '../components/StrainCard';

export default function Favorites() {
  const [strains, setStrains] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/products');
      const data = await res.json();
      const favs = JSON.parse(localStorage.getItem('starredStrains') || '[]');
      setStrains(data.filter((p) => favs.includes(p.name)));
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Favorites</h1>
        {strains.length === 0 ? (
          <p>No favorites yet</p>
        ) : (
          strains.map((p) => (
            <StrainCard
              key={p.name}
              name={p.name}
              price={p.price}
              store={p.store}
              thumbnail={p.thumbnail}
            />
          ))
        )}
      </main>
      <Footer />
    </>
  );
}
