export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  try {
    const response = await fetch(`${backendUrl}/products`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
}
