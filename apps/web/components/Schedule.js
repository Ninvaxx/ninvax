export default function Schedule() {
  const url = process.env.NEXT_PUBLIC_CALENDAR_URL || 'YOUR_GOOGLE_CALENDAR_URL';
  return (
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
      <h2>Schedule Tech Help</h2>
      <iframe
        src={url}
        style={{ border: 0 }}
        width="800"
        height="600"
        frameBorder="0"
      ></iframe>
    </div>
  );
}
