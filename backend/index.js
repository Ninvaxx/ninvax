const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2022-11-15' });

const fs = require('fs');
const path = require('path');
const events = require('events');

const dataPath = path.join(__dirname, '..', 'site', 'strains.json');
const emitter = new events.EventEmitter();
let cachedStrains = [];
// Load data on startup
loadStrains();

function loadStrains() {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    cachedStrains = data;
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Watch file for changes and emit updates
fs.watchFile(dataPath, { interval: 1000 }, () => {
  const data = loadStrains();
  emitter.emit('update', data);
});

app.get('/products', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
});

app.get('/strains/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  // Send initial data
  res.write(`data: ${JSON.stringify(cachedStrains.length ? cachedStrains : loadStrains())}\n\n`);

  const onUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  emitter.on('update', onUpdate);

  req.on('close', () => {
    emitter.off('update', onUpdate);
  });
});

app.post('/purchase', async (req, res) => {
  // Placeholder for payment intent
  res.json({});
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
