import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('Thanks for reaching out!');
        e.target.reset();
      } else {
        setStatus('Error sending message');
      }
    } catch (err) {
      setStatus('Error sending message');
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Contact</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
          <input type="text" name="name" placeholder="Name" required style={{ marginBottom: '0.5rem' }} />
          <input type="email" name="email" placeholder="Email" required style={{ marginBottom: '0.5rem' }} />
          <textarea name="message" placeholder="Message" required style={{ marginBottom: '0.5rem' }} />
          <button type="submit">Send</button>
        </form>
        {status && <p>{status}</p>}
      </main>
      <Footer />
    </>
  );
}
