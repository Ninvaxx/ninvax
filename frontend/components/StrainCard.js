export default function StrainCard({ name, price, store, thumbnail }) {
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
        <h3 style={{ margin: '0 0 0.5rem 0' }}>{name}</h3>
        <p style={{ margin: 0, fontWeight: 'bold' }}>${price}</p>
        <p style={{ margin: 0, color: '#555' }}>{store}</p>
      </div>
    </div>
  );
}
