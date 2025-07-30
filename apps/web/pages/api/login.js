import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  const usersPath = path.join(process.cwd(), 'data', 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({error:'invalid'});
  res.setHeader('Set-Cookie', `auth=${user.id}; Path=/; HttpOnly`);
  res.status(200).json({status:'ok'});
}
