import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const base = path.join(process.cwd(), 'data');
  const mood_logs = JSON.parse(fs.readFileSync(path.join(base, 'mood_logs.json')));
  const journal_entries = JSON.parse(fs.readFileSync(path.join(base, 'journal_entries.json')));
  const assistant_actions = JSON.parse(fs.readFileSync(path.join(base, 'assistant_actions.json')));
  res.status(200).json({ mood_logs, journal_entries, assistant_actions });
}
