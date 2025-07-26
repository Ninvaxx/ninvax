import { useEffect, useState } from 'react';

export default function StrainCard({ name, price, store, thumbnail }) {
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const favs = JSON.parse(localStorage.getItem('starredStrains') || '[]');
    setStarred(favs.includes(name));
  }, [name]);

  function toggleFavorite() {
    if (typeof window === 'undefined') return;
    let favs = JSON.parse(localStorage.getItem('starredStrains') || '[]');
    if (favs.includes(name)) {
      favs = favs.filter((n) => n !== name);
      setStarred(false);
    } else {
      favs.push(name);
      setStarred(true);
    }
    localStorage.setItem('starredStrains', JSON.stringify(favs));
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {thumbnail && <div style={{ marginRight: '1rem' }}>{thumbnail}</div>}
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>
          {name}{' '}
          <span
            onClick={toggleFavorite}
            style={{ cursor: 'pointer', marginLeft: '0.25rem' }}
            aria-label={starred ? 'Remove from favorites' : 'Add to favorites'}
          >
            {starred ? '★' : '☆'}
          </span>
        </h3>
        <p style={{ margin: 0, fontWeight: 'bold' }}>${price}</p>
        <p style={{ margin: 0, color: '#555' }}>{store}</p>
      </div>
    </div>
  );
}
