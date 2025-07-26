let notes = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(notes);
  }
  if (req.method === 'POST') {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const note = { id: Date.now(), text };
    notes.push(note);
    return res.status(201).json(note);
  }
  if (req.method === 'PUT') {
    const { id, text } = req.body;
    const note = notes.find((n) => n.id === id);
    if (!note) return res.status(404).json({ error: 'Not found' });
    note.text = text;
    return res.status(200).json(note);
  }
  if (req.method === 'DELETE') {
    const id = parseInt(req.query.id || req.body.id, 10);
    notes = notes.filter((n) => n.id !== id);
    return res.status(204).end();
  }
  res.status(405).end();
}
