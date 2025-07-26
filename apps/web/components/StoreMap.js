import { useEffect, useRef } from 'react';

const storeLocations = {
  'Rochelle Park-Rec': [40.9075, -74.0813],
};

export default function StoreMap({ products }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return;
    const stores = [...new Set(products.map(p => p.store))];
    const center = storeLocations[stores[0]] || [40.9075, -74.0813];
    const map = window.L.map(ref.current).setView(center, 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    stores.forEach(s => {
      const pos = storeLocations[s];
      if (pos) {
        window.L.marker(pos).addTo(map).bindPopup(s);
      }
    });
    return () => map.remove();
  }, [products]);

  return <div ref={ref} style={{ height: '300px', width: '100%', marginTop: '1rem' }} />;
}
