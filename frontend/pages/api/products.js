import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }
  const dataPath = path.join(process.cwd(), '..', 'site', 'strains.json');
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
}
