import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then(setNotes)
      .catch(() => setNotes([]));
  }, []);

  async function addNote() {
    if (!text.trim()) return;
    const tempId = Date.now();
    const optimistic = { id: tempId, text };
    setNotes((prev) => [...prev, optimistic]);
    setText('');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed');
      const saved = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === tempId ? saved : n)));
    } catch (err) {
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      alert('Failed to add note');
    }
  }

  async function updateNote(id, newText) {
    const prev = notes.find((n) => n.id === id);
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === id ? { ...n, text: newText } : n)));
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: newText }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch (err) {
      setNotes((prevNotes) => prevNotes.map((n) => (n.id === id ? prev : n)));
      alert('Failed to update note');
    }
  }

  async function deleteNote(id) {
    const prev = notes;
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    } catch (err) {
      setNotes(prev);
      alert('Failed to delete note');
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Notes</h1>
        <div>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New note" />
          <button onClick={addNote}>Add</button>
        </div>
        <ul>
          {notes.map((note) => (
            <li key={note.id} style={{ marginBottom: '0.5rem' }}>
              <input
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <button onClick={() => deleteNote(note.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
