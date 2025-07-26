import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StrainCard from '../components/StrainCard';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Products</h1>
        {products.map((p) => (
          <StrainCard key={p.name} name={p.name} price={p.price} store={p.store} thumbnail={p.thumbnail || '/placeholder-thumbnail.jpg'} />
        ))}
      </main>
      <Footer />
    </>
  );
}
