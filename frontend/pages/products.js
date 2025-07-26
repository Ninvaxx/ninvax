import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StoreMap from '../components/StoreMap';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const es = new EventSource(`${backendUrl}/strains/events`);
    es.onmessage = (e) => {
      try {
        setProducts(JSON.parse(e.data));
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Products</h1>
        <ul>
          {products.map((p) => (
            <li key={p.name}>{p.name} - ${p.price} at {p.store}</li>
          ))}
        </ul>
        <StoreMap products={products} />
      </main>
      <Footer />
    </>
  );
}
